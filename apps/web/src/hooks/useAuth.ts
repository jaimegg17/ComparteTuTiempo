import { useUser } from '@auth0/nextjs-auth0/client';
import { useState, useEffect, useCallback, useRef } from 'react';

export const useAuth = () => {
  const { user, isLoading, error } = useUser();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [tokenLoading, setTokenLoading] = useState(false);
  const accessTokenRef = useRef<string | null>(null);

  useEffect(() => {
    accessTokenRef.current = accessToken;
  }, [accessToken]);

  const getAccessToken = useCallback(async (forceRefresh = false) => {
    if (!user) return null;

    if (!forceRefresh && accessTokenRef.current) {
      fetch('/api/auth/token')
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data?.accessToken) {
            setAccessToken(data.accessToken);
          }
        })
        .catch(() => undefined);

      return accessTokenRef.current;
    }

    setTokenLoading(true);
    try {
      const response = await fetch('/api/auth/token', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.accessToken) {
          setAccessToken(data.accessToken);
          return data.accessToken;
        }
      }

      setAccessToken(null);
      return null;
    } catch {
      setAccessToken(null);
      return null;
    } finally {
      setTokenLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user && !accessToken) {
      getAccessToken();
    }
  }, [user, accessToken, getAccessToken]);

  return {
    user,
    isLoading: isLoading || tokenLoading,
    error,
    accessToken,
    getAccessToken,
  };
};
