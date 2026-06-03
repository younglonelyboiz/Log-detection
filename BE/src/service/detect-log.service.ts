// dùng để  lưu user bị đánh dấu và các log bị đánh dấu lên redis
// logic chỉ để demo k mang nhiểu giá trị

import {Log} from '../models/log.model';
import {Label} from '../enums/label.enum';
import {OrderAction} from '../enums/acction.enum';
import {BindingScope, injectable} from '@loopback/core';
import {LogDetectRepository} from '../repositories/log-detect.repository';
import {repository} from '@loopback/repository';
import {LogDetect} from '../models/log-detect.model';
import {LogRepository} from '../repositories/log.repository';
import {LogDetectRedisRepository} from '../repositories/redis/log-detect-redis.repository';
import {UserRepository} from '../repositories/user.repository';
import {MongoAndRedisHelper} from '../helper/mongo-and-redis.helper';
import {inject} from '@loopback/core';

export interface LogDetectResult {
  log: Log;
  label: Label;
  reason: string;
}

const normalFlowActions: Map<OrderAction, OrderAction> = new Map<
  OrderAction,
  OrderAction
>([
  [OrderAction.THANH_TOAN, OrderAction.DAT_HANG],
  [OrderAction.XAC_NHAN_DON_HANG, OrderAction.THANH_TOAN],
  [OrderAction.GIAO_HANG, OrderAction.XAC_NHAN_DON_HANG],
  [OrderAction.HOAN_THANH, OrderAction.GIAO_HANG],
]);

@injectable({scope: BindingScope.TRANSIENT})
export class DetectLogService {
  constructor(
    @repository(LogDetectRepository)
    public logDetectRepository: LogDetectRepository,
    @repository(LogRepository)
    public logRepository: LogRepository,
    @repository(UserRepository)
    public userRepository: UserRepository,
    @repository(LogDetectRedisRepository)
    public logDetectRedisRepository: LogDetectRedisRepository,
    @inject('helper.MongoAndRedisHelper')
    public mongoAndRedisHelper: MongoAndRedisHelper,
  ) {}

  async scanLog(): Promise<void> {
    const scanBatchSize = 50; // Số lượng Log sẽ được quét trong mỗi lần chạy
    // Bước 1: Lấy tất cả Log chưa được phân loại từ MongoDB
    const logsToDetect = await this.logRepository.find({
      where: {isDetected: false},
      limit: scanBatchSize,
    });

    if (logsToDetect.length === 0) return;
    console.log(`Phát hiện ${logsToDetect.length} log cần phân loại`);

    // Set để lưu những user bị gắn cờ, nếu user đó spam trong lần này k cần check nx
    const spammers = new Set<string>();

    for (const log of logsToDetect) {
      if (!log.userID) {
        console.error(`Log ID ${log.id} thiếu userID, bỏ qua.`);
        await this.logRepository.updateById(log.id, {isDetected: true});
        continue;
      }

      if (spammers.has(log.userID)) {
        // Đã bị đánh dấu spammer trong vòng lặp này -> bỏ qua và cập nhật log đã quét
        await this.logRepository.updateById(log.id!, {isDetected: true});
        continue;
      }

      // Kiểm tra user đã nằm trong danh sách đen chưa (qua Redis + Mongo)
      const isSpam = await this.mongoAndRedisHelper.checkSpamUser(log.userID);
      if (isSpam) {
        spammers.add(log.userID);
        await this.logRepository.updateAll(
          {isDetected: true},
          {userID: log.userID, isDetected: false},
        );
        console.log(
          `Bỏ qua log của user ${log.userID} đã bị đánh dấu spam trước đó.`,
        );
        continue;
      }

      // Bước 2: Kiểm tra hành vi spam mới
      const recentCount = await this.logRepository.count({
        userID: log.userID,
        timestamp: {gt: new Date(log.timestamp.getTime() - 5000)},
      });

      if (recentCount.count >= 20) {
        spammers.add(log.userID);

        // Cập nhật tất cả log chưa quét của user này thành đã quét
        await this.logRepository.updateAll(
          {isDetected: true},
          {userID: log.userID, isDetected: false},
        );

        const logDetectEntry = new LogDetect({
          id: log.id,
          orderId: log.orderId,
          action: log.action,
          userID: log.userID,
          timestamp: log.timestamp,
          label: Label.SPAM,
          reason: `Người dùng thực hiện ${recentCount.count} hành động trong vòng 5s.`,
        });

        // Lưu vào MongoDB và Redis với key là userID (để checkSpamUser dùng được)
        await this.mongoAndRedisHelper.saveLogDetect(
          log.userID,
          logDetectEntry,
        );

        // Cập nhật trạng thái người dùng trong cả MongoDB và Redis
        await this.mongoAndRedisHelper.updateUserMongoAndCreateUserRedis(
          log.userID,
          {
            status: 'SPAM',
          },
        );

        console.log(
          `Log ID ${log.id} đã được phân loại: SPAM. Người dùng ${log.userID} bị đưa vào blacklist.`,
        );
        continue;
      }

      // Bước 3: Kiểm tra kịch bản lỗi logic
      let label: Label = Label.NORMAL;
      let reason = '';

      if (log.action !== OrderAction.DAT_HANG) {
        const previousAction = normalFlowActions.get(log.action as OrderAction);
        if (previousAction) {
          const previousLog = await this.logRepository.findOne({
            where: {
              orderId: log.orderId,
              action: previousAction,
            },
            order: ['timestamp DESC'],
          });

          if (!previousLog) {
            label = Label.ERROR;
            reason = `Thiếu log hành động ${previousAction} trước đó.`;
          }
        }
      }

      // Nếu có lỗi logic thì lưu lại vết
      if (label === Label.ERROR) {
        const logDetectEntry = new LogDetect({
          id: log.id,
          orderId: log.orderId,
          action: log.action,
          userID: log.userID,
          timestamp: log.timestamp,
          label,
          reason,
        });
        await this.logDetectRepository.create(logDetectEntry);
        await this.logDetectRedisRepository.save(log.id, logDetectEntry);
      }

      // Đánh dấu log hiện tại là đã quét
      await this.logRepository.updateById(log.id, {isDetected: true});
      console.log(
        `Log ID ${log.id} đã được phân loại: ${label}. ${reason ? reason : 'Bình thường'}`,
      );
    }
  }
}
