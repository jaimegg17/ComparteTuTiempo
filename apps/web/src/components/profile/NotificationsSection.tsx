import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Stack,
  Switch,
  FormControlLabel,
  Divider,
  Button,
} from '@mui/material';
import { NotificationsOutlined, TuneOutlined } from '@mui/icons-material';
import type { NotificationPreferences } from '@/hooks/useNotificationPreferences';
import type { UserNotification } from '@/hooks/useNotifications';

interface NotificationsSectionProps {
  preferences: NotificationPreferences;
  onToggle: (key: keyof NotificationPreferences, value: boolean) => void;
  notifications?: UserNotification[];
  unreadCount?: number;
  onMarkAsRead?: (notificationId: number) => void | Promise<void>;
  onMarkAllAsRead?: () => void | Promise<void>;
}

const preferenceLabels: Record<keyof NotificationPreferences, { title: string; description: string }> = {
  exchanges: {
    title: 'Intercambios',
    description: 'Avisos sobre solicitudes, confirmaciones y cierres de intercambio.',
  },
  messages: {
    title: 'Mensajes',
    description: 'Recordatorios cuando haya nueva actividad en conversaciones activas.',
  },
  events: {
    title: 'Eventos',
    description: 'Cambios relevantes en eventos guardados o próximos dentro de comunidades.',
  },
  communities: {
    title: 'Comunidades',
    description: 'Novedades sobre solicitudes, cambios de normas y actividad destacada.',
  },
};

export const NotificationsSection: React.FC<NotificationsSectionProps> = ({
  preferences,
  onToggle,
  notifications = [],
  unreadCount = 0,
  onMarkAsRead,
  onMarkAllAsRead,
}) => {
  const enabledCount = Object.values(preferences).filter(Boolean).length;

  return (
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4, mb: 4 }}>
      <Box sx={{ width: { xs: '100%', md: '34%' } }}>
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, color: 'text.primary' }}>
          Preferencias de cuenta
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7, mb: 2 }}>
          Ajusta qué avisos quieres priorizar para mantener tu experiencia más útil y menos invasiva.
        </Typography>
        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
          <Chip label={`${enabledCount}/4 activas`} color="primary" sx={{ fontWeight: 700 }} />
          <Chip label="Configuración guardada en este navegador" variant="outlined" sx={{ fontWeight: 600 }} />
        </Stack>
      </Box>

      <Card
        sx={{
          width: { xs: '100%', md: '66%' },
          borderRadius: 3,
          border: '1px solid rgba(148,163,184,0.16)',
          boxShadow: '0 14px 36px rgba(15,23,42,0.08)',
        }}
      >
        <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', sm: 'center' }} sx={{ mb: 2.5 }}>
            <Box sx={{ width: 52, height: 52, borderRadius: 2, bgcolor: 'rgba(138,51,253,0.10)', color: '#7A2EF6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <NotificationsOutlined />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ mb: 0.5, fontWeight: 700, color: 'text.primary' }}>
                Notificaciones relevantes
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                Elige qué avisos quieres destacar y revisa las actualizaciones importantes sobre tus intercambios, eventos y comunidades.
              </Typography>
            </Box>
          </Stack>

          <Divider sx={{ mb: 2.5 }} />

          <Stack spacing={1.5}>
            {(Object.keys(preferences) as Array<keyof NotificationPreferences>).map((key) => (
              <Box
                key={key}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: { xs: 'flex-start', sm: 'center' },
                  gap: 2,
                  p: 2,
                  borderRadius: 2.5,
                  bgcolor: 'rgba(248,250,252,0.88)',
                  border: '1px solid rgba(148,163,184,0.14)',
                }}
              >
                <Box>
                  <Typography sx={{ fontWeight: 700, mb: 0.25 }}>{preferenceLabels[key].title}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    {preferenceLabels[key].description}
                  </Typography>
                </Box>

                <FormControlLabel
                  control={<Switch checked={preferences[key]} onChange={(event) => onToggle(key, event.target.checked)} />}
                  label={preferences[key] ? 'Activa' : 'Pausada'}
                  sx={{ mr: 0, ml: 'auto', whiteSpace: 'nowrap' }}
                />
              </Box>
            ))}
          </Stack>

          <Box sx={{ mt: 2.5, display: 'flex', alignItems: 'center', gap: 1.1 }}>
            <TuneOutlined sx={{ color: 'text.secondary', fontSize: 18 }} />
            <Typography variant="body2" color="text.secondary">
              Puedes revisar y ajustar estas preferencias cuando cambien tus prioridades de uso.
            </Typography>
          </Box>

          <Divider sx={{ my: 2.5 }} />

          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={1.5} sx={{ mb: 1.5 }}>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                Historial reciente
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {unreadCount > 0 ? `${unreadCount} notificaciones sin leer` : 'No tienes notificaciones sin leer'}
              </Typography>
            </Box>
            <Button onClick={() => onMarkAllAsRead?.()} disabled={unreadCount === 0} sx={{ textTransform: 'none', fontWeight: 700 }}>
              Marcar todas como leídas
            </Button>
          </Stack>

          {notifications.length === 0 ? (
            <Box sx={{ p: 2, borderRadius: 2.5, bgcolor: 'rgba(248,250,252,0.88)', border: '1px solid rgba(148,163,184,0.14)' }}>
              <Typography variant="body2" color="text.secondary">
                Todavía no hay notificaciones persistentes para esta cuenta.
              </Typography>
            </Box>
          ) : (
            <Stack spacing={1.25}>
              {notifications.slice(0, 6).map((notification) => (
                <Box
                  key={notification.id}
                  sx={{
                    p: 2,
                    borderRadius: 2.5,
                    bgcolor: notification.isRead ? 'rgba(248,250,252,0.72)' : 'rgba(138,51,253,0.06)',
                    border: notification.isRead ? '1px solid rgba(148,163,184,0.14)' : '1px solid rgba(138,51,253,0.16)',
                  }}
                >
                  <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1}>
                    <Box>
                      <Typography sx={{ fontWeight: 700, mb: 0.35 }}>{notification.title}</Typography>
                      {notification.body && (
                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                          {notification.body}
                        </Typography>
                      )}
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.8 }}>
                        {new Date(notification.createdAt).toLocaleString('es-ES')}
                      </Typography>
                    </Box>
                    {!notification.isRead && (
                      <Button
                        size="small"
                        onClick={() => onMarkAsRead?.(notification.id)}
                        sx={{ textTransform: 'none', fontWeight: 700, alignSelf: { xs: 'flex-start', sm: 'center' } }}
                      >
                        Marcar leída
                      </Button>
                    )}
                  </Stack>
                </Box>
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};
