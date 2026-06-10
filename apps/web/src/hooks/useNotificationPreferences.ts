import { useCallback, useEffect, useMemo, useState } from 'react';

export interface NotificationPreferences {
  exchanges: boolean;
  messages: boolean;
  events: boolean;
  communities: boolean;
}

const defaultPreferences: NotificationPreferences = {
  exchanges: true,
  messages: true,
  events: true,
  communities: true,
};

const storageKeyFor = (userId?: string | null) => `ctt:notification-preferences:${userId || 'guest'}`;

export function useNotificationPreferences(userId?: string | null) {
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(storageKeyFor(userId));
      setPreferences(raw ? { ...defaultPreferences, ...JSON.parse(raw) } : defaultPreferences);
    } catch {
      setPreferences(defaultPreferences);
    }
  }, [userId]);

  const persist = useCallback((next: NotificationPreferences) => {
    setPreferences(next);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(storageKeyFor(userId), JSON.stringify(next));
    }
  }, [userId]);

  const setPreference = useCallback((key: keyof NotificationPreferences, value: boolean) => {
    const next = { ...preferences, [key]: value };
    persist(next);
  }, [preferences, persist]);

  return useMemo(() => ({ preferences, setPreference, setPreferences: persist }), [preferences, setPreference, persist]);
}
