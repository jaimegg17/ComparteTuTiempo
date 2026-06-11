import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { useAuth } from './useAuth';
import { buildApiUrl } from '@/shared/api/config';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role?: 'USER' | 'MODERATOR' | 'ADMIN';
  imageUrl?: string | null;
  bio?: string | null;
  location?: string | null;
  phoneNumber?: string | null;
  skills?: string[] | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  preferredLanguage?: string | null;
  timeCredits?: number | null;
}

export const useUserProfile = () => {
  const { user } = useUser();
  const { accessToken, getAccessToken } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const loadUserProfile = useCallback(async () => {
    if (!user?.sub) return;

    setProfileLoading(true);
    try {
      // Obtener token si no lo tenemos
      let token = accessToken;
      if (!token) {
        token = await getAccessToken();
      }
      
      if (!token) {
        return;
      }

      const response = await fetch(buildApiUrl('/users/me'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const responseData = await response.json();
        setUserProfile(responseData.user);
      }
    } catch {
    } finally {
      setProfileLoading(false);
    }
  }, [user?.sub, accessToken, getAccessToken]);

  useEffect(() => {
    if (user && accessToken) {
      void loadUserProfile();
    }
  }, [user, accessToken, loadUserProfile]);

  const updateUserProfile = (newProfile: Partial<UserProfile>) => {
    setUserProfile(prev => prev ? { ...prev, ...newProfile } : null);
  };

  const displayName = userProfile?.name || user?.name || '';
  const displayEmail = userProfile?.email || user?.email || '';
  const displayImage = userProfile?.imageUrl || user?.picture || undefined;

  return {
    userProfile,
    profileLoading,
    loadUserProfile,
    updateUserProfile,
    // Fallback a datos de Auth0 si no tenemos perfil del backend
    displayName,
    displayEmail,
    displayImage,
  };
};
