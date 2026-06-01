import { useState } from 'react';
import { Box, Paper, Tab, Tabs } from '@mui/material';
import { ServiceDetailsTab } from './ServiceDetailsTab';
import { ServiceLocationTab } from './ServiceLocationTab';
import { ServiceRatingsTab } from './ServiceRatingsTab';
import type { Service } from '@/types/service.types';

interface ServiceInfoTabsProps {
  service: Service;
}

export function ServiceInfoTabs({ service }: ServiceInfoTabsProps) {
  const [currentTab, setCurrentTab] = useState(0);

  return (
    <Box sx={{ flexGrow: 1, minHeight: 0 }}>
      <Paper variant="outlined" sx={{ p: 0.75, mb: 2.5, borderRadius: 3, bgcolor: 'grey.50' }}>
        <Tabs
          value={currentTab}
          onChange={(_, newValue) => setCurrentTab(newValue)}
          aria-label="Secciones de información del servicio"
          variant="scrollable"
          allowScrollButtonsMobile
          sx={{
            minHeight: 44,
            '& .MuiTabs-indicator': { display: 'none' },
            '& .MuiTab-root': {
              minHeight: 40,
              textTransform: 'none',
              fontSize: '0.95rem',
              fontWeight: 700,
              borderRadius: 2,
              mr: 0.5,
            },
            '& .Mui-selected': {
              bgcolor: '#fff',
              boxShadow: '0 8px 18px rgba(15, 23, 42, 0.06)',
            },
          }}
        >
          <Tab label="Detalles" />
          <Tab label="Valoraciones" />
          <Tab label="Ubicación" />
        </Tabs>
      </Paper>

      <Box sx={{ overflow: 'auto', maxHeight: 440, pr: 0.5 }}>
        {currentTab === 0 && <ServiceDetailsTab service={service} />}
        {currentTab === 1 && <ServiceRatingsTab service={service} />}
        {currentTab === 2 && (
          <ServiceLocationTab
            location={service.location}
            latitude={service.latitude}
            longitude={service.longitude}
            formattedAddress={service.formattedAddress}
          />
        )}
      </Box>
    </Box>
  );
}
