import { apiClient } from './client';
import type { ConversationListResponse } from '@/types/message.types';

export const messagesApi = {
  async getConversations(): Promise<ConversationListResponse> {
    return apiClient.get<ConversationListResponse>('/messages/conversations');
  },

  async markMessageAsRead(messageId: number) {
    return apiClient.put(`/messages/${messageId}/read`, {});
  },
};
