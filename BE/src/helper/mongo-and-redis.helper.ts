import {UserRedisRepository} from '../repositories/redis/user-redis-repository';
import {LogDetectRedisRepository} from '../repositories/redis/log-detect-redis.repository';
import {LogDetectRepository} from '../repositories/log-detect.repository';
import {UserRepository} from '../repositories/user.repository';
import {injectable, inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {User} from '../models/user.model';
import {Label} from '../enums/label.enum';
import {LogDetect} from '../models/log-detect.model';

@injectable()
export class MongoAndRedisHelper {
  constructor(
    @repository(UserRepository)
    private userRepository: UserRepository,
    @repository(LogDetectRepository)
    private logDetectRepository: LogDetectRepository,
    @repository(UserRedisRepository)
    private userRedisRepository: UserRedisRepository,
    @repository(LogDetectRedisRepository)
    private logDetectRedisRepository: LogDetectRedisRepository,
  ) {}

  async deleteUserRedisAndMongo(userId: string): Promise<void> {
    await this.userRepository.deleteById(userId);
    await this.userRedisRepository.deleteById(userId);
  }

  async deleteLogDetectRedisAndMongo(logDetectId: string): Promise<void> {
    await this.logDetectRepository.deleteById(logDetectId);
    await this.logDetectRedisRepository.deleteById(logDetectId);
  }

  async updateUserMongoAndCreateUserRedis(
    userId: string,
    updateData: Partial<User>,
  ): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (user) {
      const updatedUser = {...user, ...updateData};
      const newUser = new User(updatedUser);
      await this.userRepository.updateById(userId, updateData);
      await this.userRedisRepository.save(userId, newUser);
    }
  }

  async checkSpamUser(userID: string): Promise<boolean> {
    const redisSpam = await this.logDetectRedisRepository.findById(userID);
    if (redisSpam) return true;

    const mongoSpam = await this.logDetectRepository.findOne({
      where: {userID, label: Label.SPAM},
    });
    if (mongoSpam) {
      await this.logDetectRedisRepository.save(userID, mongoSpam);
      return true;
    }
    return false;
  }

  async saveLogDetect(redisKey: string, logDetect: LogDetect): Promise<void> {
    await this.logDetectRedisRepository.save(redisKey, logDetect);
    await this.logDetectRepository.create(logDetect);
  }
}
