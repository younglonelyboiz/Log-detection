import {injectable, BindingScope} from '@loopback/core';
import {UserRepository} from '../repositories/user.repository';
import {repository} from '@loopback/repository';
import {User} from '../models/user.model';

@injectable({scope: BindingScope.TRANSIENT})
export class UserService {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
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

  async deleteUserById(id: string): Promise<void> {
    await this.userRepository.deleteById(id);
  }

  async updateUserStatus(id: string, status: string): Promise<void> {
    await this.userRepository.updateById(id, {
      status,
    });
  }

  async getAllUsersPaginated(page: number, pageSize: number): Promise<User[]> {
    return this.userRepository.find({
      offset: (page - 1) * pageSize,
      limit: pageSize,
    });
  }
}
