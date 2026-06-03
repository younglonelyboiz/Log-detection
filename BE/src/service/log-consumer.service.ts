// Nhận log từ rabbitMQ và lưu hết vào Mongo

import {
  injectable,
  BindingScope,
  inject,
  lifeCycleObserver,
  LifeCycleObserver,
  service,
} from '@loopback/core';
import {RabbitMQDataSource} from '../datasources/rabbitmq.datasource';
import {LogRepository} from '../repositories/log.repository';
import {repository} from '@loopback/repository';
import {Log} from '../models/log.model';
import {ConsumeMessage} from 'amqplib';
import {DetectLogService} from './detect-log.service';

@injectable({scope: BindingScope.SINGLETON})
@lifeCycleObserver('service')
export class LogConsumerService implements LifeCycleObserver {
  private queueName = 'log_queue';
  private batchSize = 20; // Số lượng log mỗi batch
  private messageBuffer: ConsumeMessage[] = []; // Mảng tạm lưu trữ log
  private processInterval?: NodeJS.Timeout;
  private isProcessing = false; // Cờ kiểm soát tránh xử lý trùng lặp
  private detectInterval?: NodeJS.Timeout;
  private detectInProgress = false; // Cờ kiểm soát tránh chạy đồng thời nhiều lần quét log
  constructor(
    @inject('datasources.RabbitMQ')
    private rabbitMQDataSource: RabbitMQDataSource,
    @repository(LogRepository)
    public logRepository: LogRepository,
    @service(DetectLogService)
    public detectLogService: DetectLogService,
  ) {}

  async start(): Promise<void> {
    if (!this.rabbitMQDataSource.channel) {
      console.error('RabbitMQ channel not available for consumer. Retrying...');
      return;
    }

    // Giới hạn số lượng message chưa được ACK (prefetch count) - lấy tối đa 100 message
    await this.rabbitMQDataSource.channel.prefetch(this.batchSize);

    this.rabbitMQDataSource.channel.consume(
      this.queueName,
      msg => {
        if (msg) {
          this.messageBuffer.push(msg);
          // Nếu đủ số lượng batchSize thì đem đi xử lý
          if (this.messageBuffer.length >= this.batchSize) {
            this.processBatch().catch(console.error);
          }
        }
      },
      {noAck: false},
    );

    // Quét định kỳ mỗi 1 giây để xử lý nốt các log còn sót lại (khi lưu lượng ít không đủ 500)
    this.processInterval = setInterval(() => {
      if (this.messageBuffer.length > 0) {
        this.processBatch().catch(console.error);
      }
    }, 1000);

    console.log(
      `LogConsumerService started, listening on queue: ${this.queueName} with batch size ${this.batchSize}`,
    );

    this.detectInterval = setInterval(async () => {
      if (!this.detectInProgress) {
        this.detectInProgress = true;
        try {
          await this.detectLogService.scanLog();
        } catch (error) {
          console.error('Error during log scanning in background:', error);
        } finally {
          this.detectInProgress = false;
        }
      }
    }, 2000);
  }

  private async processBatch(): Promise<void> {
    // Tránh việc đang lưu batch này thì lại chạy thêm một hàm xử lý batch khác
    if (this.isProcessing || this.messageBuffer.length === 0) return;
    this.isProcessing = true;

    // Cắt mảng lấy ra đúng số lượng batch
    const messagesToProcess = this.messageBuffer.splice(0, this.batchSize);

    try {
      const logsToSave: Log[] = [];

      for (const msg of messagesToProcess) {
        const logData = JSON.parse(msg.content.toString());
        const log = new Log({
          ...logData,
          userID: logData.userID || logData.userId, // Đảm bảo map đúng userID
          isDetected: false,
        });
        logsToSave.push(log);
      }

      // Lưu tất cả bản ghi vào MongoDB bằng 1 lượt insert duy nhất
      await this.logRepository.createAll(logsToSave);
      console.log(
        `Processed and saved batch of ${logsToSave.length} logs to MongoDB.`,
      );

      // ACK cả một batch: xác nhận message cuối và tự động xác nhận tất cả message trước đó
      const lastMessage = messagesToProcess[messagesToProcess.length - 1];
      this.rabbitMQDataSource.channel.ack(lastMessage, true); // tham số true = allUpTo
    } catch (error) {
      console.error('Error processing batch from RabbitMQ:', error);
      // NACK cả batch và đưa ngược lại vào RabbitMQ Queue
      const lastMessage = messagesToProcess[messagesToProcess.length - 1];
      this.rabbitMQDataSource.channel.nack(lastMessage, true, true); // allUpTo=true, requeue=true
    } finally {
      this.isProcessing = false;
      // Xử lý nốt nếu trong lúc chờ DB có thêm log tích lại trong buffer
      if (this.messageBuffer.length >= this.batchSize) {
        this.processBatch().catch(console.error);
      }
    }
  }

  async stop(): Promise<void> {
    if (this.processInterval) {
      clearInterval(this.processInterval);
    }
    if (this.detectInterval) {
      clearInterval(this.detectInterval);
    }
    console.log('LogConsumerService stopped.');
  }
}
