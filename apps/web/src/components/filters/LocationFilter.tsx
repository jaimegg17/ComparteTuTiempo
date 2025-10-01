import { Box, Typography, IconButton, Collapse, TextField } from '@mui/material';
import { NavArrowDown, NavArrowUp } from 'iconoir-react';

interface LocationFilterProps {
  location: string;
  isOpen: boolean;
  onToggle: () => void;
  onLocationChange: (location: string) => void;
}

export function LocationFilter({
  location,
  isOpen,
  onToggle,
  onLocationChange,
}: LocationFilterProps) {
  return (
    <Box>
      <Box 
        onClick={onToggle}
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          cursor: 'pointer',
          py: 0.5,
          '&:hover': { opacity: 0.7 }
        }}
      >
        <Typography variant="body1" sx={{ fontWeight: 500, fontSize: '14px' }}>
          Ubicación
        </Typography>
        <IconButton size="small">
          {isOpen ? <NavArrowUp width={18} /> : <NavArrowDown width={18} />}
        </IconButton>
      </Box>
      
      <Collapse in={isOpen}>
        <Box sx={{ pt: 1 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Madrid, Barcelona..."
            value={location}
            onChange={(e) => onLocationChange(e.target.value)}
            sx={{ 
              '& .MuiOutlinedInput-root': {
                bgcolor: 'background.paper',
                fontSize: '13px'
              },
              '& .MuiInputBase-input': {
                py: 1
              }
            }}
          />
        </Box>
      </Collapse>
    </Box>
  );
}

