import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Briefcase, Flag, UserRound } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PageHeader from '../../components/dashboard/PageHeader';
import Tabs from '../../components/common/Tabs';
import Pagination from '../../components/common/Pagination';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import { CardSkeleton } from '../../components/common/Skeleton';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';
import { Select, Textarea } from '../../components/forms/FormField';
import { useAsync } from '../../hooks/useAsync';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useToast } from '../../context/ToastContext';
import { adminService } from '../../services/adminService';
import { REPORT_REASONS, REPORT_STATUSES } from '../../utils/constants';
import { formatDateTime, timeAgo } from '../../utils/format';

function ReviewModal({ report, onClose, onSaved }) {
  const { t } = useTranslation();
  const toast = useToast();
  const [status, setStatus] = useState(report.status);
  const [notes, setNotes] = useState(report.adminNotes || '');
  const [action, setAction] = useState('none');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Taking a moderation action normally resolves the report
    if (action !== 'none' && status !== 'resolved') setStatus('resolved');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [action]);

  const save = async (e) => {
    e.preventDefault();
    if (action !== 'none' && !notes.trim()) {
      setError(t('reports.notesRequired'));
      return;
    }
    setSaving(true);
    setError('');
    try {
      const res = await adminService.updateReport(report._id, { status, adminNotes: notes.trim(), action });
      toast.success(res.message);
      onSaved();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const job = report.reportedJobId;
  const target = report.reportedUserId;
  const canSuspend = target && !target.isSuspended && target.role !== 'admin';
  const canRemoveJob = job && job.status !== 'removed';

  return (
    <Modal
      open
      onClose={onClose}
      title={t('reports.reviewTitle')}
      description={t('reports.submittedBy', { name: report.reporterId?.name || '—', date: formatDateTime(report.createdAt) })}
      size="lg"
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving}>{t('common.cancel')}</button>
          <button type="submit" form="review-form" className="btn btn-primary" disabled={saving}>{saving ? t('common.saving') : t('reports.saveReview')}</button>
        </>
      }
    >
      <form id="review-form" onSubmit={save} className="space-y-5">
        {error && <ErrorMessage compact message={error} />}
        <div className="grid gap-4 rounded-xl bg-slate-50 p-4 text-sm sm:grid-cols-2 dark:bg-navy-950">
          <div>
            <p className="text-xs text-slate-500">{t('reports.reason')}</p>
            <p className="font-medium">{t(`reportReasons.${report.reason}`)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">{t('reports.currentStatus')}</p>
            <StatusBadge kind="report" status={report.status} />
          </div>
          {job && (
            <div>
              <p className="text-xs text-slate-500">{t('reports.reportedJob')}</p>
              <Link to={`/jobs/${job._id}`} target="_blank" className="font-medium text-brand-600 hover:underline">{job.title}</Link>
              <div className="mt-1"><StatusBadge kind="job" status={job.status} /></div>
            </div>
          )}
          {target && (
            <div>
              <p className="text-xs text-slate-500">{job ? t('reports.jobOwner') : t('reports.reportedUser')}</p>
              <Link to={`/profile/${target._id}`} target="_blank" className="font-medium text-brand-600 hover:underline">{target.name}</Link>
              <p className="text-xs text-slate-500">{target.email}</p>
              <div className="mt-1"><StatusBadge kind="account" status={target.isSuspended ? 'suspended' : 'active'} /></div>
            </div>
          )}
          {!job && !target && <p className="text-slate-500 sm:col-span-2">{t('reports.deletedTarget')}</p>}
          {report.description && (
            <div className="sm:col-span-2">
              <p className="text-xs text-slate-500">{t('reports.details')}</p>
              <p className="whitespace-pre-line">{report.description}</p>
            </div>
          )}
          {report.actionTaken && report.actionTaken !== 'none' && (
            <div className="sm:col-span-2">
              <p className="text-xs text-slate-500">{t('reports.actionTaken')}</p>
              <p className="font-medium">{t(`reports.actions.${report.actionTaken}`)}</p>
            </div>
          )}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Select label={t('reports.status')} value={status} onChange={(e) => setStatus(e.target.value)}>
            {REPORT_STATUSES.map((s) => (
              <option key={s} value={s}>{t(`status.report.${s}`)}</option>
            ))}
          </Select>
          <Select label={t('reports.moderationAction')} value={action} onChange={(e) => setAction(e.target.value)}>
            <option value="none">{t('reports.actions.none')}</option>
            {canRemoveJob && <option value="remove_job">{t('reports.actions.remove_job')}</option>}
            {canSuspend && <option value="suspend_user">{t('reports.actions.suspend_user')}</option>}
          </Select>
        </div>
        <Textarea label={t('reports.adminNotes')} rows={4} maxLength={2000} value={notes} onChange={(e) => setNotes(e.target.value)} hint={t('reports.adminNotesHint')} />
      </form>
    </Modal>
  );
}

