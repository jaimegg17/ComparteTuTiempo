import { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Stack,
  Typography,
} from '@mui/material';
import { DeleteOutline, EditOutlined, Event, Schedule } from '@mui/icons-material';
import type { Event as CommunityEvent } from '@comparte-tu-tiempo/contracts';
import {
  CommunityEventForm,
  type CommunityEventFormValues,
} from '@/components/communities/forms/CommunityEventForm';
import { useTranslation } from '@/hooks/useTranslation';

interface CommunityEventsManagerProps {
  events: CommunityEvent[];
  submitting?: boolean;
  serverError?: string | null;
  onCreate: (values: CommunityEventFormValues) => Promise<void>;
  onUpdate: (eventId: number, values: CommunityEventFormValues) => Promise<void>;
  onDelete: (eventId: number) => Promise<void>;
}

const toFormValues = (event: CommunityEvent): CommunityEventFormValues => ({
  title: event.title,
  description: event.description ?? '',
  date: new Date(event.date).toISOString().slice(0, 16),
  location: event.location ?? '',
  capacity: event.capacity ? String(event.capacity) : '',
});

export function CommunityEventsManager({
  events,
  submitting = false,
  serverError,
  onCreate,
  onUpdate,
  onDelete,
}: CommunityEventsManagerProps) {
  const { t, currentLanguage } = useTranslation();
  const [editingEventId, setEditingEventId] = useState<number | null>(null);

  const sortedEvents = useMemo(
    () => [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [events],
  );

  return (
    <Stack spacing={2.5}>
      <CommunityEventForm
        submitting={submitting}
        serverError={serverError}
        onSubmit={onCreate}
      />

      <Box
        sx={{
          bgcolor: '#fff',
          borderRadius: 3,
          p: { xs: 2.5, md: 3 },
          boxShadow: '0 12px 28px rgba(15,23,42,0.06)',
          border: '1px solid rgba(148,163,184,0.16)',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>
          {t('communities.events.publishedTitle')}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
          {t('communities.events.publishedDescription')}
        </Typography>

        {sortedEvents.length === 0 ? (
          <Alert severity="info">{t('communities.events.empty')}</Alert>
        ) : (
          <Stack spacing={2}>
            {sortedEvents.map((event) => (
              <Box
                key={event.id}
                sx={{
                  p: 2,
                  border: '1px solid rgba(148,163,184,0.18)',
                  borderRadius: 2.5,
                }}
              >
                {editingEventId === event.id ? (
                  <CommunityEventForm
                    initialValues={toFormValues(event)}
                    submitting={submitting}
                    serverError={serverError}
                    submitLabel={t('communities.events.save')}
                    onCancel={() => setEditingEventId(null)}
                    onSubmit={async (values) => {
                      await onUpdate(event.id, values);
                      setEditingEventId(null);
                    }}
                  />
                ) : (
                  <Stack spacing={1.5}>
                    <Box>
                      <Typography sx={{ fontWeight: 700, mb: 0.5 }}>
                        {event.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {event.description || t('communities.events.noDescription')}
                      </Typography>
                    </Box>

                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} useFlexGap flexWrap="wrap">
                      <Chip
                        icon={<Schedule />}
                        size="small"
                        label={new Date(event.date).toLocaleString(currentLanguage === 'en' ? 'en-US' : 'es-ES')}
                      />
                      <Chip
                        icon={<Event />}
                        size="small"
                        label={event.location || t('communities.events.online')}
                        variant="outlined"
                      />
                      {typeof event.capacity === 'number' && (
                        <Chip size="small" label={t('communities.events.capacity', { capacity: event.capacity })} variant="outlined" />
                      )}
                    </Stack>

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                      <Button
                        startIcon={<EditOutlined />}
                        variant="outlined"
                        onClick={() => setEditingEventId(event.id)}
                        sx={{ textTransform: 'none', fontWeight: 700 }}
                      >
                        {t('common.edit')}
                      </Button>
                      <Button
                        startIcon={<DeleteOutline />}
                        variant="outlined"
                        color="error"
                        onClick={() => onDelete(event.id)}
                        sx={{ textTransform: 'none', fontWeight: 700 }}
                      >
                        {t('common.delete')}
                      </Button>
                    </Stack>
                  </Stack>
                )}
              </Box>
            ))}
          </Stack>
        )}
      </Box>
    </Stack>
  );
}
