import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import type { UserRepositoryPort } from '../domain/user-repository.port';
import type { User } from '../domain/user.entity';

type PublicUser = Omit<User, 'password'>;

@Injectable()
export class GetMeUseCase {
  constructor(@Inject('UserRepositoryPort') private readonly userRepository: UserRepositoryPort) {}

  async execute(userId: string): Promise<PublicUser> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phoneNumber: user.phoneNumber,
      location: user.location,
      bio: user.bio,
      skills: user.skills,
      imageUrl: user.imageUrl,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
