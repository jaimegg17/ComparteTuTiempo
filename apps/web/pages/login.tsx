import { useMemo } from 'react';
import { useRouter } from 'next/router';
import { Box, Button, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import { LoginOutlined, ShieldOutlined, VolunteerActivismOutlined } from '@mui/icons-material';
import { Layout } from '@/components/Layout';
import { useTranslation } from '@/hooks/useTranslation';

export default function LoginPage() {
  const router = useRouter();
  const { isEnglish } = useTranslation();

  const returnTo = useMemo(() => {
    const raw = router.query.returnTo;
    return typeof raw === 'string' && raw.startsWith('/') ? raw : '/profile';
  }, [router.query.returnTo]);

  const authHref = `/api/auth/login?returnTo=${encodeURIComponent(returnTo)}`;

  return (
    <Layout>
      <Box
        sx={{
          minHeight: 'calc(100vh - 80px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: 2,
          py: { xs: 5, md: 8 },
          backgroundImage:
            'linear-gradient(135deg, rgba(17,24,39,0.80), rgba(109,40,217,0.72)), url(https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1800&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <Card sx={{ width: '100%', maxWidth: 520, borderRadius: 4, boxShadow: '0 28px 80px rgba(15,23,42,0.32)' }}>
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <Chip
              icon={<VolunteerActivismOutlined fontSize="small" />}
              label={isEnglish() ? 'Time bank platform' : 'Banco de tiempo'}
              sx={{ mb: 2, bgcolor: 'rgba(138,51,253,0.10)', color: '#7A2EF6', fontWeight: 800 }}
            />

            <Typography variant="h3" sx={{ fontWeight: 950, mb: 1, fontSize: { xs: '2rem', md: '2.55rem' } }}>
              {isEnglish() ? 'Welcome back' : 'Te damos la bienvenida'}
            </Typography>
            <Typography color="text.secondary" sx={{ lineHeight: 1.8, mb: 3 }}>
              {isEnglish()
                ? 'Sign in or create your account to publish services, request help, join communities and manage your time exchanges.'
                : 'Inicia sesión o crea tu cuenta para publicar servicios, pedir ayuda, unirte a comunidades y gestionar tus intercambios de tiempo.'}
            </Typography>

            <Stack spacing={1.5}>
              <Button
                component="a"
                href={authHref}
                variant="contained"
                size="large"
                startIcon={<LoginOutlined />}
                sx={{ py: 1.35, borderRadius: 2.5, textTransform: 'none', fontWeight: 850, bgcolor: '#8A33FD', '&:hover': { bgcolor: '#7028E0' } }}
              >
                {isEnglish() ? 'Continue with Auth0' : 'Continuar con Auth0'}
              </Button>

              <Stack direction="row" spacing={1} alignItems="center" sx={{ color: 'text.secondary' }}>
                <ShieldOutlined fontSize="small" />
                <Typography variant="body2">
                  {isEnglish()
                    ? 'Authentication is handled securely through Auth0.'
                    : 'La autenticación se gestiona de forma segura con Auth0.'}
                </Typography>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Layout>
  );
}
