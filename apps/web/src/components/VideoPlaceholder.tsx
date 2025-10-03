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

  const handlePlayVideo = () => {
    // TODO: Implementar reproducción de video
    console.log('Reproducir video explicativo');
  };

  return (
    <Box sx={{ py: 8 }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              fontSize: { xs: '2rem', md: '2.5rem' },
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
              maxWidth: '600px',
              mx: 'auto',
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
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            backgroundImage: 'url(/images/video-thumbnail.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            minHeight: '400px',
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
              onClick={handlePlayVideo}
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                color: 'primary.main',
                fontSize: '1.2rem',
                fontWeight: 600,
                px: 6,
                py: 3,
                borderRadius: '50%',
                width: '120px',
                height: '120px',
                minWidth: '120px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                '&:hover': {
                  backgroundColor: 'white',
                  transform: 'scale(1.05)',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              <PlayIcon sx={{ fontSize: '3rem', ml: 0.5 }} />
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
              {t('video.playButton', 'Ver video explicativo')}
            </Typography>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};
