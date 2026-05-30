import {
  BindingScope,
  injectable,
  lifeCycleObserver,
  LifeCycleObserver,
} from '@loopback/core';
import amqp, {Channel, ChannelModel} from 'amqplib';
// import dotenv from 'dotenv';

// dotenv.config();

@injectable({scope: BindingScope.SINGLETON})
@lifeCycleObserver('datasource')
export class RabbitMQDataSource implements LifeCycleObserver {
  public connection!: ChannelModel;

  public channel!: Channel;

  async start(): Promise<void> {
    try {
      this.connection = await amqp.connect(process.env.RABBITMQ_URL as string);
      this.channel = await this.connection.createChannel();

      // tự tạo queue nếu chưa có
      await this.channel.assertQueue('log_queue', {durable: true});

      console.log('RabbitMQ connected successfully!');
    } catch (error) {
      console.error('RabbitMQ connection error:', error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (this.channel) {
      await this.channel.close();
    }
    if (this.connection) {
      await this.connection.close();
    }
  }
}
