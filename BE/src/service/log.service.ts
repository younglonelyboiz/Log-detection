import {BindingScope, injectable, service} from '@loopback/core';
import {repository} from '@loopback/repository';
import {LogRepository} from '../repositories/log.repository';
import {LogDetectRepository} from '../repositories/log-detect.repository';
import {LogDetectRedisRepository} from '../repositories/redis/log-detect-redis.repository';
import {Log} from '../models/log.model';
import {LogDetect} from '../models/log-detect.model';
import {UserService} from './user.service';

@injectable({scope: BindingScope.TRANSIENT})
export class LogService {
  constructor(
    @repository(LogRepository)
    private logRepository: LogRepository,
    @repository(LogDetectRepository)
    private logDetectRepository: LogDetectRepository,
    @repository(LogDetectRedisRepository)
    private logDetectRedisRepository: LogDetectRedisRepository,
    @service(UserService)
    private userService: UserService,
  ) {}

  async getLogsByUserId(userID: string): Promise<Log[]> {
    return this.logRepository.find({
      where: {userID},
      order: ['timestamp DESC'],
    });
  }

  async getDetectedLogsByUserId(userID: string): Promise<LogDetect[]> {
    return this.logDetectRepository.find({
      where: {userID},
      order: ['timestamp DESC'],
    });
  }

  async getLogsRedis(
    limit: number = 20,
    offset: number = 0,
  ): Promise<LogDetect[]> {
    return this.logDetectRedisRepository.findPaginated(limit, offset);
  }
}
