import { BindingScope, injectable, service } from '@loopback/core';
import { repository } from '@loopback/repository';
import { LogRepository } from '../repositories/log.repository';
import { LogDetectRepository } from '../repositories/log-detect.repository';
import { LogDetectRedisRepository } from '../repositories/redis/log-detect-redis.repository';
import { Log } from '../models/log.model';
import { LogDetect } from '../models/log-detect.model';
import { UserService } from './user.service';
import { OrderAction } from '../enums/action.enum';
import { Label } from '../enums/label.enum';

@injectable({ scope: BindingScope.TRANSIENT })
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
  ) { }

  async getLogsByUserId(userID: string): Promise<Log[]> {
    return this.logRepository.find({
      where: { userID },
      order: ['timestamp DESC'],
    });
  }

  async getDetectedLogsByUserId(userID: string): Promise<LogDetect[]> {
    return this.logDetectRepository.find({
      where: { userID },
      order: ['timestamp DESC'],
    });
  }

  async getAllDetectedLogs(
    limit?: number,
    offset?: number,
    label?: string,
  ): Promise<{ data: LogDetect[]; total: number }> {
    const whereClause: any = {};
    if (label && label !== 'all') {
      whereClause.label = label;
    }
    const [data, total] = await Promise.all([
      this.logDetectRepository.find({
        where: whereClause,
        order: ['timestamp DESC'],
        limit: limit ?? 10,
        offset: offset ?? 0,
      }),
      this.logDetectRepository.count(whereClause),
    ]);
    return { data, total: total.count };
  }

  async getLogsRedis(
    limit: number = 20,
    offset: number = 0,
  ): Promise<LogDetect[]> {
    return this.logDetectRedisRepository.findPaginated(limit, offset);
  }

  async getDashboardStats() {
    const [totalLogs, totalUsers, successfulOrders, normalLogs] = await Promise.all([
      this.logRepository.count(),
      this.userService.userRepository.count(),
      this.logDetectRepository.count({ action: OrderAction.HOAN_THANH, label: Label.NORMAL }),
      this.logDetectRepository.count({ label: Label.NORMAL }),
    ]);

    return {
      total: totalLogs.count,
      totalUsers: totalUsers.count,
      successfulOrders: successfulOrders.count,
      normal: normalLogs.count,
    };
  }
}
