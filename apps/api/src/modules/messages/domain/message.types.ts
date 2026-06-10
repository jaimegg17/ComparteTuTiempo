// MessageEntity is now a class, re-export it
export { MessageEntity } from './message.entity';
import type { MessageEntity } from './message.entity';

export interface MessageCreate {
  exchangeId: number;
  content: string;
}

export interface MessageListQuery {
  exchangeId: number;
  page?: number;
  pageSize?: number;
}

export interface MessageListResponse {
  messages: MessageEntity[]; // MessageEntity is a class
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface MessageUpdate {
  isRead?: boolean;
}
