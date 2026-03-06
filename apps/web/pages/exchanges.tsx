import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Button,
} from '@mui/material';
import { Layout } from '@/components/Layout';
import { useUser } from '@auth0/nextjs-auth0/client';
import { ExchangeCard, ExchangeFilters } from '@/components/exchanges';
import type { Exchange, ExchangeState } from '@/types/exchange.types';

export default function ExchangesPage() {
  const router = useRouter();
  const { user, isLoading: userLoading } = useUser();
  
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Filters
  const [activeTab, setActiveTab] = useState<'all' | 'received' | 'sent'>('all');
  const [activeState, setActiveState] = useState<ExchangeState | 'all'>('all');

  const getErrorMessage = (err: unknown, fallback: string) =>
    err instanceof Error ? err.message : fallback;

  const fetchExchanges = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Get token
      const tokenResponse = await fetch('/api/auth/token');
      if (!tokenResponse.ok) {
        throw new Error('No se pudo obtener el token de autenticación');
      }
      const tokenData = await tokenResponse.json();
      const token = tokenData.accessToken;

      if (!token) {
        throw new Error('Token de autenticación no disponible');
      }

      // Build query params
      const params = new URLSearchParams();
      if (activeTab === 'received') {
        params.append('offeredById', user.sub!);
      } else if (activeTab === 'sent') {
        params.append('requestedById', user.sub!);
      }
      if (activeState !== 'all') {
        params.append('state', activeState);
      }

      const response = await fetch(`http://localhost:3001/api/exchanges?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Exchange API error:', errorText);
        throw new Error('Error al cargar los intercambios');
      }

      const data = await response.json();
      setExchanges(data.exchanges || []);
    } catch (err: unknown) {
      console.error('Error fetching exchanges:', err);
      setError(getErrorMessage(err, 'Error al cargar los intercambios'));
    } finally {
      setLoading(false);
    }
  }, [user, activeTab, activeState]);

  useEffect(() => {
    if (!userLoading && user) {
      fetchExchanges();
    }
  }, [user, userLoading, fetchExchanges]);

  const handleAction = async (id: number, newState: ExchangeState) => {
    if (!user) return;

    try {
      setActionLoading(true);
      const token = await fetch('/api/auth/token').then(res => res.json()).then(data => data.accessToken);

      const response = await fetch(`http://localhost:3001/api/exchanges/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ state: newState }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar el intercambio');
      }

      // Refresh list
      await fetchExchanges();
    } catch (err: unknown) {
      console.error('Error updating exchange:', err);
      alert(getErrorMessage(err, 'Error al actualizar el intercambio'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleRatingSubmitted = useCallback(async () => {
    // Refresh exchanges to show updated data
    await fetchExchanges();
  }, [fetchExchanges]);

  if (userLoading) {
    return (
      <Layout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <Box sx={{ py: 4, px: { xs: 2, md: 3 } }}>
          <Alert severity="warning" sx={{ mb: 2 }}>
            You must log in to view your exchanges
          </Alert>
          <Button variant="contained" href="/api/auth/login">
            Log In
          </Button>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', py: 4 }}>
        <Box sx={{ px: { xs: 2, md: 3 } }}>
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              My Exchanges
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage your service requests and offers
            </Typography>
          </Box>

          {/* Filters */}
          <ExchangeFilters 
            activeTab={activeTab}
            onTabChange={setActiveTab}
            activeState={activeState}
            onStateChange={setActiveState}
          />

          {/* Content */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : exchanges.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                No hay intercambios
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {activeTab === 'received' 
                  ? 'No has recibido solicitudes aún' 
                  : activeTab === 'sent'
                  ? 'No has enviado solicitudes aún'
                  : 'No tienes intercambios registrados'}
              </Typography>
              <Button variant="contained" onClick={() => router.push('/services')}>
                Explorar Servicios
              </Button>
            </Box>
          ) : (
            <Box>
              {exchanges.map(exchange => (
                <ExchangeCard 
                  key={exchange.id}
                  exchange={exchange}
                  currentUserId={user.sub || ''}
                  onAccept={(id) => handleAction(id, 'CONFIRMED')}
                  onReject={(id) => handleAction(id, 'REJECTED')}
                  onStart={(id) => handleAction(id, 'IN_PROGRESS')}
                  onComplete={(id) => handleAction(id, 'COMPLETED')}
                  onRatingSubmitted={handleRatingSubmitted}
                  loading={actionLoading}
                />
              ))}
            </Box>
          )}
        </Box>
      </Box>
    </Layout>
  );
}
