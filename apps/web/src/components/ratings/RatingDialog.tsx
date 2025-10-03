import { useState } from 'react';
import { 
  Box, 
  Typography, 
  Rating, 
  TextField, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  Alert,
  CircularProgress
} from '@mui/material';
import { Star } from '@mui/icons-material';
import { useTranslation } from '@/hooks/useTranslation';

interface RatingDialogProps {
  open: boolean;
  onClose: () => void;
  serviceTitle: string;
  serviceId: number;
  onRatingSubmitted: () => void;
}

export function RatingDialog({ 
  open, 
  onClose, 
  serviceTitle, 
  serviceId, 
  onRatingSubmitted 
}: RatingDialogProps) {
  const { t } = useTranslation();
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (rating === 0) {
      setError(t('ratings.required'));
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get token
      const tokenResponse = await fetch('/api/auth/token');
      if (!tokenResponse.ok) {
        throw new Error('No se pudo obtener el token de autenticación');
      }
      const tokenData = await tokenResponse.json();
      const token = tokenData.accessToken;

      if (!token) {
        throw new Error('Token de autenticación no disponible');
      }

      // Submit rating
      const response = await fetch('http://localhost:3001/api/ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          score: rating,
          comment: comment.trim() || undefined,
          serviceId: serviceId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al enviar la valoración');
      }

      // Success
      onRatingSubmitted();
      handleClose();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setRating(0);
    setComment('');
    setError(null);
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Star sx={{ color: 'primary.main' }} />
          <Typography variant="h6">
            {t('ratings.rate_service')}
          </Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ py: 2 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            ¿Cómo calificarías el servicio <strong>"{serviceTitle}"</strong>?
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              {t('ratings.rating')} *
            </Typography>
            <Rating
              value={rating}
              onChange={(_, newValue) => setRating(newValue || 0)}
              size="large"
              sx={{ 
                '& .MuiRating-icon': { 
                  fontSize: '2rem' 
                } 
              }}
            />
            {rating > 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {rating === 1 && t('ratings.terrible')}
                {rating === 2 && t('ratings.poor')}
                {rating === 3 && t('ratings.average')}
                {rating === 4 && t('ratings.good')}
                {rating === 5 && t('ratings.excellent')}
              </Typography>
            )}
          </Box>
          
          <TextField
            fullWidth
            multiline
            rows={3}
            label={`${t('ratings.comment')} (opcional)`}
            placeholder={t('ratings.comment_placeholder')}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            sx={{ mb: 2 }}
          />
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          {t('ratings.cancel')}
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          disabled={loading || rating === 0}
          startIcon={loading ? <CircularProgress size={16} /> : <Star />}
        >
          {loading ? t('ratings.submitting') : t('ratings.submit')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
