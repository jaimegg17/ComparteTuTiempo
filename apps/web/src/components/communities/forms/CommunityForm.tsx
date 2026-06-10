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
import type { CommunityCreate, CommunityKind } from '@comparte-tu-tiempo/contracts';
import { ImageUpload } from '@/components/ui/ImageUpload';

export interface CommunityFormValues {
  name: string;
  description: string;
  topicsText: string;
  rulesText: string;
  imageUrl: string;
  isPrivate: boolean;
}

interface CommunityFormLabels {
  nameLabel?: string;
  descriptionLabel?: string;
  topicsLabel?: string;
  topicsHelperText?: string;
  rulesLabel?: string;
  rulesHelperText?: string;
  rulesRequiredMessage?: string;
  publicLabel?: string;
  privateLabel?: string;
  publicDescription?: string;
  privateDescription?: string;
}

interface CommunityFormProps {
  initialValues?: CommunityFormValues;
  submitting?: boolean;
  submitLabel?: string;
  serverError?: string | null;
  labels?: CommunityFormLabels;
  onCancel?: () => void;
  onSubmit: (values: CommunityFormValues) => Promise<void>;
}

const NAME_MIN = 3;
const NAME_MAX = 100;
const DESCRIPTION_MIN = 10;
const DESCRIPTION_MAX = 500;

type CommunityCreateRequest = Omit<CommunityCreate, 'creatorId'>;

const toCreatePayload = (
  values: CommunityFormValues,
  _creatorId: string,
  kind: CommunityKind = 'COMMUNITY',
): CommunityCreateRequest => ({
  name: values.name.trim(),
  description: values.description.trim(),
  topics: values.topicsText
    .split(',')
    .map((topic) => topic.trim())
    .filter(Boolean),
  rules: values.rulesText
    .split('\n')
    .map((rule) => rule.trim())
    .filter(Boolean),
  imageUrl: values.imageUrl.trim() || null,
  resources: [],
  kind,
  isPrivate: values.isPrivate,
});

export const communityFormToPayload = toCreatePayload;

const defaultLabels: Required<CommunityFormLabels> = {
  nameLabel: 'Nombre de la comunidad',
  descriptionLabel: 'Descripción',
  topicsLabel: 'Temas / categorías',
  topicsHelperText: 'Separa los temas con comas. Ej.: tecnología, idiomas, voluntariado',
  rulesLabel: 'Reglas de la comunidad',
  rulesHelperText: 'Escribe una regla por línea.',
  rulesRequiredMessage: 'Añade al menos una regla de comunidad.',
  publicLabel: 'Comunidad pública',
  privateLabel: 'Comunidad privada',
  publicDescription: 'Cualquier usuario podrá unirse a la comunidad.',
  privateDescription: 'Solo miembros aprobados podrán unirse.',
};

export function CommunityForm({
  initialValues,
  submitting = false,
  submitLabel = 'Crear comunidad',
  serverError,
  labels,
  onCancel,
  onSubmit,
}: CommunityFormProps) {
  const mergedLabels = { ...defaultLabels, ...labels };

  const [values, setValues] = useState<CommunityFormValues>(
    initialValues ?? {
      name: '',
      description: '',
      topicsText: '',
      rulesText: '',
      imageUrl: '',
      isPrivate: false,
    },
  );
  const [touched, setTouched] = useState({ name: false, description: false, rulesText: false });

  const errors = useMemo(() => {
    const next = {
      name: '',
      description: '',
      rulesText: '',
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

    const parsedRules = values.rulesText
      .split('\n')
      .map((rule) => rule.trim())
      .filter(Boolean);

    if (parsedRules.length === 0) {
      next.rulesText = mergedLabels.rulesRequiredMessage;
    }

    return next;
  }, [values, mergedLabels.rulesRequiredMessage]);

  const isValid = !errors.name && !errors.description && !errors.rulesText;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTouched({ name: true, description: true, rulesText: true });

    if (!isValid || submitting) return;
    await onSubmit(values);
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack spacing={2}>
        {serverError && <Alert severity="error">{serverError}</Alert>}

        <TextField
          label={mergedLabels.nameLabel}
          value={values.name}
          onChange={(event) => setValues((prev) => ({ ...prev, name: event.target.value }))}
          onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
          required
          fullWidth
          error={touched.name && Boolean(errors.name)}
          helperText={touched.name && errors.name ? errors.name : `${values.name.trim().length}/${NAME_MAX}`}
        />

        <TextField
          label={mergedLabels.descriptionLabel}
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
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
            Imagen de la comunidad
          </Typography>
          <ImageUpload
            currentImage={values.imageUrl}
            autoUpload
            disabled={submitting}
            onImageUploaded={(url) => setValues((prev) => ({ ...prev, imageUrl: url }))}
            onImageSelect={(file) => {
              if (!file) {
                setValues((prev) => ({ ...prev, imageUrl: '' }));
              }
            }}
          />
        </Box>

        <TextField
          label={mergedLabels.topicsLabel}
          value={values.topicsText}
          onChange={(event) => setValues((prev) => ({ ...prev, topicsText: event.target.value }))}
          fullWidth
          helperText={mergedLabels.topicsHelperText}
        />

        <TextField
          label={mergedLabels.rulesLabel}
          value={values.rulesText}
          onChange={(event) => setValues((prev) => ({ ...prev, rulesText: event.target.value }))}
          onBlur={() => setTouched((prev) => ({ ...prev, rulesText: true }))}
          required
          fullWidth
          multiline
          minRows={4}
          error={touched.rulesText && Boolean(errors.rulesText)}
          helperText={
            touched.rulesText && errors.rulesText ? errors.rulesText : mergedLabels.rulesHelperText
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
            label={values.isPrivate ? mergedLabels.privateLabel : mergedLabels.publicLabel}
          />
          <Typography variant="body2" color="text.secondary">
            {values.isPrivate ? mergedLabels.privateDescription : mergedLabels.publicDescription}
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
