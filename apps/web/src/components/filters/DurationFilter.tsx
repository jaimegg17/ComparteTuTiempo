import { Box, Typography, IconButton, Collapse, Slider, TextField } from '@mui/material';
import { NavArrowDown, NavArrowUp } from 'iconoir-react';

interface DurationFilterProps {
  durationRange: number[];
  isOpen: boolean;
  onToggle: () => void;
  onDurationChange: (event: Event, newValue: number | number[]) => void;
  onMinChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onMaxChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function DurationFilter({
  durationRange,
  isOpen,
  onToggle,
  onDurationChange,
  onMinChange,
  onMaxChange,
}: DurationFilterProps) {
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
          Duración
        </Typography>
        <IconButton size="small">
          {isOpen ? <NavArrowUp width={18} /> : <NavArrowDown width={18} />}
        </IconButton>
      </Box>
      
      <Collapse in={isOpen}>
        <Box sx={{ pt: 1.5, px: 0.5, pb: 0.5 }}>
          <Slider
            value={durationRange}
            onChange={onDurationChange}
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => `${value}h`}
            min={0}
            max={8}
            step={0.5}
            marks={[
              { value: 0, label: '0h' },
              { value: 2, label: '2h' },
              { value: 4, label: '4h' },
              { value: 6, label: '6h' },
              { value: 8, label: '8h' }
            ]}
            sx={{
              color: 'primary.main',
              '& .MuiSlider-thumb': {
                width: 14,
                height: 14,
              },
              '& .MuiSlider-valueLabel': {
                fontSize: 11,
                fontWeight: 'normal',
                top: -6,
                backgroundColor: 'primary.main',
              },
              '& .MuiSlider-markLabel': {
                fontSize: 10,
              }
            }}
          />
          
          {/* Inputs manuales para min y max */}
          <Box sx={{ display: 'flex', gap: 1.5, mt: 2, alignItems: 'center' }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block', fontSize: '10px' }}>
                Mín (h)
              </Typography>
              <TextField
                size="small"
                type="number"
                value={durationRange[0]}
                onChange={onMinChange}
                inputProps={{ 
                  min: 0, 
                  max: 8, 
                  step: 0.5,
                  style: { fontSize: '12px', padding: '5px 6px' }
                }}
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'background.paper',
                    height: '28px'
                  }
                }}
              />
            </Box>
            
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontSize: '12px' }}>—</Typography>
            
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block', fontSize: '10px' }}>
                Máx (h)
              </Typography>
              <TextField
                size="small"
                type="number"
                value={durationRange[1]}
                onChange={onMaxChange}
                inputProps={{ 
                  min: 0, 
                  max: 8, 
                  step: 0.5,
                  style: { fontSize: '12px', padding: '5px 6px' }
                }}
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'background.paper',
                    height: '28px'
                  }
                }}
              />
            </Box>
          </Box>
        </Box>
      </Collapse>
    </Box>
  );
}

