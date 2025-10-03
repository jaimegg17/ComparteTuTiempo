import React from 'react';
import {
  Card,
  CardContent,
  TextField,
  Box,
  Button,
  Chip,
  Typography,
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
  profileData: any;
  isSubmitting: boolean;
  onInputChange: (field: keyof ProfileFormValues, value: any) => void;
  onSkillAdd: (skill: string) => void;
  onSkillRemove: (index: number) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({
  formData,
  profileData,
  isSubmitting,
  onInputChange,
  onSkillAdd,
  onSkillRemove,
  onSubmit,
}) => {
  return (
    <Card sx={{ width: { xs: '100%', md: '65%' } }}>
      <CardContent sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Nombre */}
          <TextField
            label="Nombre"
            placeholder="Tu nombre completo"
            value={formData.name}
            onChange={(e) => onInputChange('name', e.target.value)}
            fullWidth
          />

          {/* Email */}
          <TextField
            label="Dirección de correo"
            type="email"
            placeholder="tu@email.com"
            value={formData.email}
            onChange={(e) => onInputChange('email', e.target.value)}
            fullWidth
          />

          {/* Teléfono */}
          <TextField
            label="Teléfono"
            type="tel"
            placeholder="+34 123 456 789"
            value={formData.phoneNumber}
            onChange={(e) => onInputChange('phoneNumber', e.target.value)}
            fullWidth
          />

          {/* Ubicación */}
          <TextField
            label="Ubicación"
            placeholder="Ciudad, País"
            value={formData.location}
            onChange={(e) => onInputChange('location', e.target.value)}
            fullWidth
          />

          {/* Fecha de nacimiento */}
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

          {/* Género */}
          <TextField
            label="Género"
            select
            value={formData.gender || ''}
            onChange={(e) => onInputChange('gender', e.target.value)}
            fullWidth
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

          {/* Idioma preferido */}
          <TextField
            label="Idioma preferido"
            select
            value={formData.preferredLanguage || 'es'}
            onChange={(e) => onInputChange('preferredLanguage', e.target.value)}
            fullWidth
            SelectProps={{
              native: true,
            }}
          >
            <option value="es">Español</option>
            <option value="en">English</option>
            <option value="fr">Français</option>
            <option value="de">Deutsch</option>
          </TextField>

          {/* Biografía */}
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

          {/* Habilidades */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
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

          {/* Créditos de tiempo */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            p: 3, 
            bgcolor: 'primary.50', 
            borderRadius: 2, 
            border: '1px solid', 
            borderColor: 'primary.200',
            mt: 2
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
        </Box>

        {/* Botones de acción */}
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