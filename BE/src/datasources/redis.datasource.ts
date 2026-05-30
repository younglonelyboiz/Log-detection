import {
  BindingScope,
  injectable,
  lifeCycleObserver,
  LifeCycleObserver,
} from '@loopback/core';
import {Redis} from 'ioredis';

@injectable({scope: BindingScope.SINGLETON})
@lifeCycleObserver('datasource')
export class RedisDataSource implements LifeCycleObserver {
  public client: Redis;

  constructor() {
    this.client = new Redis({
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      lazyConnect: true,
    });
  }

  async start(): Promise<void> {
    try {
      await this.client.connect();
      console.log('Redis connected successfully!');
    } catch (err) {
      console.error('Redis connection error:', err);
    }
  }

  async stop(): Promise<void> {
    await this.client.quit();
    console.log('Redis disconnected.');
  }
}
