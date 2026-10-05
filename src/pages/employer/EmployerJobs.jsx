import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Briefcase, Eye, MoreVertical, Pencil, PlusCircle, Search, Trash2, Users, Lock, Send, FileEdit } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PageHeader from '../../components/dashboard/PageHeader';
import Tabs from '../../components/common/Tabs';
import Pagination from '../../components/common/Pagination';
import StatusBadge from '../../components/common/StatusBadge';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';
import { TableSkeleton } from '../../components/common/Skeleton';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';
import { useAsync } from '../../hooks/useAsync';
import { useDebounce } from '../../hooks/useDebounce';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useToast } from '../../context/ToastContext';
import { employerService } from '../../services/employerService';
import { jobService } from '../../services/jobService';
import { formatDate } from '../../utils/format';
import { locationLabel } from '../../utils/labels';

function JobActions({ job, onStatus, onDelete }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const removed = job.status === 'removed';
  const item = 'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-navy-800';
  return (
    <div className="relative flex items-center justify-end gap-1" onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setOpen(false)}>
      <button
        type="button"
        className="btn-ghost rounded-lg p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
        onClick={() => onDelete(job)}
        aria-label={t('employerJobs.deleteJobNamed', { title: job.title })}
        title={t('employerJobs.deleteTitle')}
      >
        <Trash2 className="h-4 w-4" />
      </button>
      <button type="button" className="btn-ghost rounded-lg p-2" onClick={() => setOpen((o) => !o)} aria-label={t('common.actions')} aria-expanded={open}>
        <MoreVertical className="h-4 w-4" />
      </button>
      {open && (
        <div className="card absolute right-0 top-full z-20 mt-1 w-52 p-1.5 shadow-card-hover" role="menu">
          <Link to={`/jobs/${job._id}`} className={item} role="menuitem">
            <Eye className="h-4 w-4" /> {t('employerJobs.viewListing')}
          </Link>
          <Link to={`/employer/jobs/${job._id}/applications`} className={item} role="menuitem">
            <Users className="h-4 w-4" /> {t('employerJobs.applicants')}
          </Link>
          {!removed && (
            <Link to={`/employer/jobs/${job._id}/edit`} className={item} role="menuitem">
              <Pencil className="h-4 w-4" /> {t('common.edit')}
            </Link>
          )}
          {!removed && job.status !== 'published' && !job.isExpired && (
            <button type="button" className={item} role="menuitem" onClick={() => { setOpen(false); onStatus(job, 'published'); }}>
              <Send className="h-4 w-4" /> {t('employerJobs.publish')}
            </button>
          )}
          {!removed && job.status === 'published' && (
            <button type="button" className={item} role="menuitem" onClick={() => { setOpen(false); onStatus(job, 'closed'); }}>
              <Lock className="h-4 w-4" /> {t('employerJobs.close')}
            </button>
          )}
          {!removed && job.status !== 'draft' && (
            <button type="button" className={item} role="menuitem" onClick={() => { setOpen(false); onStatus(job, 'draft'); }}>
              <FileEdit className="h-4 w-4" /> {t('employerJobs.toDraft')}
            </button>
          )}
          <button type="button" className={`${item} text-red-600`} role="menuitem" onClick={() => { setOpen(false); onDelete(job); }}>
            <Trash2 className="h-4 w-4" /> {t('common.delete')}
          </button>
        </div>
      )}
    </div>
  );
}

