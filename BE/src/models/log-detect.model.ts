import {Entity, model, property} from '@loopback/repository';
import {OrderAction} from '../enums/acction.enum';
import {Label} from '../enums/label.enum';

@model()
export class LogDetect extends Entity {
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
    type: 'string',
    required: true,
    jsonSchema: {enum: Object.values(Label)},
  })
  label: Label; //nhãn phân loại log (bình thường, lỗi logic, spam)

  constructor(data?: Partial<LogDetect>) {
    super(data);
  }
}
