import {Entity, model, property} from '@loopback/repository';
import {UserStatus} from '../enums/user-status.enum';

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
    default: UserStatus.ACTIVE,
    jsonSchema: {enum: Object.values(UserStatus)},
  })
  status: UserStatus;

  constructor(data?: Partial<User>) {
    super(data);
  }
}
