import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Box, Typography, CircularProgress, Button, Chip, Stack } from '@mui/material';
import { useUser } from '@auth0/nextjs-auth0/client';
import { useErrorHandling } from '@/hooks/useErrorHandling';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfileContext } from '@/contexts/UserProfileContext';
import { SuccessAlert, ErrorAlert } from '@/components/ui/BeautifulAlert';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { NotificationsSection } from '@/components/profile/NotificationsSection';
import { useUploadImage } from '@/shared/hooks/use-upload';
import { useFavoriteServices } from '@/hooks/useFavoriteServices';
import { useNotificationPreferences } from '@/hooks/useNotificationPreferences';
import { useEventRegistrations } from '@/hooks/useEventRegistrations';
import { useNotifications } from '@/hooks/useNotifications';
import { buildApiUrl } from '@/shared/api/config';

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

interface UserProfileData {
  id: string;
  email: string;
  name: string;
  role?: 'USER' | 'MODERATOR' | 'ADMIN';
  phoneNumber?: string | null;
  location?: string | null;
  bio?: string | null;
  skills?: string[] | null;
  imageUrl?: string | null;
  timeCredits?: number;
  dateOfBirth?: string | null;
  gender?: string | null;
  preferredLanguage?: string | null;
}

interface ProfileStats {
  ratingsCount: number;
  completedExchanges: number;
  publishedServices: number;
}

const defaultValues: ProfileFormValues = {
  name: '',
  email: '',
  bio: '',
  location: '',
  phoneNumber: '',
  skills: [],
  imageUrl: '',
  dateOfBirth: '',
  gender: '',
  preferredLanguage: 'es',
};

const toDateInputValue = (value?: string | null) => {
  if (!value) return '';
  return value.includes('T') ? value.slice(0, 10) : value;
};

const emptyStats: ProfileStats = {
  ratingsCount: 0,
  completedExchanges: 0,
  publishedServices: 0,
};

