import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/material';
import {
  ArrowBack,
  MarkEmailUnreadOutlined,
  PendingActions,
  VerifiedUserOutlined,
} from '@mui/icons-material';
import { Layout } from '@/components/Layout';
import { communitiesApi } from '@/shared/api/communities';
import { adminApi, type AdminMetrics } from '@/shared/api/admin';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { apiClient } from '@/shared/api/client';
import type { Community } from '@comparte-tu-tiempo/contracts';

export default function AdminInboxPage() {
  const router = useRouter();
  const { accessToken } = useAuth();
  const { userProfile, profileLoading } = useUserProfile();
  const [organizations, setOrganizations] = useState<Community[]>([]);
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrganizations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (accessToken) {
        apiClient.setToken(accessToken);
      }

      const [pendingResponse, metricsResponse] = await Promise.all([
        communitiesApi.getPendingOrganizations(),
        adminApi.getMetrics(),
      ]);
      setOrganizations(pendingResponse.communities);
      setMetrics(metricsResponse.metrics);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'No se pudo cargar el inbox administrativo.');
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (userProfile?.role === 'ADMIN' && accessToken) {
      void loadOrganizations();
    } else if (!profileLoading) {
      setLoading(false);
    }
  }, [userProfile?.role, accessToken, profileLoading, loadOrganizations]);

  const pendingOrganizationsCount = organizations.length;
  const summaryItems = useMemo(
    () => [
      {
        label: 'Pendientes de revisar',
        value: pendingOrganizationsCount,
        icon: <PendingActions fontSize="small" />,
      },
      {
        label: 'Inbox administrativo',
        value: pendingOrganizationsCount,
        icon: <MarkEmailUnreadOutlined fontSize="small" />,
      },
      {
        label: 'Usuarios',
        value: metrics?.users ?? 0,
        icon: <VerifiedUserOutlined fontSize="small" />,
      },
      {
        label: 'Servicios',
        value: metrics?.services ?? 0,
        icon: <VerifiedUserOutlined fontSize="small" />,
      },
      {
        label: 'Intercambios',
        value: metrics?.exchanges ?? 0,
        icon: <VerifiedUserOutlined fontSize="small" />,
      },
    ],
    [pendingOrganizationsCount, metrics],
  );

  return (
    <Layout>
      <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100%', py: 4 }}>
        <Box sx={{ width: '100%', maxWidth: 1120, mx: 'auto', px: { xs: 2, md: 3 } }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => router.push('/organizations')}
            sx={{ mb: 2, textTransform: 'none' }}
          >
            Volver
          </Button>

          <Box
            sx={{
              mb: 3,
              bgcolor: '#fff',
              borderRadius: 3,
              border: '1px solid rgba(148,163,184,0.18)',
              boxShadow: '0 18px 36px rgba(15,23,42,0.08)',
              p: { xs: 2.5, md: 3 },
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.75 }}>
              Inbox administrativo
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 2.5 }}>
              Centro rápido para revisar entidades pendientes y actuar sin navegar por varias pantallas.
            </Typography>

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.25} useFlexGap flexWrap="wrap">
              {summaryItems.map((item) => (
                <Chip
                  key={item.label}
                  icon={item.icon}
                  label={`${item.label}: ${item.value}`}
                  color={item.value > 0 ? 'warning' : 'default'}
                  sx={{ fontWeight: 700 }}
                />
              ))}
            </Stack>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          {userProfile && userProfile.role !== 'ADMIN' && (
            <Alert severity="warning">Solo un administrador puede acceder a este inbox.</Alert>
          )}

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : userProfile?.role === 'ADMIN' && (
            <Stack spacing={2}>
              {organizations.length === 0 ? (
                <Alert severity="success">No hay elementos pendientes en el inbox administrativo.</Alert>
              ) : (
                organizations.map((organization) => (
                  <Box
                    key={organization.id}
                    sx={{
                      bgcolor: '#fff',
                      borderRadius: 3,
                      border: '1px solid rgba(148,163,184,0.18)',
                      boxShadow: '0 12px 28px rgba(15,23,42,0.06)',
                      p: { xs: 2.5, md: 3 },
                    }}
                  >
                    <Stack spacing={1.5}>
                      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={1.5}>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>
                            {organization.name}
                          </Typography>
                          <Typography color="text.secondary">
                            {organization.description || 'Sin descripción'}
                          </Typography>
                        </Box>
                        <Chip
                          icon={<VerifiedUserOutlined fontSize="small" />}
                          label="Organización pendiente"
                          color="warning"
                          sx={{ fontWeight: 800, alignSelf: 'flex-start' }}
                        />
                      </Stack>

                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} useFlexGap flexWrap="wrap">
                        {organization.topics.map((topic) => (
                          <Chip key={topic} size="small" label={topic} variant="outlined" />
                        ))}
                        <Chip size="small" label={`${organization.rules.length} reglas`} variant="outlined" />
                      </Stack>

                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                        <Button
                          variant="contained"
                          color="success"
                          onClick={() => router.push('/admin/organizations')}
                          sx={{ textTransform: 'none', fontWeight: 700 }}
                        >
                          Revisar en panel
                        </Button>
                        <Button
                          variant="outlined"
                          onClick={() => router.push(`/communities/${organization.id}`)}
                          sx={{ textTransform: 'none', fontWeight: 700 }}
                        >
                          Ver detalle
                        </Button>
                      </Stack>
                    </Stack>
                  </Box>
                ))
              )}
            </Stack>
          )}
        </Box>
      </Box>
    </Layout>
  );
}
