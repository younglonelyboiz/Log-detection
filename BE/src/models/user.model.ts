import {Entity, model, property} from '@loopback/repository';

@model()
export class User extends Entity {
  @property({
    type: 'string',
    id: true,
    required: true,
    generated: false,
  })
  id: string;

  @property({
    type: 'string',
  })
  name?: string;

  @property({
    type: 'string',
    required: true,
  })
  status: string; // trạng thái của user (bình thường, nghi ngờ, bị khóa)

  constructor(data?: Partial<User>) {
    super(data);
  }
}
