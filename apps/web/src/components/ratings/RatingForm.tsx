import { Box, Rating, TextField, Typography } from '@mui/material';
import { useTranslation } from '@/hooks/useTranslation';

interface RatingFormProps {
  score: number;
  comment: string;
  error?: string | null;
  disabled?: boolean;
  onScoreChange: (score: number) => void;
  onCommentChange: (comment: string) => void;
}

const COMMENT_MAX_LENGTH = 500;

export function RatingForm({
  score,
  comment,
  error,
  disabled = false,
  onScoreChange,
  onCommentChange,
}: RatingFormProps) {
  const { t } = useTranslation();

  return (
    <Box sx={{ py: 1 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
          {t('ratings.score')} *
        </Typography>
        <Rating
          value={score}
          onChange={(_, newValue) => onScoreChange(newValue || 0)}
          size="large"
          disabled={disabled}
          sx={{
            '& .MuiRating-icon': {
              fontSize: '2rem',
            },
          }}
        />
        {score > 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {score}/5
          </Typography>
        )}
      </Box>

      <TextField
        fullWidth
        multiline
        rows={4}
        label={t('ratings.comment')}
        value={comment}
        onChange={(event) => {
          const next = event.target.value;
          if (next.length <= COMMENT_MAX_LENGTH) {
            onCommentChange(next);
          }
        }}
        disabled={disabled}
        error={Boolean(error)}
        helperText={error || `${comment.length}/${COMMENT_MAX_LENGTH}`}
      />
    </Box>
  );
}
