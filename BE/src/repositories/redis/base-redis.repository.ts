import Redis from 'ioredis';
import { RedisDataSource } from '../../datasources/redis.datasource';
import { injectable, inject } from '@loopback/core';

@injectable()
export abstract class BaseRedisRepository<T> {
  protected db: Redis;

  constructor(@inject('datasources.redis') redisDataSource: RedisDataSource) {
    this.db = redisDataSource.client;
  }
  protected abstract prefix: string;

  protected toInterface(data: string): T {
    return JSON.parse(data) as T;
  }

  protected toString(data: T): string {
    return JSON.stringify(data);
  }

  async save(id: string, entity: T, ttlSeconds: number = 86400): Promise<void> {
    const key = `${this.prefix}:${id}`;
    const indexKey = `${this.prefix}:index`;
    const now = Date.now();
    try {
      await this.db.set(key, this.toString(entity), 'EX', ttlSeconds);
      await this.db.zadd(indexKey, now, id);

    } catch (err) {
      console.error(`Lỗi khi lưu ${this.prefix} với id ${id}:`, err);
    }
  }

  async findById(id: string): Promise<T | null> {
    const key = `${this.prefix}:${id}`;
    try {
      const data = await this.db.get(key);
      if (data) {
        return this.toInterface(data);
      }
      return null;
    } catch (err) {
      console.error(`Lỗi khi tìm ${this.prefix} với id ${id}:`, err);
      return null;
    }
  }

  async deleteById(id: string): Promise<void> {
    const key = `${this.prefix}:${id}`;
    const indexKey = `${this.prefix}:index`;
    try {
      await this.db.del(key);
      await this.db.zrem(indexKey, id);
    } catch (err) {
      console.error(`Lỗi khi xóa ${this.prefix} với id ${id}:`, err);
    }
  }

  async updateById(
    id: string,
    entity: T,
    ttlSeconds: number = 86400,
  ): Promise<void> {
    const key = `${this.prefix}:${id}`;
    try {
      await this.db.set(key, this.toString(entity), 'EX', ttlSeconds, 'XX');
    } catch (err) {
      console.error(`Lỗi khi cập nhật ${this.prefix} với id ${id}:`, err);
    }
  }

  async findPaginated(limit: number = 10, offset: number = 0): Promise<T[]> {
    const indexKey = `${this.prefix}:index`;
    try {
      const ids = await this.db.zrevrange(indexKey, offset, offset + limit - 1);
      if (ids.length === 0) return [];

      const keys = ids.map(id => `${this.prefix}:${id}`);
      const rawData = await this.db.mget(keys);

      const entities: T[] = [];
      for (const item of rawData) {
        if (item) {
          entities.push(this.toInterface(item));
        }
      }
      return entities;
    } catch (err) {
      console.error(`Lỗi phân trang ${this.prefix}:`, err);
      return [];
    }
  }

  async updatePartialById(id: string, updateData: Partial<T>): Promise<void> {
    const currentData = await this.findById(id);
    if (currentData) {
      const updatedData = { ...currentData, ...updateData };
      await this.save(id, updatedData);
    }
  }

  async deleteAll(): Promise<void> {
    try {
      const pipeline = this.db.pipeline();
      const stream = this.db.scanStream({
        match: `${this.prefix}:*`,
        count: 100,
      });
      await new Promise((resolve, reject) => {
        stream.on('data', (keys: string[]) => {
          keys.forEach(key => {
            pipeline.del(key);
          });
          pipeline.exec();
        });
        stream.on('end', () => {
          resolve(null);
        });
        stream.on('error', err => {
          reject(err);
        });
      });
    } catch (err) {
      console.error(`Lỗi khi xóa tất cả ${this.prefix}:`, err);
    }
  }
}
