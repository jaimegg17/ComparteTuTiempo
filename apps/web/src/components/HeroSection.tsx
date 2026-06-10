import React from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';
import { useUser } from '@auth0/nextjs-auth0/client';

export const HeroSection: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useUser();

  const handleGetStarted = () => {
    router.push(user ? '/services' : '/api/auth/login');
  };

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: { xs: '460px', sm: '500px', md: '560px' },
        backgroundImage: 'url(/images/hero-background.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        display: 'flex',
        alignItems: 'stretch',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(90deg, rgba(15,23,42,0.72) 0%, rgba(15,23,42,0.42) 45%, rgba(15,23,42,0.20) 100%)',
          zIndex: 1,
        },
      }}
    >
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', px: { xs: 2, md: 3 } }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: { xs: 'center', md: 'flex-start' },
            justifyContent: 'space-between',
            flexDirection: { xs: 'column', md: 'row' },
            gap: { xs: 3, md: 4 },
            py: { xs: 5, sm: 6, md: 8 },
            width: '100%',
          }}
        >
          {/* Contenido de texto */}
          <Box
            sx={{
              flex: 1,
              textAlign: { xs: 'center', md: 'left' },
              color: 'white',
              maxWidth: { xs: '100%', md: 760 },
            }}
          >
            <Typography
              sx={{
                display: 'inline-flex',
                mb: 2,
                px: 1.5,
                py: 0.75,
                borderRadius: 999,
                bgcolor: 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(255,255,255,0.18)',
                color: 'rgba(255,255,255,0.92)',
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: '0.02em',
              }}
            >
              Intercambia tiempo, conocimiento y apoyo real
            </Typography>
            <Typography
              variant="h2"
              sx={{
                color: 'white',
                fontWeight: 800,
                fontSize: { xs: '2rem', sm: '2.6rem', md: '3.6rem', lg: '4.3rem' },
                lineHeight: 1.08,
                mb: 2,
                textShadow: '0 10px 30px rgba(15,23,42,0.28)',
                fontFamily: '"ADLaM Display", "Roboto", "Helvetica", "Arial", sans-serif',
              }}
            >
              {t('hero.title', 'Comparte tu tiempo')}
            </Typography>
            
            <Typography
              variant="h5"
              sx={{
                fontWeight: 400,
                fontSize: { xs: '0.98rem', sm: '1.08rem', md: '1.28rem' },
                opacity: 0.96,
                mb: { xs: 3, md: 4.5 },
                maxWidth: { xs: '100%', md: 620 },
                textShadow: '0 4px 18px rgba(15,23,42,0.24)',
                lineHeight: 1.7,
              }}
            >
              {t('hero.subtitle', 'Conecta, comparte y aprende')}
            </Typography>
          </Box>

          {/* Botón */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: { xs: 'center', md: 'flex-end' },
              flex: { xs: 'none', md: '0 0 auto' },
              alignItems: { xs: 'center', md: 'flex-end' },
              alignSelf: { xs: 'center', md: 'stretch' },
              pt: { xs: 0, md: 5.5 },
            }}
          >
            <Button
              variant="contained"
              size="large"
              onClick={handleGetStarted}
              sx={{
                backgroundColor: 'white',
                color: 'primary.main',
                fontSize: { xs: '1rem', md: '1.1rem' },
                fontWeight: 700,
                px: { xs: 3.5, md: 4.5 },
                py: { xs: 1.35, md: 1.75 },
                borderRadius: 3,
                boxShadow: '0 12px 28px rgba(15,23,42,0.22)',
                '&:hover': {
                  backgroundColor: '#f5f5f5',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 16px 32px rgba(15,23,42,0.26)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              {t('hero.button', 'Empieza ya')}
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};
