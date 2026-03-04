import { Box, Typography, Alert, Rating as MuiRating } from '@mui/material';
import type { Service } from '@/types/service.types';
import { RatingsList } from '@/components/ratings';

interface ServiceRatingsTabProps {
  service: Service;
}

export function ServiceRatingsTab({ service }: ServiceRatingsTabProps) {
  if (!service.totalRatings || service.totalRatings === 0) {
    return (
      <Alert severity="info" sx={{ fontSize: '12px' }}>
        Este servicio aún no tiene valoraciones
      </Alert>
    );
  }

  return (
    <Box>
      {/* Rating summary */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 2, alignItems: 'center' }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h3" sx={{ fontWeight: 700, color: 'primary.main' }}>
            {service.averageRating || 0}
          </Typography>
          <MuiRating value={service.averageRating || 0} readOnly precision={0.1} size="small" />
          <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: '10px' }}>
            {service.totalRatings} {service.totalRatings === 1 ? 'valoración' : 'valoraciones'}
          </Typography>
        </Box>
      </Box>

      <RatingsList serviceId={service.id} serviceTitle={service.title} />
    </Box>
  );
}
