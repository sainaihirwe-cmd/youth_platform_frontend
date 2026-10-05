import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Flag, UserRound } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PageHeader from '../../components/dashboard/PageHeader';
import Pagination from '../../components/common/Pagination';
import StatusBadge from '../../components/common/StatusBadge';
import { CardSkeleton } from '../../components/common/Skeleton';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';
import { useAsync } from '../../hooks/useAsync';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { reportService } from '../../services/reportService';
import { formatDate } from '../../utils/format';

/** Reports the signed-in job seeker or employer has submitted, with their moderation status. */
export default function MyReportsPage() {
  const { t } = useTranslation();
  useDocumentTitle(t('myReports.title'));
  const [page, setPage] = useState(1);
  const reports = useAsync(() => reportService.mine({ page, limit: 10 }), [page]);
  const items = reports.data?.data || [];

  const target = (r) => {
    if (r.reportedJobId !== undefined) {
      return r.reportedJobId
        ? { icon: Briefcase, label: r.reportedJobId.title, to: `/jobs/${r.reportedJobId._id}` }
        : { icon: Briefcase, label: t('myReports.deletedJob') };
    }
    return r.reportedUserId
      ? { icon: UserRound, label: r.reportedUserId.name, to: `/profile/${r.reportedUserId._id}` }
      : { icon: UserRound, label: t('myReports.deletedUser') };
  };

  return (
    <>
      <PageHeader
        title={t('myReports.title')}
        subtitle={t('myReports.subtitle')}
        actions={
          <Link to="/jobs" className="btn btn-secondary">
            {t('nav.findJobs')}
          </Link>
        }
      />
      {reports.error && <ErrorMessage error={reports.error} onRetry={reports.reload} />}
      {!reports.error && (
        <ul className="space-y-4">
          {reports.loading && !reports.data && Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} lines={2} />)}
          {items.map((r) => {
            const { icon: Icon, label, to } = target(r);
            return (
              <li key={r._id} className="card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="rounded-xl bg-red-50 p-2.5 text-red-600 dark:bg-red-500/10 dark:text-red-400">
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <div className="min-w-0">
                      {to ? (
                        <Link to={to} className="font-semibold text-navy-900 hover:text-brand-700 dark:text-white">
                          {label}
                        </Link>
                      ) : (
                        <p className="font-semibold text-slate-500">{label}</p>
                      )}
                      <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-400">
                        {t(`reportReasons.${r.reason}`)} · {t('myReports.submittedOn', { date: formatDate(r.createdAt) })}
                      </p>
                    </div>
                  </div>
                  <StatusBadge kind="report" status={r.status} />
                </div>
                {r.description && <p className="mt-3 whitespace-pre-line text-sm text-slate-700 dark:text-slate-300">{r.description}</p>}
                <p className="mt-3 text-xs text-slate-500">{t(`myReports.statusHint.${r.status}`)}</p>
              </li>
            );
          })}
        </ul>
      )}
      {!reports.loading && !reports.error && items.length === 0 && (
        <div className="card">
          <EmptyState icon={Flag} title={t('myReports.empty')} description={t('myReports.emptyHint')} />
        </div>
      )}
      <Pagination className="mt-6" pagination={reports.data?.pagination} onChange={setPage} />
    </>
  );
}
