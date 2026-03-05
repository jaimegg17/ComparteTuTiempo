import { Card, CardContent, CardMedia, Button, Typography, Box, Chip, Rating } from '@mui/material';
import { useRouter } from 'next/router';
import { useTranslation } from '@/hooks/useTranslation';
import { useState } from 'react';

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

  // Mapping function for category display
  const getCategoryDisplayName = (category: string) => {
    const categoryMap: Record<string, string> = {
      'EDUCACION': t('services.categories.education'),
      'HOGAR': t('services.categories.home'),
      'TECNOLOGIA': t('services.categories.technology'),
      'SALUD': t('services.categories.health'),
      'DEPORTES': t('services.categories.sports'),
      'ARTE': t('services.categories.art'),
      'OTROS': t('services.categories.others'),
    };
    return categoryMap[category] || category;
  };

  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column', 
        boxShadow: 2,
        borderRadius: 2,
        overflow: 'hidden',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        }
      }}
    >
      {/* Image section with status badge */}
      <Box sx={{ position: 'relative', width: '100%', height: 180, bgcolor: 'grey.200' }}>
        {service.imageUrl && !imageError ? (
          <CardMedia
            component="img"
            height="180"
            image={service.imageUrl}
            alt={service.title}
            sx={{ objectFit: 'cover' }}
            onError={() => setImageError(true)}
          />
        ) : (
          <Box 
            sx={{ 
              width: '100%', 
              height: '100%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              bgcolor: 'grey.100',
              color: 'grey.400',
              fontSize: '48px'
            }}
          >
            📦
          </Box>
        )}
        
        {/* Status badge */}
        {service.status === 'ACTIVO' && (
          <Box
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              bgcolor: 'success.main',
              color: 'white',
              px: 1.5,
              py: 0.5,
              borderRadius: 1,
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase'
            }}
          >
            {t("services.status.active")}
          </Box>
        )}
      </Box>

      <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 1.5, gap: 1 }}>
          <Chip 
            label={getCategoryDisplayName(service.category)} 
            size="small" 
            sx={{ 
              fontSize: '11px', 
              height: '22px', 
              fontWeight: 500,
              bgcolor: '#F4BF61',
              color: '#000',
              '&:hover': {
                bgcolor: '#E5B050'
              }
            }} 
          />
        </Box>
        
        <Typography variant="h6" component="h3" sx={{ mb: 1, fontWeight: 600, lineHeight: 1.3, fontSize: '16px' }}>
          {service.title}
        </Typography>
        
        {/* Rating section */}
        {service.averageRating !== undefined && service.averageRating > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Rating 
              value={service.averageRating} 
              precision={0.1} 
              size="small" 
              readOnly 
              sx={{ fontSize: '16px' }}
            />
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '12px' }}>
              {service.averageRating.toFixed(1)} ({service.totalRatings || 0})
            </Typography>
          </Box>
        )}
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40, fontSize: '13px', lineHeight: 1.5 }}>
          {service.description.length > 80
            ? `${service.description.substring(0, 80)}...` 
            : service.description
          }
        </Typography>

        {/* Location, Duration (left) and Button (right) in same row */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto', pt: 1 }}>
          <Box>
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
                {t("common.duration")}:
              </Typography>
              <Typography variant="body1" color="primary" sx={{ fontWeight: 700, fontSize: '16px' }}>
                {service.duration}h
              </Typography>
            </Box>
          </Box>

          <Button 
            size="small" 
            variant="contained"
            onClick={() => router.push(`/services/${service.id}`)}
            sx={{ 
              textTransform: 'none', 
              borderRadius: 1.5,
              px: 2.5,
              py: 0.75,
              fontWeight: 600,
              fontSize: '13px'
            }}
          >
            {t("services.card.view_details")}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