const ProfilePage = () => {
  const { user, isLoading } = useUser();
  const { accessToken, getAccessToken } = useAuth();
  const { updateUserProfile } = useUserProfileContext();
  const { error, success, setError, setSuccess } = useErrorHandling();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [formData, setFormData] = useState<ProfileFormValues>(defaultValues);
  const [stats, setStats] = useState<ProfileStats>(emptyStats);
  const profileLoadedRef = useRef(false);
  const formDirtyRef = useRef(false);
  const uploadImage = useUploadImage();
  const { favoritesCount } = useFavoriteServices(user?.sub);
  const { preferences, setPreference } = useNotificationPreferences(user?.sub);
  const { registrationsCount } = useEventRegistrations(user?.sub);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications(user?.sub);

  const profileCompletion = useMemo(() => {
    const checks = [
      Boolean(formData.name?.trim()),
      Boolean((user?.email || formData.email)?.trim()),
      Boolean(formData.bio?.trim()),
      Boolean(formData.location?.trim()),
      Boolean(formData.phoneNumber?.trim()),
      Boolean(formData.imageUrl?.trim() || user?.picture),
      Boolean(formData.dateOfBirth),
      Boolean(formData.gender),
      Boolean(formData.preferredLanguage),
      (formData.skills?.length || 0) > 0,
    ];

    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [formData, user?.email, user?.picture]);

  const handleInputChange = (field: keyof ProfileFormValues, value: string | string[]) => {
    formDirtyRef.current = true;
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSkillAdd = (skill: string) => {
    if (skill && !formData.skills.includes(skill)) {
      formDirtyRef.current = true;
      setFormData((prev) => ({ ...prev, skills: [...prev.skills, skill] }));
    }
  };

  const handleSkillRemove = (index: number) => {
    formDirtyRef.current = true;
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }));
  };

  const handleImageUpload = useCallback(
    async (file: File) => {
      try {
        const result = await uploadImage.mutateAsync(file);
        setFormData((prev) => ({ ...prev, imageUrl: result.url }));
        setProfileData((prev) => (prev ? { ...prev, imageUrl: result.url } : prev));
        updateUserProfile({ imageUrl: result.url });
      } catch (uploadError) {
        console.error('Upload error:', uploadError);
        setError('Error uploading image');
      }
    },
    [setError, updateUserProfile, uploadImage],
  );

  const handleImageEdit = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) void handleImageUpload(file);
    };
    input.click();
  }, [handleImageUpload]);

  const loadProfile = useCallback(async () => {
    if (!user?.sub) {
      window.location.href = '/api/auth/login';
      return;
    }

    try {
      let token = accessToken;
      if (!token) token = await getAccessToken();

      if (!token) {
        window.location.href = '/api/auth/login';
        return;
      }

      const response = await fetch(buildApiUrl(`/users/profile/${user.sub}`), {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const responseData = await response.json();
        const userData = responseData.user as UserProfileData;
        const resolvedEmail = user?.email || userData.email || '';
        const resolvedName = userData.name || user?.name || '';

        setProfileData(userData);
        setFormData({
          name: resolvedName,
          email: resolvedEmail,
          bio: userData.bio || '',
          location: userData.location || '',
          phoneNumber: userData.phoneNumber || '',
          skills: userData.skills || [],
          imageUrl: userData.imageUrl || user.picture || '',
          dateOfBirth: toDateInputValue(userData.dateOfBirth),
          gender: userData.gender || '',
          preferredLanguage: userData.preferredLanguage || 'es',
        });
        profileLoadedRef.current = true;
        formDirtyRef.current = false;
      } else if (response.status === 401) {
        window.location.href = '/api/auth/login';
      } else {
        setError('Error loading profile');
      }
    } catch (loadError) {
      console.error('Profile load error:', loadError);
      setError('Error loading profile');
    }
  }, [accessToken, getAccessToken, setError, user]);

  const loadStats = useCallback(async () => {
    if (!user?.sub) return;

    try {
      let token = accessToken;
      if (!token) token = await getAccessToken();
      if (!token) return;

      const [servicesResponse, requestedResponse, offeredResponse] = await Promise.all([
        fetch(buildApiUrl(`/services?userId=${encodeURIComponent(user.sub)}`), {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(buildApiUrl(`/exchanges?requestedById=${encodeURIComponent(user.sub)}`), {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(buildApiUrl(`/exchanges?offeredById=${encodeURIComponent(user.sub)}`), {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const servicesData = servicesResponse.ok ? await servicesResponse.json() : { services: [] };
      const requestedData = requestedResponse.ok ? await requestedResponse.json() : { exchanges: [] };
      const offeredData = offeredResponse.ok ? await offeredResponse.json() : { exchanges: [] };

      const services = Array.isArray(servicesData.services) ? servicesData.services : [];
      const requested = Array.isArray(requestedData.exchanges) ? requestedData.exchanges : [];
      const offered = Array.isArray(offeredData.exchanges) ? offeredData.exchanges : [];
      const allExchanges = [...requested, ...offered];
      const uniqueExchangeIds = new Set<number>();
      const completedExchanges = allExchanges.filter((exchange: { id: number; state?: string }) => {
        if (uniqueExchangeIds.has(exchange.id)) return false;
        uniqueExchangeIds.add(exchange.id);
        return exchange.state === 'COMPLETED';
      }).length;

      const ratingsCount = services.reduce((total: number, service: { totalRatings?: number; _count?: { ratings?: number } }) => {
        return total + (service.totalRatings ?? service._count?.ratings ?? 0);
      }, 0);

      setStats({
        ratingsCount,
        completedExchanges,
        publishedServices: services.length,
      });
    } catch (statsError) {
      console.error('Stats load error:', statsError);
    }
  }, [accessToken, getAccessToken, user?.sub]);

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        if (!profileLoadedRef.current && !formDirtyRef.current) {
          void loadProfile();
        }
        void loadStats();
      } else {
        window.location.href = '/api/auth/login';
      }
    }
  }, [isLoading, loadProfile, loadStats, user]);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user?.sub) return;

    setIsSubmitting(true);
    try {
      let token = accessToken;
      if (!token) token = await getAccessToken();
      if (!token) throw new Error('No access token available');

      const response = await fetch(buildApiUrl(`/users/profile/${user.sub}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          email: user.email || profileData?.email || formData.email,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        const updatedUser = result.user as UserProfileData | undefined;
        if (updatedUser) {
          setProfileData(updatedUser);
          setFormData((prev) => ({
            ...prev,
            ...updatedUser,
            email: user.email || updatedUser.email || prev.email,
            bio: updatedUser.bio || '',
            location: updatedUser.location || '',
            phoneNumber: updatedUser.phoneNumber || '',
            skills: updatedUser.skills || [],
            imageUrl: updatedUser.imageUrl || '',
            dateOfBirth: toDateInputValue(updatedUser.dateOfBirth),
            gender: updatedUser.gender || '',
            preferredLanguage: updatedUser.preferredLanguage || 'es',
          }));
          formDirtyRef.current = false;
          updateUserProfile(updatedUser);
        }
        setSuccess(true);
        setError(null);
      } else {
        const errorText = await response.text();
        console.error('Profile update failed:', response.status, errorText);
        throw new Error(`Error updating profile: ${response.status}`);
      }
    } catch (submitError) {
      console.error('Profile update error:', submitError);
      setError('Error updating profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.50' }}>
        <Box textAlign="center">
          <CircularProgress size={80} />
          <Typography variant="body1" sx={{ mt: 2, color: 'grey.600' }}>
            Cargando perfil...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.50' }}>
        <Box textAlign="center">
          <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold' }}>
            Acceso requerido
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Necesitas iniciar sesión para acceder a tu perfil.
          </Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Layout>
        <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Box sx={{ textAlign: 'center', maxWidth: 500 }}>
            <Typography variant="h5" sx={{ mb: 2, color: 'error.main' }}>
              Error al cargar el perfil
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
              Parece que hay un problema con tu sesión. Esto puede ocurrir cuando la sesión ha expirado o se ha corrompido.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button variant="contained" component="a" href="/api/auth/logout" sx={{ mb: 1 }}>
                Cerrar Sesión y Volver a Iniciar
              </Button>
              <Button variant="outlined" onClick={() => window.location.reload()} sx={{ mb: 1 }}>
                Recargar Página
              </Button>
            </Box>
          </Box>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', py: { xs: 3, md: 4 } }}>
        <Box sx={{ maxWidth: 1240, mx: 'auto', px: { xs: 2, md: 3 } }}>
          <Box
            sx={{
              mb: 3,
              p: { xs: 2.5, md: 3 },
              borderRadius: 3,
              border: '1px solid rgba(148,163,184,0.14)',
              boxShadow: '0 16px 40px rgba(15,23,42,0.08)',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(245,243,255,0.98) 48%, rgba(240,249,255,0.98) 100%)',
            }}
          >
            <Typography variant="overline" sx={{ color: 'text.secondary', letterSpacing: '0.08em', fontWeight: 800 }}>
              Cuenta
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 900, mb: 1 }}>
              Mi perfil
            </Typography>
            <Typography color="text.secondary" sx={{ lineHeight: 1.75, maxWidth: 780, mb: 2, fontSize: { xs: '0.95rem', md: '1rem' } }}>
              Revisa tus datos, mejora la visibilidad de tu perfil público y mantén preparada tu cuenta para participar en servicios, intercambios y comunidades.
            </Typography>
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ rowGap: 1 }}>
              <Chip label={`Perfil ${profileCompletion}%`} sx={{ fontWeight: 700, bgcolor: 'rgba(138,51,253,0.10)', color: '#7A2EF6' }} />
              <Chip label={`Favoritos: ${favoritesCount}`} sx={{ fontWeight: 700, bgcolor: 'rgba(225,29,72,0.10)', color: '#be123c' }} />
              <Chip label={`Eventos guardados: ${registrationsCount}`} sx={{ fontWeight: 700, bgcolor: 'rgba(15,118,110,0.10)', color: '#0f766e' }} />
              <Chip label={`Servicios publicados: ${stats.publishedServices}`} sx={{ fontWeight: 700 }} />
            </Stack>
          </Box>

          {success && <SuccessAlert message="Datos actualizados correctamente" title="¡Éxito!" onClose={() => setSuccess(false)} sx={{ mb: 3 }} />}
          {error && <ErrorAlert message={error} title="Error" onClose={() => setError(null)} sx={{ mb: 3 }} />}

          <form onSubmit={onSubmit}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 2.5, md: 4 }, mb: 4, alignItems: 'stretch' }}>
              <ProfileHeader
                imageUrl={formData.imageUrl || user.picture || undefined}
                userName={formData.name || user.name || undefined}
                userEmail={user.email || formData.email || undefined}
                location={formData.location}
                timeCredits={profileData?.timeCredits}
                skillsCount={formData.skills.length}
                isAdmin={profileData?.role === 'ADMIN'}
                profileCompletion={profileCompletion}
                ratingsCount={stats.ratingsCount}
                completedExchanges={stats.completedExchanges}
                favoritesCount={favoritesCount}
                registeredEventsCount={registrationsCount}
                onImageEdit={handleImageEdit}
              />
              <ProfileForm
                formData={formData}
                profileData={profileData}
                isSubmitting={isSubmitting}
                onInputChange={handleInputChange}
                onSkillAdd={handleSkillAdd}
                onSkillRemove={handleSkillRemove}
              />
            </Box>

            <NotificationsSection
              preferences={preferences}
              onToggle={setPreference}
              notifications={notifications}
              unreadCount={unreadCount}
              onMarkAsRead={markAsRead}
              onMarkAllAsRead={markAllAsRead}
            />
          </form>
        </Box>
      </Box>
    </Layout>
  );
};

export default ProfilePage;
