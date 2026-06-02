import {Entity, model, property} from '@loopback/repository';
import {OrderAction} from '../enums/acction.enum';

@model()
export class Log extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
    mongodb: {dataType: 'ObjectId'},
  })
  id: string;

  @property({
    type: 'string',
    required: true,
  })
  orderId: string; //id Đơn hàng liên quan đến log

  @property({
    type: 'string',
    required: true,
    jsonSchema: {enum: Object.values(OrderAction)},
  })
  action: OrderAction; //hành động được thực hiện "Thanh toán, đặt hàng,...."

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
    type: 'boolean',
    defaul: false,
  })
  isDetected: boolean; //nhãn phân loại log (bình thường, lỗi logic, spam)`

  constructor(data?: Partial<Log>) {
    super(data);
  }
}
///// File: BE/src/models/log.model.ts
