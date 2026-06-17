import { useEffect, useState } from 'react';
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
  List,
  ListItemButton,
  ListItemText,
} from '@mui/material';
import { Layout } from '@/components/Layout';
import { useUser } from '@auth0/nextjs-auth0/client';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/hooks/useAuth';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { useUploadImage } from '@/shared/hooks/use-upload';
import { getFriendlyErrorMessage } from '@/shared/utils/error-messages';
import { useToast } from '@/components/ui/ToastProvider';
import { buildApiUrl } from '@/shared/api/config';
import { communitiesApi } from '@/shared/api/communities';
import type { Community } from '@comparte-tu-tiempo/contracts';

const CATEGORIES = ['EDUCACION', 'HOGAR', 'TECNOLOGIA', 'SALUD', 'DEPORTES', 'ARTE', 'OTROS'];
const TYPES = ['PRESENCIAL', 'VIRTUAL', 'HIBRIDO'];
const INTENTS = ['OFFER', 'REQUEST'] as const;
const AVAILABILITY = ['mañana', 'tarde', 'noche', 'mañana-tarde', 'tarde-noche', 'flexible'];

type PlacePrediction = {
  description: string;
  placeId: string;
};

type GooglePlacesStatus = 'OK' | 'ZERO_RESULTS' | string;

type GooglePlacesAutocompleteService = {
  getPlacePredictions: (
    request: { input: string; types?: string[] },
    callback: (predictions: Array<{ description: string; place_id: string }> | null, status: GooglePlacesStatus) => void,
  ) => void;
};

type GooglePlacesService = {
  getDetails: (
    request: { placeId: string; fields: string[] },
    callback: (
      place: {
        formatted_address?: string;
        name?: string;
        place_id?: string;
        geometry?: { location?: { lat: () => number; lng: () => number } };
      } | null,
      status: GooglePlacesStatus,
    ) => void,
  ) => void;
};

