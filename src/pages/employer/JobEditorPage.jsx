import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PageHeader from '../../components/dashboard/PageHeader';
import JobForm from '../../components/forms/JobForm';
import { CardSkeleton } from '../../components/common/Skeleton';
import ErrorMessage from '../../components/common/ErrorMessage';
import { useAsync } from '../../hooks/useAsync';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { jobService } from '../../services/jobService';
import { categoryService } from '../../services/categoryService';

/** Create (/employer/jobs/create) and edit (/employer/jobs/:id/edit) job postings. */
export default function JobEditorPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { t } = useTranslation();
  useDocumentTitle(isEdit ? t('jobForm.editTitle') : t('jobForm.createTitle'));
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();

  const categories = useAsync(() => categoryService.list().then((r) => r.data), []);
  const job = useAsync(() => (isEdit ? jobService.get(id).then((r) => r.data) : Promise.resolve(null)), [id]);

  const onSubmit = async (payload, status) => {
    if (isEdit) {
      const res = await jobService.update(id, payload);
      toast.success(res.message);
      navigate('/employer/jobs');
    } else {
      const res = await jobService.create({ ...payload, status: status || 'published' });
      toast.success(res.message);
      navigate(status === 'draft' ? '/employer/jobs?status=draft' : '/employer/jobs');
    }
  };

  const back = (
    <Link to="/employer/jobs" className="mb-2 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-navy-900 dark:hover:text-white">
      <ArrowLeft className="h-4 w-4" /> {t('nav.myJobs')}
    </Link>
  );

  const loading = categories.loading || job.loading;
  const error = categories.error || job.error;
  const notOwned = isEdit && job.data && !job.data.isOwner;
  const removed = isEdit && job.data?.job?.status === 'removed';

  return (
    <div className="max-w-4xl">
      <PageHeader back={back} title={isEdit ? t('jobForm.editTitle') : t('jobForm.createTitle')} subtitle={isEdit ? job.data?.job?.title : t('jobForm.createSubtitle')} />
      {loading && !categories.data ? (
        <CardSkeleton lines={6} />
      ) : error ? (
        <ErrorMessage error={error} onRetry={() => (categories.error ? categories.reload() : job.reload())} />
      ) : notOwned || (isEdit && !user) ? (
        <ErrorMessage message={t('errors.forbidden')} />
      ) : removed ? (
        <ErrorMessage message={t('jobForm.removedNotice')} />
      ) : (
        <JobForm
          key={job.data?.job?._id || 'new'}
          job={job.data?.job}
          categories={categories.data || []}
          onSubmit={onSubmit}
          allowDraft={!isEdit}
          submitLabel={isEdit ? t('common.saveChanges') : t('jobForm.publish')}
        />
      )}
    </div>
  );
}
