import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import type { MessageRepositoryPort } from '../domain/message-repository.port';
import { MessageListQuery, MessageListResponse } from '../domain/message.types';
import { MESSAGE_REPOSITORY_TOKEN } from '../domain/tokens';
import { PrismaService } from '@/common/prisma/prisma.service';

export interface ListMessagesRequest {
  query: MessageListQuery;
  userId: string;
}

export interface ListMessagesResponse {
  messages: MessageListResponse;
}

@Injectable()
export class ListMessagesUseCase {
  constructor(
    @Inject(MESSAGE_REPOSITORY_TOKEN)
    private readonly messageRepository: MessageRepositoryPort,
    private readonly prisma: PrismaService,
  ) {}

  async execute(request: ListMessagesRequest): Promise<ListMessagesResponse> {
    const { query, userId } = request;

    // Validate that the user is part of the exchange
    const exchange = await this.prisma.exchange.findUnique({
      where: { id: query.exchangeId },
    });

    if (!exchange) {
      throw new NotFoundException('Exchange not found');
    }

    // Check if user is either the requester or the offerer
    if (userId !== exchange.requestedById && userId !== exchange.offeredById) {
      throw new ForbiddenException('You can only view messages from exchanges you are part of');
    }

    const messages = await this.messageRepository.list(query);

    return { messages };
  }
}