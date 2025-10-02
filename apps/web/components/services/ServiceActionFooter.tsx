import { Box, Typography, Button, Chip } from '@mui/material';

interface ServiceActionFooterProps {
  isOwnService: boolean;
  status: string;
  duration: number;
  isUserLoggedIn: boolean;
  onRequestService: () => void;
}

export function ServiceActionFooter({ 
  isOwnService, 
  status, 
  duration, 
  isUserLoggedIn,
  onRequestService 
}: ServiceActionFooterProps) {
  return (
    <>
      {/* Botón y duración */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
        {isOwnService ? (
          <Chip label="Tu servicio" color="info" sx={{ py: 2.5, px: 2 }} />
        ) : (
          <Button
            variant="contained"
            size="large"
            onClick={onRequestService}
            disabled={status !== 'ACTIVO' || !isUserLoggedIn}
            sx={{
              py: 1.5,
              px: 4,
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: 1,
              bgcolor: '#8A33FD',
              '&:hover': {
                bgcolor: '#7028E0'
              },
              '&:disabled': {
                bgcolor: '#ccc'
              }
            }}
          >
            {status === 'ACTIVO' ? 'Solicitar' : 'No Disponible'}
          </Button>
        )}

        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#8A33FD' }}>
            {duration}h
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '11px' }}>
            de intercambio
          </Typography>
        </Box>
      </Box>

      {!isUserLoggedIn && !isOwnService && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, textAlign: 'center' }}>
          Inicia sesión para solicitar
        </Typography>
      )}
    </>
  );
}

