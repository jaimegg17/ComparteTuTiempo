import { Box, Chip } from '@mui/material';
import { CheckCircle } from 'iconoir-react';
import { useState } from 'react';
import Image from 'next/image';

interface ServiceImageSectionProps {
  imageUrl?: string;
  title: string;
  status: string;
}

export function ServiceImageSection({ imageUrl, title, status }: ServiceImageSectionProps) {
  const [imageError, setImageError] = useState(false);

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
      {imageUrl && !imageError ? (
        <Image
          src={imageUrl}
          alt={title}
          fill
          sizes="(max-width: 1200px) 100vw, 50vw"
          style={{ objectFit: 'cover' }}
          onError={() => setImageError(true)}
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
