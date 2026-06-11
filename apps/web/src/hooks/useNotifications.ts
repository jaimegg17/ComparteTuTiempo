import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from './useAuth';
import { buildApiUrl } from '@/shared/api/config';

export interface UserNotification {
  id: number;
  type: string;
  title: string;
  body?: string | null;
  link?: string | null;
  isRead: boolean;
  createdAt: string;
  readAt?: string | null;
}

interface NotificationsResponse {
  notifications: UserNotification[];
  unreadCount: number;
}

export function useNotifications(userId?: string | null) {
  const { accessToken, getAccessToken } = useAuth();
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const loadNotifications = useCallback(async () => {
    if (!userId) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    setLoading(true);
    try {
      const token = accessToken || await getAccessToken(true);
      if (!token) return;

      const response = await fetch(buildApiUrl('/users/me/notifications'), {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('No se pudieron cargar las notificaciones');
      }

      const data = await response.json() as NotificationsResponse;
      setNotifications(data.notifications ?? []);
      setUnreadCount(data.unreadCount ?? 0);
    } catch {
      // Keep the latest known notifications instead of hiding the badge on transient auth/network failures.
    } finally {
      setLoading(false);
    }
  }, [userId, accessToken, getAccessToken]);

  useEffect(() => {
    void loadNotifications();
    if (!userId) return undefined;

    const interval = window.setInterval(() => {
      void loadNotifications();
    }, 30000);

    return () => window.clearInterval(interval);
  }, [loadNotifications, userId]);

  const markAsRead = useCallback(async (notificationId: number) => {
    if (!userId) return;
    const token = accessToken || await getAccessToken();
    if (!token) return;

    const response = await fetch(buildApiUrl(`/users/me/notifications/${notificationId}/read`), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('No se pudo marcar la notificación como leída');
    }

    setNotifications((current) =>
      current.map((notification) =>
        notification.id === notificationId
          ? { ...notification, isRead: true, readAt: new Date().toISOString() }
          : notification,
      ),
    );
    setUnreadCount((current) => Math.max(0, current - 1));
  }, [userId, accessToken, getAccessToken]);

  const markAllAsRead = useCallback(async () => {
    if (!userId) return;
    const token = accessToken || await getAccessToken();
    if (!token) return;

    const response = await fetch(buildApiUrl('/users/me/notifications/read-all'), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('No se pudieron marcar las notificaciones como leídas');
    }

    setNotifications((current) =>
      current.map((notification) =>
        notification.isRead ? notification : { ...notification, isRead: true, readAt: new Date().toISOString() },
      ),
    );
    setUnreadCount(0);
  }, [userId, accessToken, getAccessToken]);

  return useMemo(() => ({
    notifications,
    unreadCount,
    loading,
    reload: loadNotifications,
    markAsRead,
    markAllAsRead,
  }), [notifications, unreadCount, loading, loadNotifications, markAsRead, markAllAsRead]);
}
