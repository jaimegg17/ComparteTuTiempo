import React from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';

export const HeroSection: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();

  const handleGetStarted = () => {
    router.push('/services');
  };

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: '500px',
        backgroundImage: 'url(/images/hero-background.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        display: 'flex',
        alignItems: 'flex-end',
        overflow: 'hidden',
      }}
    >
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 4,
            py: 0,
            pb: 2,
          }}
        >
          {/* Contenido de texto */}
          <Box
            sx={{
              flex: 1,
              textAlign: { xs: 'center', md: 'left' },
              color: 'white',
            }}
          >
            <Typography
              variant="h2"
              sx={{
                color: 'white',
                fontWeight: 700,
                fontSize: { xs: '2.5rem', md: '3.5rem', lg: '4rem' },
                lineHeight: 1.2,
                mb: 2,
                textShadow: '0 2px 4px rgba(255, 255, 255, 0.3)',
                fontFamily: '"ADLaM Display", "Roboto", "Helvetica", "Arial", sans-serif',
              }}
            >
              {t('hero.title', 'Comparte tu tiempo')}
            </Typography>
            
            <Typography
              variant="h5"
              sx={{
                fontWeight: 400,
                fontSize: { xs: '1.2rem', md: '1.5rem' },
                opacity: 0.9,
                mb: 4,
                textShadow: '0 1px 2px rgba(255, 255, 255, 0.3)',
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
              alignItems: 'flex-start',
              pt: { xs: 0, md: 0 },
            }}
          >
            <Button
              variant="contained"
              size="large"
              onClick={handleGetStarted}
              sx={{
                backgroundColor: 'white',
                color: 'primary.main',
                fontSize: '1.1rem',
                fontWeight: 600,
                marginBottom: 6,
                px: 4,
                py: 2,
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                '&:hover': {
                  backgroundColor: '#f5f5f5',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 25px rgba(0,0,0,0.2)',
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
