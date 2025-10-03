import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Button,
} from '@mui/material';
import { useUser } from '@auth0/nextjs-auth0/client';
import { useErrorHandling } from '@/hooks/useErrorHandling';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfileContext } from '@/contexts/UserProfileContext';
import { SuccessAlert, ErrorAlert } from '@/components/ui/BeautifulAlert';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { NotificationsSection } from '@/components/profile/NotificationsSection';

// Tipos para el formulario de perfil
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
  const { t } = useTranslation();
  const { error, success, setError, setSuccess, clearError } = useErrorHandling();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [formData, setFormData] = useState<ProfileFormValues>(defaultValues);

  // Funciones auxiliares para los componentes
  const handleInputChange = (field: keyof ProfileFormValues, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSkillAdd = (skill: string) => {
    if (skill && !formData.skills.includes(skill)) {
      setFormData(prev => ({ ...prev, skills: [...prev.skills, skill] }));
    }
  };

  const handleSkillRemove = (index: number) => {
    setFormData(prev => ({ 
      ...prev, 
      skills: prev.skills.filter((_, i) => i !== index) 
    }));
  };

  const handleImageEdit = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        handleImageUpload(file);
      }
    };
    input.click();
  };

  // Cargar datos del perfil
  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.sub) {
        console.log('No user found, redirecting to login...');
        window.location.href = '/api/auth/login';
        return;
      }

      try {
        // Primero verificar si tenemos un token válido
        let token = accessToken;
        if (!token) {
          console.log('No access token, trying to get one...');
          token = await getAccessToken();
        }

        if (!token) {
          console.log('Could not get access token, redirecting to login...');
          window.location.href = '/api/auth/login';
          return;
        }

        console.log('Loading profile for user:', user.sub);
        const response = await fetch(`http://localhost:3001/api/users/${user.sub}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        console.log('Profile load response status:', response.status);
        
        if (response.ok) {
          const responseData = await response.json();
          console.log('Profile response loaded:', responseData);
          
          // El endpoint devuelve { message: '...', user: ... }
          const userData = responseData.user;
          console.log('User data:', userData);
          
          setProfileData(userData);
          
          // Actualizar el formulario con los datos del usuario
          const formDataToSet = {
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
          };
          
          console.log('Setting form data:', formDataToSet);
          setFormData(formDataToSet);
        } else {
          const errorText = await response.text();
          console.error('Profile load failed:', response.status, errorText);
          if (response.status === 401) {
            console.log('Unauthorized, redirecting to login...');
            window.location.href = '/api/auth/login';
          } else {
            setError('Error loading profile');
          }
        }
      } catch (error) {
        console.error('Profile load error:', error);
        setError('Error loading profile');
      }
    };

    if (!isLoading) {
      if (user) {
        loadProfile();
      } else {
        console.log('No user authenticated, redirecting to login...');
        window.location.href = '/api/auth/login';
      }
    }
  }, [user, isLoading, setError]);

  // Debug: Log cuando cambien los datos del perfil
  useEffect(() => {
    console.log('Profile data changed:', profileData);
  }, [profileData]);

  // Debug: Log cuando cambien los datos del formulario
  useEffect(() => {
    console.log('Form data changed:', formData);
  }, [formData]);

  // Manejar upload de imagen
  const handleImageUpload = async (file: File) => {
    try {
      console.log('Starting image upload...', file);
      
      // Obtener token si no lo tenemos
      let token = accessToken;
      if (!token) {
        token = await getAccessToken();
      }
      
      if (!token) {
        throw new Error('No access token available');
      }
      
      console.log('Token available:', !!token);
      
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('http://localhost:3001/api/upload/image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      console.log('Upload response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('Upload result:', result);
        
        // Actualizar el estado del formulario
        setFormData((prev: ProfileFormValues) => ({ ...prev, imageUrl: result.url }));
        
        // También actualizar los datos del perfil para que se refleje inmediatamente
        setProfileData((prev: any) => ({ ...prev, imageUrl: result.url }));
        
        // Actualizar el contexto global para que se refleje en la navbar
        console.log('🔄 Updating context with image URL:', result.url);
        updateUserProfile({ imageUrl: result.url });
        console.log('✅ Context updated');
        
        console.log('Image URL updated:', result.url);
        return result.url;
      } else {
        const errorText = await response.text();
        console.error('Upload failed:', response.status, errorText);
        throw new Error(`Error uploading image: ${response.status}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError('Error uploading image');
      throw error;
    }
  };

  // Enviar formulario
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted!', formData);
    
    if (!user?.sub) {
      console.error('No user ID available');
      return;
    }

    setIsSubmitting(true);
    try {
      // Obtener token si no lo tenemos
      let token = accessToken;
      if (!token) {
        console.log('Getting access token...');
        token = await getAccessToken();
      }
      
      if (!token) {
        throw new Error('No access token available');
      }

      console.log('Sending profile update...', formData);
      const response = await fetch(`http://localhost:3001/api/users/${user.sub}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      console.log('Profile update response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('Profile updated successfully:', result);
        
        // Actualizar los datos del perfil con la respuesta
        if (result.user) {
          setProfileData(result.user);
          // Actualizar el contexto global
          updateUserProfile(result.user);
        }
        
        // Mostrar mensaje de éxito controlado
        setSuccess(true);
        setError(null);
      } else {
        const errorText = await response.text();
        console.error('Profile update failed:', response.status, errorText);
        throw new Error(`Error updating profile: ${response.status}`);
      }
    } catch (error) {
      console.error('Profile update error:', error);
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

  // Si hay error y el usuario está autenticado, mostrar opciones de recuperación
  if (error && user) {
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
              <Button 
                variant="contained" 
                component="a" 
                href="/api/auth/logout"
                sx={{ mb: 1 }}
              >
                Cerrar Sesión y Volver a Iniciar
              </Button>
              <Button 
                variant="outlined" 
                onClick={() => window.location.reload()}
                sx={{ mb: 1 }}
              >
                Recargar Página
              </Button>
            </Box>
            <Typography variant="caption" sx={{ mt: 2, display: 'block', color: 'text.secondary' }}>
              Si el problema persiste, intenta cerrar sesión y volver a iniciar sesión.
            </Typography>
          </Box>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
        <Box sx={{ maxWidth: 1200, mx: 'auto', p: 4 }}>
          {/* Alertas de éxito y error */}
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
          {/* Mi información - Formato de dos columnas */}
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
              onSubmit={onSubmit}
            />
          </Box>

          {/* Notificaciones - Formato de dos columnas */}
          <NotificationsSection />
          </form>
        </Box>
      </Box>
    </Layout>
  );
};

export default ProfilePage;