export interface Message {
  id: number;
  exchangeId: number;
  senderId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MessageCreate {
  exchangeId: number;
  content: string;
}

export interface MessageListResponse {
  messages: Message[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ChatUser {
  id: string;
  name: string;
  imageUrl?: string;
}
