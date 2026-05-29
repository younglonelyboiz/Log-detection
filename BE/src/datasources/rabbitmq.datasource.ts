import amqp, {Channel, ChannelModel} from 'amqplib';

import dotenv from 'dotenv';

dotenv.config();

export class RabbitMQDataSource {
  public connection!: ChannelModel;

  public channel!: Channel;

  async connect(): Promise<void> {
    try {
      this.connection = await amqp.connect(process.env.RABBITMQ_URL as string);

      this.channel = await this.connection.createChannel();

      console.log('RabbitMQ connected');
    } catch (error) {
      console.error('RabbitMQ connection error:', error);
    }
  }
}
