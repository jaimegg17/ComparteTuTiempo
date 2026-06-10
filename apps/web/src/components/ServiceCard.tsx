import { Card, CardContent, CardMedia, Typography, Box, Chip, Rating, CardActionArea, IconButton, Tooltip } from '@mui/material';
import { useRouter } from 'next/router';
import { useTranslation } from '@/hooks/useTranslation';
import { useState } from 'react';
import { ArrowOutwardRounded, FavoriteBorderRounded, FavoriteRounded } from '@mui/icons-material';
import { useUser } from '@auth0/nextjs-auth0/client';
import { useFavoriteServices } from '@/hooks/useFavoriteServices';

interface ServiceCardProps {
  service: {
    id: number;
    title: string;
    description: string;
    price: number;
    duration: number;
    location: string;
    category: string;
    type: string;
    intent?: 'OFFER' | 'REQUEST';
    status?: string;
    imageUrl?: string;
    averageRating?: number;
    totalRatings?: number;
    formattedAddress?: string | null;
    distanceKm?: number | null;
  };
}

export function ServiceCard({ service }: ServiceCardProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const [imageError, setImageError] = useState(false);
  const { user } = useUser();
  const { isFavorite, toggleFavorite } = useFavoriteServices(user?.sub);
  const favorite = isFavorite(service.id);
  const isRequest = service.intent === 'REQUEST';

  const getCategoryDisplayName = (category: string) => {
    const categoryMap: Record<string, string> = {
      EDUCACION: t('services.categories.education'),
      HOGAR: t('services.categories.home'),
      TECNOLOGIA: t('services.categories.technology'),
      SALUD: t('services.categories.health'),
      DEPORTES: t('services.categories.sports'),
      ARTE: t('services.categories.art'),
      OTROS: t('services.categories.others'),
    };
    return categoryMap[category] || category;
  };

  return (
    <Card
      sx={{
        height: '100%',
        width: '100%',
        maxWidth: 380,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
        borderRadius: 3,
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'rgba(148, 163, 184, 0.22)',
        position: 'relative',
        transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
        '&::after': {
          content: '""',
          position: 'absolute',
          inset: 0,
          borderRadius: 'inherit',
          border: '1px solid rgba(138, 51, 253, 0)',
          transition: 'border-color 0.25s ease, box-shadow 0.25s ease',
          pointerEvents: 'none',
        },
        '&:hover': {
          transform: 'translateY(-6px)',
          boxShadow: '0 24px 48px rgba(15, 23, 42, 0.16)',
          borderColor: 'rgba(138, 51, 253, 0.34)',
        },
        '&:hover::after': {
          borderColor: 'rgba(138, 51, 253, 0.18)',
          boxShadow: '0 0 0 4px rgba(138, 51, 253, 0.06)',
        },
      }}
    >
      <CardActionArea
        onClick={() => router.push(`/services/${service.id}`)}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          '&:hover .service-card-media': {
            transform: 'scale(1.035)',
          },
          '&:hover .service-card-cta': {
            transform: 'translateX(3px)',
          },
        }}
      >
        <Box sx={{ position: 'relative', width: '100%', height: 180, bgcolor: 'grey.200' }}>
          {service.imageUrl && !imageError ? (
            <CardMedia
              component="img"
              height="180"
              image={service.imageUrl}
              alt={service.title}
              className="service-card-media"
              sx={{ objectFit: 'cover', transition: 'transform 0.35s ease' }}
              onError={() => setImageError(true)}
            />
          ) : (
            <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.100', color: 'grey.400', fontSize: '48px' }}>
              {isRequest ? '🙋' : '📦'}
            </Box>
          )}

          <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(15,23,42,0) 0%, rgba(15,23,42,0.08) 100%)', pointerEvents: 'none' }} />

          <Box sx={{ position: 'absolute', top: 8, left: 8, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {service.status === 'ACTIVO' && (
              <Box sx={{ bgcolor: 'success.main', color: 'white', px: 1.5, py: 0.5, borderRadius: 1, fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>
                {t('services.status.active')}
              </Box>
            )}
            <Box sx={{ bgcolor: isRequest ? '#0f766e' : '#8A33FD', color: 'white', px: 1.5, py: 0.5, borderRadius: 1, fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>
              {isRequest ? 'Solicitud' : 'Servicio'}
            </Box>
          </Box>

          <Tooltip title={favorite ? 'Quitar de favoritos' : 'Guardar en favoritos'}>
            <IconButton
              aria-label={favorite ? 'Quitar de favoritos' : 'Guardar en favoritos'}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                toggleFavorite(service.id);
              }}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                bgcolor: 'rgba(255,255,255,0.92)',
                '&:hover': { bgcolor: '#fff' },
              }}
            >
              {favorite ? <FavoriteRounded sx={{ color: '#e11d48' }} /> : <FavoriteBorderRounded />}
            </IconButton>
          </Tooltip>
        </Box>

        <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 1.5, gap: 1, flexWrap: 'wrap' }}>
            <Chip label={getCategoryDisplayName(service.category)} size="small" sx={{ fontSize: '11px', height: '22px', fontWeight: 500, bgcolor: '#F4BF61', color: '#000', '&:hover': { bgcolor: '#E5B050' } }} />
            {favorite && <Chip label="Favorito" size="small" variant="outlined" color="error" sx={{ fontSize: '11px', height: '22px', fontWeight: 700 }} />}
          </Box>

          <Typography variant="h6" component="h3" sx={{ mb: 1, fontWeight: 600, lineHeight: 1.3, fontSize: '16px' }}>
            {service.title}
          </Typography>

          {service.averageRating !== undefined && service.averageRating > 0 && !isRequest && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Rating value={service.averageRating} precision={0.1} size="small" readOnly sx={{ fontSize: '16px' }} />
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '12px' }}>
                {service.averageRating.toFixed(1)} ({service.totalRatings || 0})
              </Typography>
            </Box>
          )}

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40, fontSize: '13px', lineHeight: 1.5 }}>
            {service.description.length > 80 ? `${service.description.substring(0, 80)}...` : service.description}
          </Typography>

          <Box sx={{ mt: 'auto', pt: 1 }}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '12px', mb: 0.5 }}>
                📍 {service.formattedAddress || service.location || 'N/A'}
              </Typography>
              {typeof service.distanceKm === 'number' && (
                <Typography variant="body2" color="primary" sx={{ fontSize: '12px', mb: 0.5, fontWeight: 600 }}>
                  A {service.distanceKm.toFixed(1)} km
                </Typography>
              )}

              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '12px' }}>
                  {t('common.duration')}:
                </Typography>
                <Typography variant="body1" color="primary" sx={{ fontWeight: 700, fontSize: '16px' }}>
                  {service.duration}h
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 1.25, borderTop: '1px solid', borderColor: 'rgba(148, 163, 184, 0.18)' }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                {service.price.toFixed(0)} créditos
              </Typography>

              <Box className="service-card-cta" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, color: '#8A33FD', fontWeight: 700, fontSize: '13px', letterSpacing: '0.01em', transition: 'transform 0.25s ease' }}>
                <span>{isRequest ? 'Ver solicitud' : t('services.card.view_details')}</span>
                <ArrowOutwardRounded sx={{ fontSize: 16 }} />
              </Box>
            </Box>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
