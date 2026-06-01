import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { Layout } from '@/components/Layout';
import { useUser } from '@auth0/nextjs-auth0/client';
import { ExchangeCard, ExchangeFilters } from '@/components/exchanges';
import type { Exchange, ExchangeState } from '@/types/exchange.types';

const STATE_COPY: Partial<Record<ExchangeState, string>> = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmado',
  IN_PROGRESS: 'En progreso',
  COMPLETED: 'Completado',
  REJECTED: 'Rechazado',
  CANCELLED: 'Cancelado',
};

export default function ExchangesPage() {
  const router = useRouter();
  const { user, isLoading: userLoading } = useUser();

  const [allExchanges, setAllExchanges] = useState<Exchange[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [notice, setNotice] = useState<{ severity: 'success' | 'error' | 'info'; message: string } | null>(null);

  const [activeTab, setActiveTab] = useState<'all' | 'received' | 'sent'>('all');
  const [activeState, setActiveState] = useState<ExchangeState | 'all'>('all');

  const getErrorMessage = (err: unknown, fallback: string) =>
    err instanceof Error ? err.message : fallback;

  const fetchExchanges = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const tokenResponse = await fetch('/api/auth/token');
      if (!tokenResponse.ok) {
        throw new Error('No se pudo obtener el token de autenticación');
      }
      const tokenData = await tokenResponse.json();
      const token = tokenData.accessToken;

      if (!token) {
        throw new Error('Token de autenticación no disponible');
      }

      const params = new URLSearchParams();
      if (activeTab === 'received') {
        params.append('offeredById', user.sub!);
      } else if (activeTab === 'sent') {
        params.append('requestedById', user.sub!);
      }

      const response = await fetch(`http://localhost:3001/api/exchanges?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al cargar los intercambios');
      }

      const data = await response.json();
      setAllExchanges(data.exchanges || []);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Error al cargar los intercambios'));
    } finally {
      setLoading(false);
    }
  }, [user, activeTab]);

  useEffect(() => {
    if (!userLoading && user) {
      fetchExchanges();
    }
  }, [user, userLoading, fetchExchanges]);

  const filteredExchanges = useMemo(() => {
    if (activeState === 'all') return allExchanges;
    return allExchanges.filter((exchange) => exchange.state === activeState);
  }, [allExchanges, activeState]);

  const counts = useMemo(
    () => ({
      pending: allExchanges.filter((exchange) => exchange.state === 'PENDING').length,
      confirmed: allExchanges.filter((exchange) => exchange.state === 'CONFIRMED').length,
      inProgress: allExchanges.filter((exchange) => exchange.state === 'IN_PROGRESS').length,
      completed: allExchanges.filter((exchange) => exchange.state === 'COMPLETED').length,
    }),
    [allExchanges],
  );

  const activeTabCopy =
    activeTab === 'received'
      ? 'Solicitudes que te han enviado'
      : activeTab === 'sent'
        ? 'Solicitudes que has enviado'
        : 'Vista global de todos tus intercambios';

  const handleAction = async (id: number, newState: ExchangeState) => {
    if (!user) return;

    try {
      setActionLoading(true);
      setNotice(null);
      const token = await fetch('/api/auth/token').then((res) => res.json()).then((data) => data.accessToken);

      const response = await fetch(`http://localhost:3001/api/exchanges/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ state: newState }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar el intercambio');
      }

      setNotice({
        severity: 'success',
        message: `Intercambio actualizado a “${STATE_COPY[newState] || newState}”.`,
      });
      await fetchExchanges();
    } catch (err: unknown) {
      setNotice({
        severity: 'error',
        message: getErrorMessage(err, 'No se pudo actualizar el intercambio'),
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRatingSubmitted = useCallback(async () => {
    setNotice({ severity: 'success', message: 'Gracias por tu valoración. Hemos actualizado el intercambio.' });
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
        <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', py: 6 }}>
          <Box sx={{ maxWidth: 780, mx: 'auto', px: { xs: 2, md: 3 } }}>
            <Paper sx={{ p: { xs: 3, md: 4 }, borderRadius: 4, boxShadow: '0 20px 55px rgba(15, 23, 42, 0.08)' }}>
              <Alert severity="warning" sx={{ mb: 2 }}>
                Inicia sesión para consultar tus solicitudes, gestionar estados y seguir tus intercambios activos.
              </Alert>
              <Button variant="contained" href="/api/auth/login" sx={{ textTransform: 'none', fontWeight: 700 }}>
                Iniciar sesión
              </Button>
            </Paper>
          </Box>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', py: { xs: 4, md: 6 } }}>
        <Box sx={{ maxWidth: 1160, mx: 'auto', px: { xs: 2, md: 3 } }}>
          <Paper
            sx={{
              mb: 3,
              p: { xs: 2.5, md: 3.5 },
              borderRadius: 4,
              background: 'linear-gradient(135deg, #ffffff 0%, #f8f5ff 100%)',
              border: '1px solid rgba(148, 163, 184, 0.16)',
              boxShadow: '0 18px 50px rgba(15, 23, 42, 0.05)',
            }}
          >
            <Typography variant="overline" sx={{ color: '#8A33FD', fontWeight: 800, letterSpacing: '0.08em' }}>
              SEGUIMIENTO DE INTERCAMBIOS
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
              Mis intercambios
            </Typography>
            <Typography color="text.secondary" sx={{ maxWidth: 820, lineHeight: 1.7, mb: 3, fontSize: { xs: '0.95rem', md: '1rem' } }}>
              Consulta tus solicitudes, confirma próximos pasos y mantén claro en qué punto está cada colaboración.
            </Typography>

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.25} useFlexGap flexWrap="wrap" sx={{ rowGap: 1.25 }}>
              <Paper variant="outlined" sx={{ p: 1.5, minWidth: 160, borderRadius: 3 }}>
                <Typography variant="caption" color="text.secondary">Vista actual</Typography>
                <Typography sx={{ fontWeight: 700 }}>{activeTabCopy}</Typography>
              </Paper>
              <Paper variant="outlined" sx={{ p: 1.5, minWidth: 120, borderRadius: 3 }}>
                <Typography variant="caption" color="text.secondary">Total</Typography>
                <Typography sx={{ fontWeight: 800, fontSize: { xs: '1.15rem', md: '1.35rem' } }}>{allExchanges.length}</Typography>
              </Paper>
              <Paper variant="outlined" sx={{ p: 1.5, minWidth: 120, borderRadius: 3 }}>
                <Typography variant="caption" color="text.secondary">Pendientes</Typography>
                <Typography sx={{ fontWeight: 800, fontSize: { xs: '1.15rem', md: '1.35rem' }, color: '#b26a00' }}>{counts.pending}</Typography>
              </Paper>
              <Paper variant="outlined" sx={{ p: 1.5, minWidth: 120, borderRadius: 3 }}>
                <Typography variant="caption" color="text.secondary">En curso</Typography>
                <Typography sx={{ fontWeight: 800, fontSize: { xs: '1.15rem', md: '1.35rem' }, color: '#1d4ed8' }}>{counts.inProgress}</Typography>
              </Paper>
              <Paper variant="outlined" sx={{ p: 1.5, minWidth: 120, borderRadius: 3 }}>
                <Typography variant="caption" color="text.secondary">Completados</Typography>
                <Typography sx={{ fontWeight: 800, fontSize: { xs: '1.15rem', md: '1.35rem' }, color: '#15803d' }}>{counts.completed}</Typography>
              </Paper>
            </Stack>
          </Paper>

          {notice && (
            <Alert severity={notice.severity} sx={{ mb: 2 }} onClose={() => setNotice(null)}>
              {notice.message}
            </Alert>
          )}

          <ExchangeFilters
            activeTab={activeTab}
            onTabChange={setActiveTab}
            activeState={activeState}
            onStateChange={setActiveState}
            counts={counts}
          />

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : filteredExchanges.length === 0 ? (
            <Paper sx={{ p: { xs: 3, md: 4 }, textAlign: 'center', borderRadius: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                No hay intercambios en este estado
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 560, mx: 'auto' }}>
                {activeTab === 'received'
                  ? 'Todavía no has recibido solicitudes para este filtro. Publicar servicios claros y completos suele ayudar a generar más movimiento.'
                  : activeTab === 'sent'
                    ? 'Aún no has enviado solicitudes que encajen con este filtro. Puedes explorar servicios y probar nuevas categorías.'
                    : 'No tienes intercambios que coincidan con la selección actual. Cambia de pestaña o ajusta el estado para ver más actividad.'}
              </Typography>
              <Button variant="contained" onClick={() => router.push('/services')} sx={{ textTransform: 'none', fontWeight: 700 }}>
                Explorar servicios
              </Button>
            </Paper>
          ) : (
            <Stack spacing={2}>
              {filteredExchanges.map((exchange) => (
                <ExchangeCard
                  key={exchange.id}
                  exchange={exchange}
                  currentUserId={user.sub || ''}
                  onAccept={(exchangeId) => handleAction(exchangeId, 'CONFIRMED')}
                  onReject={(exchangeId) => handleAction(exchangeId, 'REJECTED')}
                  onStart={(exchangeId) => handleAction(exchangeId, 'IN_PROGRESS')}
                  onComplete={(exchangeId) => handleAction(exchangeId, 'COMPLETED')}
                  onRatingSubmitted={handleRatingSubmitted}
                  loading={actionLoading}
                />
              ))}
            </Stack>
          )}
        </Box>
      </Box>
    </Layout>
  );
}
