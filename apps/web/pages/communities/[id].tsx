import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { Alert, Box, Button, CircularProgress, Stack } from '@mui/material';
import { ArrowBack, ExitToApp, GroupAdd } from '@mui/icons-material';
import { useUser } from '@auth0/nextjs-auth0/client';
import { Layout } from '@/components/Layout';
import { ErrorAlert } from '@/components/ui/BeautifulAlert';
import { communitiesApi } from '@/shared/api/communities';
import { membershipsApi } from '@/shared/api/memberships';
import { eventsApi } from '@/shared/api/events';
import { useErrorHandling, ERROR_MESSAGES } from '@/hooks/useErrorHandling';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/hooks/useAuth';
import { CommunityHeader } from '@/components/communities/CommunityHeader';
import { CommunityMembersSection } from '@/components/communities/CommunityMembersSection';
import { CommunityActivitySection } from '@/components/communities/CommunityActivitySection';
import type { Community, Event, Membership } from '@comparte-tu-tiempo/contracts';
import { apiClient } from '@/shared/api/client';

export default function CommunityDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useUser();
  const { accessToken } = useAuth();
  const { t } = useTranslation();
  const [community, setCommunity] = useState<Community | null>(null);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const { error, loading, handleAsyncOperation, clearError } = useErrorHandling();

  const communityId = useMemo(() => {
    if (!id) return null;
    const parsed = Number(id);
    return Number.isNaN(parsed) ? null : parsed;
  }, [id]);

  const fetchCommunityData = useCallback(async () => {
    if (!communityId) return;

    await handleAsyncOperation(async () => {
      if (accessToken) {
        apiClient.setToken(accessToken);
      }

      const detailResponse = await communitiesApi.getCommunity(communityId);
      setCommunity(detailResponse.community);

      const [membershipsResult, eventsResult] = await Promise.allSettled([
        membershipsApi.getMemberships({ groupId: communityId, page: 1, pageSize: 50 }),
        eventsApi.getEventsByCommunity(communityId),
      ]);

      if (membershipsResult.status === 'fulfilled') {
        setMemberships(membershipsResult.value.memberships);
      } else {
        setMemberships([]);
      }

      if (eventsResult.status === 'fulfilled') {
        setEvents(eventsResult.value);
      } else {
        setEvents([]);
      }
    }, ERROR_MESSAGES.NETWORK_ERROR);
  }, [communityId, accessToken, handleAsyncOperation]);

  useEffect(() => {
    fetchCommunityData();
  }, [fetchCommunityData]);

  const activeMemberships = memberships.filter((membership) => membership.status === 'ACTIVA');
  const myMembership = memberships.find(
    (membership) => membership.userId === user?.sub && membership.status === 'ACTIVA',
  );
  const isMember = Boolean(myMembership);
  const isOwner = Boolean(community && user?.sub && community.creatorId === user.sub);

  const handleJoin = async () => {
    if (!communityId || !user?.sub || actionLoading) return;

    setActionLoading(true);
    setNotice(null);

    try {
      if (accessToken) {
        apiClient.setToken(accessToken);
      }

      await membershipsApi.createMembership({
        userId: user.sub,
        groupId: communityId,
        role: 'MEMBER',
        status: 'ACTIVA',
      });

      setNotice('Te has unido a la comunidad.');
      await fetchCommunityData();
    } catch {
      setNotice('No se pudo completar la acción de unirse. Endpoint pendiente o acceso no permitido.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeave = async () => {
    if (!myMembership || actionLoading) return;

    setActionLoading(true);
    setNotice(null);

    try {
      if (accessToken) {
        apiClient.setToken(accessToken);
      }

      await membershipsApi.updateMembership(myMembership.id, { status: 'SUSPENDIDA' });
      setNotice('Has salido de la comunidad.');
      await fetchCommunityData();
    } catch {
      setNotice('No se pudo completar la acción de salir. Endpoint pendiente o acceso no permitido.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Layout>
      <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100%', py: 4 }}>
        <Box sx={{ maxWidth: 1040, mx: 'auto', px: { xs: 2, md: 3 } }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => router.push('/communities')}
            sx={{ mb: 2, textTransform: 'none' }}
          >
            {t('common.back')}
          </Button>

          {error && (
            <Box sx={{ mb: 2 }}>
              <ErrorAlert
                message={error}
                onRetry={fetchCommunityData}
                onClose={clearError}
                retryText={t('common.retry')}
              />
            </Box>
          )}

          {notice && (
            <Alert severity="info" sx={{ mb: 2 }} onClose={() => setNotice(null)}>
              {notice}
            </Alert>
          )}

          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          )}

          {!loading && community && (
            <Stack spacing={2.5}>
              <CommunityHeader
                community={community}
                membersCount={activeMemberships.length}
                eventsCount={events.length}
                t={t}
              />

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                {isOwner && (
                  <Button
                    variant="outlined"
                    onClick={() => router.push(`/communities/${community.id}/edit`)}
                    sx={{ textTransform: 'none', fontWeight: 600, alignSelf: 'flex-start' }}
                  >
                    Editar comunidad
                  </Button>
                )}
                <Button
                  variant={isMember ? 'outlined' : 'contained'}
                  color={isMember ? 'inherit' : 'primary'}
                  onClick={isMember ? handleLeave : handleJoin}
                  startIcon={isMember ? <ExitToApp /> : <GroupAdd />}
                  disabled={!user?.sub || actionLoading}
                  sx={{ textTransform: 'none', fontWeight: 600, alignSelf: 'flex-start' }}
                >
                  {isMember ? 'Salir de comunidad' : 'Unirse a comunidad'}
                </Button>
              </Stack>

              <CommunityMembersSection memberships={memberships} currentUserId={user?.sub ?? undefined} />
              <CommunityActivitySection events={events} />
            </Stack>
          )}
        </Box>
      </Box>
    </Layout>
  );
}
