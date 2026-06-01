import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from './useAuth';

const storageKeyFor = (userId?: string | null) => `ctt:event-registrations:${userId || 'guest'}`;

export function useEventRegistrations(userId?: string | null) {
  const { accessToken, getAccessToken } = useAuth();
  const [eventIds, setEventIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadRegistrations = async () => {
      if (typeof window === 'undefined') return;

      if (!userId) {
        try {
          const raw = window.localStorage.getItem(storageKeyFor(userId));
          setEventIds(raw ? JSON.parse(raw) : []);
        } catch {
          setEventIds([]);
        }
        return;
      }

      setLoading(true);
      try {
        const token = accessToken || await getAccessToken();
        if (!token) {
          setEventIds([]);
          return;
        }

        const response = await fetch('http://localhost:3001/api/events/me/registrations', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('No se pudieron cargar las inscripciones');
        }

        const data = await response.json() as { registeredEventIds?: number[] };
        setEventIds(data.registeredEventIds ?? []);
      } catch {
        setEventIds([]);
      } finally {
        setLoading(false);
      }
    };

    void loadRegistrations();
  }, [userId, accessToken, getAccessToken]);

  const persist = useCallback((next: number[]) => {
    setEventIds(next);
    if (typeof window !== 'undefined' && !userId) {
      window.localStorage.setItem(storageKeyFor(userId), JSON.stringify(next));
    }
  }, [userId]);

  const isRegistered = useCallback((eventId: number) => eventIds.includes(eventId), [eventIds]);

  const toggleRegistration = useCallback(async (eventId: number) => {
    const alreadyRegistered = eventIds.includes(eventId);
    const optimistic = alreadyRegistered ? eventIds.filter((id) => id !== eventId) : [...eventIds, eventId];
    persist(optimistic);

    if (!userId) {
      return !alreadyRegistered;
    }

    try {
      const token = accessToken || await getAccessToken();
      if (!token) {
        persist(eventIds);
        return alreadyRegistered;
      }

      const response = await fetch(`http://localhost:3001/api/events/${eventId}/register`, {
        method: alreadyRegistered ? 'DELETE' : 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('No se pudo actualizar la inscripción');
      }

      return !alreadyRegistered;
    } catch {
      persist(eventIds);
      return alreadyRegistered;
    }
  }, [eventIds, persist, userId, accessToken, getAccessToken]);

  return useMemo(() => ({ eventIds, registrationsCount: eventIds.length, isRegistered, toggleRegistration, loading }), [eventIds, isRegistered, toggleRegistration, loading]);
}
