import {BaseRedisRepository} from './base-redis.repository';
import {User} from '../../models/user.model';
import {RedisDataSource} from '../../datasources/redis.datasource';
import {inject, injectable} from '@loopback/core';

@injectable()
export class UserRedisRepository extends BaseRedisRepository<User> {
  protected prefix = 'user';

  constructor(@inject('datasources.redis') redisDataSource: RedisDataSource) {
    super(redisDataSource);
  }
}
