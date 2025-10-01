import { useState, useEffect } from 'react';
import { Container, Typography, Box, CircularProgress, Button } from '@mui/material';
import { Layout } from '@/components/Layout';
import { ServiceCard } from '@/components/ServiceCard';
import { FilterSidebar } from '@/components/filters/FilterSidebar';

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
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [location, setLocation] = useState('');
  const [durationRange, setDurationRange] = useState<number[]>([0, 8]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  // Estados de colapso para cada filtro
  const [openCategories, setOpenCategories] = useState(false);
  const [openLocation, setOpenLocation] = useState(false);
  const [openType, setOpenType] = useState(false);
  const [openDuration, setOpenDuration] = useState(false);

  const categories = ['EDUCACION', 'HOGAR', 'TECNOLOGIA', 'SALUD', 'DEPORTES', 'ARTE', 'OTROS'];
  const types = ['PRESENCIAL', 'VIRTUAL', 'HIBRIDO'];

  const fetchServices = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('q', searchTerm);
      
      if (selectedCategories.length > 0) {
        selectedCategories.forEach(cat => params.append('category', cat));
      }
      
      if (location) params.append('location', location);
      
      if (durationRange[0] > 0) params.append('minPrice', (durationRange[0] * 60).toString());
      if (durationRange[1] < 8) params.append('maxPrice', (durationRange[1] * 60).toString());
      
      if (selectedTypes.length > 0) {
        selectedTypes.forEach(type => params.append('type', type));
      }

      const response = await fetch(`http://localhost:3001/api/services?${params.toString()}`);
      const data = await response.json();
      
      let filteredServices = data.services || [];
      if (durationRange[0] > 0 || durationRange[1] < 8) {
        filteredServices = filteredServices.filter((service: Service) => 
          service.duration >= durationRange[0] && service.duration <= durationRange[1]
        );
      }
      
      setServices(filteredServices);
      setTotal(filteredServices.length);
    } catch (error) {
      console.error('Error al cargar servicios:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategories([]);
    setLocation('');
    setDurationRange([0, 8]);
    setSelectedTypes([]);
    setTimeout(() => fetchServices(), 100);
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
    setSelectedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const toggleType = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  return (
    <Layout>
      <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100%', py: 4 }}>
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', gap: 3 }}>
            {/* Sidebar de Filtros */}
            <FilterSidebar
              categories={categories}
              selectedCategories={selectedCategories}
              openCategories={openCategories}
              setOpenCategories={setOpenCategories}
              toggleCategory={toggleCategory}
              location={location}
              openLocation={openLocation}
              setOpenLocation={setOpenLocation}
              setLocation={setLocation}
              types={types}
              selectedTypes={selectedTypes}
              openType={openType}
              setOpenType={setOpenType}
              toggleType={toggleType}
              durationRange={durationRange}
              openDuration={openDuration}
              setOpenDuration={setOpenDuration}
              handleDurationChange={handleDurationChange}
              handleMinDurationChange={handleMinDurationChange}
              handleMaxDurationChange={handleMaxDurationChange}
              onApplyFilters={fetchServices}
              onClearFilters={handleClearFilters}
            />

            {/* Grid de Servicios */}
            <Box sx={{ flex: 1 }}>
              <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '18px' }}>
                  {loading ? 'Cargando...' : `${total} servicios encontrados`}
                </Typography>
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
                    No se encontraron servicios con los filtros seleccionados
                  </Typography>
                  <Button 
                    variant="outlined" 
                    onClick={handleClearFilters}
                    sx={{ textTransform: 'none' }}
                  >
                    Limpiar Filtros
                  </Button>
                </Box>
              )}
            </Box>
          </Box>
        </Container>
      </Box>
    </Layout>
  );
}
