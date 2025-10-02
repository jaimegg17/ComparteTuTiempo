import { Box, Chip } from '@mui/material';
import { CheckCircle } from 'iconoir-react';

interface ServiceImageSectionProps {
  imageUrl?: string;
  title: string;
  status: string;
}

export function ServiceImageSection({ imageUrl, title, status }: ServiceImageSectionProps) {
  return (
    <Box 
      sx={{ 
        width: { xs: '100%', lg: '50%' },
        height: { xs: '400px', lg: 'auto' },
        bgcolor: 'grey.100',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {imageUrl ? (
        <img 
          src={imageUrl} 
          alt={title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <Box sx={{ fontSize: '120px', color: 'grey.400' }}>📦</Box>
      )}
      
      {/* Status badge */}
      {status === 'ACTIVO' && (
        <Chip
          label="Disponible"
          color="success"
          icon={<CheckCircle width={16} height={16} />}
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            fontWeight: 600,
            bgcolor: 'success.main',
            color: 'white',
          }}
        />
      )}
    </Box>
  );
}

