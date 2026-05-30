import {inject} from '@loopback/core';
import {requestBody, post, response} from '@loopback/rest';
import {Log} from '../models/log.model';
import {OrderAction} from '../enums/acction.enum';
import {LogProducerService} from '../service/log-producer.service';

export class GenerateLogController {
  constructor(
    @inject('services.LogProducerService')
    public logProducerService: LogProducerService,
  ) {}

  @post('/logs/normal')
  @response(200, {
    description: 'Kịch bản Log cho 1 đơn hàng  bình thường',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: {
            'x-ts-type': Log,
          },
        },
      },
    },
  })
  async getNormalFlowLogs(): Promise<Log[]> {
    return this.logProducerService.publishNormalFlow();
  }

  @post('/logs/error')
  @response(200, {
    description: 'Kịch bản Log cho đơn hàng lỗi logic',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: {
            'x-ts-type': Log,
          },
        },
      },
    },
  })
  async getErrorFlowLogs(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              action: {type: 'string', enum: Object.values(OrderAction)},
              quantity: {type: 'number'},
            },
            required: ['action', 'quantity'],
          },
        },
      },
    })
    request: {
      action: OrderAction;
      quantity: number;
    },
  ): Promise<Log[]> {
    const {action, quantity} = request;
    return this.logProducerService.publishErrorFlow(action, quantity);
  }

  @post('/logs/spam')
  @response(200, {
    description: 'Kịch bản Log spam',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: {
            'x-ts-type': Log,
          },
        },
      },
    },
  })
  async getSpamFlowLogs(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              action: {type: 'string', enum: Object.values(OrderAction)},
              quantity: {type: 'number'},
            },
            required: ['action', 'quantity'],
          },
        },
      },
    })
    request: {
      action: OrderAction;
      quantity: number;
    },
  ): Promise<Log[]> {
    const {action, quantity} = request;
    return this.logProducerService.publishSpamFlow(action, quantity);
  }
}

///// File: BE/src/models/log.model.ts
