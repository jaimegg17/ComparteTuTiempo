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
  Avatar,
  Stack,
} from '@mui/material';
import {
  ArrowBackRounded,
  AccessTimeRounded,
  CalendarTodayRounded,
  HandshakeRounded,
  PersonRounded,
} from '@mui/icons-material';
import { Layout } from '@/components/Layout';
import { useUser } from '@auth0/nextjs-auth0/client';
import { Chat } from '@/components/chat/Chat';
import { ErrorAlert } from '@/components/ui/BeautifulAlert';
import { useErrorHandling, ERROR_MESSAGES } from '@/hooks/useErrorHandling';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/hooks/useAuth';
import type { Exchange, ExchangeUser } from '@/types/exchange.types';
import type { ChatUser } from '@/types/message.types';
import { buildApiUrl } from '@/shared/api/config';
import type { ChipProps } from '@mui/material';

const getUserLabel = (user?: ExchangeUser | null, fallback?: string) =>
  user?.name || user?.email || fallback || 'Usuario';

const getInitial = (name: string) => name.trim().charAt(0).toUpperCase() || 'U';

export default function ExchangeDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useUser();
  const { getAccessToken } = useAuth();
  const { t, currentLanguage } = useTranslation();
  
  const [exchange, setExchange] = useState<Exchange | null>(null);
  const [otherUser, setOtherUser] = useState<ChatUser | null>(null);
  const { error, loading, handleAsyncOperation, clearError } = useErrorHandling();

  const fetchExchange = useCallback(async () => {
    if (!id || !user) return;

    await handleAsyncOperation(async () => {
      const token = await getAccessToken();

      if (!token) {
        throw new Error(t('exchangesPage.missingTokenError'));
      }

      const response = await fetch(buildApiUrl(`/exchanges/${id}`), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(t('exchangesPage.detail.loadError'));
      }

      const data = await response.json();
      const fetchedExchange = data.exchange as Exchange;
      setExchange(fetchedExchange);

      const isRequester = user.sub === fetchedExchange.requestedById;
      const otherUserData = isRequester ? fetchedExchange.offeredBy : fetchedExchange.requestedBy;
      const fallbackUserId = isRequester ? fetchedExchange.offeredById : fetchedExchange.requestedById;
      const otherUserName = getUserLabel(otherUserData, fallbackUserId);

      setOtherUser({
        id: otherUserData?.id || fallbackUserId,
        name: otherUserName,
        imageUrl: otherUserData?.imageUrl,
      });
    }, ERROR_MESSAGES.NETWORK_ERROR);
  }, [id, user, handleAsyncOperation, t, getAccessToken]);

  useEffect(() => {
    void fetchExchange();
  }, [fetchExchange]);

  const handleMessageSent = () => {
    // Optional: Update exchange state or show notification
  };

  const getStateColor = (state: string): ChipProps['color'] => {
    switch (state) {
      case 'PENDING': return 'warning';
      case 'CONFIRMED': return 'info';
      case 'IN_PROGRESS': return 'primary';
      case 'COMPLETED': return 'success';
      case 'CANCELLED':
      case 'REJECTED': return 'error';
      default: return 'default';
    }
  };

  const formatDate = (value?: string) => {
    if (!value) return '—';
    return new Intl.DateTimeFormat(currentLanguage === 'en' ? 'en-US' : 'es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(value));
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
                retryText={t('common.retry')}
              />
            </Box>
          )}
          <Button onClick={() => router.push('/exchanges')} startIcon={<ArrowBackRounded />} sx={{ mt: 2, textTransform: 'none' }}>
            {t('exchangesPage.detail.back')}
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
            {t('exchangesPage.detail.notFound')}
          </Typography>
          <Button onClick={() => router.push('/exchanges')} startIcon={<ArrowBackRounded />} sx={{ mt: 2, textTransform: 'none' }}>
            {t('exchangesPage.detail.back')}
          </Button>
        </Box>
      </Layout>
    );
  }

  const requesterName = getUserLabel(exchange.requestedBy, exchange.requestedById);
  const providerName = getUserLabel(exchange.offeredBy, exchange.offeredById);
  const isRequester = user?.sub === exchange.requestedById;
  const myRole = isRequester ? t('exchangesPage.detail.roleRequester') : t('exchangesPage.detail.roleProvider');
  const serviceTitle = exchange.service?.title || t('exchangesPage.card.serviceFallback');
  const duration = exchange.service?.duration;

  return (
    <Layout>
      <Box sx={{ bgcolor: 'linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%)', minHeight: '100vh', py: { xs: 3, md: 4 } }}>
        <Box sx={{ px: { xs: 2, md: 3 }, maxWidth: 1440, mx: 'auto' }}>
          <Button
            onClick={() => router.push('/exchanges')}
            startIcon={<ArrowBackRounded />}
            sx={{ mb: 2.5, textTransform: 'none', fontWeight: 700 }}
          >
            {t('exchangesPage.detail.back')}
          </Button>

          <Paper
            elevation={0}
            sx={{
              mb: 3,
              p: { xs: 2.5, md: 3 },
              borderRadius: 4,
              border: '1px solid rgba(148, 163, 184, 0.18)',
              background: 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(20,184,166,0.10) 58%, rgba(255,255,255,0.94))',
            }}
          >
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2.5} alignItems={{ xs: 'flex-start', md: 'center' }} justifyContent="space-between">
              <Box>
                <Typography variant="overline" color="primary" sx={{ fontWeight: 900, letterSpacing: 1.2 }}>
                  {t('exchangesPage.detail.overline')}
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 900, color: '#0f172a', mt: 0.5 }}>
                  {serviceTitle}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mt: 0.75 }}>
                  {t('exchangesPage.detail.subtitle', { role: myRole, name: otherUser.name })}
                </Typography>
              </Box>
              <Chip
                label={t(`exchangesPage.states.${exchange.state}`)}
                color={getStateColor(exchange.state)}
                sx={{ fontWeight: 800, px: 1, borderRadius: 999 }}
              />
            </Stack>
          </Paper>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '380px minmax(0, 1fr)' }, gap: 3 }}>
            <Stack spacing={2.5}>
              <Paper elevation={0} sx={{ p: 2.5, borderRadius: 4, border: '1px solid rgba(148, 163, 184, 0.18)' }}>
                <Typography variant="h6" sx={{ fontWeight: 900, mb: 2 }}>
                  {t('exchangesPage.detail.summary')}
                </Typography>

                <Stack spacing={1.6}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box sx={{ width: 38, height: 38, borderRadius: 2, bgcolor: 'rgba(139,92,246,0.12)', display: 'grid', placeItems: 'center', color: 'primary.main' }}>
                      <HandshakeRounded fontSize="small" />
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>{t('exchangesPage.detail.service')}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 800 }}>{serviceTitle}</Typography>
                    </Box>
                  </Stack>

                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box sx={{ width: 38, height: 38, borderRadius: 2, bgcolor: 'rgba(20,184,166,0.12)', display: 'grid', placeItems: 'center', color: 'success.main' }}>
                      <CalendarTodayRounded fontSize="small" />
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>{t('exchangesPage.detail.createdAt')}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 800 }}>{formatDate(exchange.createdAt)}</Typography>
                    </Box>
                  </Stack>

                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box sx={{ width: 38, height: 38, borderRadius: 2, bgcolor: 'rgba(245,158,11,0.14)', display: 'grid', placeItems: 'center', color: 'warning.main' }}>
                      <AccessTimeRounded fontSize="small" />
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>{t('exchangesPage.detail.duration')}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 800 }}>
                        {duration ? t('exchangesPage.detail.durationValue', { hours: duration }) : '—'}
                      </Typography>
                    </Box>
                  </Stack>
                </Stack>

                {exchange.message && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800 }}>
                      {t('exchangesPage.detail.initialMessage')}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.75, color: 'text.secondary', lineHeight: 1.7 }}>
                      “{exchange.message}”
                    </Typography>
                  </>
                )}
              </Paper>

              <Paper elevation={0} sx={{ p: 2.5, borderRadius: 4, border: '1px solid rgba(148, 163, 184, 0.18)' }}>
                <Typography variant="h6" sx={{ fontWeight: 900, mb: 2 }}>
                  {t('exchangesPage.detail.participants')}
                </Typography>

                <Stack spacing={2}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Avatar src={exchange.requestedBy?.imageUrl} sx={{ bgcolor: '#8b5cf6' }}>{getInitial(requesterName)}</Avatar>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800 }}>{t('exchangesPage.detail.requester')}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 800 }} noWrap>{requesterName}</Typography>
                    </Box>
                    {isRequester && <Chip size="small" label={t('exchangesPage.detail.you')} sx={{ ml: 'auto', fontWeight: 700 }} />}
                  </Stack>

                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Avatar src={exchange.offeredBy?.imageUrl} sx={{ bgcolor: '#14b8a6' }}>{getInitial(providerName)}</Avatar>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800 }}>{t('exchangesPage.detail.provider')}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 800 }} noWrap>{providerName}</Typography>
                    </Box>
                    {!isRequester && <Chip size="small" label={t('exchangesPage.detail.you')} sx={{ ml: 'auto', fontWeight: 700 }} />}
                  </Stack>
                </Stack>
              </Paper>
            </Stack>

            <Paper elevation={0} sx={{ borderRadius: 4, border: '1px solid rgba(148, 163, 184, 0.18)', overflow: 'hidden', minHeight: 620 }}>
              <Box sx={{ px: 2.5, py: 2, borderBottom: '1px solid rgba(148, 163, 184, 0.18)', bgcolor: '#fff' }}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: 'rgba(15,23,42,0.06)', display: 'grid', placeItems: 'center' }}>
                    <PersonRounded color="primary" />
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 900 }}>
                      {t('exchangesPage.detail.chatTitle')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t('exchangesPage.detail.chatSubtitle', { name: otherUser.name })}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
              <Chat
                exchangeId={exchange.id}
                currentUserId={user?.sub || ''}
                otherUser={otherUser}
                onMessageSent={handleMessageSent}
                embedded
              />
            </Paper>
          </Box>
        </Box>
      </Box>
    </Layout>
  );
}
