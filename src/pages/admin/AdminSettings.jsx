import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Archive, Mail, MailOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PageHeader from '../../components/dashboard/PageHeader';
import AccountSettings from '../../components/dashboard/AccountSettings';
import Tabs from '../../components/common/Tabs';
import Pagination from '../../components/common/Pagination';
import StatusBadge from '../../components/common/StatusBadge';
import { CardSkeleton } from '../../components/common/Skeleton';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';
import { Checkbox, Input, Textarea } from '../../components/forms/FormField';
import { useAsync } from '../../hooks/useAsync';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { invalidatePublicSettings } from '../../hooks/usePublicSettings';
import { useToast } from '../../context/ToastContext';
import { adminService } from '../../services/adminService';
import { EMAIL_RULE } from '../../utils/constants';
import { formatDateTime } from '../../utils/format';
import { applyServerErrors } from '../../utils/formErrors';

function PlatformSettings({ settings, onSaved }) {
  const { t } = useTranslation();
  const toast = useToast();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({ defaultValues: settings, values: settings });

  const onSubmit = async (v) => {
    try {
      const res = await adminService.updateSettings({
        siteName: v.siteName,
        tagline: v.tagline,
        contactEmail: v.contactEmail,
        contactPhone: v.contactPhone,
        contactAddress: v.contactAddress,
        allowSeekerRegistration: v.allowSeekerRegistration,
        allowEmployerRegistration: v.allowEmployerRegistration,
        maxActiveJobsPerEmployer: Number(v.maxActiveJobsPerEmployer),
        featuredJobsLimit: Number(v.featuredJobsLimit),
        maintenanceMessage: v.maintenanceMessage,
      });
      invalidatePublicSettings();
      toast.success(res.message);
      onSaved(res.data.settings);
    } catch (err) {
      if (!applyServerErrors(err, setError)) setError('root', { message: err.message });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      {errors.root && <ErrorMessage compact message={errors.root.message} />}
      <section className="card space-y-5 p-5 sm:p-6">
        <h2 className="text-base font-semibold">{t('adminSettings.general')}</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <Input label={t('adminSettings.siteName')} required error={errors.siteName?.message} {...register('siteName', { required: t('validation.required') })} />
          <Input label={t('adminSettings.tagline')} maxLength={200} {...register('tagline')} />
          <Input label={t('adminSettings.contactEmail')} type="email" required error={errors.contactEmail?.message} {...register('contactEmail', { required: t('validation.required'), pattern: { value: EMAIL_RULE, message: t('validation.email') } })} />
          <Input label={t('adminSettings.contactPhone')} maxLength={30} {...register('contactPhone')} />
          <Input className="sm:col-span-2" label={t('adminSettings.contactAddress')} maxLength={200} {...register('contactAddress')} />
        </div>
        <Textarea label={t('adminSettings.announcement')} rows={2} maxLength={300} hint={t('adminSettings.announcementHint')} {...register('maintenanceMessage')} />
      </section>
      <section className="card space-y-5 p-5 sm:p-6">
        <h2 className="text-base font-semibold">{t('adminSettings.rules')}</h2>
        <Checkbox label={t('adminSettings.allowSeekers')} description={t('adminSettings.allowSeekersHint')} {...register('allowSeekerRegistration')} />
        <Checkbox label={t('adminSettings.allowEmployers')} description={t('adminSettings.allowEmployersHint')} {...register('allowEmployerRegistration')} />
        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            label={t('adminSettings.maxJobs')}
            type="number"
            min="1"
            max="1000"
            hint={t('adminSettings.maxJobsHint')}
            error={errors.maxActiveJobsPerEmployer?.message}
            {...register('maxActiveJobsPerEmployer', { required: t('validation.required'), min: { value: 1, message: t('validation.min', { count: 1 }) }, max: { value: 1000, message: t('validation.max', { count: 1000 }) } })}
          />
          <Input
            label={t('adminSettings.featuredLimit')}
            type="number"
            min="1"
            max="24"
            hint={t('adminSettings.featuredLimitHint')}
            error={errors.featuredJobsLimit?.message}
            {...register('featuredJobsLimit', { required: t('validation.required'), min: { value: 1, message: t('validation.min', { count: 1 }) }, max: { value: 24, message: t('validation.max', { count: 24 }) } })}
          />
        </div>
      </section>
      <div className="flex justify-end">
        <button type="submit" className="btn btn-primary" disabled={isSubmitting || !isDirty}>{isSubmitting ? t('common.saving') : t('common.saveChanges')}</button>
      </div>
    </form>
  );
}

function Messages() {
  const { t } = useTranslation();
  const toast = useToast();
  const [status, setStatus] = useState('new');
  const [page, setPage] = useState(1);
  const list = useAsync(() => adminService.messages({ status, page, limit: 10 }), [status, page]);
  const items = list.data?.data || [];

  const setMessageStatus = async (m, next) => {
    try {
      await adminService.updateMessage(m._id, next);
      list.reload();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <>
      <Tabs
        className="mb-4"
        active={status}
        onChange={(s) => {
          setStatus(s);
          setPage(1);
        }}
        tabs={[
          { id: 'new', label: t('status.message.new') },
          { id: 'read', label: t('status.message.read') },
          { id: 'archived', label: t('status.message.archived') },
          { id: '', label: t('applications.all') },
        ]}
      />
      {list.error && <ErrorMessage error={list.error} onRetry={list.reload} />}
      <div className="space-y-3">
        {list.loading && !list.data && <CardSkeleton lines={2} />}
        {items.map((m) => (
          <article key={m._id} className="card p-5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-semibold">{m.subject}</p>
                <p className="text-xs text-slate-500">
                  {m.name} · <a href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject}`)}`} className="text-brand-600 hover:underline">{m.email}</a> · {formatDateTime(m.createdAt)}
                </p>
              </div>
              <StatusBadge kind="message" status={m.status} />
            </div>
            <p className="mt-3 whitespace-pre-line text-sm text-slate-700 dark:text-slate-300">{m.message}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <a href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject}`)}`} className="btn btn-primary btn-sm" onClick={() => m.status === 'new' && setMessageStatus(m, 'read')}>
                <Mail className="h-4 w-4" /> {t('adminSettings.reply')}
              </a>
              {m.status === 'new' && (
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setMessageStatus(m, 'read')}><MailOpen className="h-4 w-4" /> {t('adminSettings.markRead')}</button>
              )}
              {m.status !== 'archived' && (
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setMessageStatus(m, 'archived')}><Archive className="h-4 w-4" /> {t('adminSettings.archive')}</button>
              )}
            </div>
          </article>
        ))}
        {!list.loading && !list.error && items.length === 0 && <div className="card"><EmptyState icon={Mail} title={t('adminSettings.noMessages')} /></div>}
      </div>
      <Pagination className="mt-6" pagination={list.data?.pagination} onChange={setPage} />
    </>
  );
}

export default function AdminSettings() {
  const { t } = useTranslation();
  useDocumentTitle(t('nav.settings'));
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') || 'platform';
  const data = useAsync(() => adminService.settings().then((r) => r.data.settings), []);

  return (
    <>
      <PageHeader title={t('adminSettings.title')} subtitle={t('adminSettings.subtitle')} />
      <Tabs
        className="mb-6"
        active={tab}
        onChange={(id) => setParams(id === 'platform' ? {} : { tab: id })}
        tabs={[
          { id: 'platform', label: t('adminSettings.tabPlatform') },
          { id: 'messages', label: t('adminSettings.tabMessages') },
          { id: 'account', label: t('profile.tabAccount') },
        ]}
      />
      <div className="max-w-4xl">
        {tab === 'platform' &&
          (data.error ? (
            <ErrorMessage error={data.error} onRetry={data.reload} />
          ) : !data.data ? (
            <CardSkeleton lines={6} />
          ) : (
            <PlatformSettings settings={data.data} onSaved={(s) => data.setData(s)} />
          ))}
        {tab === 'messages' && <Messages />}
        {tab === 'account' && <AccountSettings allowDelete={false} />}
      </div>
    </>
  );
}
