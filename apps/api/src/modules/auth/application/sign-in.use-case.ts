import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import type { UserRepositoryPort } from '../domain/user-repository.port';
import type { User } from '../domain/user.entity';
import { SignIn } from '@comparte-tu-tiempo/contracts';
import * as bcrypt from 'bcrypt';

type PublicUser = Omit<User, 'password'>;

@Injectable()
export class SignInUseCase {
  constructor(@Inject('UserRepositoryPort') private readonly userRepository: UserRepositoryPort) {}

  async execute(signInData: SignIn): Promise<{ user: PublicUser; token: string }> {
    // Find user by email
    const user = await this.userRepository.findByEmail(signInData.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(signInData.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    void password;

    // TODO: Generate JWT token
    const token = 'mock-jwt-token';

    return {
      user: userWithoutPassword,
      token,
    };
  }
}
