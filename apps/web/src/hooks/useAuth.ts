import { useUser } from '@auth0/nextjs-auth0/client';
import { useState, useEffect, useCallback, useRef } from 'react';

const getJwtExpiry = (token: string): number | null => {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;

    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = JSON.parse(atob(normalized)) as { exp?: number };
    return typeof decoded.exp === 'number' ? decoded.exp * 1000 : null;
  } catch {
    return null;
  }
};

export const useAuth = () => {
  const { user, isLoading, error } = useUser();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [tokenLoading, setTokenLoading] = useState(false);
  const accessTokenRef = useRef<string | null>(null);
  const accessTokenExpiresAtRef = useRef<number | null>(null);
  const tokenRequestRef = useRef<Promise<string | null> | null>(null);

  useEffect(() => {
    accessTokenRef.current = accessToken;
    accessTokenExpiresAtRef.current = accessToken ? getJwtExpiry(accessToken) : null;
  }, [accessToken]);

  const getAccessToken = useCallback(async (forceRefresh = false) => {
    if (!user) return null;

    const cachedToken = accessTokenRef.current;
    const expiresAt = accessTokenExpiresAtRef.current;
    const isUsable = cachedToken && (!expiresAt || expiresAt > Date.now() + 60_000);

    if (!forceRefresh && isUsable) {
      return cachedToken;
    }

    if (tokenRequestRef.current) {
      return tokenRequestRef.current;
    }

    tokenRequestRef.current = (async () => {
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
        tokenRequestRef.current = null;
      }
    })();

    return tokenRequestRef.current;
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
