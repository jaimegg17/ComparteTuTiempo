import { Card, CardContent, Box, Typography, Chip, Avatar, Button, Stack } from '@mui/material';
import { Clock, ChatBubble } from 'iconoir-react';
import { useRouter } from 'next/router';
import { RatingButton } from '@/components/ratings';
import type { Exchange, ExchangeState } from '@/types/exchange.types';

interface ExchangeCardProps {
  exchange: Exchange;
  currentUserId?: string;
  onAccept?: (id: number) => void;
  onReject?: (id: number) => void;
  onStart?: (id: number) => void;
  onComplete?: (id: number) => void;
  onRatingSubmitted?: () => void;
  loading?: boolean;
}

const STATE_CONFIG: Record<ExchangeState, { label: string; color: 'default' | 'warning' | 'success' | 'info' | 'error' }> = {
  PENDING: { label: 'Pendiente', color: 'warning' },
  CONFIRMED: { label: 'Confirmado', color: 'info' },
  IN_PROGRESS: { label: 'En progreso', color: 'info' },
  COMPLETED: { label: 'Completado', color: 'success' },
  REJECTED: { label: 'Rechazado', color: 'error' },
  CANCELLED: { label: 'Cancelado', color: 'default' },
};

export function ExchangeCard({ exchange, currentUserId, onAccept, onReject, onStart, onComplete, onRatingSubmitted, loading }: ExchangeCardProps) {
  const router = useRouter();
  const isProvider = currentUserId === exchange.offeredById;
  const isRequester = currentUserId === exchange.requestedById;
  const otherUser = isProvider ? exchange.requestedBy : exchange.offeredBy;

  const stateConfig = STATE_CONFIG[exchange.state];

  // Only provider can accept/reject
  const canAccept = isProvider && exchange.state === 'PENDING';
  const canReject = isProvider && exchange.state === 'PENDING';
  
  // Only requester can start the exchange
  const canStart = isRequester && exchange.state === 'CONFIRMED';
  
  // Only provider can complete the exchange
  const canComplete = isProvider && exchange.state === 'IN_PROGRESS';
  
  // Only requester can rate completed exchanges
  const canRate = isRequester && exchange.state === 'COMPLETED';

  return (
    <Card sx={{ mb: 2, '&:hover': { boxShadow: 3 }, transition: 'box-shadow 0.2s' }}>
      <CardContent>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: { xs: 'wrap', md: 'nowrap' } }}>
          {/* Service Image */}
          <Box 
            sx={{ 
              width: { xs: '100%', md: 120 }, 
              height: 120, 
              bgcolor: 'grey.200', 
              borderRadius: 2,
              overflow: 'hidden',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
            onClick={() => router.push(`/services/${exchange.serviceId}`)}
          >
            {exchange.service?.imageUrl ? (
              <img 
                src={exchange.service.imageUrl} 
                alt={exchange.service.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <Typography sx={{ fontSize: '48px' }}>📦</Typography>
            )}
          </Box>

          {/* Info */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1, gap: 1 }}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 600, 
                    fontSize: '16px',
                    mb: 0.5,
                    cursor: 'pointer',
                    '&:hover': { color: 'primary.main' },
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                  onClick={() => router.push(`/services/${exchange.serviceId}`)}
                >
                  {exchange.service?.title || 'Servicio'}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                  <Chip label={stateConfig.label} color={stateConfig.color} size="small" sx={{ height: 20, fontSize: '11px' }} />
                  {exchange.service?.category && (
                    <Chip label={exchange.service.category} size="small" variant="outlined" sx={{ height: 20, fontSize: '10px' }} />
                  )}
                </Box>
              </Box>
            </Box>

            {/* User Info */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Avatar src={otherUser?.imageUrl} alt={otherUser?.name} sx={{ width: 28, height: 28 }}>
                {otherUser?.name?.[0]?.toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="body2" sx={{ fontSize: '13px', fontWeight: 500 }}>
                  {isProvider ? 'Solicitado por' : 'Ofrecido por'}: {otherUser?.name}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '11px' }}>
                  {new Date(exchange.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                </Typography>
              </Box>
            </Box>

            {/* Duration */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5 }}>
              <Clock width={16} height={16} />
              <Typography variant="body2" sx={{ fontSize: '13px', fontWeight: 600, color: 'primary.main' }}>
                {exchange.service?.duration || 0}h
              </Typography>
            </Box>

            {/* Message */}
            {exchange.message && (
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ 
                  fontSize: '12px', 
                  mb: 2,
                  fontStyle: 'italic',
                  p: 1,
                  bgcolor: 'grey.50',
                  borderRadius: 1,
                  borderLeft: '3px solid',
                  borderColor: 'primary.main'
                }}
              >
                &quot;{exchange.message}&quot;
              </Typography>
            )}

            {/* Actions */}
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {/* Chat Button - Always available for active exchanges */}
              {(exchange.state === 'PENDING' || exchange.state === 'CONFIRMED' || exchange.state === 'IN_PROGRESS') && (
                <Button 
                  size="small" 
                  variant="outlined"
                  startIcon={<ChatBubble width={16} height={16} />}
                  onClick={() => router.push(`/exchanges/${exchange.id}`)}
                  sx={{ textTransform: 'none', fontSize: '13px' }}
                >
                  Chat
                </Button>
              )}
              
              {/* Other Actions */}
              {(canAccept || canReject || canStart || canComplete) && (
                <>
                  {canAccept && (
                  <Button 
                    size="small" 
                    variant="contained" 
                    onClick={() => onAccept?.(exchange.id)}
                    disabled={loading}
                    sx={{ textTransform: 'none', fontSize: '13px' }}
                  >
                    Aceptar
                  </Button>
                )}
                {canReject && (
                  <Button 
                    size="small" 
                    variant="outlined" 
                    color="error"
                    onClick={() => onReject?.(exchange.id)}
                    disabled={loading}
                    sx={{ textTransform: 'none', fontSize: '13px' }}
                  >
                    Rechazar
                  </Button>
                )}
                {canStart && (
                  <Button 
                    size="small" 
                    variant="contained"
                    onClick={() => onStart?.(exchange.id)}
                    disabled={loading}
                    sx={{ textTransform: 'none', fontSize: '13px' }}
                  >
                    Iniciar intercambio
                  </Button>
                )}
                {canComplete && (
                  <Button 
                    size="small" 
                    variant="contained"
                    color="success"
                    onClick={() => onComplete?.(exchange.id)}
                    disabled={loading}
                    sx={{ textTransform: 'none', fontSize: '13px' }}
                  >
                    Completar
                  </Button>
                )}
                </>
              )}
              
              {/* Rating Button for completed exchanges */}
              {canRate && (
                <RatingButton
                  exchangeId={exchange.id}
                  serviceId={exchange.serviceId}
                  serviceTitle={exchange.service?.title || 'Servicio'}
                  onRatingSubmitted={onRatingSubmitted ?? (() => {})}
                />
              )}
            </Stack>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
