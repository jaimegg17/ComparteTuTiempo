import { useState } from 'react';
import { Alert, Box, Button, Typography } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useRouter } from 'next/router';
import { useUser } from '@auth0/nextjs-auth0/client';
import { Layout } from '@/components/Layout';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/hooks/useAuth';
import { communitiesApi } from '@/shared/api/communities';
import { apiClient } from '@/shared/api/client';
import {
  CommunityForm,
  CommunityFormValues,
  communityFormToPayload,
} from '@/components/communities/forms/CommunityForm';

export default function NewCommunityPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { user } = useUser();
  const { accessToken } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (values: CommunityFormValues) => {
    if (!user?.sub) {
      setError('Necesitas iniciar sesión para crear una comunidad.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      if (accessToken) {
        apiClient.setToken(accessToken);
      }

      const response = await communitiesApi.createCommunity(communityFormToPayload(values, user.sub, 'COMMUNITY'));
      await router.push(`/communities/${response.community.id}`);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'No se pudo crear la comunidad. Revisa los datos e inténtalo de nuevo.',
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
            onClick={() => router.push('/communities')}
            sx={{ mb: 2, textTransform: 'none' }}
          >
            {t('common.back')}
          </Button>

          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            {t('communities.create')}
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
Crea una comunidad definiendo nombre, imagen, descripción y visibilidad.
          </Typography>

          {!user?.sub && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Debes iniciar sesión para crear una comunidad.
            </Alert>
          )}

          <CommunityForm
            initialValues={{
              name: '',
              description: '',
              topicsText: '',
              rulesText: '',
              imageUrl: '',
              isPrivate: false,
            }}
            submitting={submitting}
            submitLabel="Crear comunidad"
            serverError={error}
            onCancel={() => router.push('/communities')}
            onSubmit={handleSubmit}
          />
        </Box>
      </Box>
    </Layout>
  );
}
