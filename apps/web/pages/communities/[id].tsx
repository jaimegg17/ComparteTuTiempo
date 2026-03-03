import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Box, Button, Chip, CircularProgress, Typography } from '@mui/material';
import { ArrowBack, Lock, Public } from '@mui/icons-material';
import { Layout } from '@/components/Layout';
import { ErrorAlert } from '@/components/ui/BeautifulAlert';
import { communitiesApi } from '@/shared/api/communities';
import { useErrorHandling, ERROR_MESSAGES } from '@/hooks/useErrorHandling';
import { useTranslation } from '@/hooks/useTranslation';
import type { Community } from '@comparte-tu-tiempo/contracts';

export default function CommunityDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { t } = useTranslation();
  const [community, setCommunity] = useState<Community | null>(null);
  const { error, loading, handleAsyncOperation, clearError } = useErrorHandling();

  const fetchCommunity = useCallback(async () => {
    if (!id || Number.isNaN(Number(id))) return;

    await handleAsyncOperation(async () => {
      const response = await communitiesApi.getCommunity(Number(id));
      setCommunity(response.community);
    }, ERROR_MESSAGES.NETWORK_ERROR);
  }, [id, handleAsyncOperation]);

  useEffect(() => {
    fetchCommunity();
  }, [fetchCommunity]);

  return (
    <Layout>
      <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100%', py: 4 }}>
        <Box sx={{ maxWidth: 920, mx: 'auto', px: { xs: 2, md: 3 } }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => router.push('/communities')}
            sx={{ mb: 2, textTransform: 'none' }}
          >
            {t('common.back')}
          </Button>

          {error && (
            <Box sx={{ mb: 3 }}>
              <ErrorAlert
                message={error}
                onRetry={fetchCommunity}
                onClose={clearError}
                retryText={t('common.retry')}
              />
            </Box>
          )}

          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          )}

          {!loading && community && (
            <Box sx={{ bgcolor: '#fff', p: { xs: 2.5, md: 4 }, borderRadius: 3, boxShadow: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, fontSize: { xs: '1.75rem', md: '2rem' } }}>
                  {community.name}
                </Typography>

                <Chip
                  icon={community.isPrivate ? <Lock /> : <Public />}
                  label={community.isPrivate ? t('communities.private') : t('communities.public')}
                  color={community.isPrivate ? 'default' : 'primary'}
                  variant={community.isPrivate ? 'outlined' : 'filled'}
                />
              </Box>

              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                {community.description || t('communities.no_description')}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Layout>
  );
}
