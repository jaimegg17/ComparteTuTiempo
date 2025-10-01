import { Box, Typography, IconButton, Collapse, Stack, Chip } from '@mui/material';
import { NavArrowDown, NavArrowUp } from 'iconoir-react';

interface TypeFilterProps {
  types: string[];
  selectedTypes: string[];
  isOpen: boolean;
  onToggle: () => void;
  onTypeToggle: (type: string) => void;
}

export function TypeFilter({
  types,
  selectedTypes,
  isOpen,
  onToggle,
  onTypeToggle,
}: TypeFilterProps) {
  return (
    <Box>
      <Box 
        onClick={() => onToggle()}
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
          Presencialidad
        </Typography>
        <IconButton 
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
        >
          {isOpen ? <NavArrowUp width={18} /> : <NavArrowDown width={18} />}
        </IconButton>
      </Box>
      
      <Collapse in={isOpen}>
        <Box sx={{ pt: 1 }}>
          <Box sx={{ 
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            maxHeight: 180,
            overflow: 'auto',
            bgcolor: 'background.paper'
          }}>
            <Stack spacing={0.25} sx={{ p: 0.5 }}>
              {types.map((type) => (
                <Box
                  key={type}
                  onClick={() => onTypeToggle(type)}
                  sx={{
                    px: 1.5,
                    py: 1,
                    borderRadius: 0.5,
                    cursor: 'pointer',
                    bgcolor: selectedTypes.includes(type) ? 'action.selected' : 'transparent',
                    color: selectedTypes.includes(type) ? 'primary.main' : 'text.primary',
                    fontWeight: selectedTypes.includes(type) ? 600 : 400,
                    fontSize: '13px',
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: selectedTypes.includes(type) ? 'action.selected' : 'action.hover',
                    }
                  }}
                >
                  {type}
                </Box>
              ))}
            </Stack>
          </Box>
          {selectedTypes.length > 0 && (
            <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selectedTypes.map(type => (
                <Chip 
                  key={type}
                  label={type} 
                  size="small" 
                  onDelete={() => onTypeToggle(type)}
                  sx={{ fontSize: '10px', height: '22px' }}
                />
              ))}
            </Box>
          )}
        </Box>
      </Collapse>
    </Box>
  );
}

