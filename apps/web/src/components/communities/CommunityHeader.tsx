import { Box, Chip, Stack, Typography } from '@mui/material';
import { CalendarMonth, Lock, Public } from '@mui/icons-material';
import type { Community } from '@comparte-tu-tiempo/contracts';

interface CommunityHeaderProps {
  community: Community;
  membersCount: number;
  eventsCount: number;
  t: (key: string) => string;
}

export function CommunityHeader({ community, membersCount, eventsCount, t }: CommunityHeaderProps) {
  return (
    <Box sx={{ bgcolor: '#fff', p: { xs: 2.5, md: 4 }, borderRadius: 3, boxShadow: 1 }}>
      <Box
        sx={{ display: 'flex', alignItems: { xs: 'flex-start', md: 'center' }, justifyContent: 'space-between', gap: 2, mb: 2, flexDirection: { xs: 'column', md: 'row' } }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700, fontSize: { xs: '1.75rem', md: '2rem' } }}>
          {community.name}
        </Typography>

        <Chip
          icon={community.isPrivate ? <Lock /> : <Public />}
          label={community.isPrivate ? t('communities.private') : t('communities.public')}
          color={community.isPrivate ? 'default' : 'primary'}
          variant={community.isPrivate ? 'outlined' : 'filled'}
        />
      </Box>

      <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7, mb: 3 }}>
        {community.description || t('communities.no_description')}
      </Typography>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
        <Chip label={`${membersCount} miembros`} variant="outlined" />
        <Chip label={`${eventsCount} eventos`} variant="outlined" />
        <Chip
          icon={<CalendarMonth />}
          label={`Creada ${new Date(community.createdAt).toLocaleDateString('es-ES')}`}
          variant="outlined"
        />
      </Stack>
    </Box>
  );
}
