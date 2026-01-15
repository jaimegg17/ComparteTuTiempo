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
import { useCreateRating } from '@/shared/hooks/use-ratings';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/shared/api/client';

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
  const { user, getAccessToken } = useAuth();
  const createRating = useCreateRating();
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (rating === 0) {
      setError(t('ratings.required') || 'Debes seleccionar una puntuación');
      return;
    }

    if (!user?.sub) {
      setError('Debes estar autenticado para valorar');
      return;
    }

    try {
      setError(null);

      // Get access token
      const token = await getAccessToken();
      if (!token) {
        throw new Error('No se pudo obtener el token de autenticación');
      }

      // Set token in API client
      apiClient.setToken(token);

      // Submit rating
      await createRating.mutateAsync({
        userId: user.sub,
        serviceId: serviceId,
        score: rating,
        comment: comment.trim() || undefined,
      });

      // Success
      onRatingSubmitted();
      handleClose();
      
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Error inesperado al enviar la valoración';
      setError(errorMessage);
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
        <Button onClick={handleClose} disabled={createRating.isPending}>
          {t('ratings.cancel')}
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          disabled={createRating.isPending || rating === 0}
          startIcon={createRating.isPending ? <CircularProgress size={16} /> : <Star />}
        >
          {createRating.isPending ? (t('ratings.submitting') || 'Enviando...') : (t('ratings.submit') || 'Enviar')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
