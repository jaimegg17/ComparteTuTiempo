import { Box, Chip, Stack, Typography, Button } from '@mui/material';
import { Event, Schedule } from '@mui/icons-material';
import type { Event as CommunityEvent } from '@comparte-tu-tiempo/contracts';

interface CommunityActivitySectionProps {
  events: CommunityEvent[];
  isUserLoggedIn?: boolean;
  isRegistered?: (eventId: number) => boolean;
  onToggleRegistration?: (eventId: number) => void;
}

export function CommunityActivitySection({ events, isUserLoggedIn = false, isRegistered, onToggleRegistration }: CommunityActivitySectionProps) {
  return (
    <Box sx={{ bgcolor: '#fff', p: { xs: 2.5, md: 3 }, borderRadius: 3, boxShadow: 1 }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
        Actividad / Eventos
      </Typography>

      {events.length === 0 ? (
        <Typography color="text.secondary">Aún no hay actividad disponible para esta comunidad.</Typography>
      ) : (
        <Stack spacing={1.5}>
          {events.slice(0, 6).map((event) => {
            const registered = isRegistered?.(event.id) ?? false;
            return (
              <Box
                key={event.id}
                sx={{
                  p: 1.5,
                  border: '1px solid #efefef',
                  borderRadius: 2,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 1,
                  flexWrap: 'wrap',
                }}
              >
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography sx={{ fontWeight: 600 }}>{event.title}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {event.description || 'Sin descripción'}
                  </Typography>
                  <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                    <Chip icon={<Schedule />} size="small" label={new Date(event.date).toLocaleString('es-ES')} />
                    <Chip icon={<Event />} size="small" label={event.location || 'Online'} variant="outlined" />
                    {typeof event.capacity === 'number' && <Chip size="small" label={`Aforo ${event.capacity}`} variant="outlined" />}
                    {registered && <Chip size="small" label="Te has apuntado" color="success" />}
                  </Stack>
                </Box>

                <Button
                  variant={registered ? 'outlined' : 'contained'}
                  color={registered ? 'inherit' : 'primary'}
                  onClick={() => onToggleRegistration?.(event.id)}
                  disabled={!isUserLoggedIn}
                  sx={{ textTransform: 'none', fontWeight: 700 }}
                >
                  {registered ? 'Cancelar inscripción' : isUserLoggedIn ? 'Apuntarme' : 'Inicia sesión'}
                </Button>
              </Box>
            );
          })}
        </Stack>
      )}
    </Box>
  );
}
