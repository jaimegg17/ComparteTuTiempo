import { Chip, Stack, Typography } from '@mui/material';
import { Star } from '@mui/icons-material';

interface ServiceDetailHeaderProps {
  category: string;
  title: string;
  averageRating?: number;
  totalRatings?: number;
  providerName?: string;
  location?: string;
  status?: string;
  type?: string;
}

const statusLabel = (status?: string) => {
  if (!status) return '';
  return status === 'ACTIVO' ? 'Disponible' : status.replaceAll('_', ' ');
};

export function ServiceDetailHeader({
  category,
  title,
  averageRating = 0,
  totalRatings = 0,
  providerName,
  location,
  status,
  type,
}: ServiceDetailHeaderProps) {
  return (
    <>
      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mb: 1.5 }}>
        <Chip
          label={category}
          size="small"
          sx={{
            bgcolor: '#8A33FD',
            color: 'white',
            fontWeight: 700,
            fontSize: '0.72rem',
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}
        />
        {type && <Chip label={type} size="small" variant="outlined" sx={{ fontWeight: 600 }} />}
        {status && (
          <Chip
            label={statusLabel(status)}
            size="small"
            color={status === 'ACTIVO' ? 'success' : 'default'}
            variant={status === 'ACTIVO' ? 'filled' : 'outlined'}
            sx={{ fontWeight: 700 }}
          />
        )}
      </Stack>

      <Typography variant="h3" sx={{ fontWeight: 800, mb: 1.25, color: 'grey.900', fontSize: { xs: '2rem', md: '2.5rem' }, lineHeight: 1.1 }}>
        {title}
      </Typography>

      <Typography color="text.secondary" sx={{ mb: 2.25, lineHeight: 1.7 }}>
        Ofrecido por <strong>{providerName || 'la comunidad'}</strong>
        {location ? ` · ${location}` : ''}
      </Typography>

      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2.5 }}>
        <Chip icon={<Star sx={{ color: '#f5b301 !important' }} />} label={`${averageRating.toFixed(1)} / 5`} variant="outlined" sx={{ fontWeight: 700 }} />
        <Typography variant="body2" color="text.secondary">
          {totalRatings === 0 ? 'Aún no hay valoraciones' : `${totalRatings} valoraciones`}
        </Typography>
      </Stack>
    </>
  );
}
