import { Injectable } from '@nestjs/common';
import { UserRepository } from '../auth/repositories/user.repository';
import { User } from '../auth/interfaces/user.interface';
import { IntegrationsService } from '../integrations/integrations.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly integrationsService: IntegrationsService,
  ) {}

  async getCurrentUser(kuid: string): Promise<User | null> {
    const user = await this.userRepository.findByKuid(kuid);
    if (!user) return null;

    const [cnic_front, cnic_back, selfie] = await this.integrationsService.getDisplayUrls([
      user.cnic_front,
      user.cnic_back,
      user.selfie,
    ]);

    return {
      ...user,
      cnic_front: cnic_front ?? null,
      cnic_back: cnic_back ?? null,
      selfie: selfie ?? null,
    };
  }
}
