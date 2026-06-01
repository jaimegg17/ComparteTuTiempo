import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/router';
import { Typography, Box, CircularProgress, Button, Tabs, Tab, Drawer, IconButton, Chip, Paper, Stack } from '@mui/material';
import { Layout } from '@/components/Layout';
import { ServiceCard } from '@/components/ServiceCard';
import { FilterSidebar } from '@/components/filters/FilterSidebar';
import { ErrorAlert } from '@/components/ui/BeautifulAlert';
import { useToast } from '@/components/ui/ToastProvider';
import { useErrorHandling } from '@/hooks/useErrorHandling';
import { useTranslation } from '@/hooks/useTranslation';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useUser } from '@auth0/nextjs-auth0/client';
import { useAuth } from '@/hooks/useAuth';
import { useFavoriteServices } from '@/hooks/useFavoriteServices';
import Script from 'next/script';
import { FilterListRounded, CloseRounded, MapRounded, ViewListRounded, PlaceRounded } from '@mui/icons-material';

type MapCenter = { lat: number; lng: number };

interface GoogleGeocoderResult {
  geometry: {
    location: {
      lat: () => number;
      lng: () => number;
    };
  };
}

interface GoogleMapInstance {
  setCenter: (center: MapCenter) => void;
  fitBounds: (bounds: { extend: (point: MapCenter) => void }, padding?: number) => void;
  setZoom: (zoom: number) => void;
  getZoom: () => number | undefined;
}

interface GoogleMarkerInstance {
  setMap: (map: GoogleMapInstance | null) => void;
  addListener: (eventName: string, handler: () => void) => void;
}

interface GoogleInfoWindowInstance {
  setContent: (content: string) => void;
  open: (options: { anchor: GoogleMarkerInstance; map: GoogleMapInstance }) => void;
}

interface GoogleMapsNamespace {
  Map: new (element: HTMLElement, options: Record<string, unknown>) => GoogleMapInstance;
  Marker: new (options: Record<string, unknown>) => GoogleMarkerInstance;
  InfoWindow: new () => GoogleInfoWindowInstance;
  Geocoder: new () => {
    geocode: (
      request: { address: string },
      callback: (results: GoogleGeocoderResult[], status: string) => void,
    ) => void;
  };
  LatLngBounds: new () => { extend: (point: MapCenter) => void };
  Animation: { DROP: unknown };
  SymbolPath: { CIRCLE: unknown };
  event: {
    addListenerOnce: (instance: GoogleMapInstance, eventName: string, handler: () => void) => void;
  };
}

declare global {
  interface Window {
    google?: {
      maps?: GoogleMapsNamespace;
    };
  }
}

interface Service {
  id: number;
  title: string;
  description: string;
  price: number;
  duration: number;
  location: string;
  category: string;
  type: string;
  intent?: 'OFFER' | 'REQUEST';
  status: string;
  userId: string;
  imageUrl?: string;
  latitude?: number | null;
  longitude?: number | null;
  formattedAddress?: string | null;
  placeId?: string | null;
  distanceKm?: number | null;
}

const SERVICE_CATEGORIES = ['EDUCACION', 'HOGAR', 'TECNOLOGIA', 'SALUD', 'DEPORTES', 'ARTE', 'OTROS'];
const SERVICE_TYPES = ['PRESENCIAL', 'VIRTUAL', 'HIBRIDO'];

