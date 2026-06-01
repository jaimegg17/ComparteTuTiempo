import { Box, Chip, Stack, Typography } from '@mui/material';
import { CalendarMonth, Lock, Public, RuleFolder } from '@mui/icons-material';
import type { Community } from '@comparte-tu-tiempo/contracts';
import { useState } from 'react';

interface CommunityHeaderProps {
  community: Community;
  membersCount: number;
  eventsCount: number;
  t: (key: string) => string;
}

export function CommunityHeader({ community, membersCount, eventsCount, t }: CommunityHeaderProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <Box sx={{ bgcolor: '#fff', borderRadius: 3, boxShadow: '0 18px 36px rgba(15,23,42,0.08)', overflow: 'hidden', border: '1px solid rgba(148,163,184,0.18)' }}>
      {community.imageUrl && !imageError && (
        <Box
          component="img"
          src={community.imageUrl}
          alt={community.name}
          onError={() => setImageError(true)}
          sx={{
            width: '100%',
            height: { xs: 220, md: 300 },
            objectFit: 'cover',
            display: 'block',
          }}
        />
      )}

      <Box sx={{ p: { xs: 2, sm: 2.5, md: 4 } }}>
      <Box
        sx={{ display: 'flex', alignItems: { xs: 'flex-start', md: 'center' }, justifyContent: 'space-between', gap: 2, mb: 2, flexDirection: { xs: 'column', md: 'row' } }}
      >
        <Typography variant="h4" sx={{ fontWeight: 800, fontSize: { xs: '1.55rem', sm: '1.85rem', md: '2.2rem' }, wordBreak: 'break-word' }}>
          {community.name}
        </Typography>

        <Chip
          icon={community.isPrivate ? <Lock /> : <Public />}
          label={community.isPrivate ? t('communities.private') : t('communities.public')}
          color={community.isPrivate ? 'default' : 'primary'}
          variant={community.isPrivate ? 'outlined' : 'filled'}
          sx={{ fontWeight: 700 }}
        />
      </Box>

      <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7, mb: 3, fontSize: { xs: '0.95rem', md: '1rem' } }}>
        {community.description || t('communities.no_description')}
      </Typography>

        {community.topics.length > 0 && (
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mb: 3, rowGap: 1 }}>
            {community.kind === 'ORGANIZATION' && (
              <Chip
                label={community.verificationStatus === 'APPROVED' ? 'Organización verificada' : 'Organización pendiente'}
                sx={{
                  bgcolor: community.verificationStatus === 'APPROVED' ? 'rgba(15, 118, 110, 0.12)' : 'rgba(245, 158, 11, 0.14)',
                  color: community.verificationStatus === 'APPROVED' ? '#0f766e' : '#b45309',
                  fontWeight: 800,
                }}
              />
            )}
            {community.topics.map((topic) => (
              <Chip
                key={topic}
              label={topic}
              sx={{ bgcolor: 'rgba(138, 51, 253, 0.10)', color: '#7A2EF6', fontWeight: 700, textTransform: 'capitalize' }}
            />
          ))}
        </Stack>
      )}

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} useFlexGap flexWrap="wrap" sx={{ rowGap: 1 }}>
        <Chip label={`${membersCount} miembros`} variant="outlined" />
        <Chip label={`${eventsCount} eventos`} variant="outlined" />
        <Chip icon={<RuleFolder />} label={`${community.rules.length} reglas`} variant="outlined" />
        <Chip
          icon={<CalendarMonth />}
          label={`Creada ${new Date(community.createdAt).toLocaleDateString('es-ES')}`}
          variant="outlined"
        />
      </Stack>
      </Box>
    </Box>
  );
}
