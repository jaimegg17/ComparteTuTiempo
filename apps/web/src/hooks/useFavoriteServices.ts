import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from './useAuth';
import { buildApiUrl } from '@/shared/api/config';

const FAVORITES_EVENT = 'ctt:favorites-updated';
const storageKeyFor = (userId?: string | null) => `ctt:favorites:${userId || 'guest'}`;

const readCachedFavorites = (userId?: string | null): number[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(storageKeyFor(userId));
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((id) => Number.isInteger(id)) : [];
  } catch {
    return [];
  }
};

const writeCachedFavorites = (userId: string | null | undefined, ids: number[]) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(storageKeyFor(userId), JSON.stringify(ids));
};

const notifyFavoritesUpdated = (userId: string | null | undefined, ids: number[]) => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(FAVORITES_EVENT, { detail: { userId: userId || null, ids } }));
};

export function useFavoriteServices(userId?: string | null) {
  const { accessToken, getAccessToken } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  const persistLocal = useCallback((next: number[]) => {
    setFavoriteIds(next);
    writeCachedFavorites(userId, next);
    notifyFavoritesUpdated(userId, next);
  }, [userId]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const handleFavoritesUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<{ userId?: string | null; ids?: number[] }>;
      const eventUserId = customEvent.detail?.userId || null;
      const currentUserId = userId || null;
      if (eventUserId !== currentUserId) return;
      setFavoriteIds(customEvent.detail?.ids ?? []);
    };

    window.addEventListener(FAVORITES_EVENT, handleFavoritesUpdated);
    return () => window.removeEventListener(FAVORITES_EVENT, handleFavoritesUpdated);
  }, [userId]);

  useEffect(() => {
    const loadFavorites = async () => {
      if (typeof window === 'undefined') return;

      // Paint cached values immediately so buttons/favorite chips do not flicker or stay disabled.
      setFavoriteIds(readCachedFavorites(userId));

      if (!userId) {
        return;
      }

      setLoading(true);

      try {
        const token = accessToken || await getAccessToken(true);
        if (!token) {
          return;
        }

        const response = await fetch(buildApiUrl('/users/me/favorites'), {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('No se pudieron cargar los favoritos');
        }

        const data = await response.json() as { favoriteServiceIds?: number[] };
        persistLocal(data.favoriteServiceIds ?? []);
      } catch {
        // Keep cached/optimistic favorites instead of blanking the UI.
      } finally {
        setLoading(false);
      }
    };

    void loadFavorites();
  }, [userId, accessToken, getAccessToken, persistLocal]);

  const isFavorite = useCallback((serviceId: number) => favoriteIds.includes(serviceId), [favoriteIds]);

  const toggleFavorite = useCallback(async (serviceId: number) => {
    const alreadyFavorite = favoriteIds.includes(serviceId);
    const optimistic = alreadyFavorite
      ? favoriteIds.filter((id) => id !== serviceId)
      : [...favoriteIds, serviceId];

    persistLocal(optimistic);

    if (!userId) {
      return !alreadyFavorite;
    }

    try {
      const token = accessToken || await getAccessToken(true);
      if (!token) {
        persistLocal(favoriteIds);
        return alreadyFavorite;
      }

      const response = await fetch(buildApiUrl(`/users/me/favorites/${serviceId}`), {
        method: alreadyFavorite ? 'DELETE' : 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('No se pudo actualizar el favorito');
      }

      writeCachedFavorites(userId, optimistic);
      return !alreadyFavorite;
    } catch {
      persistLocal(favoriteIds);
      return alreadyFavorite;
    }
  }, [favoriteIds, persistLocal, userId, accessToken, getAccessToken]);

  const clearFavorites = useCallback(() => persistLocal([]), [persistLocal]);

  return useMemo(() => ({ favoriteIds, favoritesCount: favoriteIds.length, isFavorite, toggleFavorite, clearFavorites, loading }), [favoriteIds, isFavorite, toggleFavorite, clearFavorites, loading]);
}
