import { Paper, Box, Typography, Button, Stack, Divider } from '@mui/material';
import { CategoryFilter } from './CategoryFilter';
import { LocationFilter } from './LocationFilter';
import { TypeFilter } from './TypeFilter';
import { DurationFilter } from './DurationFilter';

interface FilterSidebarProps {
  // Categories
  categories: string[];
  selectedCategories: string[];
  openCategories: boolean;
  setOpenCategories: (open: boolean) => void;
  toggleCategory: (category: string) => void;
  
  // Location
  location: string;
  openLocation: boolean;
  setOpenLocation: (open: boolean) => void;
  setLocation: (location: string) => void;
  
  // Types
  types: string[];
  selectedTypes: string[];
  openType: boolean;
  setOpenType: (open: boolean) => void;
  toggleType: (type: string) => void;
  
  // Duration
  durationRange: number[];
  openDuration: boolean;
  setOpenDuration: (open: boolean) => void;
  handleDurationChange: (event: Event, newValue: number | number[]) => void;
  handleMinDurationChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleMaxDurationChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  
  // Actions
  onApplyFilters: () => void;
  onClearFilters: () => void;
}

export function FilterSidebar({
  categories,
  selectedCategories,
  openCategories,
  setOpenCategories,
  toggleCategory,
  location,
  openLocation,
  setOpenLocation,
  setLocation,
  types,
  selectedTypes,
  openType,
  setOpenType,
  toggleType,
  durationRange,
  openDuration,
  setOpenDuration,
  handleDurationChange,
  handleMinDurationChange,
  handleMaxDurationChange,
  onApplyFilters,
  onClearFilters,
}: FilterSidebarProps) {
  return (
    <Paper sx={{ 
      width: 280, 
      p: 0, 
      height: 'fit-content', 
      position: 'sticky', 
      top: 20,
      overflow: 'hidden'
    }}>
      {/* Header */}
      <Box sx={{ 
        p: 2, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: '1px solid',
        borderColor: 'divider'
      }}>
        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '16px' }}>
          Filtros
        </Typography>
        <Box component="span" sx={{ fontSize: '18px' }}>⚙️</Box>
      </Box>
      
      <Box sx={{ p: 2 }}>
        <Stack spacing={1.5}>
          {/* Categorías */}
          <CategoryFilter
            categories={categories}
            selectedCategories={selectedCategories}
            isOpen={openCategories}
            onToggle={() => setOpenCategories(!openCategories)}
            onCategoryToggle={toggleCategory}
          />
          
          <Divider sx={{ my: 0.5 }} />
          
          {/* Ubicación */}
          <LocationFilter
            location={location}
            isOpen={openLocation}
            onToggle={() => setOpenLocation(!openLocation)}
            onLocationChange={setLocation}
          />
          
          <Divider sx={{ my: 0.5 }} />
          
          {/* Presencialidad */}
          <TypeFilter
            types={types}
            selectedTypes={selectedTypes}
            isOpen={openType}
            onToggle={() => setOpenType(!openType)}
            onTypeToggle={toggleType}
          />
          
          <Divider sx={{ my: 0.5 }} />
          
          {/* Duración */}
          <DurationFilter
            durationRange={durationRange}
            isOpen={openDuration}
            onToggle={() => setOpenDuration(!openDuration)}
            onDurationChange={handleDurationChange}
            onMinChange={handleMinDurationChange}
            onMaxChange={handleMaxDurationChange}
          />
          
          <Divider sx={{ my: 0.5 }} />
          
          {/* Botones */}
          <Stack spacing={1} sx={{ pt: 1 }}>
            <Button 
              variant="contained" 
              onClick={onApplyFilters}
              fullWidth
              sx={{ 
                textTransform: 'none',
                py: 1,
                fontWeight: 600,
                fontSize: '13px',
                boxShadow: 1
              }}
            >
              Aplicar Filtros
            </Button>
            
            <Button 
              variant="text" 
              onClick={onClearFilters}
              fullWidth
              sx={{ 
                textTransform: 'none',
                color: 'text.secondary',
                fontSize: '13px'
              }}
            >
              Limpiar filtros
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Paper>
  );
}

