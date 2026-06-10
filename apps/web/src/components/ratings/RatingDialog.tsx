import { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
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
import { useCreateRating, useUpdateRating } from '@/shared/hooks/use-ratings';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/shared/api/client';
import { RatingForm } from './RatingForm';

interface RatingDialogProps {
  open: boolean;
  onClose: () => void;
  serviceTitle: string;
  serviceId: number;
  ratingId?: number;
  initialScore?: number;
  initialComment?: string;
  onRatingSubmitted: () => void;
}

export function RatingDialog({ 
  open, 
  onClose, 
  serviceTitle, 
  serviceId, 
  ratingId,
  initialScore = 0,
  initialComment = '',
  onRatingSubmitted 
}: RatingDialogProps) {
  const { t } = useTranslation();
  const { user, getAccessToken } = useAuth();
  const createRating = useCreateRating();
  const updateRating = useUpdateRating();
  const [rating, setRating] = useState<number>(initialScore);
  const [comment, setComment] = useState<string>(initialComment);
  const [error, setError] = useState<string | null>(null);
  const isEditMode = Boolean(ratingId);
  const isSubmitting = createRating.isPending || updateRating.isPending;
  const getErrorMessage = (err: unknown, fallback: string) => {
    if (!err || typeof err !== 'object') return fallback;
    const parsedError = err as {
      response?: { data?: { message?: string } };
      message?: string;
    };
    return parsedError.response?.data?.message || parsedError.message || fallback;
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      setError('Debes seleccionar una puntuación');
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

      if (isEditMode && ratingId) {
        await updateRating.mutateAsync({
          id: ratingId,
          data: {
            score: rating,
            comment: comment.trim() || undefined,
          },
        });
      } else {
        await createRating.mutateAsync({
          userId: user.sub,
          serviceId: serviceId,
          score: rating,
          comment: comment.trim() || undefined,
        });
      }

      // Success
      onRatingSubmitted();
      handleClose();
      
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err, 'Error inesperado al enviar la valoración');
      setError(errorMessage);
    }
  };

  const handleClose = () => {
    setRating(initialScore);
    setComment(initialComment);
    setError(null);
    onClose();
  };

  // Sync state when dialog opens with different initial values
  useEffect(() => {
    setRating(initialScore);
    setComment(initialComment);
  }, [initialScore, initialComment, open]);

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
            {isEditMode ? t('ratings.edit') : t('ratings.create')}
          </Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ py: 2 }}>
          <Typography variant="body1" sx={{ mb: 2.5 }}>
            {isEditMode ? 'Actualiza tu valoración para' : '¿Cómo calificarías el servicio'}{' '}
            <strong>&quot;{serviceTitle}&quot;</strong>?
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <RatingForm
            score={rating}
            comment={comment}
            error={error}
            disabled={isSubmitting}
            onScoreChange={setRating}
            onCommentChange={setComment}
          />
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleClose} disabled={isSubmitting}>
          {t('ratings.cancel')}
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          disabled={isSubmitting || rating === 0}
          startIcon={isSubmitting ? <CircularProgress size={16} /> : <Star />}
        >
          {isSubmitting
            ? 'Guardando...'
            : isEditMode
              ? t('ratings.update')
              : t('ratings.submit')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
