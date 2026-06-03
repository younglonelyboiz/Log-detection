import {injectable, BindingScope} from '@loopback/core';
import {User} from '../models/user.model';
import {UserRepository} from '../repositories/user.repository';
import {repository} from '@loopback/repository';

@injectable({scope: BindingScope.TRANSIENT})
export class UserRandomHelper {
  constructor(
    @repository(UserRepository)
    private userRepository: UserRepository,
  ) {}
  async getRandomUserId(): Promise<string> {
    // const users = await this.userRepository.find({
    //   limit: 10,
    // });
    const index = await this.userRepository.count();
    const indexRandom = Math.floor(Math.random() * index.count);
    const users = await this.userRepository.find({
      offset: indexRandom,
      limit: 1,
    });
    if (users.length === 0) {
      throw new Error('Không có người dùng nào trong hệ thống');
    }
    return users[0].id;
  }
}
