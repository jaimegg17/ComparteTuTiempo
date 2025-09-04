import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import type { UserRepositoryPort } from '../domain/user-repository.port';

@Injectable()
export class GetMeUseCase {
  constructor(@Inject('UserRepositoryPort') private readonly userRepository: UserRepositoryPort) {}

  async execute(userId: string): Promise<any> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user;

    return userWithoutPassword;
  }
}
