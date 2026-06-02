import {inject, injectable} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongodbDataSource} from '../datasources/mongodb.datasource';
import {User} from '../models/user.model';

@injectable()
export class UserRepository extends DefaultCrudRepository<
  User,
  typeof User.prototype.id
> {
  constructor(@inject('datasources.mongodb') dataSource: MongodbDataSource) {
    super(User, dataSource);
  }
}
