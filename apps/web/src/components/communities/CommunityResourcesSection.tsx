import { Box, Card, CardContent, Link as MuiLink, Stack, Typography } from '@mui/material';
import type { CommunityResource } from '@comparte-tu-tiempo/contracts';
import { Link as LinkIcon, Notes, Image as ImageIcon } from '@mui/icons-material';

interface CommunityResourcesSectionProps {
  resources: CommunityResource[];
}

const typeMeta = {
  link: { label: 'Enlace', icon: <LinkIcon sx={{ fontSize: 18 }} /> },
  note: { label: 'Nota', icon: <Notes sx={{ fontSize: 18 }} /> },
  image: { label: 'Imagen', icon: <ImageIcon sx={{ fontSize: 18 }} /> },
};

export function CommunityResourcesSection({ resources }: CommunityResourcesSectionProps) {
  if (!resources.length) return null;

  return (
    <Box sx={{ bgcolor: '#fff', borderRadius: 3, p: { xs: 2.5, md: 3 }, boxShadow: '0 12px 28px rgba(15,23,42,0.06)', border: '1px solid rgba(148,163,184,0.16)' }}>
      <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>
        Tablón de recursos
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
        Enlaces, notas y referencias útiles para la actividad de la comunidad.
      </Typography>

      <Stack spacing={1.5}>
        {resources.map((resource, index) => {
          const meta = typeMeta[resource.type ?? 'note'];
          return (
            <Card key={`${resource.title}-${index}`} variant="outlined" sx={{ borderRadius: 2.5, borderColor: 'rgba(148,163,184,0.18)' }}>
              <CardContent sx={{ p: 2.2, '&:last-child': { pb: 2.2 } }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', sm: 'center' }}>
                  {resource.imageUrl && (
                    <Box component="img" src={resource.imageUrl} alt={resource.title} sx={{ width: { xs: '100%', sm: 110 }, height: 84, borderRadius: 2, objectFit: 'cover', border: '1px solid rgba(148,163,184,0.18)' }} />
                  )}

                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, mb: 0.9, color: '#8A33FD', fontSize: 12, fontWeight: 700 }}>
                      {meta.icon}
                      {meta.label}
                    </Box>
                    <Typography sx={{ fontWeight: 700, mb: 0.5 }}>{resource.title}</Typography>
                    {resource.description && (
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                        {resource.description}
                      </Typography>
                    )}
                    {resource.url && (
                      <MuiLink href={resource.url} target="_blank" rel="noreferrer" underline="hover" sx={{ display: 'inline-block', mt: 1.1, fontWeight: 700 }}>
                        Abrir recurso
                      </MuiLink>
                    )}
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          );
        })}
      </Stack>
    </Box>
  );
}
