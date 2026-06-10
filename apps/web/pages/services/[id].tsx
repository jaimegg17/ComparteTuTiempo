import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  Typography,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Layout } from '@/components/Layout';
import { FavoriteBorderRounded, FavoriteRounded } from '@mui/icons-material';
import { useUser } from '@auth0/nextjs-auth0/client';
import { ServiceActionFooter } from '@/components/services/ServiceActionFooter';
import { ServiceDetailHeader } from '@/components/services/ServiceDetailHeader';
import { ServiceImageSection } from '@/components/services/ServiceImageSection';
import { ServiceInfoTabs } from '@/components/services/ServiceInfoTabs';
import { ServiceRequestDialog } from '@/components/services/ServiceRequestDialog';
import { useFavoriteServices } from '@/hooks/useFavoriteServices';
import { buildApiUrl } from '@/shared/api/config';
import type { Service } from '@/types/service.types';

export default function ServiceDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useUser();
  const { isFavorite, toggleFavorite } = useFavoriteServices(user?.sub);

  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openRequestDialog, setOpenRequestDialog] = useState(false);
  const [requestMessage, setRequestMessage] = useState('');
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);

  const getErrorMessage = (err: unknown, fallback: string) => (err instanceof Error ? err.message : fallback);

  useEffect(() => {
    if (!id) return;

    const fetchService = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(buildApiUrl(`/services/${id}`));
        if (!response.ok) {
          throw new Error('Error al cargar el servicio');
        }

        const data = await response.json();
        setService(data.service);
      } catch (err: unknown) {
        setError(getErrorMessage(err, 'Error al cargar el servicio'));
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [id]);

  const handleOpenRequest = () => {
    if (!user) {
      const returnTo = typeof router.asPath === 'string' ? router.asPath : '/services';
      router.push(`/api/auth/login?returnTo=${encodeURIComponent(returnTo)}`);
      return;
    }
    setOpenRequestDialog(true);
  };

  const handleRequestService = async () => {
    if (!user || !service) {
      handleOpenRequest();
      return;
    }

    try {
      setRequestLoading(true);
      setRequestError(null);

      const token = await fetch('/api/auth/token').then((res) => res.json()).then((data) => data.accessToken);

      const response = await fetch(buildApiUrl('/exchanges'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          serviceId: service.id,
          offeredById: service.user?.id || service.userId,
          message: requestMessage || undefined,
          date: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || (service.intent === 'REQUEST' ? 'Error al responder la solicitud' : 'Error al solicitar el servicio'));
      }

      setRequestSuccess(true);
      setTimeout(() => {
        setOpenRequestDialog(false);
        setRequestSuccess(false);
        setRequestMessage('');
        router.push('/exchanges');
      }, 1800);
    } catch (err: unknown) {
      setRequestError(getErrorMessage(err, 'Error al solicitar el servicio'));
    } finally {
      setRequestLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  if (error || !service) {
    return (
      <Layout>
        <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', py: 6 }}>
          <Box sx={{ maxWidth: 980, mx: 'auto', px: { xs: 2, md: 3 } }}>
            <Alert severity="error">{error || 'No se ha encontrado el servicio.'}</Alert>
            <Button onClick={() => router.push('/services')} sx={{ mt: 2, textTransform: 'none', fontWeight: 700 }}>
              ← Volver a servicios
            </Button>
          </Box>
        </Box>
      </Layout>
    );
  }

  const isOwnService = user?.sub === service.user?.id || user?.sub === service.userId;
  const favorite = isFavorite(service.id);
  const isRequest = service.intent === 'REQUEST';

  return (
    <Layout>
      <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100%', py: { xs: 4, md: 6 } }}>
        <Box sx={{ maxWidth: 1180, mx: 'auto', px: { xs: 2, md: 3 } }}>
          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2} sx={{ mb: 3 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25} alignItems={{ xs: 'stretch', sm: 'flex-start' }} justifyContent="space-between" sx={{ flex: 1, gap: 1.25 }}>
            <Box>
              <Button onClick={() => router.push('/services')} sx={{ mb: 1, textTransform: 'none', fontWeight: 700 }}>
                ← Volver a servicios
              </Button>
              <Typography variant="overline" sx={{ color: '#8A33FD', fontWeight: 800, letterSpacing: '0.08em', display: 'block' }}>
                {isRequest ? 'DETALLE DE LA SOLICITUD' : 'DETALLE DEL SERVICIO'}
              </Typography>
              <Typography color="text.secondary" sx={{ maxWidth: 680 }}>
                {isRequest ? 'Comprueba la necesidad publicada, la ubicación aproximada y responde solo si realmente puedes ayudar.' : 'Revisa el alcance del servicio, la ubicación aproximada y las valoraciones antes de enviar una solicitud.'}
              </Typography>
            </Box>
            {!isOwnService && (
              <Tooltip title={favorite ? 'Quitar de favoritos' : 'Guardar en favoritos'}>
                <IconButton
                  aria-label={favorite ? 'Quitar de favoritos' : 'Guardar en favoritos'}
                  onClick={() => toggleFavorite(service.id)}
                  sx={{ alignSelf: { xs: 'flex-start', sm: 'auto' }, bgcolor: '#fff', boxShadow: '0 10px 24px rgba(15,23,42,0.08)' }}
                >
                  {favorite ? <FavoriteRounded sx={{ color: '#e11d48' }} /> : <FavoriteBorderRounded />}
                </IconButton>
              </Tooltip>
            )}
            </Stack>

            {isOwnService && (
              <Button
                onClick={() => router.push(`/services/edit/${service.id}`)}
                variant="outlined"
                sx={{ alignSelf: { xs: 'flex-start', md: 'center' }, textTransform: 'none', fontWeight: 700 }}
              >
                {isRequest ? 'Editar solicitud' : 'Editar servicio'}
              </Button>
            )}
          </Stack>

          <Paper
            sx={{
              overflow: 'hidden',
              mb: 3,
              borderRadius: 4,
              boxShadow: '0 20px 55px rgba(15, 23, 42, 0.08)',
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, minHeight: { lg: 680 } }}>
              <ServiceImageSection imageUrl={service.imageUrl} title={service.title} status={service.status} />

              <Box sx={{ width: { xs: '100%', lg: '50%' }, p: { xs: 2.25, sm: 3, md: 4, lg: 5 }, display: 'flex', flexDirection: 'column' }}>
                <ServiceDetailHeader
                  category={service.category}
                  title={service.title}
                  averageRating={service.averageRating ?? 0}
                  totalRatings={service.totalRatings ?? service._count?.ratings ?? 0}
                  providerName={service.user?.name}
                  location={service.formattedAddress || service.location}
                  status={service.status}
                  type={service.type}
                />

                {!user && !isOwnService && (
                  <Alert severity="info" sx={{ mb: 2.5 }}>
                    {isRequest ? 'Puedes revisar toda la información antes de decidir. Cuando quieras responder a esta solicitud, te llevaremos al inicio de sesión.' : 'Puedes revisar toda la información antes de decidir. Cuando quieras solicitar este servicio, te llevaremos al inicio de sesión.'}
                  </Alert>
                )}

                <ServiceInfoTabs service={service} />

                <Divider sx={{ my: 3 }} />

                <ServiceActionFooter
                  isOwnService={isOwnService}
                  status={service.status}
                  duration={service.duration}
                  isUserLoggedIn={!!user}
                  intent={service.intent}
                  onRequestService={handleOpenRequest}
                />
              </Box>
            </Box>
          </Paper>
        </Box>
      </Box>

      <ServiceRequestDialog
        open={openRequestDialog}
        loading={requestLoading}
        success={requestSuccess}
        error={requestError}
        message={requestMessage}
        providerName={service.user?.name}
        duration={service.duration}
        intent={service.intent}
        onClose={() => setOpenRequestDialog(false)}
        onMessageChange={setRequestMessage}
        onSubmit={handleRequestService}
      />
    </Layout>
  );
}
