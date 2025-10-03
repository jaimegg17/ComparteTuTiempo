import React from 'react';
import {
  Box,
  Typography,
  Avatar,
  IconButton,
} from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface ProfileHeaderProps {
  imageUrl?: string;
  userName?: string;
  userEmail?: string;
  onImageEdit: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  imageUrl,
  userName,
  userEmail,
  onImageEdit,
}) => {
  const { t } = useTranslation();

  return (
    <Box sx={{ width: { xs: '100%', md: '35%' } }}>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 3, color: 'text.primary' }}>
        Mi información
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        ¡Bienvenido a tu perfil!
      </Typography>
      
      {/* Foto de perfil fuera del formulario */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ position: 'relative', display: 'inline-block' }}>
          <Avatar
            src={imageUrl || undefined}
            alt={t('profile.photoAlt', 'Foto de perfil')}
            sx={{ width: 100, height: 100 }}
          >
            {(userName || userEmail || 'U')[0].toUpperCase()}
          </Avatar>
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: '50%',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0,
              transition: 'opacity 0.3s ease',
              cursor: 'pointer',
              '&:hover': {
                opacity: 1,
              },
            }}
            onClick={onImageEdit}
          >
            <EditIcon sx={{ color: 'white', fontSize: 28 }} />
          </Box>
        </Box>
        <Typography
          variant="body2"
          sx={{
            color: '#169D9D',
            cursor: 'pointer',
            textDecoration: 'underline',
            fontWeight: 500,
            '&:hover': {
              color: '#0F7A7A',
            }
          }}
          onClick={onImageEdit}
        >
          Editar
        </Typography>
      </Box>
    </Box>
  );
};
