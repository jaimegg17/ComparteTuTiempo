import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Typography, Alert } from '@mui/material';

interface ServiceRequestDialogProps {
  open: boolean;
  loading: boolean;
  success: boolean;
  error: string | null;
  message: string;
  providerName?: string;
  duration?: number;
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
  onClose,
  onMessageChange,
  onSubmit
}: ServiceRequestDialogProps) {
  return (
    <Dialog 
      open={open} 
      onClose={() => !loading && onClose()}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Solicitar Servicio</DialogTitle>
      <DialogContent>
        {success ? (
          <Alert severity="success" sx={{ mb: 2 }}>
            ¡Solicitud enviada exitosamente! Redirigiendo...
          </Alert>
        ) : (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Envía una solicitud a <strong>{providerName}</strong> para intercambiar <strong>{duration} horas</strong>.
            </Typography>
            
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <TextField
              label="Mensaje (opcional)"
              multiline
              rows={4}
              fullWidth
              value={message}
              onChange={(e) => onMessageChange(e.target.value)}
              placeholder="Escribe un mensaje para el proveedor del servicio..."
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
          {loading ? 'Enviando...' : 'Enviar Solicitud'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

