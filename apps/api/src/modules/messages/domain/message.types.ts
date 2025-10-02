export interface MessageEntity {
  id: number;
  exchangeId: number;
  senderId: string;
  content: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

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
  messages: MessageEntity[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface MessageUpdate {
  isRead?: boolean;
}
