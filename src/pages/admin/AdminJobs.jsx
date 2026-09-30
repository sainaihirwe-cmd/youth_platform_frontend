import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Briefcase, Eye, Lock, RotateCcw, Search, ShieldOff, Star, StarOff, Trash2, Flag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PageHeader from '../../components/dashboard/PageHeader';
import Pagination from '../../components/common/Pagination';
import StatusBadge from '../../components/common/StatusBadge';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';
import { TableSkeleton } from '../../components/common/Skeleton';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';
import { Checkbox } from '../../components/forms/FormField';
import { useAsync } from '../../hooks/useAsync';
import { useDebounce } from '../../hooks/useDebounce';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useToast } from '../../context/ToastContext';
import { adminService } from '../../services/adminService';
import { categoryService } from '../../services/categoryService';
import { formatDate } from '../../utils/format';
import { categoryLabel, locationLabel } from '../../utils/labels';

export default function AdminJobs() {
  const { t } = useTranslation();
  useDocumentTitle(t('nav.jobs'));
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const status = params.get('status') || '';
  const category = params.get('category') || '';
  const reported = params.get('reported') === 'true';
  const page = Number(params.get('page')) || 1;
  const [q, setQ] = useState('');
  const debouncedQ = useDebounce(q, 400);
  const [action, setAction] = useState(null);

  const categories = useAsync(() => categoryService.list(true).then((r) => r.data), []);
  const list = useAsync(
    () => adminService.jobs({ status, category, reported: reported ? 'true' : '', page, q: debouncedQ, limit: 15 }),
    [status, category, reported, page, debouncedQ]
  );
  const jobs = list.data?.data || [];

  const setFilter = (key, value) => {
    const sp = new URLSearchParams(params);
    if (value) sp.set(key, value);
    else sp.delete(key);
    sp.delete('page');
    setParams(sp);
  };

  const quick = async (job, act) => {
    try {
      const res = await adminService.moderateJob(job._id, act);
      toast.success(res.message);
      list.reload();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const confirmAction = async (reason) => {
    const { type, job } = action;
    const res = type === 'delete' ? await adminService.deleteJob(job._id) : await adminService.moderateJob(job._id, type, reason);
    toast.success(res.message);
    list.reload();
  };

  const dialog = action && {
    remove: { title: t('adminJobs.removeTitle'), message: t('adminJobs.removeConfirm', { title: action.job.title }), label: t('adminJobs.remove'), tone: 'danger', input: { label: t('adminJobs.reason'), type: 'textarea', required: true, placeholder: t('adminJobs.reasonPlaceholder') } },
    close: { title: t('adminJobs.closeTitle'), message: t('adminJobs.closeConfirm', { title: action.job.title }), label: t('adminJobs.close'), tone: 'primary', input: { label: t('adminJobs.reasonOptional'), type: 'textarea' } },
    restore: { title: t('adminJobs.restoreTitle'), message: t('adminJobs.restoreConfirm', { title: action.job.title }), label: t('adminJobs.restore'), tone: 'success' },
    delete: { title: t('adminJobs.deleteTitle'), message: t('adminJobs.deleteConfirm', { title: action.job.title }), label: t('common.delete'), tone: 'danger' },
  }[action.type];

  const statusOf = (j) => (j.status === 'published' && j.isExpired ? 'expired' : j.status);

  const Actions = ({ j }) => (
    <div className="flex justify-end gap-1">
      <Link to={`/jobs/${j._id}`} className="btn-ghost rounded-lg p-2" title={t('common.view')} aria-label={t('common.view')}>
        <Eye className="h-4 w-4" />
      </Link>
      {j.status === 'published' && !j.isExpired && (
        <button type="button" className="rounded-lg p-2 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10" title={j.isFeatured ? t('adminJobs.unfeature') : t('adminJobs.feature')} aria-label={j.isFeatured ? t('adminJobs.unfeature') : t('adminJobs.feature')} onClick={() => quick(j, j.isFeatured ? 'unfeature' : 'feature')}>
          {j.isFeatured ? <StarOff className="h-4 w-4" /> : <Star className="h-4 w-4" />}
        </button>
      )}
      {j.status === 'published' && (
        <button type="button" className="btn-ghost rounded-lg p-2" title={t('adminJobs.close')} aria-label={t('adminJobs.close')} onClick={() => setAction({ type: 'close', job: j })}>
          <Lock className="h-4 w-4" />
        </button>
      )}
      {j.status === 'removed' ? (
        <button type="button" className="rounded-lg p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-500/10" title={t('adminJobs.restore')} aria-label={t('adminJobs.restore')} onClick={() => setAction({ type: 'restore', job: j })}>
          <RotateCcw className="h-4 w-4" />
        </button>
      ) : (
        <button type="button" className="rounded-lg p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10" title={t('adminJobs.remove')} aria-label={t('adminJobs.remove')} onClick={() => setAction({ type: 'remove', job: j })}>
          <ShieldOff className="h-4 w-4" />
        </button>
      )}
      <button type="button" className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10" title={t('common.delete')} aria-label={t('common.delete')} onClick={() => setAction({ type: 'delete', job: j })}>
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );

  return (
    <>
      <PageHeader title={t('adminJobs.title')} subtitle={t('adminJobs.subtitle')} />
      <div className="card mb-4 grid items-center gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative sm:col-span-2 lg:col-span-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
          <input type="search" className="input pl-9" placeholder={t('adminJobs.search')} value={q} onChange={(e) => setQ(e.target.value)} aria-label={t('adminJobs.search')} />
        </div>
        <select className="input" value={status} onChange={(e) => setFilter('status', e.target.value)} aria-label={t('employerJobs.status')}>
          <option value="">{t('adminUsers.allStatuses')}</option>
          {['published', 'draft', 'closed', 'expired', 'removed'].map((s) => (
            <option key={s} value={s}>{t(`status.job.${s}`)}</option>
          ))}
        </select>
        <select className="input" value={category} onChange={(e) => setFilter('category', e.target.value)} aria-label={t('filters.category')}>
          <option value="">{t('filters.allCategories')}</option>
          {(categories.data || []).map((c) => (
            <option key={c._id} value={c._id}>{categoryLabel(t, c)}</option>
          ))}
        </select>
        <Checkbox label={t('adminJobs.reportedOnly')} checked={reported} onChange={(e) => setFilter('reported', e.target.checked ? 'true' : '')} />
      </div>

      {list.error ? (
        <ErrorMessage error={list.error} onRetry={list.reload} />
      ) : (
        <div className="card overflow-hidden">
          {list.loading && !list.data ? (
            <TableSkeleton />
          ) : jobs.length === 0 ? (
            <EmptyState icon={Briefcase} title={t('adminJobs.none')} />
          ) : (
            <>
              <div className="hidden overflow-x-auto lg:block">
                <table className="table-base">
                  <thead>
                    <tr>
                      <th>{t('employerJobs.job')}</th>
                      <th>{t('adminJobs.employer')}</th>
                      <th>{t('employerJobs.status')}</th>
                      <th>{t('adminJobs.activity')}</th>
                      <th>{t('adminJobs.posted')}</th>
                      <th className="text-right">{t('common.actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-navy-800">
                    {jobs.map((j) => (
                      <tr key={j._id}>
                        <td className="max-w-xs">
                          <Link to={`/jobs/${j._id}`} className="font-medium hover:underline">{j.title}</Link>
                          <p className="text-xs text-slate-500">{categoryLabel(t, j.category)} · {locationLabel(t, j.location)}</p>
                          {j.status === 'removed' && j.removedReason && <p className="mt-0.5 text-xs text-red-600">{j.removedReason}</p>}
                        </td>
                        <td className="text-sm">
                          <p className="font-medium">{j.employer?.companyName || j.employerId?.name}</p>
                          <p className="text-xs text-slate-500">{j.employerId?.email}</p>
                          {j.employerId?.isSuspended && <StatusBadge kind="account" status="suspended" />}
                        </td>
                        <td>
                          <div className="flex flex-col items-start gap-1">
                            <StatusBadge kind="job" status={statusOf(j)} />
                            {j.isFeatured && <span className="badge bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300"><Star className="h-3 w-3 fill-current" /> {t('jobs.featured')}</span>}
                          </div>
                        </td>
                        <td className="text-xs text-slate-600 dark:text-slate-400">
                          {t('employerJobs.applicantsCount', { count: j.applicationCount })}
                          {j.reportCount > 0 && (
                            <span className="mt-0.5 flex items-center gap-1 font-medium text-red-600"><Flag className="h-3 w-3" /> {t('adminUsers.reportsCount', { count: j.reportCount })}</span>
                          )}
                        </td>
                        <td className="text-xs text-slate-500">{formatDate(j.createdAt)}</td>
                        <td><Actions j={j} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <ul className="divide-y divide-slate-100 lg:hidden dark:divide-navy-800">
                {jobs.map((j) => (
                  <li key={j._id} className="space-y-2 p-4">
                    <Link to={`/jobs/${j._id}`} className="font-medium">{j.title}</Link>
                    <p className="text-xs text-slate-500">{j.employer?.companyName || j.employerId?.name} · {formatDate(j.createdAt)}</p>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <StatusBadge kind="job" status={statusOf(j)} />
                      {j.reportCount > 0 && <span className="text-xs font-medium text-red-600">{t('adminUsers.reportsCount', { count: j.reportCount })}</span>}
                    </div>
                    <Actions j={j} />
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
      <Pagination className="mt-6" pagination={list.data?.pagination} onChange={(p) => { const sp = new URLSearchParams(params); sp.set('page', String(p)); setParams(sp); }} />
      <ConfirmationDialog open={Boolean(action)} onClose={() => setAction(null)} onConfirm={confirmAction} title={dialog?.title} message={dialog?.message} confirmLabel={dialog?.label} tone={dialog?.tone} input={dialog?.input} />
    </>
  );
}
