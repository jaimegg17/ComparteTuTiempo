import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import Script from 'next/script';
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
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/ToastProvider';
import { getFriendlyErrorMessage } from '@/shared/utils/error-messages';
import type { Service } from '@/types/service.types';
import { buildApiUrl } from '@/shared/api/config';

const CATEGORIES = ['EDUCACION', 'HOGAR', 'TECNOLOGIA', 'SALUD', 'DEPORTES', 'ARTE', 'OTROS'];
const TYPES = ['PRESENCIAL', 'VIRTUAL', 'HIBRIDO'];
const INTENTS = ['OFFER', 'REQUEST'] as const;
const AVAILABILITY = ['mañana', 'tarde', 'noche', 'mañana-tarde', 'tarde-noche', 'flexible'];

interface FormData {
  title: string;
  description: string;
  detailedDescription: string;
  duration: string;
  category: string;
  type: string;
  intent: 'OFFER' | 'REQUEST';
  location: string;
  availability: string;
  imageUrl: string;
  latitude?: number | null;
  longitude?: number | null;
  formattedAddress?: string;
  placeId?: string;
}

interface FormErrors {
  title?: string;
  description?: string;
  duration?: string;
  category?: string;
  type?: string;
  location?: string;
}

type PlaceResult = {
  name?: string;
  formatted_address?: string;
  place_id?: string;
  geometry?: {
    location?: {
      lat: () => number;
      lng: () => number;
    };
  };
};

