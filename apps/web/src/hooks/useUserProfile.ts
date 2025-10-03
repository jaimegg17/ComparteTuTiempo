import { useState, useEffect } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { useAuth } from './useAuth';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  imageUrl?: string;
  bio?: string;
  location?: string;
  phoneNumber?: string;
  skills?: string[];
  dateOfBirth?: string;
  gender?: string;
  preferredLanguage?: string;
  timeCredits?: number;
}

export const useUserProfile = () => {
  const { user, isLoading } = useUser();
  const { accessToken, getAccessToken } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const loadUserProfile = async () => {
    if (!user?.sub) return;

    setProfileLoading(true);
    try {
      // Obtener token si no lo tenemos
      let token = accessToken;
      if (!token) {
        token = await getAccessToken();
      }
      
      if (!token) {
        console.log('No access token available for profile loading');
        return;
      }

      const response = await fetch(`http://localhost:3001/api/users/${user.sub}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const responseData = await response.json();
        setUserProfile(responseData.user);
      } else {
        console.error('Failed to load user profile:', response.status);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    if (user && accessToken && !profileLoading) {
      loadUserProfile();
    }
  }, [user, accessToken]);

  const updateUserProfile = (newProfile: Partial<UserProfile>) => {
    console.log('🔄 Updating user profile context:', newProfile);
    setUserProfile(prev => {
      const updated = prev ? { ...prev, ...newProfile } : null;
      console.log('🔄 Updated profile context:', updated);
      return updated;
    });
  };

  const displayName = userProfile?.name || user?.name || '';
  const displayEmail = userProfile?.email || user?.email || '';
  const displayImage = userProfile?.imageUrl || user?.picture || undefined;

  console.log('🔄 useUserProfile return:', {
    userProfile,
    displayName,
    displayEmail,
    displayImage,
    auth0Image: user?.picture
  });

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
