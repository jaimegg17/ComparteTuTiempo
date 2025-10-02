import { useState } from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import { ServiceDetailsTab } from './ServiceDetailsTab';
import { ServiceRatingsTab } from './ServiceRatingsTab';
import { ServiceLocationTab } from './ServiceLocationTab';
import type { Service } from '@/types/service.types';

interface ServiceInfoTabsProps {
  service: Service;
}

export function ServiceInfoTabs({ service }: ServiceInfoTabsProps) {
  const [currentTab, setCurrentTab] = useState(0);

  return (
    <Box sx={{ flexGrow: 1, minHeight: 0 }}>
      <Tabs 
        value={currentTab} 
        onChange={(_, newValue) => setCurrentTab(newValue)}
        sx={{ 
          borderBottom: 1, 
          borderColor: 'divider',
          mb: 2,
          minHeight: 40,
          '& .MuiTab-root': {
            minHeight: 40,
            textTransform: 'none',
            fontSize: '14px',
            fontWeight: 600,
          }
        }}
      >
        <Tab label="Detalles" />
        <Tab label="Valoraciones" />
        <Tab label="Ubicación" />
      </Tabs>

      <Box sx={{ overflow: 'auto', maxHeight: 400 }}>
        {currentTab === 0 && <ServiceDetailsTab service={service} />}
        {currentTab === 1 && <ServiceRatingsTab service={service} />}
        {currentTab === 2 && <ServiceLocationTab location={service.location} />}
      </Box>
    </Box>
  );
}

