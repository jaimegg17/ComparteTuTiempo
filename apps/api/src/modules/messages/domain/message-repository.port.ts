import { MessageEntity, MessageCreate, MessageListQuery, MessageListResponse, MessageUpdate } from './message.types';

export interface MessageRepositoryPort {
  create(data: MessageCreate, senderId: string): Promise<MessageEntity>;
  findById(id: number): Promise<MessageEntity | null>;
  list(query: MessageListQuery): Promise<MessageListResponse>;
  update(id: number, data: MessageUpdate): Promise<MessageEntity>;
  markAsRead(messageIds: number[]): Promise<void>;
  getUnreadCount(userId: string, exchangeId: number): Promise<number>;
}