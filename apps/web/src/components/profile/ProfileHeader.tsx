import React from 'react';
import {
  Box,
  Typography,
  Avatar,
  ButtonBase,
  Chip,
  Stack,
  Paper,
  LinearProgress,
} from '@mui/material';
import { Edit as EditIcon, EmailOutlined, PlaceOutlined, ShieldOutlined, StarRounded, FavoriteRounded, EventAvailableRounded } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface ProfileHeaderProps {
  imageUrl?: string;
  userName?: string;
  userEmail?: string;
  location?: string;
  timeCredits?: number;
  skillsCount?: number;
  isAdmin?: boolean;
  profileCompletion: number;
  ratingsCount?: number;
  completedExchanges?: number;
  favoritesCount?: number;
  registeredEventsCount?: number;
  onImageEdit: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  imageUrl,
  userName,
  userEmail,
  location,
  timeCredits,
  skillsCount,
  isAdmin,
  profileCompletion,
  ratingsCount,
  completedExchanges,
  favoritesCount,
  registeredEventsCount,
  onImageEdit,
}) => {
  const { t } = useTranslation();

  return (
    <Box sx={{ width: { xs: '100%', md: '34%' }, minWidth: 0 }}>
      <Paper
        sx={{
          p: { xs: 2.5, md: 3 },
          borderRadius: 3,
          border: '1px solid rgba(148,163,184,0.16)',
          boxShadow: '0 14px 36px rgba(15,23,42,0.08)',
        }}
      >
        <Typography variant="overline" sx={{ color: 'text.secondary', letterSpacing: '0.08em', fontWeight: 800 }}>
          Tu perfil
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, color: 'text.primary' }}>
          Mi información
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.7 }}>
          Gestiona tu identidad pública, mejora la confianza de tu perfil y mantén tu información al día.
        </Typography>

        <Box sx={{ display: 'flex', alignItems: { xs: 'flex-start', sm: 'center' }, flexDirection: { xs: 'column', sm: 'row' }, gap: 2.25, mb: 2.5, minWidth: 0 }}>
          <Box sx={{ position: 'relative', display: 'inline-block' }}>
            <Avatar
              src={imageUrl || undefined}
              alt={t('profile.photoAlt', 'Foto de perfil')}
              sx={{ width: { xs: 92, md: 108 }, height: { xs: 92, md: 108 }, fontSize: { xs: 30, md: 34 }, border: '4px solid #fff', boxShadow: '0 10px 24px rgba(15,23,42,0.12)' }}
            >
              {(userName || userEmail || 'U')[0].toUpperCase()}
            </Avatar>
            <ButtonBase
              aria-label="Editar foto de perfil"
              sx={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                backgroundColor: 'rgba(15, 23, 42, 0.46)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: 0,
                transition: 'opacity 0.3s ease',
                cursor: 'pointer',
                '&:hover': { opacity: 1 },
                '&:focus-visible': { opacity: 1, outline: '2px solid white', outlineOffset: 2 },
              }}
              onClick={onImageEdit}
            >
              <EditIcon sx={{ color: 'white', fontSize: 28 }} />
            </ButtonBase>
          </Box>

          <Box sx={{ minWidth: 0, flex: 1, width: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5, wordBreak: 'break-word', lineHeight: 1.25 }}>
              {userName || 'Usuario'}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.2, wordBreak: 'break-all', lineHeight: 1.45 }}>
              {userEmail}
            </Typography>
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ rowGap: 1 }}>
              <Chip size="small" label={isAdmin ? 'Administrador' : 'Usuario'} icon={isAdmin ? <ShieldOutlined fontSize="small" /> : undefined} sx={{ fontWeight: 700, bgcolor: isAdmin ? 'rgba(245,158,11,0.14)' : 'rgba(138,51,253,0.10)', color: isAdmin ? '#b45309' : '#7A2EF6' }} />
              <Chip size="small" label={`${skillsCount ?? 0} habilidades`} sx={{ fontWeight: 700, bgcolor: 'rgba(15,118,110,0.10)', color: '#0f766e' }} />
            </Stack>
          </Box>
        </Box>

        <Typography variant="body2" sx={{ color: '#169D9D', cursor: 'pointer', textDecoration: 'underline', fontWeight: 600, mb: 2.5, '&:hover': { color: '#0F7A7A' } }} onClick={onImageEdit}>
          Cambiar foto de perfil
        </Typography>

        <Stack spacing={1.4} sx={{ mb: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
            <EmailOutlined sx={{ fontSize: 18, color: 'text.secondary' }} />
            <Typography variant="body2" sx={{ color: 'text.secondary', wordBreak: 'break-word' }}>
              {userEmail || 'Sin correo'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
            <PlaceOutlined sx={{ fontSize: 18, color: 'text.secondary' }} />
            <Typography variant="body2" sx={{ color: 'text.secondary', wordBreak: 'break-word' }}>
              {location || 'Añade tu ubicación'}
            </Typography>
          </Box>
        </Stack>

        <Box sx={{ mb: 2.5, p: 2, borderRadius: 2.5, bgcolor: 'rgba(15,23,42,0.03)', border: '1px solid rgba(148,163,184,0.14)' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary', wordBreak: 'break-word' }}>
              Perfil completado
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 800, color: '#7A2EF6' }}>
              {profileCompletion}%
            </Typography>
          </Stack>
          <LinearProgress variant="determinate" value={profileCompletion} sx={{ height: 10, borderRadius: 999, bgcolor: 'rgba(138,51,253,0.10)', '& .MuiLinearProgress-bar': { borderRadius: 999, background: 'linear-gradient(90deg, #8A33FD 0%, #22c55e 100%)' } }} />
        </Box>

        <Stack spacing={1.2} sx={{ mb: 2.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, borderRadius: 2, bgcolor: 'rgba(248,250,252,0.92)' }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0, flex: 1 }}>
              <StarRounded sx={{ color: '#f59e0b' }} />
              <Typography variant="body2" sx={{ minWidth: 0 }}>Valoraciones recibidas</Typography>
            </Stack>
            <Typography sx={{ fontWeight: 800 }}>{ratingsCount ?? 0}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, borderRadius: 2, bgcolor: 'rgba(248,250,252,0.92)' }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0, flex: 1 }}>
              <FavoriteRounded sx={{ color: '#e11d48' }} />
              <Typography variant="body2" sx={{ minWidth: 0 }}>Servicios favoritos</Typography>
            </Stack>
            <Typography sx={{ fontWeight: 800 }}>{favoritesCount ?? 0}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, borderRadius: 2, bgcolor: 'rgba(248,250,252,0.92)' }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0, flex: 1 }}>
              <EventAvailableRounded sx={{ color: '#0f766e' }} />
              <Typography variant="body2" sx={{ minWidth: 0 }}>Eventos guardados</Typography>
            </Stack>
            <Typography sx={{ fontWeight: 800 }}>{registeredEventsCount ?? 0}</Typography>
          </Box>
        </Stack>

        <Box sx={{ p: 2, borderRadius: 2.5, bgcolor: 'rgba(138,51,253,0.06)', border: '1px solid rgba(138,51,253,0.12)' }}>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.4 }}>
            Créditos de tiempo disponibles
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 900, color: '#7A2EF6', lineHeight: 1.1 }}>
            {timeCredits ?? 0}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Intercambios completados: {completedExchanges ?? 0}
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};
