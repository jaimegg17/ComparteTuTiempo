import { Box, Typography, Alert } from '@mui/material';
import { MapPin } from 'iconoir-react';

interface ServiceLocationTabProps {
  location: string;
}

export function ServiceLocationTab({ location }: ServiceLocationTabProps) {
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
        <MapPin width={24} height={24} color="#1976d2" />
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '10px', mb: 0.3, display: 'block' }}>
            UBICACIÓN
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {location}
          </Typography>
        </Box>
      </Box>

      {/* Mini mapa placeholder */}
      <Box 
        sx={{ 
          width: '100%', 
          height: 200, 
          bgcolor: 'grey.100', 
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2px dashed',
          borderColor: 'grey.300'
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <MapPin width={32} height={32} color="#9e9e9e" />
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, fontSize: '11px' }}>
            Mapa próximamente
          </Typography>
        </Box>
      </Box>

      <Alert severity="info" sx={{ mt: 2, fontSize: '11px', py: 0.5 }}>
        La ubicación exacta se compartirá tras confirmar el intercambio
      </Alert>
    </Box>
  );
}

