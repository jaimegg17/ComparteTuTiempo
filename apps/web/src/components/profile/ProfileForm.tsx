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
import { useTranslation } from '@/hooks/useTranslation';

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
  const { t } = useTranslation();
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
              {t('profile.form.overline')}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.75 }}>
              {t('profile.form.title')}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
              {t('profile.form.subtitle')}
            </Typography>
          </Box>

          <Divider />

          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2 }}>
              {t('profile.form.basic')}
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' }, gap: { xs: 1.5, md: 2 } }}>
          <TextField
            label={t('profile.form.name')}
            placeholder={t('profile.form.namePlaceholder')}
            value={formData.name}
            onChange={(e) => onInputChange('name', e.target.value)}
            fullWidth
          />

          <TextField
            label={t('profile.form.email')}
            type="email"
            placeholder="tu@email.com"
            value={formData.email}
            fullWidth
            disabled
            helperText={t('profile.form.emailHelper')}
          />

          <TextField
            label={t('profile.form.phone')}
            type="tel"
            placeholder="+34 123 456 789"
            value={formData.phoneNumber}
            onChange={(e) => onInputChange('phoneNumber', e.target.value)}
            fullWidth
          />

          <TextField
            label={t('profile.form.location')}
            placeholder={t('profile.form.locationPlaceholder')}
            value={formData.location}
            onChange={(e) => onInputChange('location', e.target.value)}
            fullWidth
          />
            </Box>
          </Box>

          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2 }}>
              {t('profile.form.personal')}
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', md: 'repeat(3, minmax(0, 1fr))' }, gap: { xs: 1.5, md: 2 } }}>
          <TextField
            label={t('profile.form.birthDate')}
            type="date"
            value={formData.dateOfBirth || ''}
            onChange={(e) => onInputChange('dateOfBirth', e.target.value)}
            fullWidth
            InputLabelProps={{
              shrink: true,
            }}
          />

          <TextField
            label={t('profile.form.gender')}
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
            <option value="">{t('profile.form.select')}</option>
            <option value="masculino">{t('profile.form.male')}</option>
            <option value="femenino">{t('profile.form.female')}</option>
            <option value="otro">{t('profile.form.other')}</option>
            <option value="prefiero_no_decir">{t('profile.form.preferNotSay')}</option>
          </TextField>

          <TextField
            label={t('profile.form.preferredLanguage')}
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
              {t('profile.form.publicProfile')}
            </Typography>
          <TextField
            label={t('profile.form.bio')}
            placeholder={t('profile.form.bioPlaceholder')}
            multiline
            rows={3}
            value={formData.bio}
            onChange={(e) => onInputChange('bio', e.target.value)}
            fullWidth
            helperText={t('profile.form.bioHelper')}
          />
          </Box>

          <Box>
            <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 800 }}>
              {t('profile.form.skills')}
            </Typography>
            <TextField
              placeholder={t('profile.form.skillPlaceholder')}
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
              helperText={t('profile.form.skillHelper')}
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
                {t('profile.form.timeCredits')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('profile.form.timeCreditsHelp')}
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
            {isSubmitting ? t('profile.form.saving') : t('profile.form.save')}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};
