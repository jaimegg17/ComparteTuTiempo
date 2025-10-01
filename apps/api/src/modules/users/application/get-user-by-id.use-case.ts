import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';

export interface GetUserByIdInput {
  userId: string;
}

export interface GetUserByIdOutput {
  user: any;
}

@Injectable()
export class GetUserByIdUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(input: GetUserByIdInput): Promise<GetUserByIdOutput> {
    const { userId } = input;

    // Get public profile (without sensitive data)
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        location: true,
        bio: true,
        skills: true,
        createdAt: true,
        _count: {
          select: {
            services: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // Calculate average rating
    const avgRating = await this.prisma.rating.aggregate({
      where: { userId },
      _avg: { score: true },
      _count: true,
    });

    return {
      user: {
        ...user,
        stats: {
          servicesOffered: user._count.services,
          averageRating: avgRating._avg.score || 0,
          totalRatings: avgRating._count,
        },
        _count: undefined, // Remove internal count
      },
    };
  }
}

