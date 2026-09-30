import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PageHeader from '../../components/dashboard/PageHeader';
import JobCard from '../../components/jobs/JobCard';
import Pagination from '../../components/common/Pagination';
import StatusBadge from '../../components/common/StatusBadge';
import { CardSkeleton } from '../../components/common/Skeleton';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';
import { useAsync } from '../../hooks/useAsync';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useSavedJobs } from '../../context/SavedJobsContext';
import { savedJobService } from '../../services/savedJobService';
import { timeAgo } from '../../utils/format';

export default function SavedJobsPage() {
  const { t } = useTranslation();
  useDocumentTitle(t('nav.savedJobs'));
  const [page, setPage] = useState(1);
  const { toggle, count } = useSavedJobs();
  // Refetch when the saved set changes (e.g. unsaved from a card)
  const saved = useAsync(() => savedJobService.list({ page, limit: 12 }), [page, count]);
  const items = saved.data?.data || [];

  return (
    <>
      <PageHeader title={t('savedJobs.title')} subtitle={t('savedJobs.subtitle')} />
      {saved.error && <ErrorMessage error={saved.error} onRetry={saved.reload} />}
      {!saved.error && (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {saved.loading && !saved.data && Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
          {items.map((item) => (
            <div key={item._id} className="flex flex-col gap-2">
              <JobCard job={item.job} />
              <div className="flex items-center justify-between px-1 text-xs text-slate-500">
                <span>
                  {t('savedJobs.savedAgo', { time: timeAgo(item.savedAt) })}
                  {!item.job.isOpen && (
                    <span className="ml-2">
                      <StatusBadge kind="job" status={item.job.status === 'published' ? 'expired' : item.job.status} />
                    </span>
                  )}
                </span>
                <button type="button" onClick={() => toggle(item.job._id)} className="flex items-center gap-1 font-medium text-red-600 hover:underline">
                  <Trash2 className="h-3.5 w-3.5" /> {t('common.remove')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {!saved.loading && !saved.error && items.length === 0 && (
        <div className="card">
          <EmptyState
            icon={Bookmark}
            title={t('savedJobs.empty')}
            description={t('savedJobs.emptyHint')}
            action={
              <Link to="/jobs" className="btn btn-primary btn-sm">
                {t('nav.findJobs')}
              </Link>
            }
          />
        </div>
      )}
      <Pagination className="mt-6" pagination={saved.data?.pagination} onChange={setPage} />
    </>
  );
}
