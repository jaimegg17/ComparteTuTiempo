import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Box, Button, CircularProgress, Typography, Chip } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useRouter } from 'next/router';
import { useUser } from '@auth0/nextjs-auth0/client';
import { Layout } from '@/components/Layout';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { communitiesApi } from '@/shared/api/communities';
import { apiClient } from '@/shared/api/client';
import { communityMembershipsApi } from '@/shared/api/community-memberships';
import { CommunityForm, CommunityFormValues } from '@/components/communities/forms/CommunityForm';
import { Stack } from '@mui/material';
import type { Community, CommunityMembership, CommunityResource, Event } from '@comparte-tu-tiempo/contracts';
import { CommunityResourcesEditor } from '@/components/communities/forms/CommunityResourcesEditor';
import { CommunityEventFormValues } from '@/components/communities/forms/CommunityEventForm';
import { eventsApi } from '@/shared/api/events';
import { CommunityEventsManager } from '@/components/communities/CommunityEventsManager';

export default function EditCommunityPage() {
  const router = useRouter();
  const { id } = router.query;
  const { t } = useTranslation();
  const { user } = useUser();
  const { accessToken } = useAuth();
  const { userProfile } = useUserProfile();
  const [community, setCommunity] = useState<Community | null>(null);
  const [memberships, setMemberships] = useState<CommunityMembership[]>([]);
  const [resources, setResources] = useState<CommunityResource[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [eventError, setEventError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const communityId = useMemo(() => {
    if (!id) return null;
    const parsed = Number(id);
    return Number.isNaN(parsed) ? null : parsed;
  }, [id]);

  const fetchCommunity = useCallback(async () => {
    if (!communityId) return;

    try {
      setLoading(true);
      setError(null);

      if (accessToken) {
        apiClient.setToken(accessToken);
      }

      const [communityResponse, eventsResponse, membershipsResponse] = await Promise.all([
        communitiesApi.getCommunity(communityId),
        eventsApi.getEventsByCommunity(communityId),
        communityMembershipsApi.getMemberships(communityId),
      ]);
      setCommunity(communityResponse.community);
      setResources(communityResponse.community.resources);
      setEvents(eventsResponse);
      setMemberships(membershipsResponse);
    } catch (fetchError) {
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : 'No se pudo cargar la comunidad para editar.',
      );
    } finally {
      setLoading(false);
    }
  }, [communityId, accessToken]);

  useEffect(() => {
    fetchCommunity();
  }, [fetchCommunity]);

  const handleSubmit = async (values: CommunityFormValues) => {
    if (!communityId || !user?.sub) {
      setError('Debes iniciar sesión para editar esta comunidad.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      if (accessToken) {
        apiClient.setToken(accessToken);
      }

      await communitiesApi.updateCommunity(communityId, {
        name: values.name.trim(),
        description: values.description.trim(),
        topics: values.topicsText
          .split(',')
          .map((topic) => topic.trim())
          .filter(Boolean),
        rules: values.rulesText
          .split('\n')
          .map((rule) => rule.trim())
          .filter(Boolean),
        imageUrl: values.imageUrl.trim() || null,
        resources: resources
          .map((resource) => ({
            title: resource.title.trim(),
            description: resource.description?.trim() || null,
            type: resource.type,
            url: resource.url?.trim() || null,
            imageUrl: resource.imageUrl?.trim() || null,
          }))
          .filter((resource) => resource.title),
        isPrivate: values.isPrivate,
      });

      await router.push(`/communities/${communityId}`);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'No se pudo guardar la comunidad. Revisa los datos e inténtalo de nuevo.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const isOwner = Boolean(community && user?.sub && community.creatorId === user.sub);
  const isAdmin = userProfile?.role === 'ADMIN';
  const canManage = isOwner || isAdmin;
  const pendingMemberships = memberships.filter((membership) => membership.status === 'PENDING');

  const handleOrganizationStatusChange = async (verificationStatus: 'APPROVED' | 'REJECTED') => {
    if (!communityId || !isAdmin) return;

    try {
      setSubmitting(true);
      setError(null);

      if (accessToken) {
        apiClient.setToken(accessToken);
      }

      if (verificationStatus === 'APPROVED') {
        await communitiesApi.approveOrganization(communityId);
      } else {
        await communitiesApi.rejectOrganization(communityId);
      }

      await fetchCommunity();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'No se pudo actualizar el estado de la organización.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateEvent = async (values: CommunityEventFormValues) => {
    if (!communityId || !user?.sub) return;

    try {
      setSubmitting(true);
      setEventError(null);

      if (accessToken) {
        apiClient.setToken(accessToken);
      }

      await eventsApi.createEvent({
        communityId,
        title: values.title.trim(),
        description: values.description.trim(),
        date: new Date(values.date),
        location: values.location.trim() || undefined,
        capacity: values.capacity ? Number(values.capacity) : undefined,
        creatorId: user.sub,
      });
      setEvents(await eventsApi.getEventsByCommunity(communityId));
    } catch (createEventError) {
      setEventError(
        createEventError instanceof Error
          ? createEventError.message
          : 'No se pudo publicar el evento.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateEvent = async (eventId: number, values: CommunityEventFormValues) => {
    if (!communityId) return;

    try {
      setSubmitting(true);
      setEventError(null);

      if (accessToken) {
        apiClient.setToken(accessToken);
      }

      await eventsApi.updateEvent(eventId, {
        title: values.title.trim(),
        description: values.description.trim(),
        date: new Date(values.date),
        location: values.location.trim() || undefined,
        capacity: values.capacity ? Number(values.capacity) : undefined,
      });

      setEvents(await eventsApi.getEventsByCommunity(communityId));
    } catch (updateEventError) {
      setEventError(
        updateEventError instanceof Error
          ? updateEventError.message
          : 'No se pudo actualizar el evento.',
      );
    } finally {
        setSubmitting(false);
    }
  };

  const handleDeleteEvent = async (eventId: number) => {
    if (!communityId) return;

    try {
      setSubmitting(true);
      setEventError(null);

      if (accessToken) {
        apiClient.setToken(accessToken);
      }

      await eventsApi.deleteEvent(eventId);
      setEvents(await eventsApi.getEventsByCommunity(communityId));
    } catch (deleteEventError) {
      setEventError(
        deleteEventError instanceof Error
          ? deleteEventError.message
          : 'No se pudo eliminar el evento.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100%', py: 6 }}>
        <Box
          sx={{
            maxWidth: 1080,
            mx: 'auto',
            px: { xs: 2, md: 3 },
            py: { xs: 3, md: 4 },
          }}
        >
          <Button
            startIcon={<ArrowBack />}
            onClick={() => router.push(communityId ? `/communities/${communityId}` : '/communities')}
            sx={{ mb: 2, textTransform: 'none' }}
          >
            {t('common.back')}
          </Button>

          <Box
            sx={{
              mb: 3,
              bgcolor: '#fff',
              borderRadius: 3,
              boxShadow: '0 14px 34px rgba(15,23,42,0.08)',
              border: '1px solid rgba(148,163,184,0.16)',
              p: { xs: 2.5, md: 3 },
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.75 }}>
              {community?.kind === 'ORGANIZATION' ? 'Panel de gestión de la organización' : t('communities.edit')}
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              Centraliza aquí la configuración, el tablón, los eventos y las solicitudes pendientes.
            </Typography>

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.25} useFlexGap flexWrap="wrap">
              <Chip label={`${resources.length} recursos`} />
              <Chip label={`${events.length} eventos`} />
              <Chip
                color={pendingMemberships.length > 0 ? 'warning' : 'default'}
                label={`${pendingMemberships.length} solicitudes pendientes`}
              />
              {community?.kind === 'ORGANIZATION' && (
                <Chip
                  color={
                    community.verificationStatus === 'APPROVED'
                      ? 'success'
                      : community.verificationStatus === 'REJECTED'
                        ? 'error'
                        : 'warning'
                  }
                  label={`Estado: ${community.verificationStatus}`}
                />
              )}
            </Stack>
          </Box>

          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          )}

          {!loading && !community && (
            <Alert severity="error">No se encontró la comunidad.</Alert>
          )}

          {!loading && community && !canManage && (
            <Alert severity="warning">
              Solo un owner o un administrador pueden gestionar este espacio.
            </Alert>
          )}

          {!loading && community && canManage && (
            <Stack spacing={2.5}>
              {community.kind === 'ORGANIZATION' && isAdmin && (
                <Alert severity={community.verificationStatus === 'APPROVED' ? 'success' : community.verificationStatus === 'REJECTED' ? 'error' : 'info'}>
                  Estado actual de la organización: <strong>{community.verificationStatus}</strong>
                </Alert>
              )}

              {community.kind === 'ORGANIZATION' && isAdmin && community.verificationStatus !== 'APPROVED' && (
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                  <Button
                    variant="contained"
                    color="success"
                    disabled={submitting}
                    onClick={() => handleOrganizationStatusChange('APPROVED')}
                    sx={{ textTransform: 'none', fontWeight: 700 }}
                  >
                    Aprobar organización
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    disabled={submitting}
                    onClick={() => handleOrganizationStatusChange('REJECTED')}
                    sx={{ textTransform: 'none', fontWeight: 700 }}
                  >
                    Rechazar organización
                  </Button>
                </Stack>
              )}

              <CommunityForm
                initialValues={{
                  name: community.name ?? '',
                  description: community.description ?? '',
                  topicsText: community.topics.join(', '),
                  rulesText: community.rules.join('\n'),
                  imageUrl: community.imageUrl ?? '',
                  isPrivate: community.isPrivate,
                }}
                submitting={submitting}
                submitLabel="Guardar cambios"
                serverError={error}
                onCancel={() => router.push(`/communities/${community.id}`)}
                onSubmit={handleSubmit}
              />

              <CommunityResourcesEditor
                resources={resources}
                onChange={setResources}
              />

              <Box id="events">
                <CommunityEventsManager
                  events={events}
                submitting={submitting}
                serverError={eventError}
                onCreate={handleCreateEvent}
                  onUpdate={handleUpdateEvent}
                  onDelete={handleDeleteEvent}
                />
              </Box>

              {pendingMemberships.length > 0 && (
                <Alert severity="warning">
                  Tienes {pendingMemberships.length} solicitud{pendingMemberships.length > 1 ? 'es' : ''} pendiente{pendingMemberships.length > 1 ? 's' : ''} de revisar en este espacio.
                </Alert>
              )}
            </Stack>
          )}
        </Box>
      </Box>
    </Layout>
  );
}
