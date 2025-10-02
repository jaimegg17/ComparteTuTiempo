import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Chip,
  Avatar,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider,
  Stack,
} from '@mui/material';
import { Layout } from '@/components/Layout';
import { Clock, Pin, User, Calendar } from 'iconoir-react';
import { useUser } from '@auth0/nextjs-auth0/client';

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
  imageUrl?: string;
  createdAt: string;
  userId: string;
  user?: {
    id: string;
    name: string;
    imageUrl?: string;
    location?: string;
  };
}

export default function ServiceDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useUser();
  
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estado del modal de solicitud
  const [openRequestDialog, setOpenRequestDialog] = useState(false);
  const [requestMessage, setRequestMessage] = useState('');
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);

  useEffect(() => {
    if (id) {
      fetchService();
    }
  }, [id]);

  const fetchService = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`http://localhost:3001/api/services/${id}`);
      
      if (!response.ok) {
        throw new Error('Servicio no encontrado');
      }
      
      const data = await response.json();
      setService(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar el servicio');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestService = async () => {
    if (!user) {
      router.push('/api/auth/login');
      return;
    }

    setRequestLoading(true);
    
    try {
      const response = await fetch('http://localhost:3001/api/exchanges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
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
        router.push('/exchanges'); // Redirigir a la página de exchanges
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al solicitar el servicio');
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
            Volver a servicios
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

          <Paper sx={{ overflow: 'hidden' }}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', lg: 'row' },
              minHeight: { lg: '600px' }
            }}>
              {/* Imagen del servicio - Izquierda */}
              <Box 
                sx={{ 
                  width: { xs: '100%', lg: '50%' },
                  height: { xs: '400px', lg: 'auto' },
                  bgcolor: 'grey.100',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  position: 'relative'
                }}
              >
                {service.imageUrl ? (
                  <img 
                    src={service.imageUrl} 
                    alt={service.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <Box sx={{ fontSize: '120px', color: 'grey.400' }}>📦</Box>
                )}
                
                {/* Status badge */}
                {service.status === 'ACTIVO' && (
                  <Chip
                    label="Disponible"
                    color="success"
                    sx={{
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      fontWeight: 600
                    }}
                  />
                )}
              </Box>

              {/* Info del servicio - Derecha */}
              <Box sx={{ 
                width: { xs: '100%', lg: '50%' },
                p: { xs: 3, md: 4, lg: 5 },
                display: 'flex',
                flexDirection: 'column'
              }}>
                {/* Categoría */}
                <Typography variant="caption" sx={{ 
                  color: 'text.secondary', 
                  textTransform: 'uppercase', 
                  letterSpacing: 1.5,
                  fontWeight: 600,
                  mb: 1
                }}>
                  {service.category}
                </Typography>

                {/* Título */}
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, color: 'grey.900' }}>
                  {service.title}
                </Typography>

                {/* Tipo */}
                <Box sx={{ mb: 3 }}>
                  <Chip label={service.type} size="small" variant="outlined" />
                </Box>

                {/* Info rápida con iconos */}
                <Stack direction="row" spacing={2} sx={{ mb: 3, flexWrap: 'wrap', gap: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Clock width={18} height={18} color="#666" />
                    <Typography variant="body2" color="text.secondary">
                      {service.duration} horas
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Pin width={18} height={18} color="#666" />
                    <Typography variant="body2" color="text.secondary">
                      {service.location}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Calendar width={18} height={18} color="#666" />
                    <Typography variant="body2" color="text.secondary">
                      {new Date(service.createdAt).toLocaleDateString('es-ES')}
                    </Typography>
                  </Box>
                </Stack>

                {/* Descripción */}
                <Typography variant="body1" sx={{ 
                  lineHeight: 1.8, 
                  color: 'text.secondary',
                  mb: 4,
                  flexGrow: 1
                }}>
                  {service.description}
                </Typography>

                <Divider sx={{ mb: 3 }} />

                {/* Usuario que ofrece */}
                {service.user && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block', textTransform: 'uppercase', fontSize: '11px' }}>
                      Ofrecido por
                    </Typography>
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 2,
                        p: 1.5,
                        bgcolor: 'grey.50',
                        borderRadius: 2,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': { bgcolor: 'grey.100', transform: 'translateX(4px)' }
                      }}
                      onClick={() => router.push(`/users/${service.user?.id || service.userId}`)}
                    >
                      <Avatar 
                        src={service.user.imageUrl} 
                        alt={service.user.name}
                        sx={{ width: 42, height: 42 }}
                      >
                        {service.user.name[0].toUpperCase()}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {service.user.name}
                        </Typography>
                        {service.user.location && (
                          <Typography variant="caption" color="text.secondary">
                            📍 {service.user.location}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Box>
                )}

                {/* Precio y botón */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 'auto' }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h4" color="primary" sx={{ fontWeight: 700 }}>
                      {service.duration}h
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      de intercambio
                    </Typography>
                  </Box>

                  {isOwnService ? (
                    <Chip label="Tu servicio" color="info" sx={{ py: 2.5, px: 2 }} />
                  ) : (
                    <Button
                      variant="contained"
                      size="large"
                      onClick={() => setOpenRequestDialog(true)}
                      disabled={service.status !== 'ACTIVO' || !user}
                      sx={{
                        py: 1.5,
                        px: 4,
                        fontWeight: 600,
                        textTransform: 'none',
                        borderRadius: 1,
                        minWidth: 160
                      }}
                    >
                      {service.status === 'ACTIVO' ? 'Solicitar' : 'No Disponible'}
                    </Button>
                  )}
                </Box>

                {!user && !isOwnService && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, textAlign: 'right' }}>
                    Inicia sesión para solicitar
                  </Typography>
                )}
              </Box>
            </Box>
          </Paper>
        </Container>
      </Box>

      {/* Modal de Solicitud */}
      <Dialog 
        open={openRequestDialog} 
        onClose={() => !requestLoading && setOpenRequestDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          Solicitar Servicio
        </DialogTitle>
        <DialogContent>
          {requestSuccess ? (
            <Alert severity="success" sx={{ mb: 2 }}>
              ¡Solicitud enviada correctamente! Redirigiendo...
            </Alert>
          ) : (
            <>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Estás a punto de solicitar el servicio <strong>{service.title}</strong>. 
                Se descontarán <strong>{service.duration} horas</strong> de tus créditos cuando se complete el servicio.
              </Typography>
              
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Mensaje opcional"
                placeholder="Añade un mensaje para el prestador del servicio..."
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
                disabled={requestLoading}
                sx={{ mt: 2 }}
              />
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={() => setOpenRequestDialog(false)}
            disabled={requestLoading || requestSuccess}
            sx={{ textTransform: 'none' }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleRequestService}
            disabled={requestLoading || requestSuccess}
            sx={{ textTransform: 'none', minWidth: 120 }}
          >
            {requestLoading ? <CircularProgress size={24} /> : 'Confirmar Solicitud'}
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
}

