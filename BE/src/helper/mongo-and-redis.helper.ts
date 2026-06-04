import {UserRedisRepository} from '../repositories/redis/user-redis-repository';
import {LogDetectRedisRepository} from '../repositories/redis/log-detect-redis.repository';
import {LogDetectRepository} from '../repositories/log-detect.repository';
import {UserRepository} from '../repositories/user.repository';
import {injectable, inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {User} from '../models/user.model';
import {Label} from '../enums/label.enum';
import {LogDetect} from '../models/log-detect.model';
import {UserStatus} from '../enums/user-status.enum';

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
    try {
      await this.userRepository.deleteById(userId);
    } catch (err) {
      console.error(`Lỗi khi xóa người dùng ${userId} khỏi MongoDB:`, err);
    }

    try {
      await this.userRedisRepository.deleteById(userId);
    } catch (err) {
      console.error(`Lỗi khi xóa người dùng ${userId} khỏi Redis:`, err);
    }
  }

  async deleteLogDetectRedisAndMongo(logDetectId: string): Promise<void> {
    try {
      await this.logDetectRepository.deleteById(logDetectId);
    } catch (err) {
      console.error(`Lỗi khi xóa log ${logDetectId} khỏi MongoDB:`, err);
    }

    try {
      await this.logDetectRedisRepository.deleteById(logDetectId);
    } catch (err) {
      console.error(`Lỗi khi xóalog ${logDetectId} khỏi Redis:`, err);
    }
  }

  // Nếu chỉnh sửa trạng thái người dùng (SPAM,BLOCK) sẽ dược lưu vào cả trog redis
  async updateUserMongoAndCreateUserRedis(
    userId: string,
    updateData: Partial<User>,
  ): Promise<void> {
    let user: User | null = null;
    try {
      user = await this.userRepository.findById(userId);
    } catch (err) {
      console.error(`Lỗi khi tìm người dùng ${userId} trong MongoDB:`, err);
      throw err;
    }

    if (user) {
      const updatedUser = {...user, ...updateData};
      const newUser = new User(updatedUser);

      // Cập nhật MongoDB
      try {
        await this.userRepository.updateById(userId, updateData);
      } catch (err) {
        console.error(
          `Lỗi khi cập nhật người dùng ${userId} trong MongoDB:`,
          err,
        );
        throw err;
      }

      // Đồng bộ sang Redis
      try {
        if (newUser.status !== UserStatus.ACTIVE) {
          await this.userRedisRepository.save(userId, newUser);
        } else {
          await this.userRedisRepository.deleteById(userId);
        }
      } catch (err) {
        console.error(
          `Đã cập nhật người dùng ${userId} trong MongoDB, nhưng không đồng bộ được sang Redis:`,
          err,
        );
      }
    }
  }

  async checkSpamUser(userID: string): Promise<boolean> {
    try {
      const redisSpam = await this.logDetectRedisRepository.findById(userID);
      if (redisSpam) return true;
    } catch (err) {
      console.error(
        `Lỗi khi truy vấn người dùng spam ${userID} từ Redis:`,
        err,
      );
    }

    try {
      const mongoSpam = await this.logDetectRepository.findOne({
        where: {userID, label: Label.SPAM},
      });
      if (mongoSpam) {
        try {
          await this.logDetectRedisRepository.save(userID, mongoSpam);
        } catch (err) {
          console.error(
            `Lỗi khi lưu cache người dùng spam ${userID} sang Redis:`,
            err,
          );
        }
        return true;
      }
    } catch (err) {
      console.error(
        `Lỗi khi truy vấn người dùng spam ${userID} từ MongoDB:`,
        err,
      );
    }
    return false;
  }

  async saveLogDetect(redisKey: string, logDetect: LogDetect): Promise<void> {
    // Lưu MongoDB trước
    try {
      await this.logDetectRepository.create(logDetect);
    } catch (err) {
      console.error(`Lỗi khi tạo bản log trong MongoDB:`, err);
      throw err;
    }

    // Đồng bộ lên Redis cache
    try {
      await this.logDetectRedisRepository.save(redisKey, logDetect);
    } catch (err) {
      console.error(` trong MongoDB, nhưng không lưu được sang Redis:`, err);
    }
  }
}
