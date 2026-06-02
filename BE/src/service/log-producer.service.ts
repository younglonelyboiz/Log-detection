import {injectable, BindingScope, inject, service} from '@loopback/core';
import {RabbitMQDataSource} from '../datasources/rabbitmq.datasource';
import {GenerateLogService} from './generate-log.service';
import {OrderAction} from '../enums/acction.enum';
import {Log} from '../models/log.model';

@injectable({scope: BindingScope.TRANSIENT})
export class LogProducerService {
  private queueName = 'log_queue';

  constructor(
    @inject('datasources.RabbitMQ')
    private rabbitMQDataSource: RabbitMQDataSource,
    @service(GenerateLogService)
    private generateLogService: GenerateLogService,
  ) {}

  // Hàm gọi kịch bản log bình thường và đẩy vào Queue
  async publishNormalFlow(): Promise<Log[]> {
    const logs = await this.generateLogService.generateNormalFlowLog();
    await this.publishToQueue(logs);
    return logs;
  }

  // Hàm gọi kịch bản log lỗi và đẩy vào Queue
  async publishErrorFlow(
    action: OrderAction,
    quantity: number,
  ): Promise<Log[]> {
    const logs = await this.generateLogService.generateErrorFlowLog(
      action,
      quantity,
    );
    await this.publishToQueue(logs);
    return logs;
  }

  // Hàm gọi kịch bản log spam và đẩy vào Queue
  async publishSpamFlow(action: OrderAction, quantity: number): Promise<Log[]> {
    const logs = await this.generateLogService.generateSpamFlowLog(
      action,
      quantity,
    );
    await this.publishToQueue(logs);
    return logs;
  }

  private async publishToQueue(logs: any[]): Promise<void> {
    const channel = this.rabbitMQDataSource.channel;

    if (!channel) {
      throw new Error('Kênh kết nối RabbitMQ chưa sẵn sàng!');
    }

    // Đảm bảo queue tồn tại trước khi gửi. durable: true giúp queue không bị mất khi RabbitMQ restart
    await channel.assertQueue(this.queueName, {durable: true});

    for (const log of logs) {
      const messageBuffer = Buffer.from(JSON.stringify(log));

      // Đẩy từng log vào queue
      channel.sendToQueue(this.queueName, messageBuffer, {
        persistent: true, // Lưu message xuống đĩa cứng của RabbitMQ để tránh mất dữ liệu (Zero Data Loss)
      });
    }

    console.log(
      `[Producer] Đã thành công ${logs.length} logs vào hàng đợi '${this.queueName}'.`,
    );
  }
}
