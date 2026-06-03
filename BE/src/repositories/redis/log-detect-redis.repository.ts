import {BaseRedisRepository} from './base-redis.repository';
import {LogDetect} from '../../models/log-detect.model';
import {RedisDataSource} from '../../datasources/redis.datasource';
import {inject, injectable} from '@loopback/core';

@injectable()
export class LogDetectRedisRepository extends BaseRedisRepository<LogDetect> {
  protected prefix = 'logDetect';

  constructor(@inject('datasources.redis') redisDataSource: RedisDataSource) {
    super(redisDataSource);
  }
}