type GoogleMapsWindow = Window & {
  google?: {
    maps?: {
      places?: {
        PlacesServiceStatus?: { OK: string };
        AutocompleteService: new () => GooglePlacesAutocompleteService;
        PlacesService: new (container: HTMLDivElement) => GooglePlacesService;
      };
    };
  };
};

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
  communityId?: string;
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
    communityId: '',
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [locating, setLocating] = useState(false);
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [mapsFailed, setMapsFailed] = useState(false);
  const [locationPredictions, setLocationPredictions] = useState<PlacePrediction[]>([]);
  const [locationSearchLoading, setLocationSearchLoading] = useState(false);
  const [locationPredictionsOpen, setLocationPredictionsOpen] = useState(false);
  const uploadImage = useUploadImage();
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const { showToast } = useToast();

  useEffect(() => {
    const rawCommunityId = router.query?.communityId;
    const communityId = Array.isArray(rawCommunityId) ? rawCommunityId[0] : rawCommunityId;
    if (!communityId) return;

    const parsedCommunityId = Number(communityId);
    if (!Number.isInteger(parsedCommunityId) || parsedCommunityId <= 0) return;

    setFormData((prev) => ({ ...prev, communityId: String(parsedCommunityId) }));
    void communitiesApi
      .getCommunity(parsedCommunityId)
      .then((response) => setSelectedCommunity(response.community))
      .catch(() => setSelectedCommunity(null));
  }, [router.query?.communityId]);

  // Display mapping functions
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

  const getIntentDisplayName = (intent: 'OFFER' | 'REQUEST') => intent === 'REQUEST' ? 'Solicitud de ayuda' : 'Servicio ofrecido';

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


  useEffect(() => {
    if (typeof window !== 'undefined' && (window as GoogleMapsWindow).google?.maps?.places) {
      setMapsLoaded(true);
      setMapsFailed(false);
    }
  }, []);

  const handleChange = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const nextValue = e.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: nextValue,
      ...(field === 'location'
        ? {
            latitude: undefined,
            longitude: undefined,
            formattedAddress: undefined,
            placeId: undefined,
          }
        : {}),
    }));
    
    // Clear the error for this field
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  useEffect(() => {
    const query = formData.location.trim();
    const googlePlaces = typeof window !== 'undefined' ? (window as GoogleMapsWindow).google?.maps?.places : undefined;

    if (!googleMapsApiKey || mapsFailed || !mapsLoaded || !googlePlaces || !locationPredictionsOpen || query.length < 3 || formData.placeId) {
      setLocationPredictions([]);
      setLocationSearchLoading(false);
      return;
    }

    let cancelled = false;
    const timeout = window.setTimeout(() => {
      setLocationSearchLoading(true);
      const autocompleteService = new googlePlaces.AutocompleteService();
      autocompleteService.getPlacePredictions(
        { input: query, types: ['geocode'] },
        (predictions, status) => {
          if (cancelled) return;
          const okStatus = googlePlaces.PlacesServiceStatus?.OK || 'OK';
          if (status === okStatus && predictions) {
            setLocationPredictions(
              predictions.map((prediction) => ({
                description: prediction.description,
                placeId: prediction.place_id,
              })),
            );
          } else {
            setLocationPredictions([]);
          }
          setLocationSearchLoading(false);
        },
      );
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [formData.location, formData.placeId, googleMapsApiKey, locationPredictionsOpen, mapsFailed, mapsLoaded]);

  const handleSelectLocationPrediction = (prediction: PlacePrediction) => {
    const googlePlaces = typeof window !== 'undefined' ? (window as GoogleMapsWindow).google?.maps?.places : undefined;

    setLocationPredictions([]);
    setLocationPredictionsOpen(false);
    setFormData((prev) => ({
      ...prev,
      location: prediction.description,
      formattedAddress: prediction.description,
      placeId: prediction.placeId,
    }));

    if (!googlePlaces) return;

    const detailsContainer = document.createElement('div');
    const placesService = new googlePlaces.PlacesService(detailsContainer);
    placesService.getDetails(
      { placeId: prediction.placeId, fields: ['formatted_address', 'name', 'geometry', 'place_id'] },
      (place, status) => {
        const okStatus = googlePlaces.PlacesServiceStatus?.OK || 'OK';
        if (status !== okStatus || !place) return;

        const lat = place.geometry?.location?.lat?.();
        const lng = place.geometry?.location?.lng?.();
        const bestAddress = place.formatted_address || place.name || prediction.description;

        setFormData((prev) => ({
          ...prev,
          location: bestAddress,
          formattedAddress: bestAddress,
          placeId: place.place_id || prediction.placeId,
          latitude: typeof lat === 'number' ? lat : undefined,
          longitude: typeof lng === 'number' ? lng : undefined,
        }));
      },
    );
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
          formattedAddress: prev.formattedAddress,
          placeId: prev.placeId,
        }));
        setLocating(false);
      },
      () => {
        const geolocationError = 'No se pudo obtener tu ubicación. Revisa los permisos del navegador e inténtalo de nuevo.';
        setError(geolocationError);
        showToast({ message: geolocationError, severity: 'warning' });
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
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
      // Use the uploaded image URL when available
      const imageUrl = uploadedImageUrl || formData.imageUrl;

      const token = await getAccessToken();
      if (!token) {
        throw new Error('No se pudo obtener el token de autenticación');
      }

      const response = await fetch(buildApiUrl('/services'), {
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
          intent: formData.intent,
          location: formData.location.trim(),
          latitude: formData.latitude,
          longitude: formData.longitude,
          formattedAddress: formData.formattedAddress,
          placeId: formData.placeId,
          availability: formData.availability || undefined,
          imageUrl: imageUrl || undefined,
          communityId: formData.communityId ? Number(formData.communityId) : undefined,
          price: parseFloat(formData.duration) * 60, // Duration in minutes
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear el servicio');
      }
      
      const data = await response.json();
      setSuccess(true);
      showToast({ message: formData.intent === 'REQUEST' ? 'Solicitud creada correctamente.' : 'Servicio creado correctamente.', severity: 'success' });
      
      // Redirect to the created service
      setTimeout(() => {
        router.push(`/services/${data.service.id}`);
      }, 1500);
    } catch (err) {
      const message = getFriendlyErrorMessage(err, 'Error al crear el servicio');
      setError(message);
      showToast({ message, severity: 'error' });
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
      {googleMapsApiKey && (
        <Script
          id="google-maps-js"
          src={`https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=places&loading=async`}
          strategy="afterInteractive"
          onLoad={() => {
            setMapsLoaded(true);
            setMapsFailed(false);
          }}
          onError={() => setMapsFailed(true)}
        />
      )}
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
              {formData.intent === 'REQUEST' ? 'Crear solicitud' : t("services.form.submit")}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              {formData.intent === 'REQUEST' ? 'Publica una necesidad concreta para que otras personas puedan ofrecerte ayuda.' : t("services.subtitle")}
            </Typography>

            {(!googleMapsApiKey || mapsFailed) && (
              <Alert severity="info" sx={{ mb: 3 }}>
                Google Places no está disponible ahora mismo. Puedes escribir la ubicación manualmente o usar tu ubicación actual.
              </Alert>
            )}

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
                {/* Title */}
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

                {/* Short description */}
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

                {/* Detailed description */}
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

                {selectedCommunity && (
                  <Alert severity="info">
                    {t('services.form.communityNotice', { name: selectedCommunity.name })}
                  </Alert>
                )}

                {/* Post type, category, and format */}
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <TextField
                    select
                    fullWidth
                    label="Tipo de publicación"
                    value={formData.intent}
                    onChange={handleChange('intent')}
                    disabled={loading || success}
                  >
                    {INTENTS.map((intent) => (
                      <MenuItem key={intent} value={intent}>
                        {getIntentDisplayName(intent)}
                      </MenuItem>
                    ))}
                  </TextField>
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

                {/* Duration and location */}
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

                  <Box sx={{ width: '100%', position: 'relative' }}>
                    <TextField
                      fullWidth
                      label={t("services.form.location")}
                      placeholder={t("services.form.placeholders.location")}
                      value={formData.location}
                      onChange={handleChange('location')}
                      onFocus={() => setLocationPredictionsOpen(true)}
                      autoComplete="off"
                      name="service-location-manual"
                      error={!!errors.location}
                      helperText={
                        errors.location ||
                        (locationSearchLoading
                          ? 'Buscando ubicaciones en Google Maps…'
                          : googleMapsApiKey && !mapsFailed
                            ? 'Empieza a escribir y selecciona una ubicación de Google Maps para guardarla con coordenadas.'
                            : 'Escribe una dirección o usa tu ubicación actual para guardar coordenadas.')
                      }
                      disabled={loading || success}
                      required
                    />
                    {locationPredictionsOpen && locationPredictions.length > 0 && (
                      <Paper
                        variant="outlined"
                        sx={{
                          position: 'absolute',
                          zIndex: 20,
                          top: '56px',
                          left: 0,
                          right: 0,
                          borderRadius: 2,
                          overflow: 'hidden',
                          boxShadow: '0 12px 30px rgba(15, 23, 42, 0.16)',
                        }}
                      >
                        <List dense disablePadding>
                          {locationPredictions.map((prediction) => (
                            <ListItemButton
                              key={prediction.placeId}
                              onMouseDown={(event) => event.preventDefault()}
                              onClick={() => handleSelectLocationPrediction(prediction)}
                            >
                              <ListItemText primary={prediction.description} />
                            </ListItemButton>
                          ))}
                        </List>
                      </Paper>
                    )}
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <Button
                    variant="text"
                    onClick={handleUseCurrentLocation}
                    disabled={loading || success || locating}
                    sx={{ textTransform: 'none', px: 0 }}
                  >
                    {locating ? 'Obteniendo ubicación…' : 'Usar mi ubicación actual'}
                  </Button>
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

                {/* Buttons */}
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
