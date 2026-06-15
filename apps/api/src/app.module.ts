import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './common/prisma/prisma.module';
import { ServicesModule } from './modules/services/services.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ExchangesModule } from './modules/exchanges/exchanges.module';
import { MessagesModule } from './modules/messages/messages.module';
import { RatingsModule } from './modules/ratings/ratings.module';
import { CommunitiesModule } from './modules/communities/communities.module';
import { EventsModule } from './modules/events/events.module';
import { UploadModule } from './modules/upload/upload.module';
import { Auth0Module } from './common/auth/auth0.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    Auth0Module,
    AuthModule,
    UsersModule,
    ServicesModule,
    ExchangesModule,
    MessagesModule,
    RatingsModule,
    CommunitiesModule,
    EventsModule,
    UploadModule,
    HealthModule,
  ],
})
export class AppModule {}
