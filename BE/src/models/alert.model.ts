import {Entity, model, property} from '@loopback/repository';
import {profile} from 'node:console';

@model()
export class Alert extends Entity {
  @property({
    type: 'string',
    id: true,
    required: true,
    generated: false, // ID sẽ được tạo thủ công bằng uuidv4()
  })
  id: string;

  @property({
    type: 'string',
    required: true,
  })
  logDetectId: string;

  @property({
    type: 'string',
    required: true,
  })
  userId: string;

  @property({
    type: 'string',
    required: true,
  })
  orderId: string;

  @property({
    type: 'string',
    required: true,
  })
  status: string; // mơi, dang điều tra, đã xử lý, báo động giả

  @property({
    type: 'string',
    required: true,
  })
  adminNote: string;

  @property({
    type: 'date',
    required: true,
  })
  timestamp: Date;

  constructor(data?: Partial<Alert>) {
    super(data);
  }
}
