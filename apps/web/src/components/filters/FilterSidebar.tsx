import { Paper, Box, Typography, Button, Stack, Divider } from '@mui/material';
import { CategoryFilter } from './CategoryFilter';
import { LocationFilter } from './LocationFilter';
import { TypeFilter } from './TypeFilter';
import { DurationFilter } from './DurationFilter';
import { useTranslation } from '@/hooks/useTranslation';

interface FilterSidebarProps {
  // Categories
  categories: string[];
  selectedCategories: string[];
  openCategories: boolean;
  setOpenCategories: (open: boolean) => void;
  toggleCategory: (category: string) => void;
  getCategoryDisplayName: (category: string) => string;
  
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
  getTypeDisplayName: (type: string) => string;
  
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
  onClearCategory?: () => void;
  onClearType?: () => void;
  onClearLocation?: () => void;
  onClearDuration?: () => void;
}

export function FilterSidebar({
  categories,
  selectedCategories,
  openCategories,
  setOpenCategories,
  toggleCategory,
  getCategoryDisplayName,
  location,
  openLocation,
  setOpenLocation,
  setLocation,
  types,
  selectedTypes,
  openType,
  setOpenType,
  toggleType,
  getTypeDisplayName,
  durationRange,
  openDuration,
  setOpenDuration,
  handleDurationChange,
  handleMinDurationChange,
  handleMaxDurationChange,
  onApplyFilters,
  onClearFilters,
  onClearCategory,
  onClearType,
  onClearLocation,
  onClearDuration,
}: FilterSidebarProps) {
  const { t } = useTranslation();
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
          {t("services.filters.title")}
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
            onClear={onClearCategory}
            getCategoryDisplayName={getCategoryDisplayName}
          />
          
          <Divider sx={{ my: 0.5 }} />
          
          {/* Ubicación */}
          <LocationFilter
            location={location}
            isOpen={openLocation}
            onToggle={() => setOpenLocation(!openLocation)}
            onLocationChange={setLocation}
            onClear={onClearLocation}
          />
          
          <Divider sx={{ my: 0.5 }} />
          
          {/* Presencialidad */}
          <TypeFilter
            types={types}
            selectedTypes={selectedTypes}
            isOpen={openType}
            onToggle={() => setOpenType(!openType)}
            onTypeToggle={toggleType}
            onClear={onClearType}
            getTypeDisplayName={getTypeDisplayName}
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
            onClear={onClearDuration}
          />
          
          <Divider sx={{ my: 0.5 }} />
          
          {/* Botones */}
          <Stack spacing={1} sx={{ pt: 1 }}>
            <Button 
              color='primary'
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
              {t("services.filters.apply")}
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
              {t("services.filters.clear")}
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Paper>
  );
}

