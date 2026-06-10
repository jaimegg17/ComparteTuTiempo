import { Box, Chip, Paper, Tab, Tabs, Typography } from '@mui/material';
import type { ExchangeState } from '@/types/exchange.types';
import { useTranslation } from '@/hooks/useTranslation';

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

const STATES: Array<{ value: ExchangeState | 'all'; labelKey: string; countKey?: keyof NonNullable<ExchangeFiltersProps['counts']> }> = [
  { value: 'all', labelKey: 'exchangesPage.filters.all' },
  { value: 'PENDING', labelKey: 'exchangesPage.pending', countKey: 'pending' },
  { value: 'CONFIRMED', labelKey: 'exchangesPage.filters.confirmed', countKey: 'confirmed' },
  { value: 'IN_PROGRESS', labelKey: 'exchangesPage.states.IN_PROGRESS', countKey: 'inProgress' },
  { value: 'COMPLETED', labelKey: 'exchangesPage.completed', countKey: 'completed' },
];

export function ExchangeFilters({ activeTab, onTabChange, activeState = 'all', onStateChange, counts }: ExchangeFiltersProps) {
  const { t } = useTranslation();
  return (
    <Paper sx={{ mb: 3, p: { xs: 2, md: 2.5 }, borderRadius: 4 }}>
      <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 800, letterSpacing: '0.08em' }}>
        {t('exchangesPage.filters.overline')}
      </Typography>

      <Tabs
        value={activeTab}
        onChange={(_, newValue) => onTabChange(newValue)}
        aria-label={t('exchangesPage.filters.aria')}
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
        <Tab label={t('exchangesPage.filters.all')} value="all" />
        <Tab label={t('exchangesPage.filters.received')} value="received" />
        <Tab label={t('exchangesPage.filters.sent')} value="sent" />
      </Tabs>

      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        {STATES.map((state) => {
          const count = state.countKey && counts ? counts[state.countKey] : undefined;
          const isActive = activeState === state.value;

          return (
            <Chip
              key={state.value}
              label={count === undefined ? t(state.labelKey) : `${t(state.labelKey)} · ${count}`}
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
