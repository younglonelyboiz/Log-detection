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

export class UserController {
  constructor(
    @service(UserService)
    public userService: UserService,
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

  @patch('/users/{id}/status')
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
  async updateUserStatus(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['status'],
            properties: {
              status: {type: 'string'},
            },
          },
        },
      },
    })
    body: {
      status: string;
    },
  ): Promise<object> {
    await this.userService.updateUserStatus(id, body.status);

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
}
