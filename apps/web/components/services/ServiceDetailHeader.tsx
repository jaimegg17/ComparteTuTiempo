import { Box, Typography, Chip, Stack } from '@mui/material';
import { Star } from '@mui/icons-material';

interface ServiceDetailHeaderProps {
  category: string;
  title: string;
  averageRating?: number;
  totalRatings?: number;
}

export function ServiceDetailHeader({
  category,
  title,
  averageRating = 0,
  totalRatings = 0,
}: ServiceDetailHeaderProps) {
  return (
    <>
      {/* Categoría con chip colorido */}
      <Box sx={{ display: 'inline-block', mb: 1.5 }}>
        <Chip 
          label={category}
          size="small"
          sx={{ 
            bgcolor: '#8A33FD',
            color: 'white',
            fontWeight: 600,
            fontSize: '11px',
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            height: '24px',
            '& .MuiChip-label': {
              px: 1.5
            }
          }}
        />
      </Box>

      {/* Título */}
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: 'grey.900' }}>
        {title}
      </Typography>

      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2.5 }}>
        <Chip
          icon={<Star sx={{ color: '#f5b301 !important' }} />}
          label={`${averageRating.toFixed(1)} / 5`}
          variant="outlined"
          sx={{ fontWeight: 600 }}
        />
        <Typography variant="body2" color="text.secondary">
          ({totalRatings} valoraciones)
        </Typography>
      </Stack>
    </>
  );
}