export default function EditServicePage() {
  const router = useRouter();
  const { id } = router.query;
  const { user, isLoading: userLoading } = useUser();
  const { getAccessToken } = useAuth();
  const { t } = useTranslation();

  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    detailedDescription: '',
    duration: '',
    category: '',
    type: '',
    intent: 'OFFER',
    location: '',
    availability: '',
    imageUrl: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [loadingService, setLoadingService] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [locating, setLocating] = useState(false);
  const locationInputRef = useRef<HTMLInputElement | null>(null);
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const { showToast } = useToast();

  const getCategoryDisplayName = (category: string) => {
    const categoryMap: Record<string, string> = {
      EDUCACION: t('services.categories.education'),
      HOGAR: t('services.categories.home'),
      TECNOLOGIA: t('services.categories.technology'),
      SALUD: t('services.categories.health'),
      DEPORTES: t('services.categories.sports'),
      ARTE: t('services.categories.art'),
      OTROS: t('services.categories.others'),
    };
    return categoryMap[category] || category;
  };

  const getTypeDisplayName = (type: string) => {
    const typeMap: Record<string, string> = {
      PRESENCIAL: t('services.types.in_person'),
      VIRTUAL: t('services.types.online'),
      HIBRIDO: t('services.types.hybrid'),
    };
    return typeMap[type] || type;
  };

  const getIntentDisplayName = (intent: 'OFFER' | 'REQUEST') => intent === 'REQUEST' ? 'Solicitud de ayuda' : 'Servicio ofrecido';

  const getAvailabilityDisplayName = (availability: string) => {
    const availabilityMap: Record<string, string> = {
      mañana: t('services.form.availability_options.morning'),
      tarde: t('services.form.availability_options.afternoon'),
      noche: t('services.form.availability_options.evening'),
      'mañana-tarde': t('services.form.availability_options.morning_afternoon'),
      'tarde-noche': t('services.form.availability_options.afternoon_evening'),
      flexible: t('services.form.availability_options.flexible'),
    };
    return availabilityMap[availability] || availability;
  };

  useEffect(() => {
    if (!id || !user) return;

    const fetchService = async () => {
      try {
        setLoadingService(true);
        const response = await fetch(buildApiUrl(`/services/${id}`));
        if (!response.ok) throw new Error('No se pudo cargar el servicio');
        const data = await response.json();
        const service: Service = data.service;

        const isOwner = user.sub === service.userId || user.sub === service.user?.id;
        if (!isOwner) {
          router.push(`/services/${id}`);
          return;
        }

        setFormData({
          title: service.title || '',
          description: service.description || '',
          detailedDescription: service.detailedDescription || '',
          duration: service.duration ? String(service.duration) : '',
          category: service.category || '',
          type: service.type || '',
          intent: service.intent || 'OFFER',
          location: service.formattedAddress || service.location || '',
          availability: service.availability || '',
          imageUrl: service.imageUrl || '',
          latitude: service.latitude ?? undefined,
          longitude: service.longitude ?? undefined,
          formattedAddress: service.formattedAddress ?? undefined,
          placeId: service.placeId ?? undefined,
        });
      } catch (err) {
        const message = getFriendlyErrorMessage(err, 'Error al cargar el servicio');
        setError(message);
        showToast({ message, severity: 'error' });
      } finally {
        setLoadingService(false);
      }
    };

    fetchService();
  }, [id, user, router, showToast]);

  useEffect(() => {
    if (!mapsLoaded || !locationInputRef.current || typeof window === 'undefined') return;

    const googleObj = (
      window as Window & {
        google?: {
          maps?: {
            places?: {
              Autocomplete: new (
                input: HTMLInputElement,
                options?: Record<string, unknown>,
              ) => {
                addListener: (
                  eventName: string,
                  callback: () => void,
                ) => { remove: () => void } | void;
                getPlace: () => PlaceResult;
              };
            };
          };
        };
      }
    ).google;

    const AutocompleteCtor = googleObj?.maps?.places?.Autocomplete;
    if (!AutocompleteCtor) return;

    const autocomplete = new AutocompleteCtor(locationInputRef.current, {
      fields: ['formatted_address', 'name', 'geometry', 'place_id'],
    });

    const listener = autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      const lat = place.geometry?.location?.lat?.();
      const lng = place.geometry?.location?.lng?.();
      const bestAddress = place.formatted_address || place.name || '';

      setFormData(prev => ({
        ...prev,
        location: bestAddress,
        latitude: typeof lat === 'number' ? lat : undefined,
        longitude: typeof lng === 'number' ? lng : undefined,
        formattedAddress: place.formatted_address || bestAddress || undefined,
        placeId: place.place_id || undefined,
      }));
    });

    return () => {
      if (listener && typeof listener.remove === 'function') listener.remove();
    };
  }, [mapsLoaded]);

  const handleChange = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const nextValue = e.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: nextValue,
      ...(field === 'location'
        ? { latitude: undefined, longitude: undefined, formattedAddress: undefined, placeId: undefined }
        : {}),
    }));

    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.title.trim()) newErrors.title = 'El título es obligatorio';
    else if (formData.title.length < 5) newErrors.title = 'El título debe tener al menos 5 caracteres';

    if (!formData.description.trim()) newErrors.description = 'La descripción es obligatoria';
    else if (formData.description.length < 20) newErrors.description = 'La descripción debe tener al menos 20 caracteres';

    const duration = parseFloat(formData.duration);
    if (!formData.duration) newErrors.duration = 'La duración es obligatoria';
    else if (isNaN(duration) || duration <= 0) newErrors.duration = 'La duración debe ser un número positivo';
    else if (duration > 24) newErrors.duration = 'La duración no puede superar 24 horas';

    if (!formData.category) newErrors.category = 'La categoría es obligatoria';
    if (!formData.type) newErrors.type = 'El tipo es obligatorio';
    if (!formData.location.trim()) newErrors.location = 'La ubicación es obligatoria';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      const geolocationError = 'Tu navegador no soporta geolocalización.';
      setError(geolocationError);
      showToast({ message: geolocationError, severity: 'warning' });
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setFormData(prev => ({
          ...prev,
          location: prev.location || `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
          latitude: lat,
          longitude: lng,
        }));
        setLocating(false);
      },
      () => {
        const geolocationError = 'No se pudo obtener tu ubicación. Revisa los permisos del navegador e inténtalo de nuevo.';
        setError(geolocationError);
        showToast({ message: geolocationError, severity: 'warning' });
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !user) return;
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      const token = await getAccessToken();
      if (!token) throw new Error('No se pudo obtener el token de autenticación');

      const response = await fetch(buildApiUrl(`/services/${id}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formData.title.trim(),
          description: formData.description.trim(),
          detailedDescription: formData.detailedDescription.trim() || undefined,
          duration: parseFloat(formData.duration),
          category: formData.category,
          type: formData.type,
          intent: formData.intent,
          location: formData.location.trim(),
          availability: formData.availability || undefined,
          imageUrl: formData.imageUrl || undefined,
          latitude: formData.latitude,
          longitude: formData.longitude,
          formattedAddress: formData.formattedAddress,
          placeId: formData.placeId,
          price: parseFloat(formData.duration) * 60,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar el servicio');
      }

      setSuccess(true);
      showToast({ message: 'Servicio actualizado correctamente.', severity: 'success' });
      setTimeout(() => {
        router.push(`/services/${id}`);
      }, 1200);
    } catch (err) {
      const message = getFriendlyErrorMessage(err, 'Error al actualizar el servicio');
      setError(message);
      showToast({ message, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (userLoading || loadingService) {
    return (
      <Layout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      {googleMapsApiKey && (
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=places&loading=async`}
          strategy="afterInteractive"
          onLoad={() => setMapsLoaded(true)}
        />
      )}
      <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100%', py: 4 }}>
        <Container maxWidth="md">
          <Button onClick={() => router.push(`/services/${id}`)} sx={{ mb: 3, textTransform: 'none' }}>
            ← Volver al servicio
          </Button>

          <Paper sx={{ p: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              {formData.intent === 'REQUEST' ? 'Editar solicitud' : 'Editar servicio'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              {formData.intent === 'REQUEST' ? 'Actualiza los datos de tu solicitud y facilita que otras personas puedan ayudarte.' : 'Actualiza los datos de tu servicio y su ubicación.'}
            </Typography>

            {!googleMapsApiKey && (
              <Alert severity="warning" sx={{ mb: 3 }}>
                Google Places no está configurado en frontend (`NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`).
                Puedes editar el servicio igualmente, pero sin sugerencias de ubicación.
              </Alert>
            )}

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 3 }}>Servicio actualizado correctamente</Alert>}

            <form onSubmit={handleSubmit}>
              <Stack spacing={3}>
                <TextField fullWidth label={t("services.form.title")} value={formData.title} onChange={handleChange('title')} error={!!errors.title} helperText={errors.title} />
                <TextField fullWidth multiline rows={2} label={t("services.form.description")} value={formData.description} onChange={handleChange('description')} error={!!errors.description} helperText={errors.description} />
                <TextField fullWidth multiline rows={4} label={t("services.form.detailed_description")} value={formData.detailedDescription} onChange={handleChange('detailedDescription')} />

                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <TextField select fullWidth label="Tipo de publicación" value={formData.intent} onChange={handleChange('intent')}>
                    {INTENTS.map((intent) => <MenuItem key={intent} value={intent}>{getIntentDisplayName(intent)}</MenuItem>)}
                  </TextField>
                  <TextField select fullWidth label={t("services.form.category")} value={formData.category} onChange={handleChange('category')} error={!!errors.category} helperText={errors.category}>
                    <MenuItem value="">{t("services.filters.category")}</MenuItem>
                    {CATEGORIES.map((cat) => <MenuItem key={cat} value={cat}>{getCategoryDisplayName(cat)}</MenuItem>)}
                  </TextField>
                  <TextField select fullWidth label={t("services.form.type")} value={formData.type} onChange={handleChange('type')} error={!!errors.type} helperText={errors.type}>
                    <MenuItem value="">{t("services.filters.type")}</MenuItem>
                    {TYPES.map((type) => <MenuItem key={type} value={type}>{getTypeDisplayName(type)}</MenuItem>)}
                  </TextField>
                </Box>

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    fullWidth
                    type="number"
                    label={t("services.form.duration")}
                    value={formData.duration}
                    onChange={handleChange('duration')}
                    error={!!errors.duration}
                    helperText={errors.duration}
                    inputProps={{ min: 0.5, max: 24, step: 0.5 }}
                  />
                  <TextField
                    fullWidth
                    label={t("services.form.location")}
                    value={formData.location}
                    onChange={handleChange('location')}
                    inputRef={locationInputRef}
                    error={!!errors.location}
                    helperText={
                      errors.location ||
                      (googleMapsApiKey
                        ? 'Puedes escribir o seleccionar una sugerencia de Google Places'
                        : 'Añade una ubicación textual. Sin API key no hay sugerencias.')
                    }
                  />
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <Button variant="text" onClick={handleUseCurrentLocation} disabled={loading || locating} sx={{ textTransform: 'none', px: 0 }}>
                    {locating ? 'Obteniendo ubicación…' : 'Usar mi ubicación actual'}
                  </Button>
                </Box>

                <TextField select fullWidth label={t("services.form.availability")} value={formData.availability} onChange={handleChange('availability')}>
                  <MenuItem value="">{t("services.form.placeholders.availability")}</MenuItem>
                  {AVAILABILITY.map((avail) => <MenuItem key={avail} value={avail}>{getAvailabilityDisplayName(avail)}</MenuItem>)}
                </TextField>

                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', pt: 2 }}>
                  <Button variant="outlined" onClick={() => router.push(`/services/${id}`)} disabled={loading || success} sx={{ textTransform: 'none', minWidth: 120 }}>
                    Cancelar
                  </Button>
                  <Button type="submit" variant="contained" disabled={loading || success} sx={{ textTransform: 'none', minWidth: 120 }}>
                    {loading ? <CircularProgress size={24} /> : 'Guardar cambios'}
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
