import { FormEvent, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  FormControlLabel,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import type { CommunityCreate } from '@comparte-tu-tiempo/contracts';

export interface CommunityFormValues {
  name: string;
  description: string;
  isPrivate: boolean;
}

interface CommunityFormProps {
  initialValues?: CommunityFormValues;
  submitting?: boolean;
  submitLabel?: string;
  serverError?: string | null;
  onCancel?: () => void;
  onSubmit: (values: CommunityFormValues) => Promise<void>;
}

const NAME_MIN = 3;
const NAME_MAX = 100;
const DESCRIPTION_MIN = 10;
const DESCRIPTION_MAX = 500;

const toCreatePayload = (values: CommunityFormValues, creatorId: string): CommunityCreate => ({
  name: values.name.trim(),
  description: values.description.trim(),
  isPrivate: values.isPrivate,
  creatorId,
});

export const communityFormToPayload = toCreatePayload;

export function CommunityForm({
  initialValues,
  submitting = false,
  submitLabel = 'Crear comunidad',
  serverError,
  onCancel,
  onSubmit,
}: CommunityFormProps) {
  const [values, setValues] = useState<CommunityFormValues>(
    initialValues ?? {
      name: '',
      description: '',
      isPrivate: false,
    },
  );
  const [touched, setTouched] = useState({ name: false, description: false });

  const errors = useMemo(() => {
    const next = {
      name: '',
      description: '',
    };

    const normalizedName = values.name.trim();
    const normalizedDescription = values.description.trim();

    if (!normalizedName) {
      next.name = 'El nombre es obligatorio.';
    } else if (normalizedName.length < NAME_MIN || normalizedName.length > NAME_MAX) {
      next.name = `El nombre debe tener entre ${NAME_MIN} y ${NAME_MAX} caracteres.`;
    }

    if (!normalizedDescription) {
      next.description = 'La descripción es obligatoria.';
    } else if (
      normalizedDescription.length < DESCRIPTION_MIN ||
      normalizedDescription.length > DESCRIPTION_MAX
    ) {
      next.description = `La descripción debe tener entre ${DESCRIPTION_MIN} y ${DESCRIPTION_MAX} caracteres.`;
    }

    return next;
  }, [values]);

  const isValid = !errors.name && !errors.description;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTouched({ name: true, description: true });

    if (!isValid || submitting) return;
    await onSubmit(values);
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack spacing={2}>
        {serverError && <Alert severity="error">{serverError}</Alert>}

        <TextField
          label="Nombre de la comunidad"
          value={values.name}
          onChange={(event) => setValues((prev) => ({ ...prev, name: event.target.value }))}
          onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
          required
          fullWidth
          error={touched.name && Boolean(errors.name)}
          helperText={touched.name && errors.name ? errors.name : `${values.name.trim().length}/${NAME_MAX}`}
        />

        <TextField
          label="Descripción"
          value={values.description}
          onChange={(event) => setValues((prev) => ({ ...prev, description: event.target.value }))}
          onBlur={() => setTouched((prev) => ({ ...prev, description: true }))}
          required
          fullWidth
          multiline
          minRows={4}
          error={touched.description && Boolean(errors.description)}
          helperText={
            touched.description && errors.description
              ? errors.description
              : `${values.description.trim().length}/${DESCRIPTION_MAX}`
          }
        />

        <Box>
          <FormControlLabel
            control={
              <Switch
                checked={values.isPrivate}
                onChange={(event) =>
                  setValues((prev) => ({ ...prev, isPrivate: event.target.checked }))
                }
              />
            }
            label={values.isPrivate ? 'Comunidad privada' : 'Comunidad pública'}
          />
          <Typography variant="body2" color="text.secondary">
            {values.isPrivate
              ? 'Solo miembros aprobados podrán unirse.'
              : 'Cualquier usuario podrá unirse a la comunidad.'}
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} justifyContent="flex-end" sx={{ pt: 1 }}>
          {onCancel && (
            <Button onClick={onCancel} disabled={submitting} sx={{ textTransform: 'none' }}>
              Cancelar
            </Button>
          )}
          <Button
            type="submit"
            variant="contained"
            disabled={submitting || !isValid}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            {submitting ? 'Guardando...' : submitLabel}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
