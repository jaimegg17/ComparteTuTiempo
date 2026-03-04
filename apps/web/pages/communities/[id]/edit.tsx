import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Box, Button, CircularProgress, Typography } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useRouter } from 'next/router';
import { useUser } from '@auth0/nextjs-auth0/client';
import { Layout } from '@/components/Layout';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/hooks/useAuth';
import { communitiesApi } from '@/shared/api/communities';
import { apiClient } from '@/shared/api/client';
import { CommunityForm, CommunityFormValues } from '@/components/communities/forms/CommunityForm';
import type { Community } from '@comparte-tu-tiempo/contracts';

export default function EditCommunityPage() {
  const router = useRouter();
  const { id } = router.query;
  const { t } = useTranslation();
  const { user } = useUser();
  const { accessToken } = useAuth();
  const [community, setCommunity] = useState<Community | null>(null);
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

      const response = await communitiesApi.getCommunity(communityId);
      setCommunity(response.community);
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

  return (
    <Layout>
      <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100%', py: 6 }}>
        <Box
          sx={{
            maxWidth: 720,
            mx: 'auto',
            px: { xs: 2, md: 3 },
            py: { xs: 3, md: 5 },
            bgcolor: '#fff',
            borderRadius: 3,
            boxShadow: 1,
          }}
        >
          <Button
            startIcon={<ArrowBack />}
            onClick={() => router.push(communityId ? `/communities/${communityId}` : '/communities')}
            sx={{ mb: 2, textTransform: 'none' }}
          >
            {t('common.back')}
          </Button>

          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            {t('communities.edit')}
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Actualiza los datos principales de tu comunidad.
          </Typography>

          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          )}

          {!loading && !community && (
            <Alert severity="error">No se encontró la comunidad.</Alert>
          )}

          {!loading && community && !isOwner && (
            <Alert severity="warning">
              Solo el creador puede editar esta comunidad.
            </Alert>
          )}

          {!loading && community && isOwner && (
            <CommunityForm
              initialValues={{
                name: community.name ?? '',
                description: community.description ?? '',
                isPrivate: community.isPrivate,
              }}
              submitting={submitting}
              submitLabel="Guardar cambios"
              serverError={error}
              onCancel={() => router.push(`/communities/${community.id}`)}
              onSubmit={handleSubmit}
            />
          )}
        </Box>
      </Box>
    </Layout>
  );
}
