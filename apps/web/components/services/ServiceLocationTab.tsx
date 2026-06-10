import { Box, Typography, Alert, Button } from '@mui/material';
import { MapPin } from 'iconoir-react';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';

interface ServiceLocationTabProps {
  location: string;
  latitude?: number | null;
  longitude?: number | null;
  formattedAddress?: string | null;
}

export function ServiceLocationTab({
  location,
  latitude,
  longitude,
  formattedAddress,
}: ServiceLocationTabProps) {
  const displayLocation = formattedAddress || location;
  const hasCoordinates = typeof latitude === 'number' && typeof longitude === 'number';
  const mapQuery = hasCoordinates
    ? `${latitude},${longitude}`
    : encodeURIComponent(displayLocation);
  const embedUrl = `https://www.google.com/maps?q=${mapQuery}&z=15&output=embed`;
  const externalMapUrl = hasCoordinates
    ? `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(displayLocation)}`;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
        <MapPin width={24} height={24} color="#1976d2" />
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '10px', mb: 0.3, display: 'block' }}>
            UBICACIÓN
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {displayLocation}
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          width: '100%',
          height: 240,
          borderRadius: 2,
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'rgba(148, 163, 184, 0.24)',
          bgcolor: 'grey.100',
        }}
      >
        <Box
          component="iframe"
          src={embedUrl}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          sx={{
            width: '100%',
            height: '100%',
            border: 0,
          }}
        />
      </Box>

      <Box sx={{ mt: 1.5, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          component="a"
          href={externalMapUrl}
          target="_blank"
          rel="noopener noreferrer"
          endIcon={<OpenInNewRoundedIcon />}
          size="small"
          sx={{ textTransform: 'none', fontWeight: 600 }}
        >
          Abrir en Google Maps
        </Button>
      </Box>

      <Alert severity="info" sx={{ mt: 2, fontSize: '11px', py: 0.5 }}>
        La ubicación exacta se compartirá tras confirmar el intercambio
      </Alert>
    </Box>
  );
}
