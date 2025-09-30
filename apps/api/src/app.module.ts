import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './common/prisma/prisma.module';
import { ServicesModule } from './modules/services/services.module';
import { AuthModule } from './modules/auth/auth.module';
import { ExchangesModule } from './modules/exchanges/exchanges.module';
import { MessagesModule } from './modules/messages/messages.module';
import { RatingsModule } from './modules/ratings/ratings.module';
import { CommunitiesModule } from './modules/communities/communities.module';
import { GroupsModule } from './modules/groups/groups.module';
import { EventsModule } from './modules/events/events.module';
import { Auth0Module } from './common/auth/auth0.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    Auth0Module,
    AuthModule,
    ServicesModule,
    ExchangesModule,
    MessagesModule,
    RatingsModule,
    CommunitiesModule,
    GroupsModule,
    EventsModule,
  ],
})
export class AppModule {}
