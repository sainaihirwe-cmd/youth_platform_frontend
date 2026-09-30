import { Link } from 'react-router-dom';
import { Bookmark, CheckCircle2, Clock, FileText, Search, XCircle, Bell } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PageHeader from '../../components/dashboard/PageHeader';
import StatCard from '../../components/dashboard/StatCard';
import ProfileCompletion from '../../components/dashboard/ProfileCompletion';
import { NotificationIcon } from '../../components/dashboard/NotificationItem';
import StatusBadge from '../../components/common/StatusBadge';
import { StatSkeleton, CardSkeleton } from '../../components/common/Skeleton';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';
import JobCard from '../../components/jobs/JobCard';
import { useAsync } from '../../hooks/useAsync';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { applicationService } from '../../services/applicationService';
import { jobService } from '../../services/jobService';
import { seekerProfileCompletion } from '../../utils/profileCompletion';
import { timeAgo } from '../../utils/format';
import { locationLabel } from '../../utils/labels';

export default function SeekerDashboard() {
  const { t } = useTranslation();
  useDocumentTitle(t('nav.dashboard'));
  const { user } = useAuth();
  const { recent: notifications } = useNotifications();
  const dash = useAsync(() => applicationService.stats().then((r) => r.data), []);
  // Recommendations: open jobs near the seeker, falling back to the newest jobs
  const recommended = useAsync(
    () =>
      jobService
        .list({ location: user?.location || undefined, limit: 3, sort: 'newest' })
        .then((r) => (r.data.length ? r.data : jobService.list({ limit: 3 }).then((x) => x.data))),
    [user?.location]
  );
  const completion = seekerProfileCompletion(user);
  const s = dash.data?.stats;

  return (
    <>
      <PageHeader
        title={t('seekerDash.greeting', { name: user?.name?.split(' ')[0] })}
        subtitle={t('seekerDash.subtitle')}
        actions={
          <Link to="/jobs" className="btn btn-primary">
            <Search className="h-4 w-4" /> {t('nav.findJobs')}
          </Link>
        }
      />

      {dash.error ? (
        <ErrorMessage error={dash.error} onRetry={dash.reload} />
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          {!s ? (
            Array.from({ length: 5 }).map((_, i) => <StatSkeleton key={i} />)
          ) : (
            <>
              <StatCard label={t('seekerDash.total')} value={s.totalApplications} icon={FileText} tone="blue" to="/seeker/applications" />
              <StatCard label={t('seekerDash.pending')} value={s.pendingApplications} icon={Clock} tone="amber" to="/seeker/applications?status=pending" />
              <StatCard label={t('seekerDash.accepted')} value={s.acceptedApplications} icon={CheckCircle2} tone="green" to="/seeker/applications?status=accepted" />
              <StatCard label={t('seekerDash.rejected')} value={s.rejectedApplications} icon={XCircle} tone="red" to="/seeker/applications?status=rejected" />
              <StatCard label={t('seekerDash.saved')} value={s.savedJobs} icon={Bookmark} tone="violet" to="/seeker/saved-jobs" />
            </>
          )}
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="card p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">{t('seekerDash.recentApplications')}</h2>
              <Link to="/seeker/applications" className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-400">
                {t('common.viewAll')}
              </Link>
            </div>
            {dash.loading && !dash.data ? (
              <div className="mt-4 space-y-3">
                <CardSkeleton lines={1} />
              </div>
            ) : dash.data?.recentApplications?.length ? (
              <ul className="mt-3 divide-y divide-slate-100 dark:divide-navy-800">
                {dash.data.recentApplications.map((a) => (
                  <li key={a._id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      {a.jobId ? (
                        <Link to={`/jobs/${a.jobId._id}`} className="block truncate font-medium hover:text-brand-700 dark:hover:text-brand-300">
                          {a.jobId.title}
                        </Link>
                      ) : (
                        <span className="text-slate-500">{t('applications.jobRemoved')}</span>
                      )}
                      <p className="text-xs text-slate-500">
                        {a.jobId?.location && `${locationLabel(t, a.jobId.location)} · `}
                        {timeAgo(a.appliedAt)}
                      </p>
                    </div>
                    <StatusBadge kind="application" status={a.status} />
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                icon={FileText}
                title={t('seekerDash.noApplications')}
                description={t('seekerDash.noApplicationsHint')}
                action={
                  <Link to="/jobs" className="btn btn-primary btn-sm">
                    {t('nav.findJobs')}
                  </Link>
                }
              />
            )}
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold">{user?.location ? t('seekerDash.jobsNear', { place: locationLabel(t, user.location) }) : t('seekerDash.latestJobs')}</h2>
            {recommended.error ? (
              <ErrorMessage error={recommended.error} onRetry={recommended.reload} compact />
            ) : (
              <div className="grid gap-4 md:grid-cols-3">
                {recommended.loading && !recommended.data
                  ? Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)
                  : recommended.data?.map((j) => <JobCard key={j._id} job={j} compact />)}
                {recommended.data?.length === 0 && <p className="text-sm text-slate-500 md:col-span-3">{t('jobs.noResults')}</p>}
              </div>
            )}
          </section>
        </div>

        <div className="space-y-6">
          <ProfileCompletion percent={completion.percent} missing={completion.missing} to="/seeker/profile" />
          <section className="card p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">{t('seekerDash.recentNotifications')}</h2>
              <Link to="/seeker/notifications" className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-400">
                {t('common.viewAll')}
              </Link>
            </div>
            {notifications.length ? (
              <ul className="mt-3 space-y-3">
                {notifications.slice(0, 4).map((n) => (
                  <li key={n._id} className="flex gap-3">
                    <NotificationIcon type={n.type} />
                    <div className="min-w-0">
                      <p className={`text-sm ${n.isRead ? '' : 'font-semibold'}`}>{n.title}</p>
                      <p className="line-clamp-2 text-xs text-slate-500">{n.message}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState icon={Bell} title={t('notifications.empty')} className="py-6" />
            )}
          </section>
        </div>
      </div>
    </>
  );
}
