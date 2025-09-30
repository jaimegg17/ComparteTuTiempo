import { Injectable, Inject } from '@nestjs/common';
import type { MessageRepositoryPort } from '../domain/message-repository.port';
import { MessageListQuery } from '@comparte-tu-tiempo/contracts';
import { MessageEntity } from '../domain/message.entity';
import { MESSAGE_REPOSITORY_TOKEN } from '../domain/tokens';

export interface ListMessagesRequest {
  query: MessageListQuery;
  userId: string; // The user requesting messages
}

export interface ListMessagesResponse {
  messages: {
    messages: MessageEntity[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

@Injectable()
export class ListMessagesUseCase {
  constructor(
    @Inject(MESSAGE_REPOSITORY_TOKEN)
    private readonly messageRepository: MessageRepositoryPort
  ) {}

  async execute(request: ListMessagesRequest): Promise<ListMessagesResponse> {
    const { query, userId } = request;

    // Filter messages where user is either sender or receiver
    const filteredQuery = {
      ...query,
      userId, // This will be used to filter messages involving this user
    };

    const result = await this.messageRepository.list(filteredQuery);

    return { messages: result };
  }
}
