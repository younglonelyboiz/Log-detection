import {inject} from '@loopback/core';
import {requestBody, post, response, getModelSchemaRef} from '@loopback/rest';
import {LogService} from '../service/log.service';
import {Log} from '../models/log.model';

export class LogController {
  constructor(
    @inject('services.LogService')
    public logService: LogService,
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
    return this.logService.generateNormalFlowLog();
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
              action: {type: 'string'},
              quantity: {type: 'number'},
            },
            required: ['action', 'quantity'],
          },
        },
      },
    })
    request: {
      action: string;
      quantity: number;
    },
  ): Promise<Log[]> {
    const {action, quantity} = request;
    return this.logService.generateErrorFlowLog(action, quantity);
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
              action: {type: 'string'},
              quantity: {type: 'number'},
            },
            required: ['action', 'quantity'],
          },
        },
      },
    })
    request: {
      action: string;
      quantity: number;
    },
  ): Promise<Log[]> {
    const {action, quantity} = request;
    return this.logService.generateSpamFlowLog(action, quantity);
  }
}

///// File: BE/src/models/log.model.ts
