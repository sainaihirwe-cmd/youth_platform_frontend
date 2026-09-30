import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PageHeader from '../../components/dashboard/PageHeader';
import { NotificationIcon } from '../../components/dashboard/NotificationItem';
import Pagination from '../../components/common/Pagination';
import Tabs from '../../components/common/Tabs';
import { CardSkeleton } from '../../components/common/Skeleton';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';
import { useAsync } from '../../hooks/useAsync';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useNotifications } from '../../context/NotificationContext';
import { useToast } from '../../context/ToastContext';
import { notificationService } from '../../services/notificationService';
import { formatDateTime, timeAgo } from '../../utils/format';

/** Full notifications list, used by both job seekers and employers. */
export default function NotificationsPage() {
  const { t } = useTranslation();
  useDocumentTitle(t('notifications.title'));
  const navigate = useNavigate();
  const toast = useToast();
  const { syncCount, refresh: refreshDropdown } = useNotifications();
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('all');
  const list = useAsync(async () => {
    const res = await notificationService.list({ page, limit: 15, unread: filter === 'unread' ? 'true' : undefined });
    syncCount(res.data.unreadCount);
    return res;
  }, [page, filter]);

  const items = list.data?.data?.notifications || [];
  const unread = list.data?.data?.unreadCount || 0;

  const updateLocal = (fn) => list.setData((d) => ({ ...d, data: { ...d.data, notifications: fn(d.data.notifications) } }));

  const markRead = async (n) => {
    if (n.isRead) return;
    try {
      await notificationService.markRead(n._id);
      updateLocal((arr) => arr.map((x) => (x._id === n._id ? { ...x, isRead: true } : x)));
      syncCount(Math.max(0, unread - 1));
      list.setData((d) => ({ ...d, data: { ...d.data, unreadCount: Math.max(0, unread - 1) } }));
      refreshDropdown();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const open = async (n) => {
    await markRead(n);
    if (n.link) navigate(n.link);
  };

  const markAll = async () => {
    try {
      await notificationService.markAllRead();
      syncCount(0);
      refreshDropdown();
      list.reload();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const remove = async (n) => {
    try {
      await notificationService.remove(n._id);
      toast.success(t('notifications.deleted'));
      refreshDropdown();
      list.reload();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <>
      <PageHeader
        title={t('notifications.title')}
        subtitle={t('notifications.subtitle', { count: unread })}
        actions={
          unread > 0 && (
            <button type="button" className="btn btn-secondary" onClick={markAll}>
              <CheckCheck className="h-4 w-4" /> {t('notifications.markAllRead')}
            </button>
          )
        }
      />
      <Tabs
        className="mb-5"
        active={filter}
        onChange={(f) => {
          setFilter(f);
          setPage(1);
        }}
        tabs={[
          { id: 'all', label: t('notifications.all') },
          { id: 'unread', label: t('notifications.unread'), count: unread },
        ]}
      />
      {list.error && <ErrorMessage error={list.error} onRetry={list.reload} />}
      {!list.error && (
        <div className="card divide-y divide-slate-100 overflow-hidden dark:divide-navy-800">
          {list.loading && !list.data && <CardSkeleton lines={2} />}
          {items.map((n) => (
            <div key={n._id} className={`flex gap-3 p-4 sm:p-5 ${n.isRead ? '' : 'bg-brand-50/50 dark:bg-brand-500/5'}`}>
              <NotificationIcon type={n.type} />
              <button type="button" className="min-w-0 flex-1 text-left" onClick={() => open(n)}>
                <p className={`text-sm ${n.isRead ? 'font-medium' : 'font-semibold'} text-navy-900 dark:text-white`}>{n.title}</p>
                <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-400">{n.message}</p>
                <p className="mt-1 text-xs text-slate-400" title={formatDateTime(n.createdAt)}>
                  {timeAgo(n.createdAt)}
                </p>
              </button>
              <div className="flex shrink-0 items-start gap-1">
                {!n.isRead && (
                  <button type="button" onClick={() => markRead(n)} className="btn-ghost rounded-lg p-2" title={t('notifications.markRead')} aria-label={t('notifications.markRead')}>
                    <CheckCheck className="h-4 w-4" />
                  </button>
                )}
                <button type="button" onClick={() => remove(n)} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40" title={t('common.delete')} aria-label={t('common.delete')}>
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
          {!list.loading && items.length === 0 && <EmptyState icon={Bell} title={t('notifications.empty')} description={t('notifications.emptyHint')} />}
        </div>
      )}
      <Pagination className="mt-6" pagination={list.data?.pagination} onChange={setPage} />
    </>
  );
}
