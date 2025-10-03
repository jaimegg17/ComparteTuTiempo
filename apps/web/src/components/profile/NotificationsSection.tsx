import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
} from '@mui/material';

export const NotificationsSection: React.FC = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4, mb: 4 }}>
      {/* Columna izquierda - Título */}
      <Box sx={{ width: { xs: '100%', md: '35%' } }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 3, color: 'text.primary' }}>
          Notificaciones
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Chip
            label="PRÓXIMAMENTE"
            sx={{ 
              fontSize: '0.8rem',
              fontWeight: 700,
              px: 2,
              py: 0.5,
              bgcolor: '#FF6B35',
              color: 'white',
              '&:hover': {
                bgcolor: '#E55A2B',
              }
            }}
          />
        </Box>
      </Box>

      {/* Columna derecha - Card sin chip */}
      <Card sx={{ width: { xs: '100%', md: '65%' }, border: '2px dashed', borderColor: 'grey.300' }}>
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 500, color: 'text.secondary' }}>
            Configuración de Notificaciones
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Próximamente: configuración de notificaciones.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};
