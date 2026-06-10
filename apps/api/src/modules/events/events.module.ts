import { Module } from '@nestjs/common';
import { EventsController } from './presentation/events.controller';
import { CreateEventUseCase } from './application/create-event.use-case';
import { ListEventsUseCase } from './application/list-events.use-case';
import { PrismaEventRepository } from './infrastructure/prisma-event-repository';
import { EVENT_REPOSITORY_TOKEN } from './domain/tokens';
import { PrismaModule } from '../../common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [EventsController],
  providers: [
    CreateEventUseCase,
    ListEventsUseCase,
    {
      provide: EVENT_REPOSITORY_TOKEN,
      useClass: PrismaEventRepository,
    },
    {
      provide: 'EventRepositoryPort',
      useExisting: EVENT_REPOSITORY_TOKEN,
    },
  ],
  exports: ['EventRepositoryPort'],
})
export class EventsModule {}
