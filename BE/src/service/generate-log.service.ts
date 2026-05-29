import {injectable, BindingScope} from '@loopback/core';
import {Log} from '../models/log.model';
import {v4 as uuidv4} from 'uuid';

@injectable({scope: BindingScope.TRANSIENT})
export class GenerateLogService {
  // kịch bản Log cho 1 đơn hàng theo flow bình thường
  async generateNormalFlowLog(): Promise<Log[]> {
    const logs: Log[] = [];
    const actions = [
      'Đặt hàng',
      'Thanh toán',
      'Xác nhận đơn hàng',
      'Giao hàng',
      'Hoàn thành',
    ];
    const userId = uuidv4(); // Giả sử userId cố định cho ví dụ này
    const orderId = uuidv4(); // Giả sử orderId cố định cho ví dụ này
    const baseTime = Date.now();
    for (let i = 0; i < 3; i++) {
      // 3 Log đầu xảy ra nhanh phase này để query vào Redis trước
      const newlog = new Log({
        id: uuidv4(),
        orderId,
        action: actions[i],
        userID: userId,
        timestamp: new Date(baseTime + i * 30000), // Mỗi Log cách nhau 30 giây
      });
      logs.push(newlog);
    }
    for (let i = 3; i < actions.length; i++) {
      // 2 Log sau xảy ra chậm hơn để query vào MongoDB sau
      const newLog = new Log({
        id: uuidv4(),
        orderId,
        action: actions[i],
        userID: userId,
        timestamp: new Date(baseTime + i * 6000000), // Mỗi Log cách nhau 100 phút
      });
      logs.push(newLog);
    }

    return logs;
  }

  // kịch bản lỗi Logic nghiệp vụ sinh 1 lỗi của flow trừ buớc đầu tiên
  async generateErrorFlowLog(action: string, quantity: number): Promise<Log[]> {
    const logs: Log[] = [];
    const baseTime = Date.now();
    const actions = [
      'Thanh toán',
      'Xác nhận đơn hàng',
      'Giao hàng',
      'Hoàn thành',
    ];
    if (!actions.includes(action)) {
      throw new Error(
        'Hành động không hợp lệ. Vui lòng chọn một trong các hành động sau: ' +
          actions.join(', '),
      );
    }
    for (let i = 0; i < quantity; i++) {
      const newLog = new Log({
        id: uuidv4(),
        orderId: uuidv4(),
        action: action, // Hành động lỗi được truyền vào
        userID: uuidv4(),
        timestamp: new Date(baseTime),
      });
      logs.push(newLog);
    }
    return logs;
  }

  // kịch bản 3 spam
  async generateSpamFlowLog(action: string, quantity: number): Promise<Log[]> {
    const logs: Log[] = [];
    const baseTime = Date.now();
    const actions = [
      'Đặt hàng',
      'Thanh toán',
      'Xác nhận đơn hàng',
      'Giao hàng',
      'Hoàn thành',
    ];
    if (!actions.includes(action)) {
      throw new Error(
        'Hành động không hợp lệ. Vui lòng chọn một trong các hành động sau: ' +
          actions.join(', '),
      );
    }
    for (let i = 0; i < quantity; i++) {
      const newLog = new Log({
        id: uuidv4(),
        orderId: uuidv4(),
        action: action,
        userID: 'spam001',
        timestamp: new Date(baseTime + i * 10),
      });
      logs.push(newLog);
    }
    return logs;
  }
}
