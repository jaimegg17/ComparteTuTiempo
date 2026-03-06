import { useState } from 'react';
import { Button } from '@mui/material';
import { Star } from '@mui/icons-material';
import { useTranslation } from '@/hooks/useTranslation';
import { RatingDialog } from './RatingDialog';

interface RatingButtonProps {
  exchangeId: number;
  serviceId: number;
  serviceTitle: string;
  onRatingSubmitted: () => void;
}

export function RatingButton({ 
  exchangeId, 
  serviceId, 
  serviceTitle, 
  onRatingSubmitted 
}: RatingButtonProps) {
  const { t } = useTranslation();
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false);
  void exchangeId;

  return (
    <>
      <Button 
        size="small" 
        variant="outlined"
        color="primary"
        startIcon={<Star />}
        onClick={() => setRatingDialogOpen(true)}
        sx={{ 
          textTransform: 'none', 
          fontSize: '13px',
          borderColor: '#8A33FD',
          color: '#8A33FD',
          '&:hover': {
            borderColor: '#7028E0',
            backgroundColor: 'rgba(138, 51, 253, 0.04)',
          }
        }}
      >
        {t('ratings.rate_service')}
      </Button>
      
      <RatingDialog
        open={ratingDialogOpen}
        onClose={() => setRatingDialogOpen(false)}
        serviceTitle={serviceTitle}
        serviceId={serviceId}
        onRatingSubmitted={onRatingSubmitted}
      />
    </>
  );
}
