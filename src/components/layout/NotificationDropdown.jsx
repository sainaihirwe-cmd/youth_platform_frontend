import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, CheckCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { timeAgo } from '../../utils/format';
import LoadingSpinner from '../common/LoadingSpinner';
import { NotificationIcon } from '../dashboard/NotificationItem';

const PAGE_BY_ROLE = { job_seeker: '/seeker/notifications', employer: '/employer/notifications', admin: '/admin/dashboard' };

export default function NotificationDropdown() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { unreadCount, recent, loading, refresh, markRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return undefined;
    refresh();
    const onClick = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, refresh]);

  const openNotification = async (n) => {
    setOpen(false);
    if (!n.isRead) markRead(n._id).catch(() => {});
    if (n.link) navigate(n.link);
  };

  const allPath = PAGE_BY_ROLE[user?.role];

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="btn-ghost relative rounded-lg p-2"
        aria-label={t('notifications.title')}
        aria-expanded={open}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white ring-2 ring-white dark:ring-navy-900">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="card absolute right-0 z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] animate-slide-up overflow-hidden p-0 shadow-card-hover">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-navy-800">
            <p className="font-semibold text-navy-900 dark:text-white">{t('notifications.title')}</p>
            {unreadCount > 0 && (
              <button type="button" onClick={() => markAllRead().catch(() => {})} className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline dark:text-brand-400">
                <CheckCheck className="h-3.5 w-3.5" /> {t('notifications.markAllRead')}
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {loading && !recent.length ? (
              <LoadingSpinner size="sm" className="py-8" />
            ) : recent.length === 0 ? (
              <p className="px-4 py-10 text-center text-sm text-slate-500">{t('notifications.empty')}</p>
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-navy-800">
                {recent.map((n) => (
                  <li key={n._id}>
                    <button
                      type="button"
                      onClick={() => openNotification(n)}
                      className={`flex w-full gap-3 px-4 py-3 text-left transition hover:bg-slate-50 dark:hover:bg-navy-800/60 ${n.isRead ? '' : 'bg-brand-50/60 dark:bg-brand-500/5'}`}
                    >
                      <NotificationIcon type={n.type} />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-start justify-between gap-2">
                          <span className="text-sm font-semibold text-navy-900 dark:text-white">{n.title}</span>
                          {!n.isRead && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-600" aria-label={t('notifications.unread')} />}
                        </span>
                        <span className="line-clamp-2 block text-xs text-slate-600 dark:text-slate-400">{n.message}</span>
                        <span className="mt-1 block text-[11px] text-slate-400">{timeAgo(n.createdAt)}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {allPath && user?.role !== 'admin' && (
            <Link to={allPath} onClick={() => setOpen(false)} className="block border-t border-slate-100 px-4 py-2.5 text-center text-sm font-medium text-brand-600 hover:bg-slate-50 dark:border-navy-800 dark:text-brand-400 dark:hover:bg-navy-800/60">
              {t('notifications.viewAll')}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
