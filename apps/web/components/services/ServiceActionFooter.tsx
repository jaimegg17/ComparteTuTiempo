import { Box, Button, Chip, Typography } from '@mui/material';
import { useTranslation } from '@/hooks/useTranslation';

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
  const { t } = useTranslation();
  const isAvailable = status === 'ACTIVO';
  const isRequest = intent === 'REQUEST';
  const ownLabel = isRequest ? t('services.actions.ownRequest') : t('services.actions.ownService');
  const ctaLabel = !isUserLoggedIn
    ? isRequest
      ? t('services.actions.loginToHelp')
      : t('services.actions.loginToRequest')
    : isRequest
      ? t('services.actions.canHelp')
      : t('services.actions.requestExchange');
  const helperText = isAvailable
    ? isRequest
      ? t('services.actions.requestHelper')
      : t('services.actions.serviceHelper')
    : isRequest
      ? t('services.actions.inactiveRequestHelper')
      : t('services.actions.inactiveServiceHelper');

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
          {t('services.actions.estimatedExchangeTime')}
        </Typography>
      </Box>
    </Box>
  );
}
