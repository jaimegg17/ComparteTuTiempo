import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';

export interface UpdateUserProfileInput {
  userId: string;
  data: {
    name?: string;
    phoneNumber?: string;
    location?: string;
    bio?: string;
    skills?: string[];
  };
}

export interface UpdateUserProfileOutput {
  user: any;
}

@Injectable()
export class UpdateUserProfileUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(input: UpdateUserProfileInput): Promise<UpdateUserProfileOutput> {
    const { userId, data } = input;

    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      throw new Error('Usuario no encontrado');
    }

    // Update user
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.phoneNumber !== undefined && { phoneNumber: data.phoneNumber }),
        ...(data.location !== undefined && { location: data.location }),
        ...(data.bio !== undefined && { bio: data.bio }),
        ...(data.skills !== undefined && { skills: data.skills }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        phoneNumber: true,
        location: true,
        bio: true,
        skills: true,
        role: true,
        timeCredits: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      user: updatedUser,
    };
  }
}

