import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';

export interface GetUserProfileInput {
  userId: string;
}

export interface GetUserProfileOutput {
  user: any;
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
    const { password, ...userWithoutPassword } = user;

    return {
      user: {
        ...userWithoutPassword,
        stats: {
          servicesOffered: user._count.services,
          exchangesRequested: user._count.requestedExchanges,
          ratingsGiven: user._count.ratings,
          averageRating: avgRating._avg.score || 0,
        },
        _count: undefined, // Remove internal count
      },
    };
  }
}

