import { Box, Button, Chip, Typography } from '@mui/material';

interface ServiceActionFooterProps {
  isOwnService: boolean;
  status: string;
  duration: number;
  isUserLoggedIn: boolean;
  intent?: 'OFFER' | 'REQUEST';
  onRequestService: () => void;
}

export function ServiceActionFooter({
  isOwnService,
  status,
  duration,
  isUserLoggedIn,
  intent = 'OFFER',
  onRequestService,
}: ServiceActionFooterProps) {
  const isAvailable = status === 'ACTIVO';
  const isRequest = intent === 'REQUEST';
  const ownLabel = isRequest ? 'Tu solicitud' : 'Tu servicio';
  const ctaLabel = !isUserLoggedIn
    ? isRequest
      ? 'Iniciar sesión para ayudar'
      : 'Iniciar sesión para solicitar'
    : isRequest
      ? 'Puedo ayudarte'
      : 'Solicitar intercambio';
  const helperText = isAvailable
    ? isRequest
      ? 'Si puedes cubrir esta necesidad, envía un mensaje inicial explicando cómo podrías ayudar y en qué condiciones.'
      : 'Revisa bien la descripción antes de enviar tu solicitud. Podrás añadir un mensaje inicial para dar contexto.'
    : isRequest
      ? 'Esta solicitud ya no está activa. Puedes seguir explorando otras necesidades publicadas en la plataforma.'
      : 'Este servicio no está disponible en este momento, pero puedes seguir explorando otras alternativas.';

  return (
    <Box sx={{ display: 'flex', alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
      {isOwnService ? (
        <Chip label={ownLabel} color="info" sx={{ py: 2.5, px: 2, fontWeight: 700 }} />
      ) : (
        <Box>
          <Button
            variant="contained"
            size="large"
            onClick={onRequestService}
            disabled={!isAvailable}
            sx={{
              py: 1.5,
              px: 4,
              fontWeight: 700,
              textTransform: 'none',
              borderRadius: 2.5,
              bgcolor: '#8A33FD',
              '&:hover': { bgcolor: '#7028E0' },
              '&:disabled': { bgcolor: '#d4d4d8', color: '#52525b' },
            }}
          >
            {ctaLabel}
          </Button>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, maxWidth: 460, lineHeight: 1.6 }}>
            {helperText}
          </Typography>
        </Box>
      )}

      <Box sx={{ textAlign: { xs: 'left', sm: 'right' }, alignSelf: { xs: 'stretch', sm: 'auto' } }}>
        <Typography variant="h3" sx={{ fontWeight: 800, color: '#8A33FD', lineHeight: 1 }}>
          {duration}h
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Tiempo estimado de intercambio
        </Typography>
      </Box>
    </Box>
  );
}
