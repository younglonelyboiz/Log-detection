import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongodbDataSource} from '../datasources/mongodb.datasource';
import {Log} from '../models/log.model'; // Import Log model

export class LogRepository extends DefaultCrudRepository<
  Log,
  typeof Log.prototype.id // Sử dụng id của Log model
> {
  constructor(@inject('datasources.mongodb') dataSource: MongodbDataSource) {
    super(Log, dataSource);
  }
}
