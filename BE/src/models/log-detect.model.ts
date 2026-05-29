import {Entity, model, property} from '@loopback/repository';

@model()
export class LogDetect extends Entity {
  @property({
    type: 'string',
    id: true,
    required: true,
    generated: false, // ID sẽ được tạo thủ công bằng uuidv4() trong LogService
  })
  id: string; //id của log 1 đơn hàng có nhiều log nên cần ID

  @property({
    type: 'string',
    required: true,
  })
  orderId: string; //id Đơn hàng liên quan đến log

  @property({
    type: 'string',
    required: true,
  })
  action: string; //hành động được thực hiện "Thanh toán, đặt hàng,...."

  @property({
    type: 'string',
    required: true,
  })
  userID: string;

  @property({
    type: 'date',
    required: true,
  })
  timestamp: Date; //thời gian log được tạo ra

  @property({
    type: 'string',
    required: true,
  })
  label: string; //nhãn phân loại log (bình thường, lỗi logic, spam)

  constructor(data?: Partial<LogDetect>) {
    super(data);
  }
}
