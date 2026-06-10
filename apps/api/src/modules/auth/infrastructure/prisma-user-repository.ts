import { Injectable } from '@nestjs/common';
import { User as PrismaUser } from '@prisma/client';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { UserRepositoryPort } from '../domain/user-repository.port';
import { User, UserCreate, UserUpdate } from '../domain/user.entity';

@Injectable()
export class PrismaUserRepository implements UserRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    return user ? this.mapToDomain(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    return user ? this.mapToDomain(user) : null;
  }

  // findByAuth0Id is now just findById since we use Auth0 ID as primary key

  async create(userData: UserCreate): Promise<User> {
    const user = await this.prisma.user.create({
      data: {
        id: userData.id, // Auth0 ID as primary key
        email: userData.email,
        password: userData.password,
        name: userData.name,
        phoneNumber: userData.phoneNumber,
        location: userData.location,
        bio: userData.bio,
        skills: userData.skills || [],
        imageUrl: userData.imageUrl,
        role: 'USER',
      },
    });

    return this.mapToDomain(user);
  }

  async update(id: string, userData: UserUpdate): Promise<User> {
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        email: userData.email,
        password: userData.password,
        name: userData.name,
        phoneNumber: userData.phoneNumber,
        location: userData.location,
        bio: userData.bio,
        skills: userData.skills,
        imageUrl: userData.imageUrl,
        role: userData.role,
      },
    });

    return this.mapToDomain(user);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    });
  }

  async findAll(): Promise<User[]> {
    const users = await this.prisma.user.findMany();
    return users.map(user => this.mapToDomain(user));
  }

  private mapToDomain(prismaUser: PrismaUser): User {
    return {
      id: prismaUser.id, // Auth0 ID as primary key
      email: prismaUser.email,
      password: prismaUser.password,
      name: prismaUser.name,
      phoneNumber: prismaUser.phoneNumber ?? undefined,
      location: prismaUser.location ?? undefined,
      bio: prismaUser.bio ?? undefined,
      skills: prismaUser.skills,
      imageUrl: prismaUser.imageUrl ?? undefined,
      role: prismaUser.role as User['role'],
      createdAt: prismaUser.createdAt,
      updatedAt: prismaUser.updatedAt,
    };
  }
}
