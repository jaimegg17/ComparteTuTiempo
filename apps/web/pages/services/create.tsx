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
  
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    detailedDescription: '',
    duration: '',
    category: '',
    type: '',
    location: '',
    availability: '',
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value,
    }));
    
    // Clear error for this field
    if (errors[field]) {
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
            ← Volver a servicios
          </Button>

          <Paper sx={{ p: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              Publicar un Servicio
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              Comparte tus habilidades con la comunidad y gana créditos de tiempo
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mb: 3 }}>
                ¡Servicio creado exitosamente! Redirigiendo...
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Stack spacing={3}>
                {/* Título */}
                <TextField
                  fullWidth
                  label="Título del servicio"
                  placeholder="Ej: Clases de inglés para principiantes"
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
                  label="Descripción corta"
                  placeholder="Resumen breve para el listado de servicios (máx. 150 caracteres)"
                  value={formData.description}
                  onChange={handleChange('description')}
                  error={!!errors.description}
                  helperText={errors.description || `${formData.description.length} caracteres`}
                  disabled={loading || success}
                  inputProps={{ maxLength: 150 }}
                  required
                />

                {/* Descripción Detallada */}
                <TextField
                  fullWidth
                  multiline
                  rows={5}
                  label="Descripción detallada (opcional)"
                  placeholder="Describe tu servicio en detalle: qué ofreces, qué incluye, requisitos previos, material necesario..."
                  value={formData.detailedDescription}
                  onChange={handleChange('detailedDescription')}
                  helperText={`${formData.detailedDescription.length} caracteres - Se mostrará en la página de detalle`}
                  disabled={loading || success}
                />

                {/* Categoría y Tipo */}
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    select
                    fullWidth
                    label="Categoría"
                    value={formData.category}
                    onChange={handleChange('category')}
                    error={!!errors.category}
                    helperText={errors.category}
                    disabled={loading || success}
                    required
                  >
                    <MenuItem value="">Selecciona una categoría</MenuItem>
                    {CATEGORIES.map((cat) => (
                      <MenuItem key={cat} value={cat}>
                        {cat}
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    select
                    fullWidth
                    label="Modalidad"
                    value={formData.type}
                    onChange={handleChange('type')}
                    error={!!errors.type}
                    helperText={errors.type}
                    disabled={loading || success}
                    required
                  >
                    <MenuItem value="">Selecciona una modalidad</MenuItem>
                    {TYPES.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>

                {/* Duración y Ubicación */}
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Duración (horas)"
                    placeholder="Ej: 2"
                    value={formData.duration}
                    onChange={handleChange('duration')}
                    error={!!errors.duration}
                    helperText={errors.duration || 'Duración aproximada de una sesión'}
                    disabled={loading || success}
                    inputProps={{ min: 0.5, max: 24, step: 0.5 }}
                    required
                  />

                  <TextField
                    fullWidth
                    label="Ubicación"
                    placeholder="Ej: Madrid, Barcelona..."
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
                  label="Disponibilidad"
                  value={formData.availability}
                  onChange={handleChange('availability')}
                  helperText="Cuándo puedes ofrecer este servicio"
                  disabled={loading || success}
                >
                  <MenuItem value="">Selecciona tu disponibilidad</MenuItem>
                  {AVAILABILITY.map((avail) => (
                    <MenuItem key={avail} value={avail}>
                      {avail.charAt(0).toUpperCase() + avail.slice(1).replace('-', ' y ')}
                    </MenuItem>
                  ))}
                </TextField>

                {/* Info adicional */}
                <Alert severity="info" sx={{ fontSize: '13px' }}>
                  <strong>Nota:</strong> La duración del servicio representa las horas de crédito que recibirás 
                  cuando se complete un intercambio.
                </Alert>

                {/* Botones */}
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', pt: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() => router.push('/services')}
                    disabled={loading || success}
                    sx={{ textTransform: 'none', minWidth: 120 }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading || success}
                    sx={{ textTransform: 'none', minWidth: 120 }}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Publicar Servicio'}
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

