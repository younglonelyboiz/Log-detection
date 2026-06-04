import {injectable, BindingScope, inject} from '@loopback/core';
import {UserRepository} from '../repositories/user.repository';
import {repository} from '@loopback/repository';
import {User} from '../models/user.model';
import {MongoAndRedisHelper} from '../helper/mongo-and-redis.helper';
import {UserRedisRepository} from '../repositories/redis/user-redis-repository';

@injectable({scope: BindingScope.TRANSIENT})
export class UserService {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
    @repository(UserRedisRepository)
    public userRedisRepository: UserRedisRepository,
    @inject('helper.MongoAndRedisHelper')
    public mongoAndRedisHelper: MongoAndRedisHelper,
  ) {}
  async createUser(name: string, email: string): Promise<void> {
    const newUser = {
      name,
      email,
    };
    await this.userRepository.create(newUser);
  }

  async createBatchUsers(
    users: {name: string; email: string}[],
  ): Promise<void> {
    const newUsers = users.map(user => ({
      name: user.name,
      email: user.email,
    }));
    await this.userRepository.createAll(newUsers);
  }

  async getUserById(id: string): Promise<User | null> {
    return this.userRepository.findById(id);
  }

  async getUserByIdRedis(id: string): Promise<User | null> {
    return this.userRedisRepository.findById(id);
  }

  async deleteUserById(id: string): Promise<void> {
    await this.mongoAndRedisHelper.deleteUserRedisAndMongo(id);
  }

  async updateUser(id: string, updateData: Partial<User>): Promise<void> {
    await this.mongoAndRedisHelper.updateUserMongoAndCreateUserRedis(
      id,
      updateData,
    );
  }

  async getAllUsers(): Promise<User[]> {
    return this.userRepository.find();
  }

  async getAllUsersRedis(
    limit: number = 10,
    offset: number = 0,
  ): Promise<User[]> {
    return this.userRedisRepository.findPaginated(limit, offset);
  }

  async getAllUsersPaginated(page: number, pageSize: number): Promise<User[]> {
    return this.userRepository.find({
      offset: (page - 1) * pageSize,
      limit: pageSize,
    });
  }
}
