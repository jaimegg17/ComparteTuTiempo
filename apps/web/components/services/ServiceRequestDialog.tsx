import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Typography, Alert } from '@mui/material';

interface ServiceRequestDialogProps {
  open: boolean;
  loading: boolean;
  success: boolean;
  error: string | null;
  message: string;
  providerName?: string;
  duration?: number;
  intent?: 'OFFER' | 'REQUEST';
  onClose: () => void;
  onMessageChange: (message: string) => void;
  onSubmit: () => void;
}

export function ServiceRequestDialog({
  open,
  loading,
  success,
  error,
  message,
  providerName,
  duration,
  intent = 'OFFER',
  onClose,
  onMessageChange,
  onSubmit
}: ServiceRequestDialogProps) {
  const isRequest = intent === 'REQUEST';

  return (
    <Dialog 
      open={open} 
      onClose={() => !loading && onClose()}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>{isRequest ? 'Responder solicitud' : 'Solicitar servicio'}</DialogTitle>
      <DialogContent>
        {success ? (
          <Alert severity="success" sx={{ mb: 2 }}>
            {isRequest ? '¡Respuesta enviada correctamente! Redirigiendo...' : '¡Solicitud enviada exitosamente! Redirigiendo...'}
          </Alert>
        ) : (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {isRequest
                ? <>Envía una propuesta a <strong>{providerName}</strong> para ayudar con esta necesidad durante <strong>{duration} horas</strong>.</>
                : <>Envía una solicitud a <strong>{providerName}</strong> para intercambiar <strong>{duration} horas</strong>.</>}
            </Typography>
            
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <TextField
              label={isRequest ? 'Mensaje de respuesta (opcional)' : 'Mensaje (opcional)'}
              multiline
              rows={4}
              fullWidth
              value={message}
              onChange={(e) => onMessageChange(e.target.value)}
              placeholder={isRequest ? 'Explica cómo podrías ayudar, tu disponibilidad o cualquier detalle útil...' : 'Escribe un mensaje para el proveedor del servicio...'}
              disabled={loading}
            />
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button 
          onClick={onSubmit} 
          variant="contained" 
          disabled={loading || success}
        >
          {loading ? 'Enviando...' : isRequest ? 'Enviar respuesta' : 'Enviar solicitud'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
