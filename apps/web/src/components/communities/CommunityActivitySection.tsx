import { Box, Chip, Stack, Typography } from '@mui/material';
import { Event, Schedule } from '@mui/icons-material';
import type { Event as CommunityEvent } from '@comparte-tu-tiempo/contracts';

interface CommunityActivitySectionProps {
  events: CommunityEvent[];
}

export function CommunityActivitySection({ events }: CommunityActivitySectionProps) {
  return (
    <Box sx={{ bgcolor: '#fff', p: { xs: 2.5, md: 3 }, borderRadius: 3, boxShadow: 1 }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
        Actividad / Eventos
      </Typography>

      {events.length === 0 ? (
        <Typography color="text.secondary">Aún no hay actividad disponible para esta comunidad.</Typography>
      ) : (
        <Stack spacing={1.5}>
          {events.slice(0, 6).map((event) => (
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
              <Box>
                <Typography sx={{ fontWeight: 600 }}>{event.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {event.description || 'Sin descripción'}
                </Typography>
              </Box>
              <Stack direction="row" spacing={1}>
                <Chip icon={<Schedule />} size="small" label={new Date(event.date).toLocaleString('es-ES')} />
                <Chip icon={<Event />} size="small" label={event.location || 'Online'} variant="outlined" />
              </Stack>
            </Box>
          ))}
        </Stack>
      )}
    </Box>
  );
}
