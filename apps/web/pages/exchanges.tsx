import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { Layout } from '@/components/Layout';
import { useUser } from '@auth0/nextjs-auth0/client';
import { ExchangeCard, ExchangeFilters } from '@/components/exchanges';
import type { Exchange, ExchangeState } from '@/types/exchange.types';
import { buildApiUrl } from '@/shared/api/config';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/hooks/useAuth';

export default function ExchangesPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { user, isLoading: userLoading } = useUser();
  const { getAccessToken } = useAuth();

  const [allExchanges, setAllExchanges] = useState<Exchange[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [notice, setNotice] = useState<{ severity: 'success' | 'error' | 'info'; message: string } | null>(null);

  const [activeTab, setActiveTab] = useState<'all' | 'received' | 'sent'>('all');
  const [activeState, setActiveState] = useState<ExchangeState | 'all'>('all');

  const getErrorMessage = (err: unknown, fallback: string) =>
    err instanceof Error ? err.message : fallback;

  const fetchExchanges = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const token = await getAccessToken();

      if (!token) {
        throw new Error(t('exchangesPage.missingTokenError'));
      }

      const params = new URLSearchParams();
      if (activeTab === 'received') {
        params.append('offeredById', user.sub!);
      } else if (activeTab === 'sent') {
        params.append('requestedById', user.sub!);
      }

      const response = await fetch(buildApiUrl(`/exchanges?${params.toString()}`), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(t('exchangesPage.loadError'));
      }

      const data = await response.json();
      setAllExchanges(data.exchanges || []);
    } catch (err: unknown) {
      setError(getErrorMessage(err, t('exchangesPage.loadError')));
    } finally {
      setLoading(false);
    }
  }, [user, activeTab, t, getAccessToken]);

  useEffect(() => {
    if (!userLoading && user) {
      fetchExchanges();
    }
  }, [user, userLoading, fetchExchanges]);

  const filteredExchanges = useMemo(() => {
    if (activeState === 'all') return allExchanges;
    return allExchanges.filter((exchange) => exchange.state === activeState);
  }, [allExchanges, activeState]);

  const counts = useMemo(
    () => ({
      pending: allExchanges.filter((exchange) => exchange.state === 'PENDING').length,
      confirmed: allExchanges.filter((exchange) => exchange.state === 'CONFIRMED').length,
      inProgress: allExchanges.filter((exchange) => exchange.state === 'IN_PROGRESS').length,
      completed: allExchanges.filter((exchange) => exchange.state === 'COMPLETED').length,
    }),
    [allExchanges],
  );

  const activeTabCopy =
    activeTab === 'received'
      ? t('exchangesPage.tabReceived')
      : activeTab === 'sent'
        ? t('exchangesPage.tabSent')
        : t('exchangesPage.tabAll');

  const handleAction = async (id: number, newState: ExchangeState) => {
    if (!user) return;

    try {
      setActionLoading(true);
      setNotice(null);
      const token = await getAccessToken();
      if (!token) throw new Error(t('exchangesPage.missingTokenError'));

      const response = await fetch(buildApiUrl(`/exchanges/${id}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ state: newState }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || t('exchangesPage.updateError'));
      }

      setNotice({
        severity: 'success',
        message: t('exchangesPage.updated', { state: t(`exchangesPage.states.${newState}`) }),
      });
      await fetchExchanges();
    } catch (err: unknown) {
      setNotice({
        severity: 'error',
        message: getErrorMessage(err, t('exchangesPage.updateFallback')),
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRatingSubmitted = useCallback(async () => {
    setNotice({ severity: 'success', message: t('exchangesPage.ratingSubmitted') });
    await fetchExchanges();
  }, [fetchExchanges, t]);

  if (userLoading) {
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
        <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', py: 6 }}>
          <Box sx={{ maxWidth: 780, mx: 'auto', px: { xs: 2, md: 3 } }}>
            <Paper sx={{ p: { xs: 3, md: 4 }, borderRadius: 4, boxShadow: '0 20px 55px rgba(15, 23, 42, 0.08)' }}>
              <Alert severity="warning" sx={{ mb: 2 }}>
                {t('exchangesPage.loginWarning')}
              </Alert>
              <Button variant="contained" href="/api/auth/login" sx={{ textTransform: 'none', fontWeight: 700 }}>
                {t('exchangesPage.login')}
              </Button>
            </Paper>
          </Box>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', py: { xs: 4, md: 6 } }}>
        <Box sx={{ maxWidth: 1160, mx: 'auto', px: { xs: 2, md: 3 } }}>
          <Paper
            sx={{
              mb: 3,
              p: { xs: 2.5, md: 3.5 },
              borderRadius: 4,
              background: 'linear-gradient(135deg, #ffffff 0%, #f8f5ff 100%)',
              border: '1px solid rgba(148, 163, 184, 0.16)',
              boxShadow: '0 18px 50px rgba(15, 23, 42, 0.05)',
            }}
          >
            <Typography variant="overline" sx={{ color: '#8A33FD', fontWeight: 800, letterSpacing: '0.08em' }}>
              {t('exchangesPage.overline')}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
              {t('exchangesPage.title')}
            </Typography>
            <Typography color="text.secondary" sx={{ maxWidth: 820, lineHeight: 1.7, mb: 3, fontSize: { xs: '0.95rem', md: '1rem' } }}>
              {t('exchangesPage.subtitle')}
            </Typography>

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.25} useFlexGap flexWrap="wrap" sx={{ rowGap: 1.25 }}>
              <Paper variant="outlined" sx={{ p: 1.5, minWidth: 160, borderRadius: 3 }}>
                <Typography variant="caption" color="text.secondary">{t('exchangesPage.currentView')}</Typography>
                <Typography sx={{ fontWeight: 700 }}>{activeTabCopy}</Typography>
              </Paper>
              <Paper variant="outlined" sx={{ p: 1.5, minWidth: 120, borderRadius: 3 }}>
                <Typography variant="caption" color="text.secondary">{t('exchangesPage.total')}</Typography>
                <Typography sx={{ fontWeight: 800, fontSize: { xs: '1.15rem', md: '1.35rem' } }}>{allExchanges.length}</Typography>
              </Paper>
              <Paper variant="outlined" sx={{ p: 1.5, minWidth: 120, borderRadius: 3 }}>
                <Typography variant="caption" color="text.secondary">{t('exchangesPage.pending')}</Typography>
                <Typography sx={{ fontWeight: 800, fontSize: { xs: '1.15rem', md: '1.35rem' }, color: '#b26a00' }}>{counts.pending}</Typography>
              </Paper>
              <Paper variant="outlined" sx={{ p: 1.5, minWidth: 120, borderRadius: 3 }}>
                <Typography variant="caption" color="text.secondary">{t('exchangesPage.inProgress')}</Typography>
                <Typography sx={{ fontWeight: 800, fontSize: { xs: '1.15rem', md: '1.35rem' }, color: '#1d4ed8' }}>{counts.inProgress}</Typography>
              </Paper>
              <Paper variant="outlined" sx={{ p: 1.5, minWidth: 120, borderRadius: 3 }}>
                <Typography variant="caption" color="text.secondary">{t('exchangesPage.completed')}</Typography>
                <Typography sx={{ fontWeight: 800, fontSize: { xs: '1.15rem', md: '1.35rem' }, color: '#15803d' }}>{counts.completed}</Typography>
              </Paper>
            </Stack>
          </Paper>

          {notice && (
            <Alert severity={notice.severity} sx={{ mb: 2 }} onClose={() => setNotice(null)}>
              {notice.message}
            </Alert>
          )}

          <ExchangeFilters
            activeTab={activeTab}
            onTabChange={setActiveTab}
            activeState={activeState}
            onStateChange={setActiveState}
            counts={counts}
          />

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : filteredExchanges.length === 0 ? (
            <Paper sx={{ p: { xs: 3, md: 4 }, textAlign: 'center', borderRadius: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                {t('exchangesPage.emptyTitle')}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 560, mx: 'auto' }}>
                {activeTab === 'received'
                  ? t('exchangesPage.emptyReceived')
                  : activeTab === 'sent'
                    ? t('exchangesPage.emptySent')
                    : t('exchangesPage.emptyAll')}
              </Typography>
              <Button variant="contained" onClick={() => router.push('/services')} sx={{ textTransform: 'none', fontWeight: 700 }}>
                {t('exchangesPage.exploreServices')}
              </Button>
            </Paper>
          ) : (
            <Stack spacing={2}>
              {filteredExchanges.map((exchange) => (
                <ExchangeCard
                  key={exchange.id}
                  exchange={exchange}
                  currentUserId={user.sub || ''}
                  onAccept={(exchangeId) => handleAction(exchangeId, 'CONFIRMED')}
                  onReject={(exchangeId) => handleAction(exchangeId, 'REJECTED')}
                  onStart={(exchangeId) => handleAction(exchangeId, 'IN_PROGRESS')}
                  onComplete={(exchangeId) => handleAction(exchangeId, 'COMPLETED')}
                  onRatingSubmitted={handleRatingSubmitted}
                  loading={actionLoading}
                />
              ))}
            </Stack>
          )}
        </Box>
      </Box>
    </Layout>
  );
}
