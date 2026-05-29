import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongodbDataSource} from '../datasources/mongodb.datasource';
import {LogDetect} from '../models/log-detect.model';

export class LogDetectRepository extends DefaultCrudRepository<
  LogDetect,
  typeof LogDetect.prototype.id
> {
  constructor(@inject('datasources.mongodb') dataSource: MongodbDataSource) {
    super(LogDetect, dataSource);
  }
}
