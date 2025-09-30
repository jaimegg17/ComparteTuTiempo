import { MessageEntity } from './message.entity';
import { MessageCreate, MessageListQuery } from '@comparte-tu-tiempo/contracts';

export interface MessageRepositoryPort {
  create(data: MessageCreate): Promise<MessageEntity>;
  findById(id: number): Promise<MessageEntity | null>;
  findByUserId(userId: string): Promise<MessageEntity[]>;
  findByConversation(userId1: string, userId2: string): Promise<MessageEntity[]>;
  list(query: MessageListQuery): Promise<{
    messages: MessageEntity[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }>;
}
