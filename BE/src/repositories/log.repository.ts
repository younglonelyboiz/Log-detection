import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongodbDataSource} from '../datasources/mongodb.datasource';
import {Log} from '../models/log.model';
import {injectable} from '@loopback/core';

@injectable()
export class LogRepository extends DefaultCrudRepository<
  Log,
  typeof Log.prototype.id
> {
  constructor(@inject('datasources.mongodb') dataSource: MongodbDataSource) {
    super(Log, dataSource);
  }
}
