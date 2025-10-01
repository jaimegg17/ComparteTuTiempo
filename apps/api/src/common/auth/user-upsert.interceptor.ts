import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserUpsertInterceptor implements NestInterceptor {
  constructor(private readonly prisma: PrismaService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (user?.sub) {
      // Upsert user if doesn't exist
      await this.prisma.user.upsert({
        where: { id: user.sub },
        update: {
          email: user.email || null,
          name: user.name || null,
        },
        create: {
          id: user.sub,
          email: user.email || 'user@example.com',
          password: 'auth0-user', // Placeholder password for Auth0 users
          name: user.name || 'Usuario',
          timeCredits: 0, // Default time credits for new users
        },
      });
    }

    return next.handle();
  }
}
