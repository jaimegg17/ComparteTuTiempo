import React from 'react';
import {
  Card,
  CardContent,
  TextField,
  Box,
  Button,
  Chip,
  Typography,
  Stack,
  Divider,
} from '@mui/material';

interface ProfileFormValues {
  name: string;
  email: string;
  bio: string;
  location: string;
  phoneNumber: string;
  skills: string[];
  imageUrl: string;
  dateOfBirth?: string;
  gender?: string;
  preferredLanguage?: string;
}

interface ProfileFormProps {
  formData: ProfileFormValues;
  profileData: {
    timeCredits?: number;
  } | null;
  isSubmitting: boolean;
  onInputChange: (field: keyof ProfileFormValues, value: string | string[]) => void;
  onSkillAdd: (skill: string) => void;
  onSkillRemove: (index: number) => void;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({
  formData,
  profileData,
  isSubmitting,
  onInputChange,
  onSkillAdd,
  onSkillRemove,
}) => {
  return (
    <Card
      sx={{
        width: { xs: '100%', md: '66%' },
        minWidth: 0,
        borderRadius: 3,
        border: '1px solid rgba(148,163,184,0.16)',
        boxShadow: '0 14px 36px rgba(15,23,42,0.08)',
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3.5 } }}>
        <Stack spacing={3.5}>
          <Box>
            <Typography variant="overline" sx={{ color: 'text.secondary', letterSpacing: '0.08em', fontWeight: 800 }}>
              Edición
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.75 }}>
              Configura tu perfil público
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
              Un perfil completo genera más confianza al publicar servicios, participar en comunidades y cerrar intercambios.
            </Typography>
          </Box>

          <Divider />

          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2 }}>
              Información básica
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' }, gap: { xs: 1.5, md: 2 } }}>
          <TextField
            label="Nombre"
            placeholder="Tu nombre completo"
            value={formData.name}
            onChange={(e) => onInputChange('name', e.target.value)}
            fullWidth
          />

          <TextField
            label="Dirección de correo"
            type="email"
            placeholder="tu@email.com"
            value={formData.email}
            fullWidth
            disabled
            helperText="El email proviene de tu cuenta de inicio de sesión y no se puede editar aquí."
          />

          <TextField
            label="Teléfono"
            type="tel"
            placeholder="+34 123 456 789"
            value={formData.phoneNumber}
            onChange={(e) => onInputChange('phoneNumber', e.target.value)}
            fullWidth
          />

          <TextField
            label="Ubicación"
            placeholder="Ciudad, País"
            value={formData.location}
            onChange={(e) => onInputChange('location', e.target.value)}
            fullWidth
          />
            </Box>
          </Box>

          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2 }}>
              Información personal
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', md: 'repeat(3, minmax(0, 1fr))' }, gap: { xs: 1.5, md: 2 } }}>
          <TextField
            label="Fecha de nacimiento"
            type="date"
            value={formData.dateOfBirth || ''}
            onChange={(e) => onInputChange('dateOfBirth', e.target.value)}
            fullWidth
            InputLabelProps={{
              shrink: true,
            }}
          />

          <TextField
            label="Género"
            select
            value={formData.gender || ''}
            onChange={(e) => onInputChange('gender', e.target.value)}
            fullWidth
            InputLabelProps={{
              shrink: true,
            }}
            SelectProps={{
              native: true,
            }}
          >
            <option value="">Seleccionar...</option>
            <option value="masculino">Masculino</option>
            <option value="femenino">Femenino</option>
            <option value="otro">Otro</option>
            <option value="prefiero_no_decir">Prefiero no decir</option>
          </TextField>

          <TextField
            label="Idioma preferido"
            select
            value={formData.preferredLanguage || 'es'}
            onChange={(e) => onInputChange('preferredLanguage', e.target.value)}
            fullWidth
            InputLabelProps={{
              shrink: true,
            }}
            SelectProps={{
              native: true,
            }}
          >
            <option value="es">Español</option>
            <option value="en">English</option>
            <option value="fr">Français</option>
            <option value="de">Deutsch</option>
          </TextField>
            </Box>
          </Box>

          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2 }}>
              Perfil público
            </Typography>
          <TextField
            label="Biografía"
            placeholder="Cuéntanos algo sobre ti..."
            multiline
            rows={3}
            value={formData.bio}
            onChange={(e) => onInputChange('bio', e.target.value)}
            fullWidth
            helperText="Escribe algunas frases sobre ti mismo."
          />
          </Box>

          <Box>
            <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 800 }}>
              Habilidades
            </Typography>
            <TextField
              placeholder="Escribe una habilidad y presiona Enter"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const target = e.target as HTMLInputElement;
                  const value = target.value.trim();
                  if (value) {
                    onSkillAdd(value);
                    target.value = '';
                  }
                }
              }}
              fullWidth
              sx={{ mb: 2 }}
              helperText="Pulsa Enter para añadir una habilidad al perfil."
            />
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {formData.skills?.map((skill: string, index: number) => (
                <Chip
                  key={index}
                  label={skill}
                  onDelete={() => onSkillRemove(index)}
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Box>
          </Box>

          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            p: 3, 
            bgcolor: 'primary.50', 
            borderRadius: 2.5, 
            border: '1px solid', 
            borderColor: 'primary.200',
            mt: 0.5
          }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                Créditos de Tiempo Disponibles
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Minutos disponibles para intercambios
              </Typography>
            </Box>
            <Typography variant="h3" color="primary" sx={{ fontWeight: 'bold' }}>
              {profileData?.timeCredits || 0}
            </Typography>
          </Box>

        </Stack>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            sx={{ 
              bgcolor: 'primary.main', 
              '&:hover': { bgcolor: 'primary.dark' },
              px: 4
            }}
          >
            {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};
