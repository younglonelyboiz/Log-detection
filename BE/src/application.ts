import {BootMixin} from '@loopback/boot';
import {ApplicationConfig, BindingScope} from '@loopback/core';
import {
  RestExplorerBindings,
  RestExplorerComponent,
} from '@loopback/rest-explorer';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {ServiceMixin} from '@loopback/service-proxy';
import path from 'path';
import {MySequence} from './sequence';
import {UserService} from './service/user.service';
import {UserRepository} from './repositories/user.repository';
import {GenerateLogService} from './service/generate-log.service';
import {LogRepository} from './repositories/log.repository';
import {LogDetectRepository} from './repositories/log-detect.repository';
import {RabbitMQDataSource} from './datasources/rabbitmq.datasource';
import {LogProducerService} from './service/log-producer.service';
import {LogConsumerService} from './service/log-consumer.service';
import {DetectLogService} from './service/detect-log.service';
import {LogDetectRedisRepository} from './repositories/redis/log-detect-redis.repository';
import {UserHelper} from './helper/user.helper';
import {RedisDataSource} from './datasources/redis.datasource';

export {ApplicationConfig};

export class LogDetectionApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);
    this.service(GenerateLogService);
    this.service(UserService);
    this.repository(LogRepository);
    this.repository(UserRepository);
    this.repository(LogDetectRepository);
    this.service(DetectLogService);

    this.bind('helper.UserHelper').toClass(UserHelper);

    this.bind('datasources.redis')
      .toClass(RedisDataSource)
      .inScope(BindingScope.SINGLETON);
    this.repository(LogDetectRedisRepository);

    // Đăng ký RabbitMQ & các tiến trình Producer / Consumer
    this.bind('datasources.RabbitMQ')
      .toClass(RabbitMQDataSource)
      .inScope(BindingScope.SINGLETON)
      .tag('lifeCycleObserver');
    this.service(LogConsumerService);
    this.service(LogProducerService);

    // Set up the custom sequence
    this.sequence(MySequence);

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    // Customize @loopback/rest-explorer configuration here
    this.configure(RestExplorerBindings.COMPONENT).to({
      path: '/explorer',
    });
    this.component(RestExplorerComponent);

    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };
  }
}
//// File: BE/src/models/log.model.ts
