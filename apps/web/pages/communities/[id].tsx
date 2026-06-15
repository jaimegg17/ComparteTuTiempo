import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { Alert, Box, Button, CircularProgress, Stack, Typography } from '@mui/material';
import { ArrowBack, EventAvailable, ExitToApp, GroupAdd, HandymanOutlined } from '@mui/icons-material';
import { useUser } from '@auth0/nextjs-auth0/client';
import { Layout } from '@/components/Layout';
import { ErrorAlert } from '@/components/ui/BeautifulAlert';
import { communitiesApi } from '@/shared/api/communities';
import { eventsApi } from '@/shared/api/events';
import { communityMembershipsApi } from '@/shared/api/community-memberships';
import { servicesApi } from '@/shared/api/services';
import { useErrorHandling, ERROR_MESSAGES } from '@/hooks/useErrorHandling';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useEventRegistrations } from '@/hooks/useEventRegistrations';
import { CommunityHeader } from '@/components/communities/CommunityHeader';
import { CommunityMembersSection } from '@/components/communities/CommunityMembersSection';
import { CommunityActivitySection } from '@/components/communities/CommunityActivitySection';
import { CommunityRulesSection } from '@/components/communities/CommunityRulesSection';
import { CommunityResourcesSection } from '@/components/communities/CommunityResourcesSection';
import type { Community, CommunityMembership, CommunityMembershipRole, Event, Service } from '@comparte-tu-tiempo/contracts';
import { apiClient } from '@/shared/api/client';
import { ServiceCard } from '@/components/ServiceCard';

