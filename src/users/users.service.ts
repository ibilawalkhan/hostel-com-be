import { Injectable } from '@nestjs/common';
import { UserRepository } from '../auth/repositories/user.repository';
import { User } from '../auth/interfaces/user.interface';

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UserRepository) {}

  async getCurrentUser(kuid: string): Promise<User | null> {
    return this.userRepository.findByKuid(kuid);
  }
}
