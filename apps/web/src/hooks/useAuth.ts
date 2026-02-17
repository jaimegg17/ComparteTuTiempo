import { useUser } from '@auth0/nextjs-auth0/client';
import { useState, useEffect } from 'react';

export const useAuth = () => {
  const { user, isLoading, error } = useUser();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [tokenLoading, setTokenLoading] = useState(false);

  const getAccessToken = async (forceRefresh = false) => {
    if (!user) return null;
    
    // If we have a cached token and not forcing refresh, return it
    // But we'll still fetch a fresh one to ensure it's valid
    if (!forceRefresh && accessToken) {
      // Still fetch fresh token but return cached one immediately
      // The fresh fetch will update the cache in the background
      fetch('/api/auth/token')
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data?.accessToken) {
            setAccessToken(data.accessToken);
          }
        })
        .catch(err => console.error('🔑 Background token refresh failed:', err));
      
      return accessToken;
    }
    
    setTokenLoading(true);
    try {
      console.log('🔑 Getting access token for user:', user.sub);
      // Add cache busting to ensure fresh token
      const response = await fetch('/api/auth/token', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      console.log('🔑 Token response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        if (data.accessToken) {
          console.log('✅ Token obtained successfully, length:', data.accessToken.length);
          setAccessToken(data.accessToken);
          return data.accessToken;
        } else {
          console.error('❌ No access token in response. Response data:', data);
          setAccessToken(null);
          return null;
        }
      } else {
        let errorText = '';
        try {
          errorText = await response.text();
        } catch {
          errorText = 'Could not read error response';
        }
        console.error('❌ Failed to get access token. Status:', response.status);
        console.error('❌ Error response:', errorText);
        // Clear cached token if request failed
        setAccessToken(null);
        return null;
      }
    } catch (error) {
      console.error('🔑 Error getting access token:', error);
      setAccessToken(null);
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
