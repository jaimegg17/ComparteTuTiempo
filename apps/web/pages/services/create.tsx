import { useState } from 'react';
import { useRouter } from 'next/router';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  MenuItem,
  Alert,
  CircularProgress,
  Stack,
} from '@mui/material';
import { Layout } from '@/components/Layout';
import { useUser } from '@auth0/nextjs-auth0/client';
import { useTranslation } from '@/hooks/useTranslation';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { useUploadImage } from '@/shared/hooks/use-upload';

const CATEGORIES = ['EDUCACION', 'HOGAR', 'TECNOLOGIA', 'SALUD', 'DEPORTES', 'ARTE', 'OTROS'];
const TYPES = ['PRESENCIAL', 'VIRTUAL', 'HIBRIDO'];
const AVAILABILITY = ['mañana', 'tarde', 'noche', 'mañana-tarde', 'tarde-noche', 'flexible'];

interface FormData {
  title: string;
  description: string;
  detailedDescription: string;
  duration: string;
  category: string;
  type: string;
  location: string;
  availability: string;
  imageUrl: string;
}

interface FormErrors {
  title?: string;
  description?: string;
  duration?: string;
  category?: string;
  type?: string;
  location?: string;
}

export default function CreateServicePage() {
  const router = useRouter();
  const { user, isLoading: userLoading } = useUser();
  const { t } = useTranslation();
  
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    detailedDescription: '',
    duration: '',
    category: '',
    type: '',
    location: '',
    availability: '',
    imageUrl: '',
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const uploadImage = useUploadImage();

  // Mapping functions for display
  const getCategoryDisplayName = (category: string) => {
    const categoryMap: Record<string, string> = {
      'EDUCACION': t('services.categories.education'),
      'HOGAR': t('services.categories.home'),
      'TECNOLOGIA': t('services.categories.technology'),
      'SALUD': t('services.categories.health'),
      'DEPORTES': t('services.categories.sports'),
      'ARTE': t('services.categories.art'),
      'OTROS': t('services.categories.others'),
    };
    return categoryMap[category] || category;
  };
  
  const getTypeDisplayName = (type: string) => {
    const typeMap: Record<string, string> = {
      'PRESENCIAL': t('services.types.in_person'),
      'VIRTUAL': t('services.types.online'),
      'HIBRIDO': t('services.types.hybrid'),
    };
    return typeMap[type] || type;
  };

  const getAvailabilityDisplayName = (availability: string) => {
    const availabilityMap: Record<string, string> = {
      'mañana': t('services.form.availability_options.morning'),
      'tarde': t('services.form.availability_options.afternoon'),
      'noche': t('services.form.availability_options.evening'),
      'mañana-tarde': t('services.form.availability_options.morning_afternoon'),
      'tarde-noche': t('services.form.availability_options.afternoon_evening'),
      'flexible': t('services.form.availability_options.flexible'),
    };
    return availabilityMap[availability] || availability;
  };


  const handleChange = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value,
    }));
    
    // Clear error for this field
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'El título es obligatorio';
    } else if (formData.title.length < 5) {
      newErrors.title = 'El título debe tener al menos 5 caracteres';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es obligatoria';
    } else if (formData.description.length < 20) {
      newErrors.description = 'La descripción debe tener al menos 20 caracteres';
    }
    
    const duration = parseFloat(formData.duration);
    if (!formData.duration) {
      newErrors.duration = 'La duración es obligatoria';
    } else if (isNaN(duration) || duration <= 0) {
      newErrors.duration = 'La duración debe ser un número positivo';
    } else if (duration > 24) {
      newErrors.duration = 'La duración no puede superar 24 horas';
    }
    
    if (!formData.category) {
      newErrors.category = 'La categoría es obligatoria';
    }
    
    if (!formData.type) {
      newErrors.type = 'El tipo es obligatorio';
    }
    
    if (!formData.location.trim()) {
      newErrors.location = 'La ubicación es obligatoria';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      router.push('/api/auth/login');
      return;
    }
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Use uploaded image URL if available
      const imageUrl = uploadedImageUrl || formData.imageUrl;

      // Get token
      const tokenResponse = await fetch('/api/auth/token');
      if (!tokenResponse.ok) {
        throw new Error('No se pudo obtener el token de autenticación');
      }
      const tokenData = await tokenResponse.json();
      const token = tokenData.accessToken;

      const response = await fetch('http://localhost:3001/api/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formData.title.trim(),
          description: formData.description.trim(),
          detailedDescription: formData.detailedDescription.trim() || undefined,
          duration: parseFloat(formData.duration),
          category: formData.category,
          type: formData.type,
          location: formData.location.trim(),
          availability: formData.availability || undefined,
          imageUrl: imageUrl || undefined,
          price: parseFloat(formData.duration) * 60, // Duration in minutes
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear el servicio');
      }
      
      const data = await response.json();
      setSuccess(true);
      
      // Redirect to the created service
      setTimeout(() => {
        router.push(`/services/${data.service.id}`);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear el servicio');
    } finally {
      setLoading(false);
    }
  };

  if (userLoading) {
    return (
      <Layout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  if (!user) {
    router.push('/api/auth/login');
    return null;
  }

  return (
    <Layout>
      <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100%', py: 4 }}>
        <Container maxWidth="md">
          <Button 
            onClick={() => router.push('/services')} 
            sx={{ mb: 3, textTransform: 'none' }}
          >
            {t("services.form.back_to_services")}
          </Button>

          <Paper sx={{ p: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              {t("services.form.submit")}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              {t("services.subtitle")}
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mb: 3 }}>
                {t("services.form.success_message")}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Stack spacing={3}>
                {/* Título */}
                <TextField
                  fullWidth
                  label={t("services.form.title")}
                  placeholder={t("services.form.placeholders.title")}
                  value={formData.title}
                  onChange={handleChange('title')}
                  error={!!errors.title}
                  helperText={errors.title}
                  disabled={loading || success}
                  required
                />

                {/* Descripción Corta */}
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label={t("services.form.description")}
                  placeholder={t("services.form.placeholders.description")}
                  value={formData.description}
                  onChange={handleChange('description')}
                  error={!!errors.description}
                  helperText={errors.description || `${formData.description.length} ${t("services.form.help_text.description")}`}
                  disabled={loading || success}
                  inputProps={{ maxLength: 150 }}
                  required
                />

                {/* Descripción Detallada */}
                <TextField
                  fullWidth
                  multiline
                  rows={5}
                  label={t("services.form.detailed_description")}
                  placeholder={t("services.form.placeholders.detailed_description")}
                  value={formData.detailedDescription}
                  onChange={handleChange('detailedDescription')}
                  helperText={`${formData.detailedDescription.length} ${t("services.form.help_text.detailed_description")}`}
                  disabled={loading || success}
                />

                {/* Imagen del Servicio */}
                <ImageUpload
                  autoUpload={true}
                  onImageUploaded={(url) => {
                    setUploadedImageUrl(url);
                    setFormData(prev => ({ ...prev, imageUrl: url }));
                  }}
                  disabled={loading || success}
                />

                {/* Categoría y Tipo */}
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    select
                    fullWidth
                    label={t("services.form.category")}
                    value={formData.category}
                    onChange={handleChange('category')}
                    error={!!errors.category}
                    helperText={errors.category}
                    disabled={loading || success}
                    required
                  >
                    <MenuItem value="">{t("services.filters.category")}</MenuItem>
                    {CATEGORIES.map((cat) => (
                      <MenuItem key={cat} value={cat}>
                        {getCategoryDisplayName(cat)}
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    select
                    fullWidth
                    label={t("services.form.type")}
                    value={formData.type}
                    onChange={handleChange('type')}
                    error={!!errors.type}
                    helperText={errors.type}
                    disabled={loading || success}
                    required
                  >
                    <MenuItem value="">{t("services.filters.type")}</MenuItem>
                    {TYPES.map((type) => (
                      <MenuItem key={type} value={type}>
                        {getTypeDisplayName(type)}
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>

                {/* Duración y Ubicación */}
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    fullWidth
                    type="number"
                    label={t("services.form.duration")}
                    placeholder={t("services.form.placeholders.duration")}
                    value={formData.duration}
                    onChange={handleChange('duration')}
                    error={!!errors.duration}
                    helperText={errors.duration || t("services.form.help_text.duration")}
                    disabled={loading || success}
                    inputProps={{ min: 0.5, max: 24, step: 0.5 }}
                    required
                  />

                  <TextField
                    fullWidth
                    label={t("services.form.location")}
                    placeholder={t("services.form.placeholders.location")}
                    value={formData.location}
                    onChange={handleChange('location')}
                    error={!!errors.location}
                    helperText={errors.location}
                    disabled={loading || success}
                    required
                  />
                </Box>

                {/* Disponibilidad */}
                <TextField
                  select
                  fullWidth
                  label={t("services.form.availability")}
                  value={formData.availability}
                  onChange={handleChange('availability')}
                  helperText={t("services.form.help_text.availability")}
                  disabled={loading || success}
                >
                  <MenuItem value="">{t("services.form.placeholders.availability")}</MenuItem>
                  {AVAILABILITY.map((avail) => (
                    <MenuItem key={avail} value={avail}>
                      {getAvailabilityDisplayName(avail)}
                    </MenuItem>
                  ))}
                </TextField>

                {/* Info adicional */}
                <Alert severity="info" sx={{ fontSize: '13px' }}>
                  <strong>{t("services.form.info_note")}</strong>
                </Alert>

                {/* Botones */}
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', pt: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() => router.push('/services')}
                    disabled={loading || success}
                    sx={{ textTransform: 'none', minWidth: 120 }}
                  >
                    {t("services.form.cancel")}
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading || success}
                    sx={{ textTransform: 'none', minWidth: 120 }}
                  >
                    {loading || uploadImage.isPending ? (
                      <CircularProgress size={24} />
                    ) : (
                      t("services.form.submit")
                    )}
                  </Button>
                </Box>
              </Stack>
            </form>
          </Paper>
        </Container>
      </Box>
    </Layout>
  );
}

