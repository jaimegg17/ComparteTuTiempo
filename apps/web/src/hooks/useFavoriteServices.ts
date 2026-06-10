import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from './useAuth';
import { buildApiUrl } from '@/shared/api/config';

const storageKeyFor = (userId?: string | null) => `ctt:favorites:${userId || 'guest'}`;

export function useFavoriteServices(userId?: string | null) {
  const { accessToken, getAccessToken } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadFavorites = async () => {
      if (typeof window === 'undefined') return;

      if (!userId) {
        try {
          const raw = window.localStorage.getItem(storageKeyFor(userId));
          setFavoriteIds(raw ? JSON.parse(raw) : []);
        } catch {
          setFavoriteIds([]);
        }
        return;
      }

      setLoading(true);

      try {
        const token = accessToken || await getAccessToken();
        if (!token) {
          setFavoriteIds([]);
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
        setFavoriteIds(data.favoriteServiceIds ?? []);
      } catch {
        setFavoriteIds([]);
      } finally {
        setLoading(false);
      }
    };

    void loadFavorites();
  }, [userId, accessToken, getAccessToken]);

  const persist = useCallback((next: number[]) => {
    setFavoriteIds(next);
    if (typeof window !== 'undefined' && !userId) {
      window.localStorage.setItem(storageKeyFor(userId), JSON.stringify(next));
    }
  }, [userId]);

  const isFavorite = useCallback((serviceId: number) => favoriteIds.includes(serviceId), [favoriteIds]);

  const toggleFavorite = useCallback(async (serviceId: number) => {
    const alreadyFavorite = favoriteIds.includes(serviceId);
    const optimistic = alreadyFavorite
      ? favoriteIds.filter((id) => id !== serviceId)
      : [...favoriteIds, serviceId];

    persist(optimistic);

    if (!userId) {
      return !alreadyFavorite;
    }

    try {
      const token = accessToken || await getAccessToken();
      if (!token) {
        persist(favoriteIds);
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

      return !alreadyFavorite;
    } catch {
      persist(favoriteIds);
      return alreadyFavorite;
    }
  }, [favoriteIds, persist, userId, accessToken, getAccessToken]);

  const clearFavorites = useCallback(() => persist([]), [persist]);

  return useMemo(() => ({ favoriteIds, favoritesCount: favoriteIds.length, isFavorite, toggleFavorite, clearFavorites, loading }), [favoriteIds, isFavorite, toggleFavorite, clearFavorites, loading]);
}
