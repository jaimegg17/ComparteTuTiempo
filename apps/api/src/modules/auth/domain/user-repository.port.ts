import { User, UserCreate, UserUpdate } from './user.entity';

export interface UserRepositoryPort {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(userData: UserCreate): Promise<User>;
  update(id: string, userData: UserUpdate): Promise<User>;
  delete(id: string): Promise<void>;
  findAll(): Promise<User[]>;
}
