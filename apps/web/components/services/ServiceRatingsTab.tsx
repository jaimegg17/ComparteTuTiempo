import { Box, Typography, Alert, Avatar, LinearProgress, List, ListItem, ListItemAvatar, ListItemText, Rating as MuiRating } from '@mui/material';
import type { Service } from '@/types/service.types';

interface ServiceRatingsTabProps {
  service: Service;
}

export function ServiceRatingsTab({ service }: ServiceRatingsTabProps) {
  // Calculate rating distribution
  const ratingDistribution = service?.ratings && service.ratings.length > 0 ? [5, 4, 3, 2, 1].map(stars => ({
    stars,
    count: service.ratings!.filter(r => r.score === stars).length,
    percentage: (service.totalRatings || 0) > 0 
      ? (service.ratings!.filter(r => r.score === stars).length / (service.totalRatings || 1)) * 100 
      : 0
  })) : [];

  if (!service.totalRatings || service.totalRatings === 0) {
    return (
      <Alert severity="info" sx={{ fontSize: '12px' }}>
        Este servicio aún no tiene valoraciones
      </Alert>
    );
  }

  return (
    <Box>
      {/* Rating summary compacto */}
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

        <Box sx={{ flex: 1 }}>
          {ratingDistribution.slice(0, 5).map(({ stars, count, percentage }) => (
            <Box key={stars} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.3 }}>
              <Typography variant="caption" sx={{ width: 15, fontSize: '10px' }}>
                {stars}★
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={percentage} 
                sx={{ flex: 1, height: 4, borderRadius: 1 }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ width: 20, fontSize: '10px' }}>
                {count}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Reviews compactas */}
      <List sx={{ py: 0 }}>
        {service.ratings?.slice(0, 3).map((rating) => (
          <ListItem key={rating.id} alignItems="flex-start" sx={{ px: 0, py: 1 }}>
            <ListItemAvatar>
              <Avatar src={rating.user.imageUrl} alt={rating.user.name} sx={{ width: 32, height: 32 }}>
                {rating.user.name[0].toUpperCase()}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.3 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '13px' }}>
                    {rating.user.name}
                  </Typography>
                  <MuiRating value={rating.score} readOnly size="small" sx={{ fontSize: '14px' }} />
                </Box>
              }
              secondary={
                <>
                  {rating.comment && (
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '12px', mb: 0.3, lineHeight: 1.4 }}>
                      {rating.comment.length > 100 ? `${rating.comment.substring(0, 100)}...` : rating.comment}
                    </Typography>
                  )}
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '10px' }}>
                    {new Date(rating.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                  </Typography>
                </>
              }
            />
          </ListItem>
        ))}
      </List>

      {service.ratings && service.ratings.length > 3 && (
        <Typography variant="caption" color="primary" sx={{ display: 'block', textAlign: 'center', mt: 1, fontWeight: 600, fontSize: '11px' }}>
          Ver todas las valoraciones
        </Typography>
      )}
    </Box>
  );
}