export default function CommunityDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useUser();
  const { accessToken } = useAuth();
  const { userProfile } = useUserProfile();
  const { isRegistered, toggleRegistration } = useEventRegistrations(user?.sub);
  const { t } = useTranslation();
  const [community, setCommunity] = useState<Community | null>(null);
  const [memberships, setMemberships] = useState<CommunityMembership[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [communityServices, setCommunityServices] = useState<Service[]>([]);
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

      if (detailResponse.community.isPrivate && !user?.sub) {
        setMemberships([]);
        setEvents([]);
        setCommunityServices([]);
        return;
      }

      const [membershipsResult, eventsResult, servicesResult] = await Promise.allSettled([
        communityMembershipsApi.getMemberships(communityId),
        eventsApi.getEventsByCommunity(communityId),
        servicesApi.getServices({ communityId, page: 1, pageSize: 6 }),
      ]);

      if (membershipsResult.status === 'fulfilled') {
        setMemberships(membershipsResult.value);
      } else {
        setMemberships([]);
      }

      if (eventsResult.status === 'fulfilled') {
        setEvents(eventsResult.value);
      } else {
        setEvents([]);
      }

      if (servicesResult.status === 'fulfilled') {
        setCommunityServices(servicesResult.value.services);
      } else {
        setCommunityServices([]);
      }
    }, ERROR_MESSAGES.NETWORK_ERROR);
  }, [communityId, accessToken, user?.sub, handleAsyncOperation]);

  useEffect(() => {
    fetchCommunityData();
  }, [fetchCommunityData]);

  const activeMemberships = memberships.filter((membership) => membership.status === 'ACTIVE');
  const pendingMemberships = memberships.filter((membership) => membership.status === 'PENDING');
  const myMembership = memberships.find(
    (membership) => membership.userId === user?.sub && membership.status === 'ACTIVE',
  );
  const myPendingMembership = memberships.find(
    (membership) => membership.userId === user?.sub && membership.status === 'PENDING',
  );
  const isMember = Boolean(myMembership);
  const isOwner = myMembership?.role === 'OWNER' || Boolean(community && user?.sub && community.creatorId === user.sub);
  const isAdmin = userProfile?.role === 'ADMIN';
  const canManage = isOwner || isAdmin;
  const isOrganizationView = router.pathname.startsWith('/organizations') || community?.kind === 'ORGANIZATION';

  const handleToggleEventRegistration = async (eventId: number) => {
    if (!user?.sub) {
      setNotice(t('communities.detail.loginToRegisterEvent'));
      return;
    }
    if (!isMember && !canManage) {
      setNotice(t('communities.detail.mustBeMemberToRegisterEvent'));
      return;
    }
    const added = await toggleRegistration(eventId);
    setNotice(added ? t('communities.detail.eventRegistered') : t('communities.detail.eventUnregistered'));
  };

  const handleJoin = async () => {
    if (!communityId || actionLoading) return;

    if (!user?.sub) {
      router.push(`/api/auth/login?returnTo=${isOrganizationView ? '/organizations' : '/communities'}/${communityId}`);
      return;
    }

    setActionLoading(true);
    setNotice(null);

    try {
      if (accessToken) {
        apiClient.setToken(accessToken);
      }

      await communityMembershipsApi.joinCommunity(communityId);

      setNotice(community?.isPrivate ? t('communities.detail.joinPrivateSuccess') : t('communities.detail.joinSuccess'));
      await fetchCommunityData();
    } catch {
      setNotice(t('communities.detail.joinError'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeave = async () => {
    const targetMembership = myMembership ?? myPendingMembership;
    if (!targetMembership || actionLoading) return;

    setActionLoading(true);
    setNotice(null);

    try {
      if (accessToken) {
        apiClient.setToken(accessToken);
      }

      await communityMembershipsApi.leaveCommunity(communityId!);
      setNotice(myPendingMembership ? t('communities.detail.leavePendingSuccess') : t('communities.detail.leaveSuccess'));
      await fetchCommunityData();
    } catch {
      setNotice(t('communities.detail.leaveError'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleRoleChange = async (membership: CommunityMembership, role: CommunityMembershipRole) => {
    if (!communityId || !canManage || membership.role === role) return;

    try {
      setActionLoading(true);
      await communityMembershipsApi.updateMembership(communityId, membership.id, { role });
      setNotice(t('communities.detail.roleSuccess'));
      await fetchCommunityData();
    } catch {
      setNotice(t('communities.detail.roleError'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusChange = async (
    membership: CommunityMembership,
    status: 'ACTIVE' | 'PENDING' | 'SUSPENDED',
  ) => {
    if (!communityId || !canManage || membership.status === status) return;

    try {
      setActionLoading(true);
      await communityMembershipsApi.updateMembership(communityId, membership.id, { status });
      setNotice(status === 'ACTIVE' ? t('communities.detail.statusApproved') : t('communities.detail.statusRejected'));
      await fetchCommunityData();
    } catch {
      setNotice(t('communities.detail.statusError'));
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Layout>
      <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100%', py: 4 }}>
        <Box sx={{ maxWidth: 1040, mx: 'auto', px: { xs: 2, sm: 2.5, md: 3 } }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => router.push(isOrganizationView ? '/organizations' : '/communities')}
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
              {!(community.isPrivate && !user?.sub) && (
                <CommunityHeader
                  community={community}
                  membersCount={activeMemberships.length}
                  eventsCount={events.length}
                  resourcesCount={community.resources.length}
                  t={t}
                />
              )}

              {community.isPrivate && !user?.sub ? (
                <Box
                  sx={{
                    bgcolor: '#fff',
                    borderRadius: 3,
                    border: '1px solid rgba(148,163,184,0.16)',
                    boxShadow: '0 12px 28px rgba(15,23,42,0.06)',
                    p: { xs: 2.5, md: 3 },
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
                    {t(isOrganizationView ? 'communities.detail.privateOrganizationLoginTitle' : 'communities.detail.privateCommunityLoginTitle')}
                  </Typography>
                  <Typography color="text.secondary" sx={{ mb: 2, lineHeight: 1.7 }}>
                    {t(isOrganizationView ? 'communities.detail.privateOrganizationLoginDescription' : 'communities.detail.privateCommunityLoginDescription')}
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => router.push(`/api/auth/login?returnTo=${isOrganizationView ? '/organizations' : '/communities'}/${community.id}`)}
                    sx={{ textTransform: 'none', fontWeight: 800, bgcolor: '#8A33FD', '&:hover': { bgcolor: '#7028E0' } }}
                  >
                    {t('auth.login')}
                  </Button>
                </Box>
              ) : (
                <>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ '& .MuiButton-root': { width: { xs: '100%', sm: 'auto' } } }}>
                {canManage && (
                  <>
                    <Button
                      variant="contained"
                      startIcon={<EventAvailable />}
                      onClick={() => router.push(`/communities/${community.id}/edit#events`)}
                      sx={{ textTransform: 'none', fontWeight: 700, alignSelf: 'flex-start' }}
                    >
                      {t('communities.detail.publishEvent')}
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => router.push(`/communities/${community.id}/edit`)}
                      sx={{ textTransform: 'none', fontWeight: 600, alignSelf: 'flex-start' }}
                    >
                      {t('communities.detail.manageSpace', { space: isOrganizationView ? t('communities.detail.organization') : t('communities.detail.community') })}
                    </Button>
                  </>
                )}
                <Button
                  variant={isMember || myPendingMembership ? 'outlined' : 'contained'}
                  color={isMember || myPendingMembership ? 'inherit' : 'primary'}
                  onClick={isMember || myPendingMembership ? handleLeave : handleJoin}
                  startIcon={isMember || myPendingMembership ? <ExitToApp /> : <GroupAdd />}
                  disabled={actionLoading}
                  sx={{ textTransform: 'none', fontWeight: 600, alignSelf: 'flex-start' }}
                >
                  {isMember
                    ? t('communities.detail.leave')
                    : myPendingMembership
                      ? t('communities.detail.cancelRequest')
                      : community.isPrivate
                        ? t(isOrganizationView ? 'communities.detail.requestJoinOrganization' : 'communities.detail.requestJoin')
                        : t(isOrganizationView ? 'communities.detail.joinOrganization' : 'communities.detail.join')}
                </Button>
              </Stack>

              {community.isPrivate && !isMember && !myPendingMembership && (
                <Alert severity="info">
                  {t('communities.detail.privateNotice')}
                </Alert>
              )}

              {myPendingMembership && (
                <Alert severity="warning">
                  {t('communities.detail.pendingNotice')}
                </Alert>
              )}

              {canManage && pendingMemberships.length > 0 && (
                <Alert severity="warning">
                  {t('communities.detail.pendingReview', { count: pendingMemberships.length })}
                </Alert>
              )}

              <Box
                sx={{
                  bgcolor: '#fff',
                  borderRadius: 3,
                  border: '1px solid rgba(148,163,184,0.16)',
                  boxShadow: '0 12px 28px rgba(15,23,42,0.06)',
                  p: { xs: 2.25, md: 2.75 },
                }}
              >
                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1.5} sx={{ mb: 2 }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>
                      {t(isOrganizationView ? 'communities.services.organizationTitle' : 'communities.services.title')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t(isOrganizationView ? 'communities.services.organizationDescription' : 'communities.services.description')}
                    </Typography>
                  </Box>
                  {(isMember || canManage) && (
                    <Button
                      variant="outlined"
                      startIcon={<HandymanOutlined />}
                      onClick={() => router.push(`/services/create?communityId=${community.id}`)}
                      sx={{ textTransform: 'none', fontWeight: 700, alignSelf: { xs: 'stretch', sm: 'flex-start' } }}
                    >
                      {t(isOrganizationView ? 'communities.detail.publishOrganizationService' : 'communities.detail.publishService')}
                    </Button>
                  )}
                </Stack>

                {communityServices.length === 0 ? (
                  <Alert severity="info">{t(isOrganizationView ? 'communities.services.organizationEmpty' : 'communities.services.empty')}</Alert>
                ) : (
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(3, minmax(0, 1fr))' },
                      gap: 2,
                      '& > *': { maxWidth: 'none' },
                    }}
                  >
                    {communityServices.map((service) => (
                      <ServiceCard key={service.id} service={{ ...service, location: service.location ?? '' }} />
                    ))}
                  </Box>
                )}
              </Box>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', lg: '1.35fr 1fr' },
                  gap: 2.5,
                }}
              >
                <Box>
                  <Stack spacing={2.5}>
                    <CommunityRulesSection rules={community.rules} organization={isOrganizationView} />
                    <CommunityResourcesSection resources={community.resources} organization={isOrganizationView} />
                  </Stack>
                </Box>
                <Box>
                  <Stack spacing={2.5}>
                    <CommunityMembersSection
                      memberships={memberships}
                      currentUserId={user?.sub ?? undefined}
                      canManage={canManage}
                      onRoleChange={handleRoleChange}
                      onStatusChange={handleStatusChange}
                    />
                    <CommunityActivitySection
                      events={events}
                      isUserLoggedIn={!!user?.sub}
                      isRegistered={isRegistered}
                      onToggleRegistration={handleToggleEventRegistration}
                    />
                  </Stack>
                </Box>
              </Box>
                </>
              )}
            </Stack>
          )}
        </Box>
      </Box>
    </Layout>
  );
}
