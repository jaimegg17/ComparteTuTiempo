import React from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
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
        minHeight: '500px',
        display: 'flex',
        overflow: 'hidden',
        borderRadius: 3,
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '1400px',
        mx: 'auto',
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
        <Box sx={{ position: 'relative', zIndex: 2, textAlign: 'left', color: 'white', p: 6 }}>
          <Typography
            variant="h3"
            sx={{
              color: 'white',
              fontWeight: 700,
              fontSize: { xs: '2rem', md: '2.5rem' },
              mb: 3,
              textShadow: '0 2px 4px rgba(255, 255, 255, 0.3)',
            }}
          >
            {t('promo.title', 'Comparte para conseguir')}
          </Typography>
          
          <Typography
            variant="h6"
            sx={{
              fontWeight: 400,
              fontSize: { xs: '1rem', md: '1.2rem' },
              opacity: 0.9,
              textShadow: '0 1px 2px rgba(0,0,0,0.5)',
              mb: 4,
              maxWidth: '500px',
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
              fontSize: '1.1rem',
              fontWeight: 600,
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
        }}
      />
    </Box>
  );
};
