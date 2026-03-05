import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';

export interface GetUserProfileInput {
  userId: string;
}

export interface GetUserProfileOutput {
  user: {
    id: string;
    email: string;
    name: string;
    phoneNumber: string | null;
    location: string | null;
    bio: string | null;
    skills: string[];
    imageUrl: string | null;
    role: 'USER' | 'MODERATOR' | 'ADMIN';
    timeCredits: number;
    createdAt: Date;
    updatedAt: Date;
    stats: {
      servicesOffered: number;
      exchangesRequested: number;
      ratingsGiven: number;
      averageRating: number;
    };
  };
}

@Injectable()
export class GetUserProfileUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(input: GetUserProfileInput): Promise<GetUserProfileOutput> {
    const { userId } = input;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: {
            services: true,
            requestedExchanges: true,
            ratings: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // Calculate average rating received
    const avgRating = await this.prisma.rating.aggregate({
      where: { userId },
      _avg: { score: true },
    });

    // Remove sensitive data
    const { password: _password, _count, ...userWithoutPassword } = user;
    void _password;

    return {
      user: {
        ...userWithoutPassword,
        stats: {
          servicesOffered: _count.services,
          exchangesRequested: _count.requestedExchanges,
          ratingsGiven: _count.ratings,
          averageRating: avgRating._avg.score || 0,
        },
      },
    };
  }
}
