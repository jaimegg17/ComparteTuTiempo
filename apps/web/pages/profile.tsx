import React, { useCallback, useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Button } from '@mui/material';
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

const ProfilePage = () => {
  const { user, isLoading } = useUser();
  const { accessToken, getAccessToken } = useAuth();
  const { updateUserProfile } = useUserProfileContext();
  const { error, success, setError, setSuccess } = useErrorHandling();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [formData, setFormData] = useState<ProfileFormValues>(defaultValues);
  const uploadImage = useUploadImage();

  const handleInputChange = (field: keyof ProfileFormValues, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSkillAdd = (skill: string) => {
    if (skill && !formData.skills.includes(skill)) {
      setFormData((prev) => ({ ...prev, skills: [...prev.skills, skill] }));
    }
  };

  const handleSkillRemove = (index: number) => {
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

      const response = await fetch(`http://localhost:3001/api/users/${user.sub}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const responseData = await response.json();
        const userData = responseData.user as UserProfileData;

        setProfileData(userData);
        setFormData({
          name: userData.name || user.name || '',
          email: userData.email || user.email || '',
          bio: userData.bio || '',
          location: userData.location || '',
          phoneNumber: userData.phoneNumber || '',
          skills: userData.skills || [],
          imageUrl: userData.imageUrl || user.picture || '',
          dateOfBirth: userData.dateOfBirth || '',
          gender: userData.gender || '',
          preferredLanguage: userData.preferredLanguage || 'es',
        });
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

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        void loadProfile();
      } else {
        window.location.href = '/api/auth/login';
      }
    }
  }, [isLoading, loadProfile, user]);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!user?.sub) return;

    setIsSubmitting(true);
    try {
      let token = accessToken;
      if (!token) token = await getAccessToken();
      if (!token) throw new Error('No access token available');

      const response = await fetch(`http://localhost:3001/api/users/${user.sub}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        const updatedUser = result.user as UserProfileData | undefined;
        if (updatedUser) {
          setProfileData(updatedUser);
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
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'grey.50',
        }}
      >
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
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'grey.50',
        }}
      >
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
        <Box
          sx={{
            minHeight: '100vh',
            bgcolor: 'grey.50',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Box sx={{ textAlign: 'center', maxWidth: 500 }}>
            <Typography variant="h5" sx={{ mb: 2, color: 'error.main' }}>
              Error al cargar el perfil
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
              Parece que hay un problema con tu sesión. Esto puede ocurrir cuando la sesión ha
              expirado o se ha corrompido.
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
      <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
        <Box sx={{ maxWidth: 1200, mx: 'auto', p: 4 }}>
          {success && (
            <SuccessAlert
              message="Datos actualizados correctamente"
              title="¡Éxito!"
              onClose={() => setSuccess(false)}
              sx={{ mb: 3 }}
            />
          )}
          {error && (
            <ErrorAlert
              message={error}
              title="Error"
              onClose={() => setError(null)}
              sx={{ mb: 3 }}
            />
          )}

          <form onSubmit={onSubmit}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4, mb: 4 }}>
              <ProfileHeader
                imageUrl={formData.imageUrl || user.picture || undefined}
                userName={user.name || undefined}
                userEmail={user.email || undefined}
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

            <NotificationsSection />
          </form>
        </Box>
      </Box>
    </Layout>
  );
};

export default ProfilePage;
