import { useState } from 'react';
import { Alert, Box, Button, Chip, Stack, Typography } from '@mui/material';
import { ArrowBack, CheckCircleOutline, ShieldOutlined, VerifiedUserOutlined } from '@mui/icons-material';
import { useRouter } from 'next/router';
import { useUser } from '@auth0/nextjs-auth0/client';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/hooks/useAuth';
import { communitiesApi } from '@/shared/api/communities';
import { apiClient } from '@/shared/api/client';
import {
  CommunityForm,
  CommunityFormValues,
  communityFormToPayload,
} from '@/components/communities/forms/CommunityForm';

export default function NewOrganizationPage() {
  const router = useRouter();
  const { user } = useUser();
  const { accessToken } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (values: CommunityFormValues) => {
    if (!user?.sub) {
      setError('Necesitas iniciar sesión para solicitar una organización.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      if (accessToken) {
        apiClient.setToken(accessToken);
      }

      const response = await communitiesApi.createCommunity(
        communityFormToPayload(values, user.sub, 'ORGANIZATION'),
      );
      await router.push(`/communities/${response.community.id}`);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'No se pudo registrar la solicitud de organización.',
      );
    } finally {
      setSubmitting(false);
    }
  };

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

          <Box
            sx={{
              borderRadius: 4,
              overflow: 'hidden',
              border: '1px solid rgba(148,163,184,0.14)',
              boxShadow: '0 20px 48px rgba(15,23,42,0.10)',
              background:
                'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(245,243,255,0.98) 48%, rgba(240,249,255,0.98) 100%)',
            }}
          >
            <Stack direction={{ xs: 'column', lg: 'row' }} spacing={0}>
              <Box sx={{ flex: 1, p: { xs: 2.5, md: 4 } }}>
                <Chip
                  label="Solicitud institucional"
                  size="small"
                  sx={{
                    mb: 1.5,
                    fontWeight: 800,
                    letterSpacing: '0.03em',
                    textTransform: 'uppercase',
                    bgcolor: 'rgba(138,51,253,0.10)',
                    color: '#7A2EF6',
                  }}
                />
                <Typography variant="h3" sx={{ fontWeight: 900, mb: 1.25, fontSize: { xs: '2rem', md: '2.5rem' } }}>
                  Solicita el alta de una organización en la plataforma
                </Typography>
                <Typography color="text.secondary" sx={{ lineHeight: 1.8, maxWidth: 760, mb: 2.5 }}>
                  Esta vía está pensada para asociaciones, ONG, fundaciones y colectivos formales.
                  La solicitud quedará en revisión y solo aparecerá públicamente cuando haya sido validada por administración.
                </Typography>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25} useFlexGap flexWrap="wrap">
                  <Chip icon={<ShieldOutlined fontSize="small" />} label="Revisión administrativa" sx={{ fontWeight: 700 }} />
                  <Chip icon={<VerifiedUserOutlined fontSize="small" />} label="Badge de verificación" sx={{ fontWeight: 700 }} />
                  <Chip icon={<CheckCircleOutline fontSize="small" />} label="Mayor señal de confianza" sx={{ fontWeight: 700 }} />
                </Stack>
              </Box>

              <Box
                sx={{
                  width: { xs: '100%', lg: 360 },
                  borderLeft: { lg: '1px solid rgba(148,163,184,0.14)' },
                  borderTop: { xs: '1px solid rgba(148,163,184,0.14)', lg: 'none' },
                  bgcolor: 'rgba(255,255,255,0.68)',
                  p: { xs: 2.5, md: 3 },
                }}
              >
                <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 800, letterSpacing: '0.08em' }}>
                  Qué conviene incluir
                </Typography>
                <Stack spacing={1.5} sx={{ mt: 1.5 }}>
                  {[
                    'Una descripción clara de la misión o actividad principal.',
                    'Temas o ámbitos en los que trabaja la entidad.',
                    'Reglas o principios de participación bien definidos.',
                    'Si procede, indicar que es privada para controlar el acceso inicial.',
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

          <Box
            sx={{
              mt: 3,
              maxWidth: 860,
              mx: 'auto',
              px: { xs: 2.5, md: 3.5 },
              py: { xs: 2.5, md: 3.5 },
              bgcolor: '#fff',
              borderRadius: 3,
              border: '1px solid rgba(148,163,184,0.16)',
              boxShadow: '0 16px 40px rgba(15,23,42,0.08)',
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.75 }}>
              Datos de la organización
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3, lineHeight: 1.7 }}>
              Completa la información base para que el equipo administrador pueda revisar la solicitud con más contexto.
            </Typography>

            {!user?.sub && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                Debes iniciar sesión para solicitar una organización.
              </Alert>
            )}

            <CommunityForm
              initialValues={{
                name: '',
                description: '',
                topicsText: '',
                rulesText: '',
                isPrivate: false,
              }}
              submitting={submitting}
              submitLabel="Enviar solicitud"
              serverError={error}
              labels={{
                nameLabel: 'Nombre de la organización',
                descriptionLabel: 'Descripción institucional',
                topicsLabel: 'Ámbitos / categorías',
                topicsHelperText: 'Separa los ámbitos con comas. Ej.: inclusión social, salud, educación, voluntariado',
                rulesLabel: 'Normas o principios de participación',
                rulesHelperText: 'Escribe una norma o principio por línea.',
                rulesRequiredMessage: 'Añade al menos una norma o principio de participación.',
                publicLabel: 'Organización pública',
                privateLabel: 'Organización privada',
                publicDescription: 'La organización se mostrará como entidad abierta una vez sea aprobada.',
                privateDescription: 'La organización requerirá aprobación también para el acceso de nuevos miembros.',
              }}
              onCancel={() => router.push('/organizations')}
              onSubmit={handleSubmit}
            />
          </Box>
        </Box>
      </Box>
    </Layout>
  );
}
