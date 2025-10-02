import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Container,
  Box,
  Button,
  Paper,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import { Layout } from '@/components/Layout';
import { useUser } from '@auth0/nextjs-auth0/client';
import { ServiceImageSection } from '@/components/services/ServiceImageSection';
import { ServiceDetailHeader } from '@/components/services/ServiceDetailHeader';
import { ServiceInfoTabs } from '@/components/services/ServiceInfoTabs';
import { ServiceActionFooter } from '@/components/services/ServiceActionFooter';
import { ServiceRequestDialog } from '@/components/services/ServiceRequestDialog';
import type { Service } from '@/types/service.types';

export default function ServiceDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useUser();
  
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Request dialog state
  const [openRequestDialog, setOpenRequestDialog] = useState(false);
  const [requestMessage, setRequestMessage] = useState('');
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    
    const fetchService = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`http://localhost:3001/api/services/${id}`);
        
        if (!response.ok) {
          throw new Error('Error al cargar el servicio');
        }
        
        const data = await response.json();
        console.log('Service data from API:', data.service);
        console.log('Has detailedDescription:', !!data.service.detailedDescription);
        setService(data.service);
      } catch (err: any) {
        console.error('Error fetching service:', err);
        setError(err.message || 'Error al cargar el servicio');
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [id]);

  const handleRequestService = async () => {
    if (!user) {
      alert('Debes iniciar sesión para solicitar un servicio');
      return;
    }

    try {
      setRequestLoading(true);
      setRequestError(null);

      const token = await fetch('/api/auth/token').then(res => res.json()).then(data => data.accessToken);

      const response = await fetch('http://localhost:3001/api/exchanges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          serviceId: service?.id,
          offeredById: service?.user?.id || service?.userId,
          message: requestMessage || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al solicitar el servicio');
      }

      setRequestSuccess(true);
      setTimeout(() => {
        setOpenRequestDialog(false);
        setRequestSuccess(false);
        setRequestMessage('');
        router.push('/exchanges');
      }, 2000);

    } catch (err: any) {
      console.error('Error requesting service:', err);
      setRequestError(err.message || 'Error al solicitar el servicio');
    } finally {
      setRequestLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  if (error || !service) {
    return (
      <Layout>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Alert severity="error">{error || 'Servicio no encontrado'}</Alert>
          <Button onClick={() => router.push('/services')} sx={{ mt: 2 }}>
            ← Volver a servicios
          </Button>
        </Container>
      </Layout>
    );
  }

  const isOwnService = user?.sub === service.user?.id || user?.sub === service.userId;

  return (
    <Layout>
      <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100%', py: 6 }}>
        <Container maxWidth="lg">
          <Button 
            onClick={() => router.push('/services')} 
            sx={{ mb: 3, textTransform: 'none' }}
          >
            ← Volver a servicios
          </Button>

          <Paper sx={{ overflow: 'hidden', mb: 3 }}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', lg: 'row' },
              minHeight: { lg: '600px' }
            }}>
              {/* Imagen del servicio - Izquierda */}
              <ServiceImageSection 
                imageUrl={service.imageUrl}
                title={service.title}
                status={service.status}
              />

              {/* Info del servicio - Derecha */}
              <Box sx={{ 
                width: { xs: '100%', lg: '50%' },
                p: { xs: 3, md: 4, lg: 5 },
                display: 'flex',
                flexDirection: 'column'
              }}>
                <ServiceDetailHeader 
                  category={service.category}
                  title={service.title}
                />

                <ServiceInfoTabs service={service} />

                <Divider sx={{ my: 2 }} />

                <ServiceActionFooter 
                  isOwnService={isOwnService}
                  status={service.status}
                  duration={service.duration}
                  isUserLoggedIn={!!user}
                  onRequestService={() => setOpenRequestDialog(true)}
                />
              </Box>
            </Box>
          </Paper>
        </Container>
      </Box>

      {/* Modal de Solicitud */}
      <ServiceRequestDialog 
        open={openRequestDialog}
        loading={requestLoading}
        success={requestSuccess}
        error={requestError}
        message={requestMessage}
        providerName={service.user?.name}
        duration={service.duration}
        onClose={() => setOpenRequestDialog(false)}
        onMessageChange={setRequestMessage}
        onSubmit={handleRequestService}
      />
    </Layout>
  );
}
