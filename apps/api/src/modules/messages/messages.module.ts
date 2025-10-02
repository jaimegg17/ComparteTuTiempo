import { Module } from '@nestjs/common';
import { MessagesController } from './infrastructure/messages.controller';
import { CreateMessageUseCase } from './application/create-message.use-case';
import { ListMessagesUseCase } from './application/list-messages.use-case';
import { UpdateMessageUseCase } from './application/update-message.use-case';
import { PrismaMessageRepository } from './infrastructure/prisma-message-repository';
import { MESSAGE_REPOSITORY_TOKEN } from './domain/tokens';
import { PrismaService } from '@/common/prisma/prisma.service';

@Module({
  controllers: [MessagesController],
  providers: [
    CreateMessageUseCase,
    ListMessagesUseCase,
    UpdateMessageUseCase,
    {
      provide: MESSAGE_REPOSITORY_TOKEN,
      useClass: PrismaMessageRepository,
    },
    PrismaService,
  ],
  exports: [
    CreateMessageUseCase,
    ListMessagesUseCase,
    UpdateMessageUseCase,
  ],
})
export class MessagesModule {}