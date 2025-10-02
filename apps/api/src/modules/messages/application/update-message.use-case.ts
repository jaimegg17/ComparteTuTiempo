import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import type { MessageRepositoryPort } from '../domain/message-repository.port';
import { MessageEntity, MessageUpdate } from '../domain/message.types';
import { MESSAGE_REPOSITORY_TOKEN } from '../domain/tokens';
import { PrismaService } from '@/common/prisma/prisma.service';

export interface UpdateMessageRequest {
  id: number;
  data: MessageUpdate;
  userId: string;
}

export interface UpdateMessageResponse {
  message: MessageEntity;
}

@Injectable()
export class UpdateMessageUseCase {
  constructor(
    @Inject(MESSAGE_REPOSITORY_TOKEN)
    private readonly messageRepository: MessageRepositoryPort,
    private readonly prisma: PrismaService,
  ) {}

  async execute(request: UpdateMessageRequest): Promise<UpdateMessageResponse> {
    const { id, data, userId } = request;

    const existingMessage = await this.messageRepository.findById(id);
    if (!existingMessage) {
      throw new NotFoundException('Message not found');
    }

    // Validate that the user is part of the exchange
    const exchange = await this.prisma.exchange.findUnique({
      where: { id: existingMessage.exchangeId },
    });

    if (!exchange) {
      throw new NotFoundException('Exchange not found');
    }

    // Check if user is either the requester or the offerer
    if (userId !== exchange.requestedById && userId !== exchange.offeredById) {
      throw new ForbiddenException('You can only update messages from exchanges you are part of');
    }

    const message = await this.messageRepository.update(id, data);

    return { message };
  }
}
