import { useState, useEffect } from 'react';
import { Message, MessageCreate, MessageListResponse } from '@/types/message.types';
import { useErrorHandling, ERROR_MESSAGES } from '@/hooks/useErrorHandling';

interface UseMessagesProps {
  exchangeId: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function useMessages({ exchangeId, autoRefresh = false, refreshInterval = 5000 }: UseMessagesProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const { error, handleAsyncOperation, clearError } = useErrorHandling();

  const fetchMessages = async () => {
    await handleAsyncOperation(async () => {
      const response = await fetch(`http://localhost:3001/api/messages/exchange/${exchangeId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error(ERROR_MESSAGES.NETWORK_ERROR);
      }

      const data: { messages: MessageListResponse } = await response.json();
      setMessages(data.messages.messages || []);
    }, ERROR_MESSAGES.NETWORK_ERROR);
  };

  const sendMessage = async (content: string): Promise<Message | null> => {
    const messageData: MessageCreate = {
      exchangeId,
      content,
    };

    return await handleAsyncOperation(async () => {
      const response = await fetch('http://localhost:3001/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify(messageData),
      });

      if (!response.ok) {
        throw new Error(ERROR_MESSAGES.NETWORK_ERROR);
      }

      const data = await response.json();
      const newMessage = data.message;
      
      setMessages(prev => [...prev, newMessage]);
      return newMessage;
    }, ERROR_MESSAGES.NETWORK_ERROR);
  };

  const markAsRead = async (messageId: number) => {
    await handleAsyncOperation(async () => {
      const response = await fetch(`http://localhost:3001/api/messages/${messageId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error(ERROR_MESSAGES.NETWORK_ERROR);
      }

      // Update local state
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId ? { ...msg, isRead: true } : msg
        )
      );
    }, ERROR_MESSAGES.NETWORK_ERROR);
  };

  useEffect(() => {
    fetchMessages().finally(() => setLoading(false));
  }, [exchangeId]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchMessages, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, exchangeId]);

  return {
    messages,
    loading,
    error,
    sendMessage,
    markAsRead,
    refreshMessages: fetchMessages,
    clearError,
  };
}
