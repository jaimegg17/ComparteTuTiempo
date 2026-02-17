import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  Avatar,
  Divider,
  CircularProgress,
  Alert,
  Badge,
  Chip,
} from '@mui/material';
import { Send as SendIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { Message, MessageCreate, ChatUser } from '@/types/message.types';
import { useErrorHandling, ERROR_MESSAGES } from '@/hooks/useErrorHandling';
import { ErrorAlert } from '@/components/ui/BeautifulAlert';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/shared/api/client';

interface ChatProps {
  exchangeId: number;
  currentUserId: string;
  otherUser: ChatUser;
  onMessageSent?: (message: Message) => void;
  enableRealTime?: boolean; // Enable polling for real-time updates
  pollingInterval?: number; // Polling interval in milliseconds (default: 3000ms)
}

export function Chat({ 
  exchangeId, 
  currentUserId, 
  otherUser, 
  onMessageSent,
  enableRealTime = true,
  pollingInterval = 3000,
}: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isPolling, setIsPolling] = useState(false);
  const [lastMessageId, setLastMessageId] = useState<number | null>(null);
  const [newMessagesCount, setNewMessagesCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isUserTypingRef = useRef(false);
  const { error, handleAsyncOperation, clearError } = useErrorHandling();
  const { getAccessToken } = useAuth();

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch messages
  const fetchMessages = useCallback(async (silent = false) => {
    if (!silent && !loading) {
      setIsPolling(true);
    }

    try {
      const token = await getAccessToken();
      if (token) {
        apiClient.setToken(token);
      }

      const data = await apiClient.get<{
        message: string;
        messages: Message[];
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
      }>(`/messages/exchange/${exchangeId}`);

      const fetchedMessages = data.messages || [];
      
      // Check for new messages
      if (lastMessageId !== null && fetchedMessages.length > 0) {
        const lastFetchedId = fetchedMessages[fetchedMessages.length - 1].id;
        if (lastFetchedId > lastMessageId) {
          // New messages detected
          const newMessages = fetchedMessages.filter(msg => msg.id > lastMessageId);
          setNewMessagesCount(prev => prev + newMessages.length);
          
          // If user is not typing, update messages and scroll
          if (!isUserTypingRef.current) {
            setMessages(fetchedMessages);
            setLastMessageId(lastFetchedId);
            setNewMessagesCount(0);
            scrollToBottom();
          }
        }
      } else {
        // Initial load
        setMessages(fetchedMessages);
        if (fetchedMessages.length > 0) {
          setLastMessageId(fetchedMessages[fetchedMessages.length - 1].id);
        }
      }
    } catch (err) {
      if (!silent) {
        console.error('Error fetching messages:', err);
      }
    } finally {
      if (!silent) {
        setIsPolling(false);
      }
    }
  }, [exchangeId, getAccessToken, lastMessageId, loading]);

  // Initial fetch
  useEffect(() => {
    fetchMessages(false).finally(() => setLoading(false));
  }, [exchangeId]);

  // Polling for real-time updates
  useEffect(() => {
    if (!enableRealTime || loading) return;

    // Start polling
    pollingIntervalRef.current = setInterval(() => {
      if (!isUserTypingRef.current) {
        fetchMessages(true); // Silent fetch
      }
    }, pollingInterval);

    // Cleanup on unmount or when exchangeId changes
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [enableRealTime, exchangeId, loading, pollingInterval, fetchMessages]);

  // Handle visibility change (pause polling when tab is hidden)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab is hidden, pause polling
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
      } else {
        // Tab is visible, resume polling
        if (enableRealTime && !loading && !pollingIntervalRef.current) {
          pollingIntervalRef.current = setInterval(() => {
            if (!isUserTypingRef.current) {
              fetchMessages(true);
            }
          }, pollingInterval);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enableRealTime, loading, pollingInterval, fetchMessages]);

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const messageData: MessageCreate = {
      exchangeId,
      content: newMessage.trim(),
    };

    await handleAsyncOperation(async () => {
      const token = await getAccessToken();
      if (token) {
        apiClient.setToken(token);
      }

      const data = await apiClient.post<{
        message: string;
        data: Message;
      }>('/messages', messageData);

      const newMsg = data.data;
      
      // Update messages and last message ID
      setMessages(prev => [...prev, newMsg]);
      setLastMessageId(newMsg.id);
      setNewMessage('');
      setNewMessagesCount(0); // Clear new messages count
      
      // Scroll to bottom
      setTimeout(() => scrollToBottom(), 100);
      
      // Notify parent component
      onMessageSent?.(newMsg);
    }, ERROR_MESSAGES.NETWORK_ERROR);
  };

  // Handle typing state
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    isUserTypingRef.current = e.target.value.length > 0;
  };

  // Handle input focus/blur
  const handleInputFocus = () => {
    isUserTypingRef.current = true;
  };

  const handleInputBlur = () => {
    // Small delay to allow for message sending
    setTimeout(() => {
      isUserTypingRef.current = false;
    }, 500);
  };

  // Load new messages when user clicks on new messages indicator
  const loadNewMessages = () => {
    fetchMessages(false).then(() => {
      setNewMessagesCount(0);
      scrollToBottom();
    });
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper sx={{ height: 500, display: 'flex', flexDirection: 'column' }}>
      {/* Chat Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar src={otherUser.imageUrl} alt={otherUser.name}>
            {otherUser.name[0]}
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {otherUser.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Exchange Chat
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Error Display */}
      {error && (
        <Box sx={{ p: 2 }}>
          <ErrorAlert
            message={error}
            onRetry={fetchMessages}
            onClose={clearError}
            retryText="Retry"
          />
        </Box>
      )}

      {/* Messages Area */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2, position: 'relative' }}>
        {/* New Messages Indicator */}
        {newMessagesCount > 0 && (
          <Box
            sx={{
              position: 'sticky',
              top: 0,
              zIndex: 10,
              display: 'flex',
              justifyContent: 'center',
              mb: 2,
            }}
          >
            <Chip
              label={`${newMessagesCount} nuevo${newMessagesCount > 1 ? 's' : ''} mensaje${newMessagesCount > 1 ? 's' : ''}`}
              onClick={loadNewMessages}
              color="primary"
              sx={{
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                },
              }}
            />
          </Box>
        )}

        {messages.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              No messages yet. Start the conversation!
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {messages.map((message) => {
              const isOwnMessage = message.senderId === currentUserId;
              return (
                <Box
                  key={message.id}
                  sx={{
                    display: 'flex',
                    justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
                  }}
                >
                  <Box
                    sx={{
                      maxWidth: '70%',
                      p: 2,
                      borderRadius: 2,
                      backgroundColor: isOwnMessage ? 'primary.main' : 'grey.100',
                      color: isOwnMessage ? 'white' : 'text.primary',
                      position: 'relative',
                    }}
                  >
                    <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                      {message.content}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          opacity: 0.7,
                          fontSize: '0.75rem',
                        }}
                      >
                        {new Date(message.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Typography>
                      {isOwnMessage && (
                        <Typography
                          variant="caption"
                          sx={{
                            opacity: message.isRead ? 1 : 0.5,
                            fontSize: '0.7rem',
                            ml: 0.5,
                          }}
                        >
                          {message.isRead ? '✓✓' : '✓'}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Box>
              );
            })}
            <div ref={messagesEndRef} />
          </Box>
        )}

        {/* Polling indicator (subtle) */}
        {isPolling && enableRealTime && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 8,
              right: 8,
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
            }}
          >
            <CircularProgress size={12} thickness={4} />
          </Box>
        )}
      </Box>

      {/* Message Input */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
          <TextField
            fullWidth
            multiline
            maxRows={3}
            placeholder="Type your message..."
            value={newMessage}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            onKeyPress={handleKeyPress}
            variant="outlined"
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />
          <IconButton
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            color="primary"
            sx={{
              borderRadius: 2,
              backgroundColor: 'primary.main',
              color: 'white',
              '&:hover': {
                backgroundColor: 'primary.dark',
              },
              '&:disabled': {
                backgroundColor: 'grey.300',
                color: 'grey.500',
              },
            }}
          >
            <SendIcon />
          </IconButton>
          {enableRealTime && (
            <IconButton
              onClick={() => fetchMessages(false)}
              color="default"
              size="small"
              title="Refresh messages"
              sx={{
                borderRadius: 2,
              }}
            >
              <RefreshIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
        {enableRealTime && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block', fontSize: '0.7rem' }}>
            Real-time updates enabled
          </Typography>
        )}
      </Box>
    </Paper>
  );
}
