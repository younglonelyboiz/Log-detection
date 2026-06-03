import Redis from 'ioredis';
import {RedisDataSource} from '../../datasources/redis.datasource';
import {injectable, inject} from '@loopback/core';

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

  async save(id: string, entity: T): Promise<void> {
    const key = `${this.prefix}:${id}`;
    try {
      await this.db.set(key, this.toString(entity));
    } catch (err) {
      console.error(`Failed to save ${this.prefix} with id ${id}:`, err);
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
      console.error(`Failed to find ${this.prefix} with id ${id}:`, err);
      return null;
    }
  }

  async deleteById(id: string): Promise<void> {
    const key = `${this.prefix}:${id}`;
    try {
      await this.db.del(key);
    } catch (err) {
      console.error(`Failed to delete ${this.prefix} with id ${id}:`, err);
    }
  }

  async updateById(id: string, entity: T): Promise<void> {
    const key = `${this.prefix}:${id}`;
    try {
      await this.db.set(key, this.toString(entity), 'XX');
    } catch (err) {
      console.error(`Failed to update ${this.prefix} with id ${id}:`, err);
    }
  }

  async updatePartialById(id: string, updateData: Partial<T>): Promise<void> {
    const currentData = await this.findById(id);
    if (currentData) {
      const updatedData = {...currentData, ...updateData};
      await this.save(id, updatedData);
    }
  }
}

// async findAll(limit: number = 10, offset: number = 0): Promise<T[]> {
//   try {
//     const keys = await this.db.keys(`${this.prefix}:*`);
//     const entities: T[] = [];
//     for (const key of keys) {
//       const data = await this.db.get(key);
//       if (data) {
//         entities.push(this.toInterface(data));
//       }
//     }
//     return entities;
//   } catch (err) {
//     console.error(`Failed to find all ${this.prefix} entities:`, err);
//     return [];
//   }
// }
