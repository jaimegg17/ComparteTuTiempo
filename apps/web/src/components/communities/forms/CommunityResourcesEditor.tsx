import { useMemo } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Add, DeleteOutline } from '@mui/icons-material';
import type { CommunityResource } from '@comparte-tu-tiempo/contracts';

interface CommunityResourcesEditorProps {
  resources: CommunityResource[];
  onChange: (resources: CommunityResource[]) => void;
}

const emptyResource = (): CommunityResource => ({
  title: '',
  description: '',
  type: 'note',
  url: null,
  imageUrl: null,
});

export function CommunityResourcesEditor({
  resources,
  onChange,
}: CommunityResourcesEditorProps) {
  const canAddMore = resources.length < 12;

  const normalizedResources = useMemo(
    () => (resources.length ? resources : []),
    [resources],
  );

  const handleResourceChange = (
    index: number,
    key: keyof CommunityResource,
    value: string,
  ) => {
    const next = [...normalizedResources];
    const parsedValue =
      key === 'description' || key === 'url' || key === 'imageUrl'
        ? value || null
        : value;

    next[index] = {
      ...next[index],
      [key]: parsedValue,
    };

    onChange(next);
  };

  const handleAddResource = () => {
    onChange([...normalizedResources, emptyResource()]);
  };

  const handleRemoveResource = (index: number) => {
    onChange(normalizedResources.filter((_, currentIndex) => currentIndex !== index));
  };

  return (
    <Box
      sx={{
        bgcolor: '#fff',
        borderRadius: 3,
        p: { xs: 2.5, md: 3 },
        boxShadow: '0 12px 28px rgba(15,23,42,0.06)',
        border: '1px solid rgba(148,163,184,0.16)',
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        spacing={1.5}
        sx={{ mb: 2.5 }}
      >
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Tablón de recursos y anuncios
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Añade notas, enlaces o imágenes destacadas para el espacio.
          </Typography>
        </Box>

        <Button
          startIcon={<Add />}
          onClick={handleAddResource}
          disabled={!canAddMore}
          variant="outlined"
          sx={{ textTransform: 'none', fontWeight: 700, alignSelf: 'flex-start' }}
        >
          Añadir recurso
        </Button>
      </Stack>

      {normalizedResources.length === 0 ? (
        <Typography color="text.secondary">
          Aún no hay recursos publicados. Puedes empezar añadiendo una nota, un enlace o una imagen.
        </Typography>
      ) : (
        <Stack spacing={2}>
          {normalizedResources.map((resource, index) => (
            <Card
              key={`resource-editor-${index}`}
              variant="outlined"
              sx={{ borderRadius: 2.5, borderColor: 'rgba(148,163,184,0.18)' }}
            >
              <CardContent sx={{ p: 2.2, '&:last-child': { pb: 2.2 } }}>
                <Stack spacing={2}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography sx={{ fontWeight: 700 }}>
                      Recurso #{index + 1}
                    </Typography>
                    <IconButton
                      onClick={() => handleRemoveResource(index)}
                      aria-label={`Eliminar recurso ${index + 1}`}
                    >
                      <DeleteOutline />
                    </IconButton>
                  </Stack>

                  <TextField
                    label="Título"
                    value={resource.title}
                    onChange={(event) => handleResourceChange(index, 'title', event.target.value)}
                    fullWidth
                  />

                  <TextField
                    select
                    label="Tipo"
                    value={resource.type}
                    onChange={(event) => handleResourceChange(index, 'type', event.target.value)}
                    fullWidth
                  >
                    <MenuItem value="note">Nota</MenuItem>
                    <MenuItem value="link">Enlace</MenuItem>
                    <MenuItem value="image">Imagen</MenuItem>
                  </TextField>

                  <TextField
                    label="Descripción"
                    value={resource.description ?? ''}
                    onChange={(event) => handleResourceChange(index, 'description', event.target.value)}
                    multiline
                    minRows={3}
                    fullWidth
                  />

                  {(resource.type === 'link' || resource.type === 'image') && (
                    <TextField
                      label="URL"
                      value={resource.url ?? ''}
                      onChange={(event) => handleResourceChange(index, 'url', event.target.value)}
                      fullWidth
                    />
                  )}

                  {resource.type === 'image' && (
                    <TextField
                      label="URL de imagen"
                      value={resource.imageUrl ?? ''}
                      onChange={(event) => handleResourceChange(index, 'imageUrl', event.target.value)}
                      fullWidth
                    />
                  )}
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  );
}
