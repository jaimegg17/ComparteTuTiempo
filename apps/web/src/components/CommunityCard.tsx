import { Card, CardActionArea, CardContent, Typography, Box, Chip, Button } from '@mui/material';
import { useRouter } from 'next/router';
import { useTranslation } from '@/hooks/useTranslation';
import { Community } from '@comparte-tu-tiempo/contracts';
import { Lock, Public, GroupAdd, ArrowOutwardRounded } from '@mui/icons-material';
import { useState } from 'react';

interface CommunityCardProps {
  community: Community;
  onJoin?: (community: Community) => void;
  showJoinAction?: boolean;
  detailBasePath?: '/communities' | '/organizations';
}

export function CommunityCard({ community, onJoin, showJoinAction = false, detailBasePath = '/communities' }: CommunityCardProps) {
  const router = useRouter();
  const { t, currentLanguage } = useTranslation();
  const locale = currentLanguage === 'en' ? 'en-US' : 'es-ES';
  const [imageError, setImageError] = useState(false);

  const displayedTopics = community.topics.slice(0, 3);

  return (
    <Card
      sx={{
        height: '100%',
        width: '100%',
        maxWidth: 380,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
        borderRadius: 3,
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'rgba(148, 163, 184, 0.22)',
        position: 'relative',
        transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
        '&::after': {
          content: '""',
          position: 'absolute',
          inset: 0,
          borderRadius: 'inherit',
          border: '1px solid rgba(138, 51, 253, 0)',
          transition: 'border-color 0.25s ease, box-shadow 0.25s ease',
          pointerEvents: 'none',
        },
        '&:hover': {
          transform: 'translateY(-6px)',
          boxShadow: '0 24px 48px rgba(15, 23, 42, 0.16)',
          borderColor: 'rgba(138, 51, 253, 0.34)',
        },
        '&:hover::after': {
          borderColor: 'rgba(138, 51, 253, 0.18)',
          boxShadow: '0 0 0 4px rgba(138, 51, 253, 0.06)',
        },
      }}
    >
      <CardActionArea
        onClick={() => router.push(`${detailBasePath}/${community.id}`)}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          '&:hover .community-card-media': {
            transform: 'scale(1.035)',
          },
          '&:hover .community-card-cta': {
            transform: 'translateX(3px)',
          },
        }}
      >
        <Box sx={{ position: 'relative', width: '100%', height: 190, bgcolor: 'grey.200' }}>
          {community.imageUrl && !imageError ? (
            <Box
              component="img"
              src={community.imageUrl}
              alt={community.name}
              className="community-card-media"
              onError={() => setImageError(true)}
              sx={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.35s ease' }}
            />
          ) : (
            <Box
              sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '54px',
                background: 'linear-gradient(135deg, #8A33FD 0%, #7028E0 100%)',
              }}
            >
              👥
            </Box>
          )}

          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(180deg, rgba(15,23,42,0.02) 0%, rgba(15,23,42,0.45) 100%)',
              pointerEvents: 'none',
            }}
          />

          <Box
            sx={{
              position: 'absolute',
              top: 10,
              right: 10,
              px: 1.4,
              py: 0.55,
              borderRadius: 999,
              backdropFilter: 'blur(12px)',
              bgcolor: 'rgba(255,255,255,0.18)',
              color: 'white',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.6,
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
            }}
          >
            {community.isPrivate ? <Lock sx={{ fontSize: 14 }} /> : <Public sx={{ fontSize: 14 }} />}
            {community.isPrivate ? t('communities.private') : t('communities.public')}
          </Box>
        </Box>

        <CardContent sx={{ flexGrow: 1, p: 2.5, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 1.5, gap: 1, flexWrap: 'wrap' }}>
            {community.kind === 'ORGANIZATION' && (
              <Chip
                label={community.verificationStatus === 'APPROVED' ? t('communities.verified') : t('communities.pending')}
                size="small"
                sx={{
                  fontSize: '11px',
                  height: '24px',
                  fontWeight: 700,
                  bgcolor: community.verificationStatus === 'APPROVED' ? 'rgba(15, 118, 110, 0.12)' : 'rgba(245, 158, 11, 0.14)',
                  color: community.verificationStatus === 'APPROVED' ? '#0f766e' : '#b45309',
                  textTransform: 'uppercase',
                }}
              />
            )}
            {displayedTopics.map((topic) => (
              <Chip
                key={topic}
                label={topic}
                size="small"
                sx={{
                  fontSize: '11px',
                  height: '24px',
                  fontWeight: 600,
                  bgcolor: 'rgba(138, 51, 253, 0.10)',
                  color: '#7A2EF6',
                  textTransform: 'capitalize',
                }}
              />
            ))}
          </Box>

          <Typography variant="h6" component="h3" sx={{ mb: 1, fontWeight: 700, lineHeight: 1.3, fontSize: '17px' }}>
            {community.name}
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 66, fontSize: '13px', lineHeight: 1.55 }}>
            {community.description
              ? (community.description.length > 110 ? `${community.description.substring(0, 110)}...` : community.description)
              : t('communities.no_description')}
          </Typography>

          <Box sx={{ mt: 'auto', pt: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 2 }}>
              <Typography variant="body2" sx={{ fontSize: '12px', color: 'text.secondary' }}>
                {t('communities.rulesCount', { count: community.rules.length })}
              </Typography>
              {community.resources.length > 0 && (
                <Typography variant="body2" sx={{ fontSize: '12px', color: 'text.secondary' }}>
                  · {t('communities.resourcesCount', { count: community.resources.length })}
                </Typography>
              )}
            </Box>

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                pt: 1.25,
                borderTop: '1px solid',
                borderColor: 'rgba(148, 163, 184, 0.18)',
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                {new Date(community.createdAt).toLocaleDateString(locale, { month: 'short', year: 'numeric' })}
              </Typography>

              <Box
                className="community-card-cta"
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.75,
                  color: '#8A33FD',
                  fontWeight: 700,
                  fontSize: '13px',
                  letterSpacing: '0.01em',
                  transition: 'transform 0.25s ease',
                }}
              >
                <span>{t('communities.view_details')}</span>
                <ArrowOutwardRounded sx={{ fontSize: 16 }} />
              </Box>
            </Box>
          </Box>
        </CardContent>
      </CardActionArea>

      {showJoinAction && onJoin && (
        <Box sx={{ px: 2.5, pb: 2.2, pt: 0 }}>
          <Button
            fullWidth
            variant="outlined"
            size="small"
            startIcon={<GroupAdd />}
            onClick={(event) => {
              event.stopPropagation();
              onJoin(community);
            }}
            sx={{ textTransform: 'none', borderRadius: 1.8, fontWeight: 700 }}
          >
            {community.isPrivate ? t('communities.detail.requestJoin') : t('communities.join')}
          </Button>
        </Box>
      )}
    </Card>
  );
}
