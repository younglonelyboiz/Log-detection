import {Entity, model, property} from '@loopback/repository';

@model()
export class User extends Entity {
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
  name: string;

  @property({
    type: 'string',
    required: true,
    unique: true,
  })
  email: string;

  @property({
    type: 'string',
    default: 'Active',
  })
  status?: string; // trạng thái của user (bình thường, nghi ngờ, bị khóa)

  constructor(data?: Partial<User>) {
    super(data);
  }
}
