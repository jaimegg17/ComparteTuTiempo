import { FormEvent, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useTranslation } from '@/hooks/useTranslation';
import { LocationAutocompleteField } from '@/components/location/LocationAutocompleteField';

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
  submitLabel,
  onCancel,
  onSubmit,
}: CommunityEventFormProps) {
  const { t } = useTranslation();
  const effectiveSubmitLabel = submitLabel ?? t('communities.events.publish');
  const [values, setValues] = useState<CommunityEventFormValues>({
    title: initialValues?.title ?? '',
    description: initialValues?.description ?? '',
    date: initialValues?.date ?? '',
    location: initialValues?.location ?? '',
    capacity: initialValues?.capacity ?? '',
  });

  const errors = useMemo(() => {
    return {
      title: values.title.trim().length < 5 ? t('communities.events.titleError') : '',
      description:
        values.description.trim().length < 10
          ? t('communities.events.descriptionError')
          : '',
      date: !values.date ? t('communities.events.dateError') : '',
    };
  }, [values, t]);

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
        {effectiveSubmitLabel === t('communities.events.save') ? t('communities.events.edit') : t('communities.events.publish')}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
        {t('communities.events.description')}
      </Typography>

      <Stack spacing={2}>
        {serverError && <Alert severity="error">{serverError}</Alert>}

        <TextField
          label={t('communities.events.title')}
          value={values.title}
          onChange={(event) => setValues((prev) => ({ ...prev, title: event.target.value }))}
          error={Boolean(errors.title)}
          helperText={errors.title || ' '}
          fullWidth
        />

        <TextField
          label={t('communities.events.eventDescription')}
          value={values.description}
          onChange={(event) => setValues((prev) => ({ ...prev, description: event.target.value }))}
          error={Boolean(errors.description)}
          helperText={errors.description || ' '}
          multiline
          minRows={3}
          fullWidth
        />

        <TextField
          label={t('communities.events.dateTime')}
          type="datetime-local"
          value={values.date}
          onChange={(event) => setValues((prev) => ({ ...prev, date: event.target.value }))}
          error={Boolean(errors.date)}
          helperText={errors.date || ' '}
          InputLabelProps={{ shrink: true }}
          fullWidth
        />

        <LocationAutocompleteField
          label={t('communities.events.location')}
          value={values.location}
          onChange={(value) => setValues((prev) => ({ ...prev, location: value }))}
          fullWidth
        />

        <TextField
          label={t('communities.events.capacityLabel')}
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
              {t('common.cancel')}
            </Button>
          )}
          <Button
            type="submit"
            variant="contained"
            disabled={submitting || !isValid}
            sx={{ textTransform: 'none', fontWeight: 700 }}
          >
            {submitting ? t('communities.form.saving') : effectiveSubmitLabel}
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}
