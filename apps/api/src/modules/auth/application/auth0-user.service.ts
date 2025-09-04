import { Injectable, Inject } from '@nestjs/common';
import type { UserRepositoryPort } from '../domain/user-repository.port';
import type { User, UserCreate } from '../domain/user.entity';

@Injectable()
export class Auth0UserService {
  constructor(@Inject('UserRepositoryPort') private readonly userRepository: UserRepositoryPort) {}

  /**
   * Find or create user from Auth0 payload
   * This method is called when a user authenticates with Auth0
   */
  async findOrCreateFromAuth0(auth0User: any): Promise<User> {
    // Try to find user by Auth0 ID (now the primary key)
    let user = await this.userRepository.findById(auth0User.id);
    
    if (!user) {
      // Create new user from Auth0 data
      const userData: UserCreate = {
        id: auth0User.id, // Auth0 ID as primary key
        email: auth0User.email,
        name: auth0User.name,
        imageUrl: auth0User.picture,
        // Set default values
        password: '', // No password needed with Auth0
        phoneNumber: undefined,
        location: undefined,
        bio: undefined,
        skills: [],
      };
      
      user = await this.userRepository.create(userData);
    } else {
      // Update user info from Auth0
      const updateData = {
        email: auth0User.email,
        name: auth0User.name,
        imageUrl: auth0User.picture,
      };
      
      user = await this.userRepository.update(user.id, updateData);
    }
    
    return user;
  }
}
