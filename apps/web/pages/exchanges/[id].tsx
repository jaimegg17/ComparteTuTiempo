import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Typography,
  CircularProgress,
  Button,
  Paper,
  Chip,
  Divider,
} from '@mui/material';
import { Layout } from '@/components/Layout';
import { useUser } from '@auth0/nextjs-auth0/client';
import { Chat } from '@/components/chat/Chat';
import { ErrorAlert } from '@/components/ui/BeautifulAlert';
import { useErrorHandling, ERROR_MESSAGES } from '@/hooks/useErrorHandling';
import type { Exchange } from '@/types/exchange.types';
import type { ChatUser } from '@/types/message.types';
import { buildApiUrl } from '@/shared/api/config';
import type { ChipProps } from '@mui/material';

export default function ExchangeDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useUser();
  
  const [exchange, setExchange] = useState<Exchange | null>(null);
  const [otherUser, setOtherUser] = useState<ChatUser | null>(null);
  const { error, loading, handleAsyncOperation, clearError } = useErrorHandling();

  const fetchExchange = useCallback(async () => {
    if (!id || !user) return;

    await handleAsyncOperation(async () => {
      // Get token
      const tokenResponse = await fetch('/api/auth/token');
      if (!tokenResponse.ok) {
        throw new Error('Could not get authentication token');
      }
      const tokenData = await tokenResponse.json();
      const token = tokenData.accessToken;

      if (!token) {
        throw new Error('Authentication token not available');
      }

      // Fetch exchange details
      const response = await fetch(buildApiUrl(`/exchanges/${id}`), {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(ERROR_MESSAGES.NETWORK_ERROR);
      }

      const data = await response.json();
      setExchange(data.exchange);

      // Determine the other user
      const isRequester = user.sub === data.exchange.requestedById;
      const otherUserData = isRequester ? data.exchange.offeredBy : data.exchange.requestedBy;
      const fallbackUserId = isRequester ? data.exchange.offeredById : data.exchange.requestedById;

      setOtherUser({
        id: otherUserData?.id || fallbackUserId,
        name: otherUserData?.name || otherUserData?.email || fallbackUserId,
        imageUrl: otherUserData?.imageUrl,
      });
    }, ERROR_MESSAGES.NETWORK_ERROR);
  }, [id, user, handleAsyncOperation]);

  useEffect(() => {
    fetchExchange();
  }, [fetchExchange]);

  const handleMessageSent = () => {
    // Optional: Update exchange state or show notification
  };

  if (loading) {
    return (
      <Layout>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  if (error || !exchange) {
    return (
      <Layout>
        <Box sx={{ py: 4, px: { xs: 2, md: 3 } }}>
          {error && (
            <Box sx={{ mb: 3 }}>
              <ErrorAlert
                message={error}
                onRetry={fetchExchange}
                onClose={clearError}
                retryText="Retry"
              />
            </Box>
          )}
          <Button onClick={() => router.push('/exchanges')} sx={{ mt: 2 }}>
            ← Back to exchanges
          </Button>
        </Box>
      </Layout>
    );
  }

  if (!otherUser) {
    return (
      <Layout>
        <Box sx={{ py: 4, px: { xs: 2, md: 3 } }}>
          <Typography variant="h6" color="error">
            Could not load exchange details
          </Typography>
          <Button onClick={() => router.push('/exchanges')} sx={{ mt: 2 }}>
            ← Back to exchanges
          </Button>
        </Box>
      </Layout>
    );
  }

  const getStateColor = (state: string): ChipProps['color'] => {
    switch (state) {
      case 'PENDING': return 'warning';
      case 'CONFIRMED': return 'info';
      case 'IN_PROGRESS': return 'primary';
      case 'COMPLETED': return 'success';
      case 'CANCELLED': return 'error';
      case 'DISPUTED': return 'error';
      default: return 'default';
    }
  };

  return (
    <Layout>
      <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', py: 4 }}>
        <Box sx={{ px: { xs: 2, md: 3 } }}>
          <Button 
            onClick={() => router.push('/exchanges')} 
            sx={{ mb: 3, textTransform: 'none' }}
          >
            ← Back to exchanges
          </Button>

          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
            {/* Exchange Details */}
            <Box sx={{ width: { xs: '100%', md: '33%' } }}>
              <Paper sx={{ p: 3, height: 'fit-content' }}>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                  Exchange Details
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Service
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {exchange.service?.title}
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Status
                  </Typography>
                  <Chip 
                    label={exchange.state} 
                    color={getStateColor(exchange.state)}
                    size="small"
                  />
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Date
                  </Typography>
                  <Typography variant="body2">
                    {new Date(exchange.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>

                {exchange.service?.duration && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Duration
                    </Typography>
                    <Typography variant="body2">
                      {exchange.service.duration} hours
                    </Typography>
                  </Box>
                )}

                <Divider sx={{ my: 2 }} />

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Requester
                  </Typography>
                  <Typography variant="body2">
                    {exchange.requestedBy?.name}
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Provider
                  </Typography>
                  <Typography variant="body2">
                    {exchange.offeredBy?.name}
                  </Typography>
                </Box>
              </Paper>
            </Box>

            {/* Chat */}
            <Box sx={{ width: { xs: '100%', md: '67%' } }}>
              <Chat
                exchangeId={exchange.id}
                currentUserId={user?.sub || ''}
                otherUser={otherUser}
                onMessageSent={handleMessageSent}
              />
            </Box>
          </Box>
        </Box>
      </Box>
    </Layout>
  );
}
