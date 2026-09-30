import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import { notificationService } from '../services/notificationService';

const NotificationContext = createContext(null);
const POLL_MS = 45000;

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await notificationService.list({ limit: 8 });
      setRecent(res.data.notifications);
      setUnreadCount(res.data.unreadCount);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const refreshCount = useCallback(async () => {
    if (!user || document.visibilityState === 'hidden') return;
    try {
      const res = await notificationService.unreadCount();
      setUnreadCount((prev) => {
        // New notifications arrived: refresh the dropdown list too
        if (res.data.unreadCount > prev) refresh();
        return res.data.unreadCount;
      });
    } catch {
      /* polling failures are silent; the next poll retries */
    }
  }, [user, refresh]);

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      setRecent([]);
      return undefined;
    }
    refresh();
    const id = setInterval(refreshCount, POLL_MS);
    const onFocus = () => refreshCount();
    window.addEventListener('focus', onFocus);
    return () => {
      clearInterval(id);
      window.removeEventListener('focus', onFocus);
    };
  }, [user, refresh, refreshCount]);

  const markRead = useCallback(async (id) => {
    await notificationService.markRead(id);
    setRecent((list) => list.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
    setUnreadCount((c) => Math.max(0, c - 1));
  }, []);

  const markAllRead = useCallback(async () => {
    await notificationService.markAllRead();
    setRecent((list) => list.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  }, []);

  /** Lets the notifications page keep the header badge in sync after its own changes. */
  const syncCount = useCallback((count) => setUnreadCount(count), []);

  const value = useMemo(
    () => ({ unreadCount, recent, loading, error, refresh, markRead, markAllRead, syncCount }),
    [unreadCount, recent, loading, error, refresh, markRead, markAllRead, syncCount]
  );
  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}
