import { Card, CardContent, CardActions, Button, Typography, Box, Chip } from '@mui/material';
import { useRouter } from 'next/router';
import { useTranslation } from '@/hooks/useTranslation';
import { Community } from '@comparte-tu-tiempo/contracts';
import { Lock, Public, People } from '@mui/icons-material';

interface CommunityCardProps {
  community: Community;
}

export function CommunityCard({ community }: CommunityCardProps) {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column', 
        boxShadow: 2,
        borderRadius: 2,
        overflow: 'hidden',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        }
      }}
    >
      {/* Header section with privacy badge */}
      <Box 
        sx={{ 
          position: 'relative', 
          width: '100%', 
          height: 120, 
          bgcolor: 'primary.main',
          background: 'linear-gradient(135deg, #8A33FD 0%, #7028E0 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '48px',
        }}
      >
        <People sx={{ fontSize: 56 }} />
        
        {/* Privacy badge */}
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            bgcolor: community.isPrivate ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            px: 1.5,
            py: 0.5,
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            fontSize: '11px',
            fontWeight: 600,
            textTransform: 'uppercase',
            backdropFilter: 'blur(10px)',
          }}
        >
          {community.isPrivate ? (
            <>
              <Lock sx={{ fontSize: 14 }} />
              {t("communities.private")}
            </>
          ) : (
            <>
              <Public sx={{ fontSize: 14 }} />
              {t("communities.public")}
            </>
          )}
        </Box>
      </Box>

      <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
        <Typography variant="h6" component="h3" sx={{ mb: 1, fontWeight: 600, lineHeight: 1.3, fontSize: '18px' }}>
          {community.name}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 60, fontSize: '13px', lineHeight: 1.5 }}>
          {community.description 
            ? (community.description.length > 100
                ? `${community.description.substring(0, 100)}...` 
                : community.description)
            : t("communities.no_description")
          }
        </Typography>

        {/* Footer with creation date and button */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto', pt: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '11px' }}>
            {new Date(community.createdAt).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}
          </Typography>

          <Button 
            size="small" 
            variant="contained"
            onClick={() => router.push(`/communities/${community.id}`)}
            sx={{ 
              textTransform: 'none', 
              borderRadius: 1.5,
              px: 2.5,
              py: 0.75,
              fontWeight: 600,
              fontSize: '13px',
              bgcolor: '#8A33FD',
              '&:hover': {
                bgcolor: '#7028E0',
              }
            }}
          >
            {t("communities.view_details")}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
