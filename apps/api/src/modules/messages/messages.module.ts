import { Module } from '@nestjs/common';
import { MessagesController } from './presentation/messages.controller';
import { CreateMessageUseCase } from './application/create-message.use-case';
import { ListMessagesUseCase } from './application/list-messages.use-case';
import { PrismaMessageRepository } from './infrastructure/prisma-message-repository';
import { MessageRepositoryPort } from './domain/message-repository.port';
import { MESSAGE_REPOSITORY_TOKEN } from './domain/tokens';
import { PrismaModule } from '../../common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MessagesController],
  providers: [
    CreateMessageUseCase,
    ListMessagesUseCase,
    {
      provide: MESSAGE_REPOSITORY_TOKEN,
      useClass: PrismaMessageRepository,
    },
    {
      provide: 'MessageRepositoryPort',
      useExisting: MESSAGE_REPOSITORY_TOKEN,
    },
  ],
  exports: ['MessageRepositoryPort'],
})
export class MessagesModule {}
