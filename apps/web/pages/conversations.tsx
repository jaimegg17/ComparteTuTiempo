import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Paper,
  Avatar,
  Badge,
  Chip,
} from '@mui/material';
import { Layout } from '@/components/Layout';
import { ErrorAlert } from '@/components/ui/BeautifulAlert';
import { useErrorHandling, ERROR_MESSAGES } from '@/hooks/useErrorHandling';
import { useAuth } from '@/hooks/useAuth';
import { messagesApi } from '@/shared/api/messages';
import { apiClient } from '@/shared/api/client';
import type { ConversationSummary } from '@/types/message.types';

export default function ConversationsPage() {
  const router = useRouter();
  const { user, isLoading, getAccessToken } = useAuth();
  const { error, loading, handleAsyncOperation, clearError } = useErrorHandling();
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);

  const fetchConversations = async () => {
    if (!user) return;

    await handleAsyncOperation(async () => {
      const token = await getAccessToken();
      if (token) {
        apiClient.setToken(token);
      }
      const data = await messagesApi.getConversations();
      setConversations(data.conversations || []);
    }, ERROR_MESSAGES.NETWORK_ERROR);
  };

  useEffect(() => {
    if (!isLoading && user) {
      fetchConversations();
    }
  }, [user, isLoading]);

  const formatTimestamp = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleString();
  };

  const getStateColor = (state: string) => {
    switch (state) {
      case 'PENDING':
        return 'warning';
      case 'CONFIRMED':
        return 'info';
      case 'IN_PROGRESS':
        return 'primary';
      case 'COMPLETED':
        return 'success';
      case 'CANCELLED':
      case 'DISPUTED':
        return 'error';
      default:
        return 'default';
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <Box sx={{ py: 4, px: { xs: 2, md: 3 } }}>
          <Alert severity="warning" sx={{ mb: 2 }}>
            You must log in to view your conversations
          </Alert>
          <Button variant="contained" href="/api/auth/login">
            Log In
          </Button>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', py: 4 }}>
        <Box sx={{ px: { xs: 2, md: 3 } }}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              Conversations
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Stay up to date with your latest messages
            </Typography>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <ErrorAlert message={error} onRetry={fetchConversations} onClose={clearError} />
          ) : conversations.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                No conversations yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Start an exchange to begin chatting with other users.
              </Typography>
              <Button variant="contained" onClick={() => router.push('/services')}>
                Browse Services
              </Button>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {conversations.map(conversation => (
                <Paper
                  key={conversation.exchangeId}
                  sx={{
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                    },
                  }}
                  onClick={() => router.push(`/exchanges/${conversation.exchangeId}`)}
                >
                  <Badge
                    color="primary"
                    badgeContent={conversation.unreadCount}
                    invisible={conversation.unreadCount === 0}
                  >
                    <Avatar
                      src={conversation.otherUser.imageUrl || undefined}
                      alt={conversation.otherUser.name}
                    >
                      {conversation.otherUser.name?.charAt(0)}
                    </Avatar>
                  </Badge>

                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {conversation.otherUser.name}
                      </Typography>
                      {conversation.service && (
                        <Typography variant="body2" color="text.secondary">
                          • {conversation.service.title}
                        </Typography>
                      )}
                      <Chip
                        label={conversation.exchangeState}
                        size="small"
                        color={getStateColor(conversation.exchangeState) as any}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {conversation.lastMessage?.content || 'Sin mensajes todavía'}
                    </Typography>
                  </Box>

                  <Typography variant="caption" color="text.secondary">
                    {formatTimestamp(conversation.lastMessageAt)}
                  </Typography>
                </Paper>
              ))}
            </Box>
          )}
        </Box>
      </Box>
    </Layout>
  );
}
