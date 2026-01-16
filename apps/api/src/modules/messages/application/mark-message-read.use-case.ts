import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import type { MessageRepositoryPort } from '../domain/message-repository.port';
import { MESSAGE_REPOSITORY_TOKEN } from '../domain/tokens';
import { PrismaService } from '@/common/prisma/prisma.service';
import { MessageEntity } from '../domain/message.entity';

export interface MarkMessageReadRequest {
  messageId: number;
  userId: string;
}

export interface MarkMessageReadResponse {
  message: MessageEntity;
}

@Injectable()
export class MarkMessageReadUseCase {
  constructor(
    @Inject(MESSAGE_REPOSITORY_TOKEN)
    private readonly messageRepository: MessageRepositoryPort,
    private readonly prisma: PrismaService,
  ) {}

  async execute(request: MarkMessageReadRequest): Promise<MarkMessageReadResponse> {
    const { messageId, userId } = request;

    // Get the message
    const message = await this.messageRepository.findById(messageId);
    if (!message) {
      throw new NotFoundException(`Message with ID ${messageId} not found`);
    }

    // Get the exchange to verify user permissions
    const exchange = await this.prisma.exchange.findUnique({
      where: { id: message.exchangeId },
    });

    if (!exchange) {
      throw new NotFoundException('Exchange not found');
    }

    // Check if user is part of the exchange
    if (userId !== exchange.requestedById && userId !== exchange.offeredById) {
      throw new ForbiddenException('You can only mark messages as read in exchanges you are part of');
    }

    // Only mark as read if the message was not sent by the current user
    // (users don't need to mark their own messages as read)
    if (message.senderId === userId) {
      // Return the message as-is if user is the sender
      return { message };
    }

    // Mark message as read
    const updatedMessage = await this.messageRepository.update(messageId, { isRead: true });

    return { message: updatedMessage };
  }
}
