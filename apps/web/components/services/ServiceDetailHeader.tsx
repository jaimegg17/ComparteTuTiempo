import { Box, Typography, Chip } from '@mui/material';

interface ServiceDetailHeaderProps {
  category: string;
  title: string;
}

export function ServiceDetailHeader({ category, title }: ServiceDetailHeaderProps) {
  return (
    <>
      {/* Categoría con chip colorido */}
      <Box sx={{ display: 'inline-block', mb: 1.5 }}>
        <Chip 
          label={category}
          size="small"
          sx={{ 
            bgcolor: '#8A33FD',
            color: 'white',
            fontWeight: 600,
            fontSize: '11px',
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            height: '24px',
            '& .MuiChip-label': {
              px: 1.5
            }
          }}
        />
      </Box>

      {/* Título */}
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: 'grey.900' }}>
        {title}
      </Typography>
    </>
  );
}

