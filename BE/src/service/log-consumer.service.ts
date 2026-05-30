import {
  injectable,
  BindingScope,
  inject,
  lifeCycleObserver,
  LifeCycleObserver,
} from '@loopback/core';
import {RabbitMQDataSource} from '../datasources/rabbitmq.datasource';
import {LogDetectRepository} from '../repositories/log-detect.repository';
import {repository} from '@loopback/repository';
import {LogDetect} from '../models/log-detect.model';
import {Log} from '../models/log.model';
import {v4 as uuidv4} from 'uuid';
import {ConsumeMessage} from 'amqplib';
import {Label} from '../enums/label.enum';

@injectable({scope: BindingScope.SINGLETON})
@lifeCycleObserver('service')
export class LogConsumerService implements LifeCycleObserver {
  private queueName = 'log_queue'; // Tên hàng đợi RabbitMQ để tiêu thụ log
  private batchSize = 100; // Số lượng log mỗi batch
  private messageBuffer: ConsumeMessage[] = []; // Mảng tạm lưu trữ log
  private processInterval?: NodeJS.Timeout;
  private isProcessing = false; // Cờ kiểm soát tránh xử lý trùng lặp

  constructor(
    @inject('datasources.RabbitMQ')
    private rabbitMQDataSource: RabbitMQDataSource,
    @repository(LogDetectRepository)
    public logDetectRepository: LogDetectRepository,
  ) {}

  /**
   * Phương thức này được gọi khi ứng dụng khởi động.
   */
  async start(): Promise<void> {
    if (!this.rabbitMQDataSource.channel) {
      console.error('RabbitMQ channel not available for consumer. Retrying...');
      // Có thể thêm logic retry hoặc chờ đợi ở đây
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
  }

  private async processBatch(): Promise<void> {
    // Tránh việc đang lưu batch này thì lại chạy thêm một hàm xử lý batch khác
    if (this.isProcessing || this.messageBuffer.length === 0) return;
    this.isProcessing = true;

    // Cắt mảng lấy ra đúng số lượng batch
    const messagesToProcess = this.messageBuffer.splice(0, this.batchSize);

    try {
      const logsToSave: LogDetect[] = [];

      for (const msg of messagesToProcess) {
        const logData: Log = JSON.parse(msg.content.toString());
        const detectedLog = new LogDetect({
          ...logData,
          label: Label.NORMAL, // --- Logic phân tích / Detect ở đây ---
        });
        logsToSave.push(detectedLog);
      }

      // Lưu tất cả 500 bản ghi vào MongoDB bằng 1 lượt insert duy nhất
      await this.logDetectRepository.createAll(logsToSave);
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

  /**
   * Phương thức này được gọi khi ứng dụng dừng.
   */
  async stop(): Promise<void> {
    if (this.processInterval) {
      clearInterval(this.processInterval);
    }
    console.log('LogConsumerService stopped.');
  }
}
