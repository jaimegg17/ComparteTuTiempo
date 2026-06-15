import { Box, Card, CardContent, Link as MuiLink, Stack, Typography } from '@mui/material';
import type { CommunityResource } from '@comparte-tu-tiempo/contracts';
import { Link as LinkIcon, Notes, Image as ImageIcon } from '@mui/icons-material';
import { useTranslation } from '@/hooks/useTranslation';

interface CommunityResourcesSectionProps {
  resources: CommunityResource[];
  organization?: boolean;
}

const typeIcons = {
  link: <LinkIcon sx={{ fontSize: 18 }} />,
  note: <Notes sx={{ fontSize: 18 }} />,
  image: <ImageIcon sx={{ fontSize: 18 }} />,
};

export function CommunityResourcesSection({ resources, organization = false }: CommunityResourcesSectionProps) {
  const { t } = useTranslation();
  if (!resources.length) return null;

  return (
    <Box sx={{ bgcolor: '#fff', borderRadius: 3, p: { xs: 2.5, md: 3 }, boxShadow: '0 12px 28px rgba(15,23,42,0.06)', border: '1px solid rgba(148,163,184,0.16)' }}>
      <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>
        {t(organization ? 'communities.resourcesSection.organizationTitle' : 'communities.resourcesSection.title')}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
        {t(organization ? 'communities.resourcesSection.organizationDescription' : 'communities.resourcesSection.description')}
      </Typography>

      <Stack spacing={1.5}>
        {resources.map((resource, index) => {
          const resourceType = resource.type ?? 'note';
          return (
            <Card key={`${resource.title}-${index}`} variant="outlined" sx={{ borderRadius: 2.5, borderColor: 'rgba(148,163,184,0.18)' }}>
              <CardContent sx={{ p: 2.2, '&:last-child': { pb: 2.2 } }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', sm: 'center' }}>
                  {resource.imageUrl && (
                    <Box component="img" src={resource.imageUrl} alt={resource.title} sx={{ width: { xs: '100%', sm: 110 }, height: 84, borderRadius: 2, objectFit: 'cover', border: '1px solid rgba(148,163,184,0.18)' }} />
                  )}

                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, mb: 0.9, color: '#8A33FD', fontSize: 12, fontWeight: 700 }}>
                      {typeIcons[resourceType]}
                      {t(`communities.resourcesSection.${resourceType}`)}
                    </Box>
                    <Typography sx={{ fontWeight: 700, mb: 0.5 }}>{resource.title}</Typography>
                    {resource.description && (
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                        {resource.description}
                      </Typography>
                    )}
                    {resource.url && (
                      <MuiLink href={resource.url} target="_blank" rel="noreferrer" underline="hover" sx={{ display: 'inline-block', mt: 1.1, fontWeight: 700 }}>
                        {t('communities.resourcesSection.open')}
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
