import {service} from '@loopback/core';
import {UserService} from '../service/user.service';
import {
  get,
  param,
  requestBody,
  response,
  post,
  del,
  patch,
} from '@loopback/rest';
import {User} from '../models/user.model';
import {inject} from '@loopback/core';
import {MongoAndRedisHelper} from '../helper/mongo-and-redis.helper';

export class UserController {
  constructor(
    @service(UserService)
    public userService: UserService,
    @inject('helper.MongoAndRedisHelper')
    public mongoAndRedisHelper: MongoAndRedisHelper,
  ) {}

  @post('/create/users')
  @response(200, {
    description: 'Tạo mới người dùng',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            message: {type: 'string'},
          },
        },
      },
    },
  })
  async createUser(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              name: {type: 'string'},
              email: {type: 'string'},
            },
            required: ['name', 'email'],
          },
        },
      },
    })
    request: {
      name: string;
      email: string;
    },
  ): Promise<object> {
    const {name, email} = request;
    await this.userService.createUser(name, email);
    return {message: 'User created successfully'};
  }

  @post('/create/batch-users')
  @response(200, {
    description: 'Tạo mới nhiều người dùng',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            message: {type: 'string'},
          },
        },
      },
    },
  })
  async createBatchUsers(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: {type: 'string'},
                email: {type: 'string'},
              },
              required: ['name', 'email'],
            },
          },
        },
      },
    })
    request: {name: string; email: string}[],
  ): Promise<object> {
    await this.userService.createBatchUsers(request);
    return {message: 'Users created successfully'};
  }
  @get('/users/cache')
  @response(200, {
    description: 'Lấy danh sách người dùng từ Redis',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: {
            'x-ts-type': User,
          },
        },
      },
    },
  })
  async getAllUsersRedis(
    @param.query.number('limit') limit: number = 10,
    @param.query.number('offset') offset: number = 0,
  ): Promise<User[]> {
    return this.userService.getAllUsersRedis(limit, offset);
  }

  @get('users/{id}/cache')
  @response(200, {
    description: 'Lấy thông tin người dùng từ Redis',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            message: {type: 'string'},
            user: {
              'x-ts-type': User,
            },
          },
        },
      },
    },
  })
  async getUserByIdRedis(@param.path.string('id') id: string): Promise<object> {
    return {
      message: 'User found',
      user: await this.userService.getUserByIdRedis(id),
    };
  }

  @get('/users/{id}')
  @response(200, {
    description: 'Lấy thông tin người dùng',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            message: {type: 'string'},
            user: {
              'x-ts-type': User,
            },
          },
        },
      },
    },
  })
  async getUserById(@param.path.string('id') id: string): Promise<object> {
    const user = await this.userService.getUserById(id);

    return {
      message: 'User found',
      user,
    };
  }

  @del('/users/{id}')
  @response(200, {
    description: 'Xóa người dùng theo ID',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            message: {type: 'string'},
          },
        },
      },
    },
  })
  async deleteUserById(@param.path.string('id') id: string): Promise<object> {
    await this.userService.deleteUserById(id);

    return {
      message: 'User deleted successfully',
    };
  }

  @patch('/users/{id}/update')
  @response(200, {
    description: 'Cập nhật trạng thái người dùng',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            message: {type: 'string'},
          },
        },
      },
    },
  })
  async updateUser(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
          },
        },
      },
    })
    body: Partial<User>,
  ): Promise<object> {
    await this.userService.updateUser(id, body);

    return {
      message: 'User status updated successfully',
    };
  }

  @get('/users')
  @response(200, {
    description: 'Lấy danh sách người dùng',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: {
            'x-ts-type': User,
          },
        },
      },
    },
  })
  async getAllUsersPaginated(
    @param.query.number('page') page: number = 1,
    @param.query.number('pageSize') pageSize: number = 10,
  ): Promise<User[]> {
    return this.userService.getAllUsersPaginated(page, pageSize);
  }

  @post('/reset/users')
  @response(200, {
    description: 'Reset trạng thái người dùng',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            message: {type: 'string'},
          },
        },
      },
    },
  })
  async resetAllUser(): Promise<object> {
    await this.userService.resetAllUser();
    return {message: 'Users reset successfully'};
  }
}
