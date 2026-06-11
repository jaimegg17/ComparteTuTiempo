import { Avatar, Box, Button, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import { ChatBubble, Clock } from 'iconoir-react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { RatingButton } from '@/components/ratings';
import { useTranslation } from '@/hooks/useTranslation';
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

const STATE_CONFIG: Record<ExchangeState, { labelKey: string; color: 'default' | 'warning' | 'success' | 'info' | 'error' }> = {
  PENDING: { labelKey: 'exchangesPage.states.PENDING', color: 'warning' },
  CONFIRMED: { labelKey: 'exchangesPage.states.CONFIRMED', color: 'info' },
  IN_PROGRESS: { labelKey: 'exchangesPage.states.IN_PROGRESS', color: 'info' },
  COMPLETED: { labelKey: 'exchangesPage.states.COMPLETED', color: 'success' },
  REJECTED: { labelKey: 'exchangesPage.states.REJECTED', color: 'error' },
  CANCELLED: { labelKey: 'exchangesPage.states.CANCELLED', color: 'default' },
};

export function ExchangeCard({ exchange, currentUserId, onAccept, onReject, onStart, onComplete, onRatingSubmitted, loading }: ExchangeCardProps) {
  const router = useRouter();
  const { t, currentLanguage } = useTranslation();
  const locale = currentLanguage === 'en' ? 'en-US' : 'es-ES';
  const isProvider = currentUserId === exchange.offeredById;
  const isRequester = currentUserId === exchange.requestedById;
  const otherUser = isProvider ? exchange.requestedBy : exchange.offeredBy;
  const otherUserName = otherUser?.name || otherUser?.email || otherUser?.id || t('exchangesPage.card.unknownUser');

  const stateConfig = STATE_CONFIG[exchange.state];
  const canAccept = isProvider && exchange.state === 'PENDING';
  const canReject = isProvider && exchange.state === 'PENDING';
  const canStart = isRequester && exchange.state === 'CONFIRMED';
  const canComplete = isProvider && exchange.state === 'IN_PROGRESS';
  const canRate = isRequester && exchange.state === 'COMPLETED';
  const relationshipCopy = isProvider ? t('exchangesPage.card.requestedService') : t('exchangesPage.card.sentService');

  return (
    <Card
      sx={{
        borderRadius: 4,
        border: '1px solid rgba(148, 163, 184, 0.16)',
        boxShadow: '0 16px 40px rgba(15, 23, 42, 0.05)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 18px 48px rgba(15, 23, 42, 0.08)',
        },
      }}
    >
      <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: { xs: 'wrap', md: 'nowrap' } }}>
          <Box
            role="button"
            tabIndex={0}
            aria-label={t('exchangesPage.card.openService', { title: exchange.service?.title || t('exchangesPage.card.serviceFallback') })}
            sx={{
              width: { xs: '100%', sm: 180, md: 148 },
              height: { xs: 180, sm: 160, md: 148 },
              bgcolor: 'grey.200',
              borderRadius: 3,
              overflow: 'hidden',
              flexShrink: 0,
              cursor: 'pointer',
              position: 'relative',
            }}
            onClick={() => router.push(`/services/${exchange.serviceId}`)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                router.push(`/services/${exchange.serviceId}`);
              }
            }}
          >
            {exchange.service?.imageUrl ? (
              <Image
                src={exchange.service.imageUrl}
                alt={exchange.service.title}
                fill
                sizes="(max-width: 900px) 100vw, 148px"
                style={{ objectFit: 'cover' }}
              />
            ) : (
              <Box sx={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center' }}>
                <Typography sx={{ fontSize: '3rem' }}>📦</Typography>
              </Box>
            )}
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={1.5} sx={{ mb: 1.25 }}>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 800, letterSpacing: '0.08em' }}>
                  {relationshipCopy}
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 800,
                    fontSize: '1.05rem',
                    lineHeight: 1.35,
                    mt: 0.25,
                    mb: 0.75,
                    cursor: 'pointer',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    '&:hover': { color: 'primary.main' },
                  }}
                  onClick={() => router.push(`/services/${exchange.serviceId}`)}
                >
                  {exchange.service?.title || t('exchangesPage.card.serviceFallback')}
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} useFlexGap flexWrap="wrap" sx={{ alignItems: { xs: 'stretch', sm: 'center' } }}>
                  <Chip label={t(stateConfig.labelKey)} color={stateConfig.color} size="small" sx={{ fontWeight: 700 }} />
                  {exchange.service?.category && <Chip label={exchange.service.category} size="small" variant="outlined" />}
                </Stack>
              </Box>

              <Box sx={{ textAlign: { xs: 'left', md: 'right' }, alignSelf: { xs: 'flex-start', md: 'auto' } }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  {t('exchangesPage.card.updated')}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {new Date(exchange.updatedAt).toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' })}
                </Typography>
              </Box>
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar src={otherUser?.imageUrl} alt={otherUserName} sx={{ width: 34, height: 34 }}>
                  {otherUserName[0]?.toUpperCase()}
                </Avatar>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, wordBreak: 'break-word' }}>
                    {isProvider ? t('exchangesPage.card.requestedBy') : t('exchangesPage.card.offeredBy')} {otherUserName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {t('exchangesPage.card.created', { date: new Date(exchange.createdAt).toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' }) })}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <Clock width={16} height={16} />
                <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  {t('exchangesPage.card.duration', { hours: exchange.service?.duration || 0 })}
                </Typography>
              </Box>
            </Stack>

            {exchange.message && (
              <Box
                sx={{
                  mb: 2,
                  p: 1.5,
                  bgcolor: 'grey.50',
                  borderRadius: 2.5,
                  border: '1px solid rgba(148, 163, 184, 0.14)',
                }}
              >
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 0.5 }}>
                  {t('exchangesPage.card.initialMessage')}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.65 }}>
                  {exchange.message}
                </Typography>
              </Box>
            )}

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1}
              useFlexGap
              flexWrap="wrap"
              sx={{
                alignItems: { xs: 'stretch', sm: 'center' },
                justifyContent: { xs: 'stretch', sm: 'flex-end' },
                ml: { sm: 'auto' },
                mt: 1,
              }}
            >
              {(exchange.state === 'PENDING' || exchange.state === 'CONFIRMED' || exchange.state === 'IN_PROGRESS') && (
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<ChatBubble width={16} height={16} />}
                  onClick={() => router.push(`/exchanges/${exchange.id}`)}
                  sx={{ textTransform: 'none', fontWeight: 700, width: { xs: '100%', sm: 'auto' } }}
                >
                  {t('exchangesPage.card.openChat')}
                </Button>
              )}

              <Button
                size="small"
                variant="text"
                onClick={() => router.push(`/services/${exchange.serviceId}`)}
                sx={{ textTransform: 'none', fontWeight: 700, width: { xs: '100%', sm: 'auto' } }}
              >
                {t('exchangesPage.card.viewService')}
              </Button>

              {canAccept && (
                <Button size="small" variant="contained" onClick={() => onAccept?.(exchange.id)} disabled={loading} sx={{ textTransform: 'none', fontWeight: 700, width: { xs: '100%', sm: 'auto' } }}>
                  {t('exchangesPage.card.accept')}
                </Button>
              )}
              {canReject && (
                <Button size="small" variant="outlined" color="error" onClick={() => onReject?.(exchange.id)} disabled={loading} sx={{ textTransform: 'none', fontWeight: 700, width: { xs: '100%', sm: 'auto' } }}>
                  {t('exchangesPage.card.reject')}
                </Button>
              )}
              {canStart && (
                <Button size="small" variant="contained" onClick={() => onStart?.(exchange.id)} disabled={loading} sx={{ textTransform: 'none', fontWeight: 700, width: { xs: '100%', sm: 'auto' } }}>
                  {t('exchangesPage.card.start')}
                </Button>
              )}
              {canComplete && (
                <Button size="small" variant="contained" color="success" onClick={() => onComplete?.(exchange.id)} disabled={loading} sx={{ textTransform: 'none', fontWeight: 700, width: { xs: '100%', sm: 'auto' } }}>
                  {t('exchangesPage.card.complete')}
                </Button>
              )}
              {canRate && (
                <RatingButton
                  exchangeId={exchange.id}
                  serviceId={exchange.serviceId}
                  serviceTitle={exchange.service?.title || t('exchangesPage.card.serviceFallback')}
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
