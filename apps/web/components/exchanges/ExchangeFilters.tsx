import { Box, Chip, Paper, Tab, Tabs, Typography } from '@mui/material';
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

const STATES: Array<{ value: ExchangeState | 'all'; label: string; countKey?: keyof NonNullable<ExchangeFiltersProps['counts']> }> = [
  { value: 'all', label: 'Todos' },
  { value: 'PENDING', label: 'Pendientes', countKey: 'pending' },
  { value: 'CONFIRMED', label: 'Confirmados', countKey: 'confirmed' },
  { value: 'IN_PROGRESS', label: 'En progreso', countKey: 'inProgress' },
  { value: 'COMPLETED', label: 'Completados', countKey: 'completed' },
];

export function ExchangeFilters({ activeTab, onTabChange, activeState = 'all', onStateChange, counts }: ExchangeFiltersProps) {
  return (
    <Paper sx={{ mb: 3, p: { xs: 2, md: 2.5 }, borderRadius: 4 }}>
      <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 800, letterSpacing: '0.08em' }}>
        FILTRAR ACTIVIDAD
      </Typography>

      <Tabs
        value={activeTab}
        onChange={(_, newValue) => onTabChange(newValue)}
        aria-label="Tipos de intercambios"
        variant="scrollable"
        allowScrollButtonsMobile
        sx={{
          mt: 1,
          mb: 2,
          minHeight: 44,
          '& .MuiTabs-indicator': {
            height: 3,
            borderRadius: 999,
          },
          '& .MuiTab-root': {
            textTransform: 'none',
            fontSize: '0.95rem',
            fontWeight: 700,
            minHeight: 44,
            px: 2,
          },
        }}
      >
        <Tab label="Todos" value="all" />
        <Tab label="Recibidos" value="received" />
        <Tab label="Enviados" value="sent" />
      </Tabs>

      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        {STATES.map((state) => {
          const count = state.countKey && counts ? counts[state.countKey] : undefined;
          const isActive = activeState === state.value;

          return (
            <Chip
              key={state.value}
              label={count === undefined ? state.label : `${state.label} · ${count}`}
              onClick={() => onStateChange(state.value)}
              color={isActive ? 'primary' : 'default'}
              variant={isActive ? 'filled' : 'outlined'}
              sx={{
                fontSize: '0.8rem',
                height: 32,
                cursor: 'pointer',
                fontWeight: 600,
                borderRadius: 999,
              }}
            />
          );
        })}
      </Box>
    </Paper>
  );
}
