import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { Alert, Box, Button, Chip, CircularProgress, Stack, Typography } from '@mui/material';
import {
  ArrowBack,
  CheckCircleOutline,
  PendingActionsOutlined,
  RuleFolderOutlined,
  VisibilityOutlined,
} from '@mui/icons-material';
import { Layout } from '@/components/Layout';
import { communitiesApi } from '@/shared/api/communities';
import { adminApi, type AdminMetrics } from '@/shared/api/admin';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { apiClient } from '@/shared/api/client';
import type { Community } from '@comparte-tu-tiempo/contracts';

export default function AdminOrganizationsPage() {
  const router = useRouter();
  const { user, accessToken, isLoading: authLoading } = useAuth();
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
      setError(loadError instanceof Error ? loadError.message : 'No se pudieron cargar las organizaciones pendientes.');
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

  const handleDecision = async (communityId: number, decision: 'approve' | 'reject') => {
    try {
      if (accessToken) {
        apiClient.setToken(accessToken);
      }

      if (decision === 'approve') {
        await communitiesApi.approveOrganization(communityId);
      } else {
        await communitiesApi.rejectOrganization(communityId);
      }

      await loadOrganizations();
    } catch (decisionError) {
      setError(decisionError instanceof Error ? decisionError.message : 'No se pudo actualizar la solicitud.');
    }
  };

  const totalRules = useMemo(
    () => organizations.reduce((sum, organization) => sum + organization.rules.length, 0),
    [organizations],
  );

  return (
    <Layout>
      <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100%', py: 4 }}>
        <Box sx={{ width: '100%', maxWidth: 1160, mx: 'auto', px: { xs: 2, md: 3 } }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => router.push('/organizations')}
            sx={{ mb: 2, textTransform: 'none' }}
          >
            Volver a organizaciones
          </Button>

          {(authLoading || profileLoading) ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : !user ? (
            <Alert
              severity="warning"
              action={
                <Button color="inherit" size="small" onClick={() => router.push('/api/auth/login?returnTo=/admin/organizations')}>
                  Iniciar sesión
                </Button>
              }
              sx={{ mb: 2 }}
            >
              Necesitas iniciar sesión con una cuenta administradora para acceder a esta pantalla.
            </Alert>
          ) : userProfile?.role !== 'ADMIN' ? (
            <Alert severity="warning" sx={{ mb: 2 }}>Solo un administrador puede acceder a esta pantalla.</Alert>
          ) : (
            <>
          <Box
            sx={{
              mb: 3,
              borderRadius: 4,
              overflow: 'hidden',
              border: '1px solid rgba(148,163,184,0.14)',
              boxShadow: '0 20px 48px rgba(15,23,42,0.10)',
              background:
                'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(254,249,195,0.60) 45%, rgba(255,255,255,0.98) 100%)',
            }}
          >
            <Stack direction={{ xs: 'column', lg: 'row' }} spacing={0}>
              <Box sx={{ flex: 1, p: { xs: 2.5, md: 4 } }}>
                <Chip
                  icon={<PendingActionsOutlined fontSize="small" />}
                  label="Revisión administrativa"
                  size="small"
                  sx={{ mb: 1.5, fontWeight: 800, bgcolor: 'rgba(245,158,11,0.14)', color: '#b45309' }}
                />
                <Typography variant="h3" sx={{ fontWeight: 900, mb: 1.25, fontSize: { xs: '2rem', md: '2.5rem' } }}>
                  Panel de revisión de organizaciones
                </Typography>
                <Typography color="text.secondary" sx={{ lineHeight: 1.8, maxWidth: 760, mb: 2.5 }}>
                  Desde aquí puedes validar solicitudes institucionales, revisar su contexto y decidir qué organizaciones
                  pasan a formar parte del catálogo público de la plataforma.
                </Typography>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25} useFlexGap flexWrap="wrap">
                  <Chip icon={<PendingActionsOutlined fontSize="small" />} label={`Pendientes: ${organizations.length}`} sx={{ fontWeight: 700 }} />
                  <Chip icon={<RuleFolderOutlined fontSize="small" />} label={`Reglas declaradas: ${totalRules}`} sx={{ fontWeight: 700 }} />
                  <Chip icon={<CheckCircleOutline fontSize="small" />} label={`Organizaciones aprobadas: ${metrics?.organizations ?? 0}`} sx={{ fontWeight: 700 }} />
                  <Chip icon={<VisibilityOutlined fontSize="small" />} label={`Eventos: ${metrics?.events ?? 0}`} sx={{ fontWeight: 700 }} />
                </Stack>
              </Box>

              <Box
                sx={{
                  width: { xs: '100%', lg: 320 },
                  borderLeft: { lg: '1px solid rgba(148,163,184,0.14)' },
                  borderTop: { xs: '1px solid rgba(148,163,184,0.14)', lg: 'none' },
                  bgcolor: 'rgba(255,255,255,0.68)',
                  p: { xs: 2.5, md: 3 },
                }}
              >
                <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 800, letterSpacing: '0.08em' }}>
                  Criterios sugeridos
                </Typography>
                <Stack spacing={1.5} sx={{ mt: 1.5 }}>
                  {[
                    'Claridad en la misión o el propósito institucional.',
                    'Temas coherentes con la actividad que se quiere representar.',
                    'Normas internas suficientes para operar con seguridad.',
                  ].map((item) => (
                    <Box
                      key={item}
                      sx={{
                        borderRadius: 2.5,
                        px: 1.75,
                        py: 1.5,
                        bgcolor: 'rgba(255,255,255,0.82)',
                        border: '1px solid rgba(148,163,184,0.14)',
                      }}
                    >
                      <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
                        {item}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>
            </Stack>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Stack spacing={2.25}>
              {organizations.length === 0 ? (
                <Box
                  sx={{
                    bgcolor: '#fff',
                    borderRadius: 3,
                    border: '1px solid rgba(148,163,184,0.16)',
                    boxShadow: '0 12px 28px rgba(15,23,42,0.06)',
                    p: { xs: 2.5, md: 3 },
                    textAlign: 'center',
                  }}
                >
                  <CheckCircleOutline sx={{ fontSize: 34, color: '#0f766e', mb: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
                    No hay organizaciones pendientes
                  </Typography>
                  <Typography color="text.secondary">
                    Todo el buzón de revisión está al día en este momento.
                  </Typography>
                </Box>
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
                    <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2.5} justifyContent="space-between">
                      <Box sx={{ flex: 1 }}>
                        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mb: 1.25 }}>
                          <Chip label="Pendiente" size="small" sx={{ fontWeight: 800, bgcolor: 'rgba(245,158,11,0.14)', color: '#b45309' }} />
                          {organization.topics.slice(0, 4).map((topic) => (
                            <Chip key={topic} label={topic} size="small" sx={{ fontWeight: 700, bgcolor: 'rgba(138,51,253,0.10)', color: '#7A2EF6' }} />
                          ))}
                        </Stack>

                        <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.75 }}>
                          {organization.name}
                        </Typography>
                        <Typography color="text.secondary" sx={{ mb: 1.5, lineHeight: 1.7 }}>
                          {organization.description || 'Sin descripción'}
                        </Typography>

                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25} useFlexGap flexWrap="wrap">
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {organization.topics.length} temas definidos
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {organization.rules.length} reglas declaradas
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {new Date(organization.createdAt).toLocaleDateString('es-ES')}
                          </Typography>
                        </Stack>
                      </Box>

                      <Stack spacing={1.25} sx={{ minWidth: { lg: 220 } }}>
                        <Button
                          variant="contained"
                          color="success"
                          onClick={() => handleDecision(organization.id, 'approve')}
                          sx={{ textTransform: 'none', fontWeight: 800 }}
                        >
                          Aprobar organización
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          onClick={() => handleDecision(organization.id, 'reject')}
                          sx={{ textTransform: 'none', fontWeight: 800 }}
                        >
                          Rechazar solicitud
                        </Button>
                        <Button
                          variant="text"
                          startIcon={<VisibilityOutlined />}
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
            </>
          )}
        </Box>
      </Box>
    </Layout>
  );
}
