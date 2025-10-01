import { Box, Typography, IconButton, Collapse, Stack, Chip } from '@mui/material';
import { NavArrowDown, NavArrowUp } from 'iconoir-react';

interface CategoryFilterProps {
  categories: string[];
  selectedCategories: string[];
  isOpen: boolean;
  onToggle: () => void;
  onCategoryToggle: (category: string) => void;
}

export function CategoryFilter({
  categories,
  selectedCategories,
  isOpen,
  onToggle,
  onCategoryToggle,
}: CategoryFilterProps) {
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
          Categorías
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
              {categories.map((cat) => (
                <Box
                  key={cat}
                  onClick={() => onCategoryToggle(cat)}
                  sx={{
                    px: 1.5,
                    py: 1,
                    borderRadius: 0.5,
                    cursor: 'pointer',
                    bgcolor: selectedCategories.includes(cat) ? 'action.selected' : 'transparent',
                    color: selectedCategories.includes(cat) ? 'primary.main' : 'text.primary',
                    fontWeight: selectedCategories.includes(cat) ? 600 : 400,
                    fontSize: '13px',
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: selectedCategories.includes(cat) ? 'action.selected' : 'action.hover',
                    }
                  }}
                >
                  {cat}
                </Box>
              ))}
            </Stack>
          </Box>
          {selectedCategories.length > 0 && (
            <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selectedCategories.map(cat => (
                <Chip 
                  key={cat}
                  label={cat} 
                  size="small" 
                  onDelete={() => onCategoryToggle(cat)}
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

