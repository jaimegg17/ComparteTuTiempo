import { useUser } from '@auth0/nextjs-auth0/client';
import { useState, useEffect } from 'react';

export const useAuth = () => {
  const { user, isLoading, error } = useUser();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [tokenLoading, setTokenLoading] = useState(false);

  const getAccessToken = async () => {
    if (!user) return null;
    
    setTokenLoading(true);
    try {
      console.log('🔑 Getting access token for user:', user.sub);
      const response = await fetch('/api/auth/token');
      console.log('🔑 Token response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('🔑 Token obtained successfully:', !!data.accessToken);
        setAccessToken(data.accessToken);
        return data.accessToken;
      } else {
        const errorText = await response.text();
        console.error('🔑 Failed to get access token:', response.status, errorText);
        return null;
      }
    } catch (error) {
      console.error('🔑 Error getting access token:', error);
      return null;
    } finally {
      setTokenLoading(false);
    }
  };

  useEffect(() => {
    if (user && !accessToken) {
      getAccessToken();
    }
  }, [user]);

  return {
    user,
    isLoading: isLoading || tokenLoading,
    error,
    accessToken,
    getAccessToken,
  };
};