export default function EmployerJobs() {
  const { t } = useTranslation();
  useDocumentTitle(t('nav.myJobs'));
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const status = params.get('status') || '';
  const page = Number(params.get('page')) || 1;
  const [q, setQ] = useState('');
  const debouncedQ = useDebounce(q, 400);
  const [deleting, setDeleting] = useState(null);

  const list = useAsync(() => employerService.jobs({ status, page, q: debouncedQ, limit: 10 }), [status, page, debouncedQ]);
  const jobs = list.data?.data || [];

  const setStatusFilter = (s) => {
    const sp = new URLSearchParams();
    if (s) sp.set('status', s);
    setParams(sp);
  };

  const changeStatus = async (job, next) => {
    try {
      const res = await jobService.setStatus(job._id, next);
      toast.success(res.message);
      list.reload();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const remove = async () => {
    const res = await jobService.remove(deleting._id);
    toast.success(res.message);
    list.reload();
  };

  const tabs = [
    { id: '', label: t('employerJobs.all') },
    { id: 'active', label: t('employerJobs.active') },
    { id: 'draft', label: t('status.job.draft') },
    { id: 'closed', label: t('status.job.closed') },
    { id: 'expired', label: t('status.job.expired') },
    { id: 'removed', label: t('status.job.removed') },
  ];

  const statusOf = (j) => (j.status === 'published' && j.isExpired ? 'expired' : j.status);

  return (
    <>
      <PageHeader
        title={t('employerJobs.title')}
        subtitle={t('employerJobs.subtitle')}
        actions={
          <Link to="/employer/jobs/create" className="btn btn-primary">
            <PlusCircle className="h-4 w-4" /> {t('nav.postJob')}
          </Link>
        }
      />
      <Tabs tabs={tabs} active={status} onChange={setStatusFilter} className="mb-4" />
      <div className="relative mb-4 max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
        <input type="search" className="input pl-9" placeholder={t('employerJobs.search')} value={q} onChange={(e) => setQ(e.target.value)} aria-label={t('employerJobs.search')} />
      </div>

      {list.error ? (
        <ErrorMessage error={list.error} onRetry={list.reload} />
      ) : (
        <div className="card overflow-visible">
          {list.loading && !list.data ? (
            <TableSkeleton />
          ) : jobs.length === 0 ? (
            <EmptyState
              icon={Briefcase}
              title={status || debouncedQ ? t('employerJobs.noneFiltered') : t('employerJobs.none')}
              description={t('employerJobs.noneHint')}
              action={
                <Link to="/employer/jobs/create" className="btn btn-primary btn-sm">
                  {t('nav.postJob')}
                </Link>
              }
            />
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block">
                <table className="table-base">
                  <thead>
                    <tr>
                      <th>{t('employerJobs.job')}</th>
                      <th>{t('employerJobs.status')}</th>
                      <th>{t('employerJobs.applicants')}</th>
                      <th>{t('jobs.deadline')}</th>
                      <th className="sr-only">{t('common.actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-navy-800">
                    {jobs.map((j) => (
                      <tr key={j._id} className="hover:bg-slate-50/60 dark:hover:bg-navy-800/30">
                        <td className="max-w-xs">
                          <Link to={`/employer/jobs/${j._id}/applications`} className="font-medium text-navy-900 hover:text-brand-700 dark:text-white">
                            {j.title}
                          </Link>
                          <p className="text-xs text-slate-500">
                            {locationLabel(t, j.location)} · {t(`jobTypes.${j.jobType}`)} · {t('employerJobs.createdOn', { date: formatDate(j.createdAt) })}
                          </p>
                        </td>
                        <td>
                          <StatusBadge kind="job" status={statusOf(j)} />
                        </td>
                        <td>
                          <Link to={`/employer/jobs/${j._id}/applications`} className="text-sm font-medium hover:underline">
                            {j.applicationCount}
                            {j.pendingCount > 0 && <span className="ml-1.5 text-xs text-amber-600">({t('employerJobs.pendingCount', { count: j.pendingCount })})</span>}
                          </Link>
                        </td>
                        <td className="text-sm text-slate-600 dark:text-slate-400">{formatDate(j.applicationDeadline)}</td>
                        <td className="text-right">
                          <JobActions job={j} onStatus={changeStatus} onDelete={setDeleting} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Mobile cards */}
              <ul className="divide-y divide-slate-100 md:hidden dark:divide-navy-800">
                {jobs.map((j) => (
                  <li key={j._id} className="flex items-start gap-3 p-4">
                    <div className="min-w-0 flex-1">
                      <Link to={`/employer/jobs/${j._id}/applications`} className="font-medium">
                        {j.title}
                      </Link>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <StatusBadge kind="job" status={statusOf(j)} />
                        <span>{t('employerJobs.applicantsCount', { count: j.applicationCount })}</span>
                        <span>· {formatDate(j.applicationDeadline)}</span>
                      </div>
                    </div>
                    <JobActions job={j} onStatus={changeStatus} onDelete={setDeleting} />
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
      <Pagination
        className="mt-6"
        pagination={list.data?.pagination}
        onChange={(p) => {
          const sp = new URLSearchParams(params);
          sp.set('page', String(p));
          setParams(sp);
        }}
      />
      <ConfirmationDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={remove}
        title={t('employerJobs.deleteTitle')}
        message={t('employerJobs.deleteConfirm', { title: deleting?.title || '', count: deleting?.applicationCount || 0 })}
        confirmLabel={t('common.delete')}
      />
    </>
  );
}
