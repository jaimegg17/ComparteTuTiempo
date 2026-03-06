import React from 'react';
import { Alert, AlertTitle, Box, Button, Collapse, IconButton } from '@mui/material';
import { Close as CloseIcon, Refresh as RefreshIcon, Warning as WarningIcon, Error as ErrorIcon, Info as InfoIcon } from '@mui/icons-material';
import type { SxProps, Theme } from '@mui/material/styles';

export type AlertSeverity = 'error' | 'warning' | 'info' | 'success';

interface BeautifulAlertProps {
  severity: AlertSeverity;
  title?: string;
  message: string;
  onClose?: () => void;
  onRetry?: () => void;
  retryText?: string;
  closable?: boolean;
  variant?: 'filled' | 'outlined' | 'standard';
  sx?: SxProps<Theme>;
}

const getIcon = (severity: AlertSeverity) => {
  switch (severity) {
    case 'error':
      return <ErrorIcon />;
    case 'warning':
      return <WarningIcon />;
    case 'info':
      return <InfoIcon />;
    case 'success':
      return <InfoIcon />;
    default:
      return <InfoIcon />;
  }
};

export function BeautifulAlert({
  severity,
  title,
  message,
  onClose,
  onRetry,
  retryText = 'Retry',
  closable = true,
  variant = 'filled',
  sx = {}
}: BeautifulAlertProps) {
  const [open, setOpen] = React.useState(true);

  const handleClose = () => {
    setOpen(false);
    onClose?.();
  };

  if (!open) return null;

  return (
    <Collapse in={open}>
      <Alert
        severity={severity}
        variant={variant}
        icon={getIcon(severity)}
        sx={{
          borderRadius: 2,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          border: 'none',
          ...sx
        }}
        action={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {onRetry && (
              <Button
                size="small"
                startIcon={<RefreshIcon />}
                onClick={onRetry}
                sx={{
                  textTransform: 'none',
                  fontWeight: 500,
                  fontSize: '0.875rem',
                  minWidth: 'auto',
                  px: 2,
                  py: 0.5,
                  borderRadius: 1,
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                  }
                }}
              >
                {retryText}
              </Button>
            )}
            {closable && (
              <IconButton
                size="small"
                onClick={handleClose}
                sx={{
                  color: 'inherit',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  }
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
        }
      >
        {title && (
          <AlertTitle sx={{ fontWeight: 600, fontSize: '1rem', mb: 0.5 }}>
            {title}
          </AlertTitle>
        )}
        <Box sx={{ fontSize: '0.875rem', lineHeight: 1.5 }}>
          {message}
        </Box>
      </Alert>
    </Collapse>
  );
}

// Convenience components for common use cases
export function ErrorAlert({ message, title = 'Error', onRetry, onClose, ...props }: Omit<BeautifulAlertProps, 'severity'>) {
  return (
    <BeautifulAlert
      severity="error"
      title={title}
      message={message}
      onRetry={onRetry}
      onClose={onClose}
      {...props}
    />
  );
}

export function WarningAlert({ message, title = 'Warning', onRetry, onClose, ...props }: Omit<BeautifulAlertProps, 'severity'>) {
  return (
    <BeautifulAlert
      severity="warning"
      title={title}
      message={message}
      onRetry={onRetry}
      onClose={onClose}
      {...props}
    />
  );
}

export function InfoAlert({ message, title = 'Information', onRetry, onClose, ...props }: Omit<BeautifulAlertProps, 'severity'>) {
  return (
    <BeautifulAlert
      severity="info"
      title={title}
      message={message}
      onRetry={onRetry}
      onClose={onClose}
      {...props}
    />
  );
}

export function SuccessAlert({ message, title = 'Success', onRetry, onClose, ...props }: Omit<BeautifulAlertProps, 'severity'>) {
  return (
    <BeautifulAlert
      severity="success"
      title={title}
      message={message}
      onRetry={onRetry}
      onClose={onClose}
      {...props}
    />
  );
}
