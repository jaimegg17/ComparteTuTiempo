import React from 'react';
import {
  Box,
  Typography,
  Button,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';

export const PromoBanner: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();

  const handleCreateService = () => {
    router.push('/services/create');
  };

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: { xs: '420px', md: '500px' },
        display: 'flex',
        overflow: 'hidden',
        borderRadius: { xs: 3, md: 4 },
        boxShadow: '0 18px 40px rgba(15,23,42,0.10)',
        border: '1px solid rgba(148,163,184,0.16)',
        width: '100%',
        maxWidth: '1400px',
        mx: 'auto',
        flexDirection: { xs: 'column', md: 'row' },
      }}
    >
      {/* Lado izquierdo - Imagen de fondo */}
      <Box
        sx={{
          flex: 1,
          backgroundImage: 'url(/images/promo-left-bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 100%)',
            zIndex: 1,
          },
        }}
      >
          <Box sx={{ position: 'relative', zIndex: 2, textAlign: 'left', color: 'white', p: { xs: 2.5, sm: 3.5, md: 6 } }}>
          <Typography
            variant="h3"
            sx={{
              color: 'white',
              fontWeight: 800,
              fontSize: { xs: '1.65rem', sm: '2rem', md: '2.5rem' },
              mb: 3,
              textShadow: '0 10px 30px rgba(15,23,42,0.28)',
            }}
          >
            {t('promo.title', 'Comparte para conseguir')}
          </Typography>
          
          <Typography
            variant="h6"
            sx={{
              fontWeight: 400,
              fontSize: { xs: '0.95rem', sm: '1rem', md: '1.2rem' },
              opacity: 0.95,
              textShadow: '0 1px 2px rgba(0,0,0,0.5)',
              mb: 4,
              maxWidth: { xs: '100%', md: '500px' },
              lineHeight: 1.7,
            }}
          >
            {t('promo.subtitle', 'En esta plataforma podrás encontrar todo lo que necesites. Solo necesitas tiempo.')}
          </Typography>

          <Button
            variant="contained"
            size="large"
            onClick={handleCreateService}
            sx={{
              backgroundColor: 'white',
              color: 'primary.main',
              fontSize: { xs: '1rem', md: '1.1rem' },
              fontWeight: 700,
              px: { xs: 3, md: 4 },
              py: { xs: 1.25, md: 1.75 },
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
            {t('promo.button', 'Busca ahora')}
          </Button>
        </Box>
      </Box>

      {/* Lado derecho - Imagen de personas */}
      <Box
        sx={{
          flex: 1,
          backgroundImage: 'url(/images/promo-right-bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          position: 'relative',
          minHeight: { xs: 220, md: 'auto' },
        }}
      />
    </Box>
  );
};
