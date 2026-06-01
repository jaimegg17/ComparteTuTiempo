import { FormEvent, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

export interface CommunityEventFormValues {
  title: string;
  description: string;
  date: string;
  location: string;
  capacity: string;
}

interface CommunityEventFormProps {
  initialValues?: CommunityEventFormValues;
  submitting?: boolean;
  serverError?: string | null;
  submitLabel?: string;
  onCancel?: () => void;
  onSubmit: (values: CommunityEventFormValues) => Promise<void>;
}

export function CommunityEventForm({
  initialValues,
  submitting = false,
  serverError,
  submitLabel = 'Publicar evento',
  onCancel,
  onSubmit,
}: CommunityEventFormProps) {
  const [values, setValues] = useState<CommunityEventFormValues>({
    title: initialValues?.title ?? '',
    description: initialValues?.description ?? '',
    date: initialValues?.date ?? '',
    location: initialValues?.location ?? '',
    capacity: initialValues?.capacity ?? '',
  });

  const errors = useMemo(() => {
    return {
      title: values.title.trim().length < 5 ? 'El título debe tener al menos 5 caracteres.' : '',
      description:
        values.description.trim().length < 10
          ? 'La descripción debe tener al menos 10 caracteres.'
          : '',
      date: !values.date ? 'Debes indicar una fecha.' : '',
    };
  }, [values]);

  const isValid = !errors.title && !errors.description && !errors.date;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isValid || submitting) return;
    await onSubmit(values);
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        bgcolor: '#fff',
        borderRadius: 3,
        p: { xs: 2.5, md: 3 },
        boxShadow: '0 12px 28px rgba(15,23,42,0.06)',
        border: '1px solid rgba(148,163,184,0.16)',
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>
        {submitLabel === 'Guardar cambios' ? 'Editar evento' : 'Publicar evento'}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
        Crea una actividad visible en el detalle de la comunidad u organización.
      </Typography>

      <Stack spacing={2}>
        {serverError && <Alert severity="error">{serverError}</Alert>}

        <TextField
          label="Título"
          value={values.title}
          onChange={(event) => setValues((prev) => ({ ...prev, title: event.target.value }))}
          error={Boolean(errors.title)}
          helperText={errors.title || ' '}
          fullWidth
        />

        <TextField
          label="Descripción"
          value={values.description}
          onChange={(event) => setValues((prev) => ({ ...prev, description: event.target.value }))}
          error={Boolean(errors.description)}
          helperText={errors.description || ' '}
          multiline
          minRows={3}
          fullWidth
        />

        <TextField
          label="Fecha y hora"
          type="datetime-local"
          value={values.date}
          onChange={(event) => setValues((prev) => ({ ...prev, date: event.target.value }))}
          error={Boolean(errors.date)}
          helperText={errors.date || ' '}
          InputLabelProps={{ shrink: true }}
          fullWidth
        />

        <TextField
          label="Ubicación"
          value={values.location}
          onChange={(event) => setValues((prev) => ({ ...prev, location: event.target.value }))}
          fullWidth
        />

        <TextField
          label="Capacidad"
          type="number"
          value={values.capacity}
          onChange={(event) => setValues((prev) => ({ ...prev, capacity: event.target.value }))}
          fullWidth
        />

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
          {onCancel && (
            <Button
              type="button"
              variant="text"
              onClick={onCancel}
              sx={{ textTransform: 'none', fontWeight: 700 }}
            >
              Cancelar
            </Button>
          )}
          <Button
            type="submit"
            variant="contained"
            disabled={submitting || !isValid}
            sx={{ textTransform: 'none', fontWeight: 700 }}
          >
            {submitting ? 'Guardando...' : submitLabel}
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}
