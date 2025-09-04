import { Injectable, ConflictException, BadRequestException, Inject } from '@nestjs/common';
import type { UserRepositoryPort } from '../domain/user-repository.port';
import type { UserCreate } from '../domain/user.entity';
import { SignUp } from '@comparte-tu-tiempo/contracts';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SignUpUseCase {
  constructor(@Inject('UserRepositoryPort') private readonly userRepository: UserRepositoryPort) {}

  async execute(signUpData: SignUp): Promise<{ user: any; token: string }> {
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(signUpData.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Validate password strength
    if (signUpData.password.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters long');
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(signUpData.password, saltRounds);

    // Create user
    const userData: UserCreate = {
      id: `temp-${Date.now()}`, // Temporary ID for JWT auth
      email: signUpData.email,
      password: hashedPassword,
      name: signUpData.name,
      phoneNumber: signUpData.phoneNumber,
      location: signUpData.location,
      bio: undefined,
      skills: [],
      imageUrl: undefined,
    };

    const user = await this.userRepository.create(userData);

    // Remove password from response
    const { password, ...userWithoutPassword } = user;

    // TODO: Generate JWT token
    const token = 'mock-jwt-token';

    return {
      user: userWithoutPassword,
      token,
    };
  }
}
