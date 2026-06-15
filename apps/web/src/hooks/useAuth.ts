import { useUser } from '@auth0/nextjs-auth0/client';
import { useState, useEffect, useCallback, useRef } from 'react';

let sharedAccessToken: string | null = null;
let sharedAccessTokenExpiresAt: number | null = null;
let sharedAccessTokenUserId: string | null = null;
let sharedTokenRequest: Promise<string | null> | null = null;
let sharedFetchReference: typeof fetch | null = null;

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
  const userId = typeof user?.sub === 'string' ? user.sub : typeof user?.id === 'string' ? user.id : null;
  const [accessToken, setAccessToken] = useState<string | null>(() => {
    const currentFetchReference = typeof fetch === 'function' ? fetch : null;
    return userId && sharedAccessTokenUserId === userId && (!sharedFetchReference || sharedFetchReference === currentFetchReference)
      ? sharedAccessToken
      : null;
  });
  const [tokenLoading, setTokenLoading] = useState(false);
  const accessTokenRef = useRef<string | null>(accessToken);
  const accessTokenExpiresAtRef = useRef<number | null>(accessToken ? getJwtExpiry(accessToken) : null);

  useEffect(() => {
    const currentFetchReference = typeof fetch === 'function' ? fetch : null;
    if (sharedFetchReference && currentFetchReference && sharedFetchReference !== currentFetchReference) {
      sharedAccessToken = null;
      sharedAccessTokenExpiresAt = null;
      sharedAccessTokenUserId = null;
      sharedTokenRequest = null;
      setAccessToken(null);
    }

    if (!userId) {
      sharedAccessToken = null;
      sharedAccessTokenExpiresAt = null;
      sharedAccessTokenUserId = null;
      sharedTokenRequest = null;
      accessTokenRef.current = null;
      accessTokenExpiresAtRef.current = null;
      setAccessToken(null);
      return;
    }

    if (sharedAccessTokenUserId && sharedAccessTokenUserId !== userId) {
      sharedAccessToken = null;
      sharedAccessTokenExpiresAt = null;
      sharedAccessTokenUserId = null;
      sharedTokenRequest = null;
      setAccessToken(null);
      return;
    }

    if (sharedAccessToken && sharedAccessTokenUserId === userId && sharedAccessToken !== accessToken) {
      setAccessToken(sharedAccessToken);
      return;
    }

    accessTokenRef.current = accessToken;
    accessTokenExpiresAtRef.current = accessToken ? getJwtExpiry(accessToken) : null;
  }, [accessToken, userId]);

  const getAccessToken = useCallback(async (forceRefresh = false) => {
    if (!user) return null;

    const currentFetchReference = typeof fetch === 'function' ? fetch : null;
    if (sharedFetchReference && currentFetchReference && sharedFetchReference !== currentFetchReference) {
      sharedAccessToken = null;
      sharedAccessTokenExpiresAt = null;
      sharedAccessTokenUserId = null;
      sharedTokenRequest = null;
      setAccessToken(null);
    }

    const cachedToken = sharedAccessTokenUserId === userId ? sharedAccessToken || accessTokenRef.current : accessTokenRef.current;
    const expiresAt = sharedAccessTokenUserId === userId ? sharedAccessTokenExpiresAt || accessTokenExpiresAtRef.current : accessTokenExpiresAtRef.current;
    const isUsable = cachedToken && (!expiresAt || expiresAt > Date.now() + 60_000);

    if (!forceRefresh && isUsable) {
      return cachedToken;
    }

    if (sharedTokenRequest) {
      return sharedTokenRequest;
    }

    sharedTokenRequest = (async () => {
      setTokenLoading(true);
      try {
        sharedFetchReference = currentFetchReference;
        const response = await fetch('/api/auth/token', {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.accessToken) {
            sharedAccessToken = data.accessToken;
            sharedAccessTokenExpiresAt = getJwtExpiry(data.accessToken);
            sharedAccessTokenUserId = userId;
            setAccessToken(data.accessToken);
            return data.accessToken;
          }
        }

        sharedAccessToken = null;
        sharedAccessTokenExpiresAt = null;
        sharedAccessTokenUserId = null;
        setAccessToken(null);
        return null;
      } catch {
        sharedAccessToken = null;
        sharedAccessTokenExpiresAt = null;
        sharedAccessTokenUserId = null;
        setAccessToken(null);
        return null;
      } finally {
        setTokenLoading(false);
        sharedTokenRequest = null;
      }
    })();

    return sharedTokenRequest;
  }, [user, userId]);

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
