import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { Typography, Box, CircularProgress, Button, Tabs, Tab } from '@mui/material';
import { Layout } from '@/components/Layout';
import { ServiceCard } from '@/components/ServiceCard';
import { FilterSidebar } from '@/components/filters/FilterSidebar';
import { ErrorAlert } from '@/components/ui/BeautifulAlert';
import { useErrorHandling, ERROR_MESSAGES } from '@/hooks/useErrorHandling';
import { useTranslation } from '@/hooks/useTranslation';
import { useUser } from '@auth0/nextjs-auth0/client';
import { useAuth } from '@/hooks/useAuth';

interface Service {
  id: number;
  title: string;
  description: string;
  price: number;
  duration: number;
  location: string;
  category: string;
  type: string;
  status: string;
  userId: string;
  imageUrl?: string;
  latitude?: number | null;
  longitude?: number | null;
  formattedAddress?: string | null;
  placeId?: string | null;
  distanceKm?: number | null;
}

export default function ServicesPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { user } = useUser();
  const { accessToken } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [total, setTotal] = useState(0);
  const [activeTab, setActiveTab] = useState(0);
  const { error, loading, handleAsyncOperation, clearError } = useErrorHandling();
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [location, setLocation] = useState('');
  const [durationRange, setDurationRange] = useState<number[]>([0, 8]);
  const [selectedType, setSelectedType] = useState<string>('');
  const [nearLat, setNearLat] = useState<number | null>(null);
  const [nearLng, setNearLng] = useState<number | null>(null);
  const [radiusKm, setRadiusKm] = useState<number>(10);
  const [useNearby, setUseNearby] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  // Estados de colapso para cada filtro
  const [openCategories, setOpenCategories] = useState(false);
  const [openLocation, setOpenLocation] = useState(false);
  const [openType, setOpenType] = useState(false);
  const [openDuration, setOpenDuration] = useState(false);

  // Enum values for API calls (keep original values)
  const categories = ['EDUCACION', 'HOGAR', 'TECNOLOGIA', 'SALUD', 'DEPORTES', 'ARTE', 'OTROS'];
  const types = ['PRESENCIAL', 'VIRTUAL', 'HIBRIDO'];
  
  // Mapping functions for display
  const getCategoryDisplayName = (category: string) => {
    const categoryMap: Record<string, string> = {
      'EDUCACION': t('services.categories.education'),
      'HOGAR': t('services.categories.home'),
      'TECNOLOGIA': t('services.categories.technology'),
      'SALUD': t('services.categories.health'),
      'DEPORTES': t('services.categories.sports'),
      'ARTE': t('services.categories.art'),
      'OTROS': t('services.categories.others'),
    };
    return categoryMap[category] || category;
  };
  
  const getTypeDisplayName = (type: string) => {
    const typeMap: Record<string, string> = {
      'PRESENCIAL': t('services.types.in_person'),
      'VIRTUAL': t('services.types.online'),
      'HIBRIDO': t('services.types.hybrid'),
    };
    return typeMap[type] || type;
  };

  type FilterOverrides = {
    searchTerm?: string;
    selectedCategory?: string;
    location?: string;
    durationRange?: number[];
    selectedType?: string;
    nearLat?: number | null;
    nearLng?: number | null;
    radiusKm?: number;
    useNearby?: boolean;
  };

  const fetchServices = useCallback(async (overrides?: FilterOverrides) => {
    const q = overrides?.searchTerm ?? searchTerm;
    const cat = overrides?.selectedCategory ?? selectedCategory;
    const loc = overrides?.location ?? location;
    const dur = overrides?.durationRange ?? durationRange;
    const typ = overrides?.selectedType ?? selectedType;
    const lat = overrides?.nearLat ?? nearLat;
    const lng = overrides?.nearLng ?? nearLng;
    const radius = overrides?.radiusKm ?? radiusKm;
    const nearbyEnabled = overrides?.useNearby ?? useNearby;

    await handleAsyncOperation(async () => {
      const params = new URLSearchParams();
      if (q) params.append('q', q);
      if (cat) params.append('category', cat);
      if (loc) params.append('location', loc);
      if (dur[0] > 0) params.append('minPrice', (dur[0] * 60).toString());
      if (dur[1] < 8) params.append('maxPrice', (dur[1] * 60).toString());
      if (typ) params.append('type', typ);
      if (nearbyEnabled && lat !== null && lng !== null) {
        params.append('nearLat', lat.toString());
        params.append('nearLng', lng.toString());
        params.append('radiusKm', radius.toString());
      }

      const endpoint = nearbyEnabled && lat !== null && lng !== null
        ? '/api/services/nearby/search'
        : '/api/services';
      let url = `http://localhost:3001${endpoint}?${params.toString()}`;
      if (activeTab === 1 && user?.sub && accessToken) {
        params.append('userId', user.sub);
        url = `http://localhost:3001${endpoint}?${params.toString()}`;
      }

      const response = await fetch(url, {
        headers: activeTab === 1 && accessToken ? {
          'Authorization': `Bearer ${accessToken}`,
        } : {},
      });

      if (!response.ok) {
        throw new Error(ERROR_MESSAGES.NETWORK_ERROR);
      }

      const data = await response.json();
      let filteredServices = data.services || [];
      if (dur[0] > 0 || dur[1] < 8) {
        filteredServices = filteredServices.filter((service: Service) =>
          service.duration >= dur[0] && service.duration <= dur[1]
        );
      }
      setServices(filteredServices);
      setTotal(filteredServices.length);
    }, ERROR_MESSAGES.NETWORK_ERROR);
  }, [
    searchTerm,
    selectedCategory,
    location,
    durationRange,
    selectedType,
    nearLat,
    nearLng,
    radiusKm,
    useNearby,
    handleAsyncOperation,
    activeTab,
    user?.sub,
    accessToken,
  ]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handleClearFilters = () => {
    const emptyFilters = {
      searchTerm: '',
      selectedCategory: '',
      location: '',
      durationRange: [0, 8] as number[],
      selectedType: '',
      nearLat: null,
      nearLng: null,
      radiusKm: 10,
      useNearby: false,
    };
    setSearchTerm('');
    setSelectedCategory('');
    setLocation('');
    setDurationRange([0, 8]);
    setSelectedType('');
    setNearLat(null);
    setNearLng(null);
    setRadiusKm(10);
    setUseNearby(false);
    // Fetch with empty filters immediately so results update on first click
    fetchServices(emptyFilters);
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setNearLat(lat);
        setNearLng(lng);
        setUseNearby(true);
        setIsLocating(false);
        fetchServices({ nearLat: lat, nearLng: lng, useNearby: true, radiusKm });
      },
      () => {
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleDisableNearby = () => {
    setNearLat(null);
    setNearLng(null);
    setUseNearby(false);
    fetchServices({ nearLat: null, nearLng: null, useNearby: false });
  };

  const handleRadiusChange = (newRadius: number) => {
    setRadiusKm(newRadius);
    if (useNearby && nearLat !== null && nearLng !== null) {
      fetchServices({ radiusKm: newRadius, nearLat, nearLng, useNearby: true });
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleDurationChange = (_event: Event, newValue: number | number[]) => {
    setDurationRange(newValue as number[]);
  };

  const handleMinDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setDurationRange([Math.min(value, durationRange[1]), durationRange[1]]);
  };

  const handleMaxDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 8;
    setDurationRange([durationRange[0], Math.max(value, durationRange[0])]);
  };

  const toggleCategory = (cat: string) => {
    // Si ya está seleccionada, la deseleccionamos; si no, la seleccionamos
    setSelectedCategory(prev => prev === cat ? '' : cat);
  };

  const toggleType = (type: string) => {
    // Si ya está seleccionado, lo deseleccionamos; si no, lo seleccionamos
    setSelectedType(prev => prev === type ? '' : type);
  };

  return (
    <Layout>
      <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100%', py: 4 }}>
        <Box sx={{ px: { xs: 2, md: 3 } }}>
          {error && (
            <Box sx={{ mb: 3 }}>
              <ErrorAlert
                message={error}
                onRetry={fetchServices}
                onClose={clearError}
                retryText={t("common.retry")}
              />
            </Box>
          )}
          <Box sx={{ display: 'flex', gap: 3 }}>
            {/* Sidebar de Filtros */}
            <FilterSidebar
              categories={categories}
              selectedCategories={selectedCategory ? [selectedCategory] : []}
              openCategories={openCategories}
              setOpenCategories={setOpenCategories}
              toggleCategory={toggleCategory}
              getCategoryDisplayName={getCategoryDisplayName}
              location={location}
              openLocation={openLocation}
              setOpenLocation={setOpenLocation}
              setLocation={setLocation}
              types={types}
              selectedTypes={selectedType ? [selectedType] : []}
              openType={openType}
              setOpenType={setOpenType}
              toggleType={toggleType}
              getTypeDisplayName={getTypeDisplayName}
              durationRange={durationRange}
              openDuration={openDuration}
              setOpenDuration={setOpenDuration}
              handleDurationChange={handleDurationChange}
              handleMinDurationChange={handleMinDurationChange}
              handleMaxDurationChange={handleMaxDurationChange}
              onApplyFilters={fetchServices}
              onClearFilters={handleClearFilters}
              onClearCategory={() => { setSelectedCategory(''); fetchServices({ selectedCategory: '' }); }}
              onClearType={() => { setSelectedType(''); fetchServices({ selectedType: '' }); }}
              onClearLocation={() => { setLocation(''); fetchServices({ location: '' }); }}
              onClearDuration={() => { setDurationRange([0, 8]); fetchServices({ durationRange: [0, 8] }); }}
            />

            {/* Grid de Servicios */}
            <Box sx={{ flex: 1 }}>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
              {/* Tab Controller - Izquierda */}
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                sx={{
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontWeight: 500,
                    fontSize: '14px',
                    minHeight: '36px',
                    py: 1,
                    px: 2,
                  },
                  '& .Mui-selected': {
                    color: '#8A33FD',
                    fontWeight: 600,
                  },
                  '& .MuiTabs-indicator': {
                    backgroundColor: '#8A33FD',
                  },
                }}
              >
                <Tab label={t("services.tabs.offers")} />
                <Tab 
                  label={t("services.tabs.my_services")} 
                  disabled={!user?.sub}
                />
              </Tabs>
              
              {/* Número de resultados y botón - Derecha */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '18px' }}>
                  {loading ? t("common.loading") : `${total} ${t("services.title").toLowerCase()} ${t("common.found")}`}
                </Typography>
                
                <Button 
                  variant="contained" 
                  onClick={() => router.push('/services/create')}
                  sx={{ 
                    textTransform: 'none', 
                    fontWeight: 600,
                    bgcolor: '#8A33FD',
                    px: 3,
                    py: 1,
                    borderRadius: 2,
                    boxShadow: '0 2px 8px rgba(138, 51, 253, 0.3)',
                    '&:hover': {
                      bgcolor: '#7028E0',
                      boxShadow: '0 4px 12px rgba(138, 51, 253, 0.4)',
                    }
                  }}
                >
                  + {t("services.create")}
                </Button>
              </Box>
            </Box>

            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
              <Button
                variant={useNearby ? 'contained' : 'outlined'}
                size="small"
                onClick={handleUseMyLocation}
                disabled={isLocating}
                sx={{ textTransform: 'none' }}
              >
                {isLocating ? 'Obteniendo ubicación…' : 'Usar mi ubicación'}
              </Button>
              <Button
                variant="text"
                size="small"
                onClick={handleDisableNearby}
                disabled={!useNearby}
                sx={{ textTransform: 'none' }}
              >
                Quitar cercanía
              </Button>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Radio:
                </Typography>
                <Button
                  size="small"
                  variant={radiusKm === 5 ? 'contained' : 'outlined'}
                  onClick={() => handleRadiusChange(5)}
                  sx={{ minWidth: 56 }}
                >
                  5 km
                </Button>
                <Button
                  size="small"
                  variant={radiusKm === 10 ? 'contained' : 'outlined'}
                  onClick={() => handleRadiusChange(10)}
                  sx={{ minWidth: 56 }}
                >
                  10 km
                </Button>
                <Button
                  size="small"
                  variant={radiusKm === 25 ? 'contained' : 'outlined'}
                  onClick={() => handleRadiusChange(25)}
                  sx={{ minWidth: 56 }}
                >
                  25 km
                </Button>
              </Box>
            </Box>

              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: 2.5,
                  }}
                >
                  {services.map((service) => (
                    <ServiceCard key={service.id} service={service} />
                  ))}
                </Box>
              )}

              {!loading && services.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                    {activeTab === 1 
                      ? t("services.empty_states.no_my_services")
                      : t("services.empty_states.no_services")
                    }
                  </Typography>
                  <Button 
                    variant="outlined" 
                    onClick={activeTab === 1 ? () => router.push('/services/create') : handleClearFilters}
                    sx={{ textTransform: 'none' }}
                  >
                    {activeTab === 1 
                      ? t("services.empty_states.create_first")
                      : t("services.filters.clear")
                    }
                  </Button>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    </Layout>
  );
}
