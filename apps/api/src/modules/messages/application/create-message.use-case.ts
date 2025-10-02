import { Injectable, Inject, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import type { MessageRepositoryPort } from '../domain/message-repository.port';
import { MessageEntity, MessageCreate, MessageListQuery, MessageListResponse, MessageUpdate } from '../domain/message.types';
import { MESSAGE_REPOSITORY_TOKEN } from '../domain/tokens';
import { PrismaService } from '@/common/prisma/prisma.service';

export interface CreateMessageRequest {
  data: MessageCreate;
  userId: string;
}

export interface CreateMessageResponse {
  message: MessageEntity;
}

@Injectable()
export class CreateMessageUseCase {
  constructor(
    @Inject(MESSAGE_REPOSITORY_TOKEN)
    private readonly messageRepository: MessageRepositoryPort,
    private readonly prisma: PrismaService,
  ) {}

  async execute(request: CreateMessageRequest): Promise<CreateMessageResponse> {
    const { data, userId } = request;

    // Validate that the user is part of the exchange
    const exchange = await this.prisma.exchange.findUnique({
      where: { id: data.exchangeId },
      include: {
        service: true,
      },
    });

    if (!exchange) {
      throw new NotFoundException('Exchange not found');
    }

    // Check if user is either the requester or the offerer
    if (userId !== exchange.requestedById && userId !== exchange.offeredById) {
      throw new ForbiddenException('You can only send messages in exchanges you are part of');
    }

    // Validate message content
    if (!data.content || data.content.trim().length === 0) {
      throw new BadRequestException('Message content cannot be empty');
    }

    if (data.content.length > 1000) {
      throw new BadRequestException('Message content cannot exceed 1000 characters');
    }

    const message = await this.messageRepository.create(data, userId);

    return { message };
  }
}