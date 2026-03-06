import { Box, Tabs, Tab, Chip } from '@mui/material';
import type { ExchangeState } from '@/types/exchange.types';

interface ExchangeFiltersProps {
  activeTab: 'all' | 'received' | 'sent';
  onTabChange: (tab: 'all' | 'received' | 'sent') => void;
  activeState?: ExchangeState | 'all';
  onStateChange: (state: ExchangeState | 'all') => void;
  counts?: {
    pending: number;
    confirmed: number;
    inProgress: number;
    completed: number;
  };
}

const STATES: Array<{ value: ExchangeState | 'all'; label: string }> = [
  { value: 'all', label: 'Todos' },
  { value: 'PENDING', label: 'Pendientes' },
  { value: 'CONFIRMED', label: 'Confirmados' },
  { value: 'IN_PROGRESS', label: 'En progreso' },
  { value: 'COMPLETED', label: 'Completados' },
];

export function ExchangeFilters({ activeTab, onTabChange, activeState = 'all', onStateChange }: ExchangeFiltersProps) {
  return (
    <Box sx={{ mb: 3 }}>
      {/* Tab selector */}
      <Tabs 
        value={activeTab} 
        onChange={(_, newValue) => onTabChange(newValue)}
        sx={{ 
          mb: 2,
          borderBottom: 1,
          borderColor: 'divider',
          '& .MuiTab-root': {
            textTransform: 'none',
            fontSize: '14px',
            fontWeight: 600
          }
        }}
      >
        <Tab label="Todos" value="all" />
        <Tab label="Recibidos" value="received" />
        <Tab label="Enviados" value="sent" />
      </Tabs>

      {/* State filters */}
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        {STATES.map(state => (
          <Chip
            key={state.value}
            label={state.label}
            onClick={() => onStateChange(state.value)}
            color={activeState === state.value ? 'primary' : 'default'}
            variant={activeState === state.value ? 'filled' : 'outlined'}
            sx={{ 
              fontSize: '12px',
              height: '28px',
              cursor: 'pointer'
            }}
          />
        ))}
      </Box>
    </Box>
  );
}
