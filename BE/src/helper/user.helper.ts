import {injectable, BindingScope} from '@loopback/core';
import {User} from '../models/user.model';
import {UserRepository} from '../repositories/user.repository';
import {repository} from '@loopback/repository';

@injectable({scope: BindingScope.TRANSIENT})
export class UserHelper {
  constructor(
    @repository(UserRepository)
    private userRepository: UserRepository,
  ) {}
  async getRandomUserId(): Promise<string> {
    const users = await this.userRepository.find({
      limit: 10,
    });
    if (users.length === 0) {
      throw new Error('Không có người dùng nào trong hệ thống');
    }
    const randomIndex = Math.floor(Math.random() * users.length);
    return users[randomIndex].id;
  }
}
