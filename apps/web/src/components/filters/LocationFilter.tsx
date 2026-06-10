import { Box, Typography, IconButton, Collapse, TextField } from '@mui/material';
import { NavArrowDown, NavArrowUp, Xmark } from 'iconoir-react';
import { useTranslation } from '@/hooks/useTranslation';

interface LocationFilterProps {
  location: string;
  isOpen: boolean;
  onToggle: () => void;
  onLocationChange: (location: string) => void;
  onClear?: () => void;
}

export function LocationFilter({
  location,
  isOpen,
  onToggle,
  onLocationChange,
  onClear,
}: LocationFilterProps) {
  const { t } = useTranslation();
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
          {t("services.filters.location")} {location && '(1)'}
        </Typography>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {location && onClear && (
            <IconButton 
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
              sx={{ color: 'error.main' }}
            >
              <Xmark width={16} />
            </IconButton>
          )}
          <IconButton size="small">
            {isOpen ? <NavArrowUp width={18} /> : <NavArrowDown width={18} />}
          </IconButton>
        </Box>
      </Box>
      
      <Collapse in={isOpen}>
        <Box sx={{ pt: 1 }}>
          <TextField
            fullWidth
            size="small"
            placeholder={t("services.filters.location")}
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

