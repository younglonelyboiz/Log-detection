import { service } from '@loopback/core';
import { get, param, response } from '@loopback/rest';
import { LogService } from '../service/log.service';
import { Log } from '../models/log.model';
import { LogDetect } from '../models/log-detect.model';

export class LogsController {
  constructor(
    @service(LogService)
    public logService: LogService,
  ) { }

  @get('/logs/user/{id}')
  @response(200, {
    description: 'Lấy danh sách log của người dùng theo ID',
    content: {
      'application/json': { schema: { type: 'array', items: { 'x-ts-type': Log } } },
    },
  })
  async getLogsByUser(@param.path.string('id') id: string): Promise<Log[]> {
    return this.logService.getLogsByUserId(id);
  }

  @get('/logs/detected/user/{id}')
  @response(200, {
    description: 'Lấy các log bất thường\lỗi đã được phân loại của người dùng',
    content: {
      'application/json': {
        schema: { type: 'array', items: { 'x-ts-type': LogDetect } },
      },
    },
  })
  async getDetectedLogsByUser(
    @param.path.string('id') id: string,
  ): Promise<LogDetect[]> {
    return this.logService.getDetectedLogsByUserId(id);
  }

  @get('/logs/detected')
  @response(200, {
    description: 'Lấy tất cả các log bất thường/lỗi đã được phân loại từ MongoDB',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            data: { type: 'array', items: { 'x-ts-type': LogDetect } },
            total: { type: 'number' },
          },
        },
      },
    },
  })
  async getAllDetectedLogs(
    @param.query.number('limit') limit?: number,
    @param.query.number('offset') offset?: number,
    @param.query.string('label') label?: string,
  ): Promise<object> {
    return this.logService.getAllDetectedLogs(limit, offset, label);
  }

  @get('/logs/cache')
  @response(200, {
    description: 'Lấy log từ redis',
    content: {
      'application/json': {
        schema: { type: 'array', items: { 'x-ts-type': LogDetect } },
      },
    },
  })
  async getLogRedis(
    @param.query.number('limit') limit?: number,
    @param.query.number('offset') offset?: number,
  ): Promise<LogDetect[]> {
    return this.logService.getLogsRedis(limit, offset);
  }

  @get('/dashboard/stats')
  @response(200, {
    description: 'Lấy các chỉ số thống kê cho Dashboard',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            total: { type: 'number' },
            totalUsers: { type: 'number' },
            successfulOrders: { type: 'number' },
            normal: { type: 'number' },
          },
        },
      },
    },
  })
  async getDashboardStats(): Promise<object> {
    return this.logService.getDashboardStats();
  }
}