export default function AdminReports() {
  const { t } = useTranslation();
  useDocumentTitle(t('nav.reports'));
  const [params, setParams] = useSearchParams();
  const status = params.get('status') || '';
  const type = params.get('type') || '';
  const reason = params.get('reason') || '';
  const page = Number(params.get('page')) || 1;
  const [reviewing, setReviewing] = useState(null);

  const list = useAsync(() => adminService.reports({ status, type, reason, page, limit: 15 }), [status, type, reason, page]);
  const reports = list.data?.data?.reports || [];
  const counts = list.data?.data?.counts;

  const setFilter = (key, value) => {
    const sp = new URLSearchParams(params);
    if (value) sp.set(key, value);
    else sp.delete(key);
    sp.delete('page');
    setParams(sp);
  };

  const tabs = [
    { id: '', label: t('applications.all') },
    ...REPORT_STATUSES.map((s) => ({ id: s, label: t(`status.report.${s}`), count: counts?.[s] })),
  ];

  return (
    <>
      <PageHeader title={t('reports.title')} subtitle={t('reports.subtitle')} />
      <Tabs tabs={tabs} active={status} onChange={(s) => setFilter('status', s)} className="mb-4" />
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <select className="input sm:w-48" value={type} onChange={(e) => setFilter('type', e.target.value)} aria-label={t('reports.type')}>
          <option value="">{t('reports.allTypes')}</option>
          <option value="job">{t('reports.jobReports')}</option>
          <option value="user">{t('reports.userReports')}</option>
        </select>
        <select className="input sm:w-56" value={reason} onChange={(e) => setFilter('reason', e.target.value)} aria-label={t('reports.reason')}>
          <option value="">{t('reports.allReasons')}</option>
          {REPORT_REASONS.map((r) => (
            <option key={r} value={r}>{t(`reportReasons.${r}`)}</option>
          ))}
        </select>
      </div>

      {list.error ? (
        <ErrorMessage error={list.error} onRetry={list.reload} />
      ) : (
        <div className="space-y-3">
          {list.loading && !list.data && Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} lines={1} />)}
          {reports.map((r) => {
            const Icon = r.reportedJobId ? Briefcase : UserRound;
            return (
              <article key={r._id} className="card flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold">{r.reportedJobId?.title || r.reportedUserId?.name || t('reports.deletedTarget')}</p>
                    <StatusBadge kind="report" status={r.status} />
                    <span className="chip">{t(`reportReasons.${r.reason}`)}</span>
                  </div>
                  {r.description && <p className="mt-1 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">{r.description}</p>}
                  <p className="mt-1 text-xs text-slate-500">
                    {t('reports.byOn', { name: r.reporterId?.name || '—', time: timeAgo(r.createdAt) })}
                    {r.reviewedBy && ` · ${t('reports.reviewedBy', { name: r.reviewedBy.name })}`}
                  </p>
                </div>
                <button type="button" className="btn btn-primary btn-sm" onClick={() => setReviewing(r)}>{t('reports.review')}</button>
              </article>
            );
          })}
          {!list.loading && reports.length === 0 && (
            <div className="card"><EmptyState icon={Flag} title={t('reports.none')} description={t('reports.noneHint')} /></div>
          )}
        </div>
      )}
      <Pagination className="mt-6" pagination={list.data?.pagination} onChange={(p) => { const sp = new URLSearchParams(params); sp.set('page', String(p)); setParams(sp); }} />
      {reviewing && <ReviewModal report={reviewing} onClose={() => setReviewing(null)} onSaved={list.reload} />}
    </>
  );
}
