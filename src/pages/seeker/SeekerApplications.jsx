import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PageHeader from '../../components/dashboard/PageHeader';
import ApplicationCard from '../../components/dashboard/ApplicationCard';
import Tabs from '../../components/common/Tabs';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';
import StatusBadge from '../../components/common/StatusBadge';
import { CardSkeleton } from '../../components/common/Skeleton';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';
import { useAsync } from '../../hooks/useAsync';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useToast } from '../../context/ToastContext';
import { applicationService } from '../../services/applicationService';
import { openProtectedFile } from '../../services/api';
import { formatDateTime } from '../../utils/format';

export default function SeekerApplications() {
  const { t } = useTranslation();
  useDocumentTitle(t('nav.myApplications'));
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const status = params.get('status') || '';
  const page = Number(params.get('page')) || 1;
  const [viewing, setViewing] = useState(null);
  const [withdrawing, setWithdrawing] = useState(null);

  const list = useAsync(() => applicationService.mine({ status: status || undefined, page, limit: 10 }), [status, page]);
  const stats = useAsync(() => applicationService.stats().then((r) => r.data.stats), []);

  const setFilter = (next) => {
    const sp = new URLSearchParams();
    if (next) sp.set('status', next);
    setParams(sp);
  };

  const withdraw = async () => {
    await applicationService.withdraw(withdrawing._id);
    toast.success(t('applications.withdrawn'));
    list.reload();
    stats.reload();
  };

  const s = stats.data;
  const tabs = [
    { id: '', label: t('applications.all'), count: s?.totalApplications },
    { id: 'pending', label: t('status.application.pending'), count: s?.pendingApplications },
    { id: 'accepted', label: t('status.application.accepted'), count: s?.acceptedApplications },
    { id: 'rejected', label: t('status.application.rejected'), count: s?.rejectedApplications },
  ];
  const items = list.data?.data || [];

  return (
    <>
      <PageHeader title={t('applications.title')} subtitle={t('applications.subtitle')} />
      <Tabs tabs={tabs} active={status} onChange={setFilter} className="mb-6" />

      {list.error && <ErrorMessage error={list.error} onRetry={list.reload} />}
      {!list.error && (
        <div className="space-y-3">
          {list.loading && !list.data && Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} lines={1} />)}
          {items.map((a) => (
            <ApplicationCard key={a._id} application={a} onView={setViewing} onWithdraw={setWithdrawing} />
          ))}
          {!list.loading && items.length === 0 && (
            <div className="card">
              <EmptyState
                icon={FileText}
                title={status ? t('applications.noneWithStatus') : t('seekerDash.noApplications')}
                description={t('seekerDash.noApplicationsHint')}
                action={
                  <Link to="/jobs" className="btn btn-primary btn-sm">
                    {t('nav.findJobs')}
                  </Link>
                }
              />
            </div>
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

      <Modal open={Boolean(viewing)} onClose={() => setViewing(null)} title={viewing?.jobId?.title || t('applications.jobRemoved')} size="lg">
        {viewing && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge kind="application" status={viewing.status} />
              <span className="text-sm text-slate-500">{t('applications.submittedOn', { date: formatDateTime(viewing.appliedAt) })}</span>
            </div>
            {viewing.statusChangedAt && (
              <p className="text-sm text-slate-600 dark:text-slate-400">{t('applications.statusChanged', { date: formatDateTime(viewing.statusChangedAt) })}</p>
            )}
            <div>
              <h3 className="text-sm font-semibold">{t('apply.coverLetter')}</h3>
              <p className="prose-job mt-2 rounded-xl bg-slate-50 p-4 text-sm dark:bg-navy-950">{viewing.coverLetter}</p>
            </div>
            {viewing.resumeUrl && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => openProtectedFile(viewing.resumeUrl, viewing.resumeOriginalName).catch((e) => toast.error(e.message))}
              >
                <FileText className="h-4 w-4" /> {viewing.resumeOriginalName || t('applications.viewResume')}
              </button>
            )}
            {viewing.jobId && (
              <Link to={`/jobs/${viewing.jobId._id}`} className="btn btn-primary">
                {t('applications.viewJob')}
              </Link>
            )}
          </div>
        )}
      </Modal>

      <ConfirmationDialog
        open={Boolean(withdrawing)}
        onClose={() => setWithdrawing(null)}
        onConfirm={withdraw}
        title={t('applications.withdrawTitle')}
        message={t('applications.withdrawConfirm', { title: withdrawing?.jobId?.title || '' })}
        confirmLabel={t('applications.withdraw')}
      />
    </>
  );
}
