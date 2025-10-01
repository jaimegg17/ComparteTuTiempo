import { Card, CardContent, CardActions, CardMedia, Button, Typography, Box, Chip } from '@mui/material';
import { useRouter } from 'next/router';

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
  };
}

export function ServiceCard({ service }: ServiceCardProps) {
  const router = useRouter();

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
        {service.imageUrl ? (
          <CardMedia
            component="img"
            height="180"
            image={service.imageUrl}
            alt={service.title}
            sx={{ objectFit: 'cover' }}
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
            Disponible
          </Box>
        )}
      </Box>

      <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5, gap: 1 }}>
          <Chip 
            label={service.category} 
            size="small" 
            color="primary" 
            sx={{ fontSize: '11px', height: '22px', fontWeight: 500 }} 
          />
          <Chip 
            label={service.type} 
            size="small" 
            variant="outlined" 
            sx={{ fontSize: '11px', height: '22px' }} 
          />
        </Box>
        
        <Typography variant="h6" component="h3" sx={{ mb: 1, fontWeight: 600, lineHeight: 1.3, fontSize: '16px' }}>
          {service.title}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40, fontSize: '13px', lineHeight: 1.5 }}>
          {service.description.length > 80
            ? `${service.description.substring(0, 80)}...` 
            : service.description
          }
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto', pt: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '12px' }}>
            📍 {service.location || 'N/A'}
          </Typography>
          
          {/* Duration as "price" */}
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
            <Typography variant="h6" color="primary" sx={{ fontWeight: 700, fontSize: '20px' }}>
              {service.duration}
            </Typography>
            <Typography variant="body2" color="primary" sx={{ fontWeight: 600, fontSize: '13px' }}>
              horas
            </Typography>
          </Box>
        </Box>
      </CardContent>

      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button 
          size="medium" 
          fullWidth 
          variant="contained"
          onClick={() => router.push(`/services/${service.id}`)}
          sx={{ 
            textTransform: 'none', 
            borderRadius: 2,
            py: 1,
            fontWeight: 600,
            fontSize: '14px'
          }}
        >
          Solicitar Servicio
        </Button>
      </CardActions>
    </Card>
  );
}
