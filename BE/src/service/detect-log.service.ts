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
  ) {}

  async scanLog(): Promise<void> {
    const scanBatchSize = 50; // Số lượng Log sẽ được quét trong mỗi lần chạy
    // Bước 1: Lấy tất cả Log chưa được phân loại từ MongoD
    const logsToDetect = await this.logRepository.find({
      where: {isDetected: false},
      limit: scanBatchSize,
    });
    if (logsToDetect.length !== 0) {
      console.log(`Phát hiện ${logsToDetect.length} log cần được phân loại.`);
    }

    // Bước 2: Quét từng Log và phân loại
    for (const log of logsToDetect) {
      let spam = false;
      let label: Label = Label.NORMAL;
      let reason = '';

      // Kiểm tra xem user đã bị đánh dấu spam trước đó chưa (trong MongoDB)
      const existingSpam = await this.logDetectRepository.findOne({
        where: {userID: log.userID, label: Label.SPAM},
      });
      if (existingSpam) {
        // User đã bị đánh dấu spam → đánh dấu tất cả log mới của user này và bỏ qua
        await this.logRepository.updateAll(
          {isDetected: true},
          {userID: log.userID, isDetected: false},
        );
        console.log(
          `Bỏ qua log của user ${log.userID} — đã bị đánh dấu spam trước đó.`,
        );
        continue;
      }

      // Kiểm tra xem Log có thuộc kịch bản spam hay không
      const recentCount = await this.logRepository.count({
        userID: log.userID,
        timestamp: {gt: new Date(log.timestamp.getTime() - 5000)},
      });

      if (recentCount.count >= 20) {
        spam = true;
        // cập nhật cờ cho tất cả log của user này để tránh quét lại nhiều lần
        await this.logRepository.updateAll(
          {isDetected: true},
          {userID: log.userID, isDetected: false},
        );
        label = Label.SPAM;
        reason = `Người dùng thực hiện ${recentCount.count} hành động trong vòng 5s.`;
        // Cập nhật Log đã được phân loại vào MongoDB
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
        if (spam) {
          // Lưu vào Redis để tra cứu nhanh cho các log sau của cùng user
          await this.logDetectRedisRepository.save(log.id!, logDetectEntry);
        }
        // đánh dấu log gốc đã được quét
        await this.logRepository.updateById(log.id!, {isDetected: true});
        continue;
      }

      // Kiểm tra xem Log có thuộc kịch bản lỗi logic hay không
      if (log.action !== OrderAction.DAT_HANG) {
        const previousAction = normalFlowActions.get(log.action as OrderAction);
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
        // Cập nhật Log đã được phân loại vào MongoDB
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
        if (label === Label.ERROR) {
          // Lưu vào Redis để tra cứu nhanh cho các log sau của cùng order
          await this.logDetectRedisRepository.save(log.id!, logDetectEntry);
        }
        // đánh dấu log gốc đã được quét
      }

      await this.logRepository.updateById(log.id!, {isDetected: true});

      console.log(`Log ID ${log.id} đã được phân loại: ${label}. ${reason}`);
    }
  }
}
