import { Module } from '@nestjs/common';
import { MessagesController } from './presentation/messages.controller';
import { CreateMessageUseCase } from './application/create-message.use-case';
import { ListMessagesUseCase } from './application/list-messages.use-case';
import { UpdateMessageUseCase } from './application/update-message.use-case';
import { MarkMessageReadUseCase } from './application/mark-message-read.use-case';
import { PrismaMessageRepository } from './infrastructure/prisma-message-repository';
import { MESSAGE_REPOSITORY_TOKEN } from './domain/tokens';
import { PrismaModule } from '@/common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MessagesController],
  providers: [
    CreateMessageUseCase,
    ListMessagesUseCase,
    UpdateMessageUseCase,
    MarkMessageReadUseCase,
    {
      provide: MESSAGE_REPOSITORY_TOKEN,
      useClass: PrismaMessageRepository,
    },
  ],
  exports: [
    CreateMessageUseCase,
    ListMessagesUseCase,
    UpdateMessageUseCase,
    MarkMessageReadUseCase,
  ],
})
export class MessagesModule {}