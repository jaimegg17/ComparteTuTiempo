import React from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
  Card,
  CardContent,
} from '@mui/material';
import { PlayArrow as PlayIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

export const VideoPlaceholder: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Box sx={{ pt: { xs: 3.5, md: 4.5 }, pb: { xs: 6, md: 8 } }}>
      <Container maxWidth="lg" sx={{ px: { xs: 2, md: 3 } }}>
        <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 6 } }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              fontSize: { xs: '1.7rem', sm: '2rem', md: '2.5rem' },
              mb: 2,
              color: 'text.primary',
            }}
          >
            {t('video.title', '¿Cómo funciona nuestra plataforma?')}
          </Typography>
          
          <Typography
            variant="h6"
            sx={{
              fontWeight: 400,
              fontSize: { xs: '1rem', md: '1.2rem' },
              color: 'text.secondary',
              maxWidth: { xs: '100%', md: '600px' },
              mx: 'auto',
              lineHeight: 1.7,
            }}
          >
            {t('video.subtitle', 'Descubre en este video cómo puedes intercambiar tu tiempo por servicios y experiencias únicas.')}
          </Typography>
        </Box>

        <Card
          sx={{
            position: 'relative',
            borderRadius: 4,
            overflow: 'hidden',
            boxShadow: '0 18px 36px rgba(15,23,42,0.10)',
            border: '1px solid rgba(148,163,184,0.16)',
            backgroundImage: 'url(/images/video-thumbnail.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            minHeight: { xs: '240px', sm: '320px', md: '400px' },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(135deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.6) 100%)',
              zIndex: 1,
            },
          }}
        >
          <CardContent sx={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
            <Button
              variant="contained"
              size="large"
              disabled
              aria-label={t('video.comingSoon', 'Video próximamente')}
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                color: 'primary.main',
                fontSize: '1.2rem',
                fontWeight: 600,
                px: { xs: 0, md: 5 },
                py: { xs: 0, md: 2.5 },
                borderRadius: '50%',
                width: { xs: '84px', md: '112px' },
                height: { xs: '84px', md: '112px' },
                minWidth: { xs: '84px', md: '112px' },
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              <PlayIcon sx={{ fontSize: { xs: '2.2rem', md: '3rem' }, ml: 0.35 }} />
            </Button>
            
            <Typography
              variant="h6"
              sx={{
                color: 'white',
                fontWeight: 600,
                mt: 3,
                textShadow: '0 2px 4px rgba(0,0,0,0.5)',
              }}
            >
              {t('video.comingSoon', 'Video próximamente')}
            </Typography>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};