export default function ServicesPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { user } = useUser();
  const { favoriteIds, favoritesCount } = useFavoriteServices(user?.sub);
  const { userProfile } = useUserProfile();
  const { accessToken } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const { error, loading, handleAsyncOperation, clearError } = useErrorHandling();
  const { showToast } = useToast();
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [location, setLocation] = useState('');
  const [durationRange, setDurationRange] = useState<number[]>([0, 8]);
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedIntent, setSelectedIntent] = useState<'ALL' | 'OFFER' | 'REQUEST'>('OFFER');
  const [nearLat, setNearLat] = useState<number | null>(null);
  const [nearLng, setNearLng] = useState<number | null>(null);
  const [radiusKm, setRadiusKm] = useState<number>(10);
  const [useNearby, setUseNearby] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [mapCenter, setMapCenter] = useState<MapCenter>({ lat: 40.4168, lng: -3.7038 });
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<GoogleMapInstance | null>(null);
  const markersRef = useRef<GoogleMarkerInstance[]>([]);
  const infoWindowRef = useRef<GoogleInfoWindowInstance | null>(null);

  // Estados de colapso para cada filtro
  const [openCategories, setOpenCategories] = useState(false);
  const [openLocation, setOpenLocation] = useState(false);
  const [openType, setOpenType] = useState(false);
  const [openDuration, setOpenDuration] = useState(false);

  // Enum values for API calls (keep original values)
  const categories = SERVICE_CATEGORIES;
  const types = SERVICE_TYPES;
  const visibleServices = showFavoritesOnly ? services.filter((service) => favoriteIds.includes(service.id)) : services;

  useEffect(() => {
    if (!router.isReady) return;

    const categoryParam = router.query.category;
    const normalizedCategory = typeof categoryParam === 'string' ? categoryParam.trim().toUpperCase() : '';
    const intentParam = typeof router.query.intent === 'string' ? router.query.intent.trim().toUpperCase() : '';

    if (normalizedCategory && categories.includes(normalizedCategory) && normalizedCategory !== selectedCategory) {
      setSelectedCategory(normalizedCategory);
    }

    if ((intentParam === 'OFFER' || intentParam === 'REQUEST') && intentParam !== selectedIntent) {
      setSelectedIntent(intentParam as 'OFFER' | 'REQUEST');
    }
  }, [router.isReady, router.query.category, router.query.intent, selectedCategory, selectedIntent, categories]);
  
  // Mapping functions for display
  const getCategoryDisplayName = useCallback((category: string) => {
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
  }, [t]);
  
  const getTypeDisplayName = useCallback((type: string) => {
    const typeMap: Record<string, string> = {
      'PRESENCIAL': t('services.types.in_person'),
      'VIRTUAL': t('services.types.online'),
      'HIBRIDO': t('services.types.hybrid'),
    };
    return typeMap[type] || type;
  }, [t]);

  type FilterOverrides = {
    searchTerm?: string;
    selectedCategory?: string;
    location?: string;
    durationRange?: number[];
    selectedType?: string;
    selectedIntent?: 'ALL' | 'OFFER' | 'REQUEST';
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
    const intent = overrides?.selectedIntent ?? selectedIntent;
    const lat = overrides?.nearLat ?? nearLat;
    const lng = overrides?.nearLng ?? nearLng;
    const radius = overrides?.radiusKm ?? radiusKm;
    const nearbyEnabled = overrides?.useNearby ?? useNearby;

    await handleAsyncOperation(async () => {
      const params = new URLSearchParams();
      if (q) params.append('q', q);
      if (cat) params.append('category', cat);
      if (loc) params.append('location', loc);
      // El backend filtra minPrice/maxPrice por créditos, no por duración.
      // La duración se filtra abajo en cliente para evitar excluir resultados por precio.
      if (typ) params.append('type', typ);
      if (intent !== 'ALL') params.append('intent', intent);
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
        let rawMessage = `Error al cargar los servicios (${response.status})`;
        try {
          const errorData = await response.json();
          const raw = errorData.message ?? errorData.error;
          rawMessage = Array.isArray(raw) ? raw[0] ?? raw.join(' ') : (raw || rawMessage);
        } catch {
          rawMessage = response.statusText || rawMessage;
        }
        throw Object.assign(new Error(rawMessage), { status: response.status });
      }

      const data = await response.json();
      let filteredServices = data.services || [];
      if (dur[0] > 0 || dur[1] < 8) {
        filteredServices = filteredServices.filter((service: Service) =>
          service.duration >= dur[0] && service.duration <= dur[1]
        );
      }
      setServices(filteredServices);
    }, 'No se pudieron cargar los servicios.');
  }, [
    searchTerm,
    selectedCategory,
    location,
    durationRange,
    selectedType,
    selectedIntent,
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
      selectedIntent: 'OFFER' as const,
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
    setSelectedIntent('OFFER');
    setNearLat(null);
    setNearLng(null);
    setRadiusKm(10);
    setUseNearby(false);
    // Fetch with empty filters immediately so results update on first click
    fetchServices(emptyFilters);
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      showToast({ message: 'Tu navegador no soporta geolocalización.', severity: 'warning' });
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
        showToast({ message: 'No se pudo obtener tu ubicación. Revisa los permisos del navegador.', severity: 'warning' });
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

  const activeFiltersCount = [
    Boolean(selectedCategory),
    Boolean(location.trim()),
    Boolean(selectedType),
    durationRange[0] > 0 || durationRange[1] < 8,
    useNearby,
    selectedIntent !== 'OFFER',
  ].filter(Boolean).length;

  const pageContentSx = {
    width: '100%',
    maxWidth: 1240,
    mx: 'auto',
    px: { xs: 2, md: 3 },
  };

  const getServiceMapPopupContent = useCallback((service: Service) => {
    const address = service.formattedAddress || service.location || 'Ubicación no disponible';
    const category = getCategoryDisplayName(service.category);
    const imageBlock = service.imageUrl
      ? `
        <div style="height:120px;overflow:hidden;background:#e5e7eb;">
          <img src="${service.imageUrl}" alt="" style="width:100%;height:100%;object-fit:cover;display:block;" />
        </div>
      `
      : `
        <div style="height:120px;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#ede9fe 0%,#f5f3ff 100%);font-size:34px;">
          📦
        </div>
      `;

    return `
      <div style="width:280px;overflow:hidden;border-radius:18px;background:#ffffff;color:#0f172a;font-family:Inter,system-ui,-apple-system,sans-serif;">
        ${imageBlock}
        <div style="padding:14px 14px 12px;">
          <div style="display:inline-flex;align-items:center;border-radius:999px;background:#F4BF61;color:#111827;font-size:11px;font-weight:700;padding:4px 10px;margin-bottom:10px;">
            ${category} · ${service.intent === 'REQUEST' ? 'Solicitud' : 'Servicio'}
          </div>
          <div style="font-size:16px;line-height:1.3;font-weight:800;margin-bottom:6px;">
            ${service.title}
          </div>
          <div style="font-size:12px;line-height:1.45;color:#64748b;margin-bottom:10px;">
            ${address}
          </div>
          <div style="display:flex;justify-content:space-between;gap:10px;margin-bottom:12px;">
            <div style="padding:8px 10px;border-radius:12px;background:#f8fafc;border:1px solid rgba(148,163,184,0.18);font-size:12px;">
              <div style="color:#64748b;margin-bottom:2px;">Duración</div>
              <div style="font-weight:800;color:#0f172a;">${service.duration}h</div>
            </div>
            <div style="padding:8px 10px;border-radius:12px;background:#f8fafc;border:1px solid rgba(148,163,184,0.18);font-size:12px;">
              <div style="color:#64748b;margin-bottom:2px;">Precio</div>
              <div style="font-weight:800;color:#0f172a;">${service.price} créditos</div>
            </div>
          </div>
          <a href="/services/${service.id}" style="display:inline-flex;align-items:center;gap:8px;color:#8A33FD;font-weight:800;font-size:13px;text-decoration:none;">
            Ver detalles <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
    `;
  }, [getCategoryDisplayName]);

  const servicesWithCoordinates = useMemo(
    () => visibleServices.filter((service) => typeof service.latitude === 'number' && typeof service.longitude === 'number'),
    [visibleServices],
  );

  useEffect(() => {
    if (useNearby && nearLat !== null && nearLng !== null) {
      setMapCenter({ lat: nearLat, lng: nearLng });
      return;
    }

    if (!mapsLoaded || typeof window === 'undefined') return;

    const preferredLocation = userProfile?.location?.trim();
    const googleObj = window.google;

    if (!preferredLocation || !googleObj?.maps?.Geocoder) {
      setMapCenter({ lat: 40.4168, lng: -3.7038 });
      return;
    }

    const geocoder = new googleObj.maps.Geocoder();
    geocoder.geocode({ address: preferredLocation }, (results: GoogleGeocoderResult[], status: string) => {
      if (status === 'OK' && results[0]?.geometry?.location) {
        setMapCenter({
          lat: results[0].geometry.location.lat(),
          lng: results[0].geometry.location.lng(),
        });
      }
    });
  }, [mapsLoaded, userProfile?.location, useNearby, nearLat, nearLng]);

  useEffect(() => {
    if (viewMode !== 'map' || !mapsLoaded || !mapContainerRef.current || typeof window === 'undefined') return;

    const googleObj = window.google;
    if (!googleObj?.maps) return;
    const mapsApi = googleObj.maps;

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = new mapsApi.Map(mapContainerRef.current, {
        center: mapCenter,
        zoom: useNearby ? 12 : 6,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });
      infoWindowRef.current = new mapsApi.InfoWindow();
    } else {
      mapInstanceRef.current.setCenter(mapCenter);
    }

    const map = mapInstanceRef.current;
    if (!map) return;

    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    const bounds = new mapsApi.LatLngBounds();

    if (useNearby && nearLat !== null && nearLng !== null) {
      const userMarker = new mapsApi.Marker({
        position: { lat: nearLat, lng: nearLng },
        map,
        title: 'Tu ubicación',
        icon: {
          path: mapsApi.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#2563eb',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
      });
      markersRef.current.push(userMarker);
      bounds.extend({ lat: nearLat, lng: nearLng });
    }

    servicesWithCoordinates.forEach((service) => {
      const position = { lat: service.latitude as number, lng: service.longitude as number };
      const marker = new mapsApi.Marker({
        position,
        map,
        title: service.title,
        animation: mapsApi.Animation.DROP,
      });

      marker.addListener('click', () => {
        infoWindowRef.current?.setContent(getServiceMapPopupContent(service));
        infoWindowRef.current?.open({
          anchor: marker,
          map,
        });
      });

      markersRef.current.push(marker);
      bounds.extend(position);
    });

    if (servicesWithCoordinates.length > 0 || (useNearby && nearLat !== null && nearLng !== null)) {
      map.fitBounds(bounds, 80);
      if ((servicesWithCoordinates.length === 1 && !useNearby) || (servicesWithCoordinates.length <= 2 && useNearby)) {
        mapsApi.event.addListenerOnce(map, 'bounds_changed', () => {
          map.setZoom(Math.min(map.getZoom() ?? 12, 13));
        });
      }
    } else {
      map.setCenter(mapCenter);
      map.setZoom(useNearby ? 12 : 6);
    }
  }, [viewMode, mapsLoaded, servicesWithCoordinates, mapCenter, useNearby, nearLat, nearLng, getServiceMapPopupContent]);

  return (
    <Layout>
      {googleMapsApiKey && (
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}`}
          strategy="afterInteractive"
          onLoad={() => setMapsLoaded(true)}
        />
      )}
      <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100%', py: 4 }}>
        <Box sx={pageContentSx}>
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
          <Drawer
            anchor="left"
            open={filtersOpen}
            onClose={() => setFiltersOpen(false)}
            PaperProps={{
              sx: {
                width: { xs: '100%', sm: 380 },
                p: { xs: 2, sm: 2.5 },
                bgcolor: '#f8fafc',
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, mb: 2 }}>
              <Box>
                <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 800, letterSpacing: '0.08em' }}>
                  EXPLORA MEJOR
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>
                  {t("services.filters.title")}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  Ajusta categorías, formato, ubicación y duración para ver resultados más relevantes.
                </Typography>
              </Box>
              <IconButton onClick={() => setFiltersOpen(false)}>
                <CloseRounded />
              </IconButton>
            </Box>

            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mb: 2 }}>
              <Chip label={`${activeFiltersCount} filtros activos`} size="small" color={activeFiltersCount > 0 ? 'primary' : 'default'} />
              {selectedIntent !== 'ALL' && <Chip label={selectedIntent === 'REQUEST' ? 'Viendo solicitudes' : 'Viendo servicios'} size="small" variant="outlined" />}
              {showFavoritesOnly && <Chip label="Solo favoritos" size="small" color="error" variant="outlined" />}
            </Stack>

            <FilterSidebar
              drawerMode
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
              onApplyFilters={() => {
                fetchServices();
                setFiltersOpen(false);
              }}
              onClearFilters={handleClearFilters}
              onClearCategory={() => { setSelectedCategory(''); fetchServices({ selectedCategory: '' }); }}
              onClearType={() => { setSelectedType(''); fetchServices({ selectedType: '' }); }}
              onClearLocation={() => { setLocation(''); fetchServices({ location: '' }); }}
              onClearDuration={() => { setDurationRange([0, 8]); fetchServices({ durationRange: [0, 8] }); }}
            />
          </Drawer>

          <Box sx={{ width: '100%' }}>
            <Box sx={{ mb: 2.5 }}>
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  minHeight: 42,
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '14px',
                    minHeight: '42px',
                    py: 1,
                    px: 2,
                  },
                  '& .Mui-selected': {
                    color: '#8A33FD',
                    fontWeight: 700,
                  },
                  '& .MuiTabs-indicator': {
                    backgroundColor: '#8A33FD',
                    height: 3,
                    borderRadius: 999,
                  },
                }}
              >
                <Tab label={t("services.tabs.offers")} />
                <Tab label={t("services.tabs.my_services")} disabled={!user?.sub} />
              </Tabs>
            </Box>

            <Paper
              sx={{
                mb: 3,
                p: { xs: 1.5, md: 2 },
                borderRadius: 3,
                border: '1px solid rgba(148, 163, 184, 0.16)',
                boxShadow: '0 14px 32px rgba(15,23,42,0.05)',
                backgroundColor: '#fff',
              }}
            >
              <Stack spacing={1.5}>
                <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1.5} justifyContent="space-between" alignItems={{ xs: 'stretch', lg: 'center' }}>
                  <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ rowGap: 1 }}>
                    <Button
                      variant={filtersOpen ? 'contained' : 'outlined'}
                      startIcon={<FilterListRounded />}
                      onClick={() => setFiltersOpen(true)}
                      sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 999, px: 2.25 }}
                    >
                      Filtros
                    </Button>
                    {activeFiltersCount > 0 && (
                      <Chip label={`${activeFiltersCount} activos`} size="small" color="primary" sx={{ fontWeight: 700 }} />
                    )}
                    {showFavoritesOnly && <Chip label="Solo favoritos" size="small" color="error" variant="outlined" sx={{ fontWeight: 700 }} />}
                  </Stack>

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25} alignItems={{ xs: 'stretch', sm: 'center' }}>
                    <Box>
                      <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 800, letterSpacing: '0.08em', display: 'block', lineHeight: 1.2 }}>
                        Resumen
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700 }}>
                      {loading ? t("common.loading") : `${visibleServices.length} ${selectedIntent === 'REQUEST' ? 'solicitudes' : 'servicios'} ${t("common.found")}`}
                      </Typography>
                    </Box>
                    <Button
                      variant="contained"
                      onClick={() => router.push('/services/create')}
                      sx={{
                        textTransform: 'none',
                        fontWeight: 700,
                        bgcolor: '#8A33FD',
                        px: 2.5,
                        py: 1,
                        borderRadius: 999,
                        boxShadow: '0 6px 18px rgba(138, 51, 253, 0.24)',
                        '&:hover': { bgcolor: '#7028E0' },
                      }}
                    >
                      + {selectedIntent === 'REQUEST' ? 'Crear solicitud' : 'Nueva publicación'}
                    </Button>
                  </Stack>
                </Stack>

                <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} justifyContent="space-between" alignItems={{ xs: 'stretch', md: 'center' }}>
                  <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ rowGap: 1 }}>
                    <Box sx={{ display: 'inline-flex', p: 0.5, borderRadius: 999, bgcolor: 'rgba(15,23,42,0.04)', gap: 0.5, flexWrap: 'wrap' }}>
                      <Button
                        variant={selectedIntent === 'OFFER' ? 'contained' : 'text'}
                        onClick={() => setSelectedIntent('OFFER')}
                        sx={{ textTransform: 'none', borderRadius: 999, px: 2, fontWeight: 700, minHeight: 36 }}
                      >
                        Servicios
                      </Button>
                      <Button
                        variant={selectedIntent === 'REQUEST' ? 'contained' : 'text'}
                        onClick={() => setSelectedIntent('REQUEST')}
                        sx={{ textTransform: 'none', borderRadius: 999, px: 2, fontWeight: 700, minHeight: 36 }}
                      >
                        Solicitudes
                      </Button>
                    </Box>

                    <Box sx={{ display: 'inline-flex', p: 0.5, borderRadius: 999, bgcolor: 'rgba(15,23,42,0.04)', gap: 0.5, flexWrap: 'wrap' }}>
                      <Button
                        variant={viewMode === 'list' ? 'contained' : 'text'}
                        startIcon={<ViewListRounded />}
                        onClick={() => setViewMode('list')}
                        sx={{ textTransform: 'none', borderRadius: 999, px: 2, fontWeight: 700, minHeight: 36 }}
                      >
                        Lista
                      </Button>
                      <Button
                        variant={viewMode === 'map' ? 'contained' : 'text'}
                        startIcon={<MapRounded />}
                        onClick={() => setViewMode('map')}
                        sx={{ textTransform: 'none', borderRadius: 999, px: 2, fontWeight: 700, minHeight: 36 }}
                      >
                        Mapa
                      </Button>
                    </Box>

                    <Button
                      variant={showFavoritesOnly ? 'contained' : 'outlined'}
                      onClick={() => setShowFavoritesOnly((prev) => !prev)}
                      disabled={favoritesCount === 0 && !showFavoritesOnly}
                      sx={{ textTransform: 'none', borderRadius: 999, px: 2.25, fontWeight: 700, opacity: favoritesCount === 0 && !showFavoritesOnly ? 0.6 : 1 }}
                    >
                      {favoritesCount > 0 ? `Favoritos (${favoritesCount})` : 'Favoritos'}
                    </Button>
                  </Stack>

                  <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ rowGap: 1 }}>
                    <Button
                      variant={useNearby ? 'contained' : 'outlined'}
                      size="small"
                      onClick={handleUseMyLocation}
                      disabled={isLocating}
                      sx={{ textTransform: 'none', borderRadius: 999, fontWeight: 700 }}
                    >
                      {isLocating ? 'Obteniendo ubicación…' : 'Usar mi ubicación'}
                    </Button>
                    <Button
                      variant="text"
                      size="small"
                      onClick={handleDisableNearby}
                      disabled={!useNearby}
                      sx={{ textTransform: 'none', fontWeight: 700 }}
                    >
                      Quitar cercanía
                    </Button>
                    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap', px: 1, py: 0.5, borderRadius: 999, bgcolor: 'rgba(15,23,42,0.04)' }}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700, px: 0.5 }}>
                        Radio:
                      </Typography>
                      <Button size="small" variant={radiusKm === 5 ? 'contained' : 'text'} onClick={() => handleRadiusChange(5)} sx={{ minWidth: 52, borderRadius: 999, fontWeight: 700 }}>
                        5 km
                      </Button>
                      <Button size="small" variant={radiusKm === 10 ? 'contained' : 'text'} onClick={() => handleRadiusChange(10)} sx={{ minWidth: 56, borderRadius: 999, fontWeight: 700 }}>
                        10 km
                      </Button>
                      <Button size="small" variant={radiusKm === 25 ? 'contained' : 'text'} onClick={() => handleRadiusChange(25)} sx={{ minWidth: 56, borderRadius: 999, fontWeight: 700 }}>
                        25 km
                      </Button>
                    </Box>
                  </Stack>
                </Stack>
              </Stack>
            </Paper>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
              </Box>
            ) : viewMode === 'map' ? (
              <Box sx={{ display: 'grid', gap: 2.5 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    border: '1px solid rgba(148, 163, 184, 0.18)',
                    backgroundColor: '#fff',
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap', mb: 1.5 }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem' }}>
                        {selectedIntent === 'REQUEST' ? 'Explora solicitudes en el mapa' : 'Explora servicios en el mapa'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Centro: {useNearby ? 'tu ubicación actual' : (userProfile?.location || 'Madrid')}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', width: { xs: '100%', md: 'auto' } }}>
                      <Chip icon={<PlaceRounded />} label={`${servicesWithCoordinates.length} con coordenadas`} size="small" />
                      {visibleServices.length > servicesWithCoordinates.length && (
                        <Chip label={`${visibleServices.length - servicesWithCoordinates.length} sin mapa`} size="small" variant="outlined" />
                      )}
                      {showFavoritesOnly && <Chip label="solo favoritos" size="small" color="error" variant="outlined" />}
                    </Box>
                  </Box>

                  {!googleMapsApiKey ? (
                    <Box sx={{ py: 8, textAlign: 'center' }}>
                      <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                        Google Maps no está configurado en frontend.
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Añade la API key para habilitar la vista de mapa.
                      </Typography>
                    </Box>
                  ) : (
                    <Box
                      ref={mapContainerRef}
                      sx={{
                        width: '100%',
                        height: { xs: 420, md: 560 },
                        borderRadius: 3,
                        overflow: 'hidden',
                        background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)',
                      }}
                    />
                  )}
                </Paper>
              </Box>
            ) : (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(3, minmax(0, 1fr))' },
                  justifyContent: 'stretch',
                  gap: 3,
                }}
              >
                {visibleServices.map((service) => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </Box>
            )}

            {!loading && visibleServices.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                  {activeTab === 1
                    ? (selectedIntent === 'REQUEST' ? 'Aún no has publicado solicitudes.' : t("services.empty_states.no_my_services"))
                    : showFavoritesOnly
                      ? 'No tienes publicaciones guardadas como favoritas.'
                      : (selectedIntent === 'REQUEST' ? 'No hay solicitudes disponibles con estos filtros.' : t("services.empty_states.no_services"))}
                </Typography>
                <Button
                  variant="outlined"
                  onClick={activeTab === 1 ? () => router.push('/services/create') : handleClearFilters}
                  sx={{ textTransform: 'none' }}
                >
                  {activeTab === 1
                    ? t("services.empty_states.create_first")
                    : t("services.filters.clear")}
                </Button>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </Layout>
  );
}
