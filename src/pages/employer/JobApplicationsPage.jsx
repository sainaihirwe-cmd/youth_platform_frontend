import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Briefcase, Check, FileText, GraduationCap, Mail, MapPin, Phone, Search, Users, X, ExternalLink, RotateCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PageHeader from '../../components/dashboard/PageHeader';
import Tabs from '../../components/common/Tabs';
import Pagination from '../../components/common/Pagination';
import StatusBadge from '../../components/common/StatusBadge';
import Avatar from '../../components/common/Avatar';
import Modal from '../../components/common/Modal';
import { CardSkeleton } from '../../components/common/Skeleton';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';
import { useAsync } from '../../hooks/useAsync';
import { useDebounce } from '../../hooks/useDebounce';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useToast } from '../../context/ToastContext';
import { employerService } from '../../services/employerService';
import { applicationService } from '../../services/applicationService';
import { openProtectedFile } from '../../services/api';
import { formatDate, formatDateTime, timeAgo } from '../../utils/format';
import { locationLabel } from '../../utils/labels';

export default function JobApplicationsPage() {
  const { id } = useParams();
  const { t } = useTranslation();
  const toast = useToast();
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('newest');
  const [q, setQ] = useState('');
  const debouncedQ = useDebounce(q, 400);
  const [selected, setSelected] = useState(null);
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);

  const data = useAsync(() => employerService.jobApplications(id, { status, page, q: debouncedQ, sort, limit: 15 }), [id, status, page, debouncedQ, sort]);
  const job = data.data?.data?.job;
  const counts = data.data?.data?.counts;
  const applications = data.data?.data?.applications || [];
  useDocumentTitle(job ? t('applicants.titleFor', { title: job.title }) : t('applicants.title'));

  const openApplicant = (a) => {
    setSelected(a);
    setNotes(a.employerNotes || '');
  };

  const updateStatus = async (application, next) => {
    setBusy(true);
    try {
      const res = await applicationService.updateStatus(application._id, next, notes);
      toast.success(t(`applicants.marked.${next}`));
      setSelected((s) => (s && s._id === application._id ? { ...s, status: res.data.application.status, employerNotes: notes } : s));
      data.reload();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const viewResume = (a) => {
    const url = a.resumeUrl || a.applicantId?.resumeUrl;
    openProtectedFile(url, a.resumeOriginalName || a.applicantId?.resumeOriginalName).catch((e) => toast.error(e.message));
  };

  const total = counts ? counts.pending + counts.accepted + counts.rejected : undefined;
  const tabs = [
    { id: '', label: t('applications.all'), count: total },
    { id: 'pending', label: t('status.application.pending'), count: counts?.pending },
    { id: 'accepted', label: t('status.application.accepted'), count: counts?.accepted },
    { id: 'rejected', label: t('status.application.rejected'), count: counts?.rejected },
  ];

  const back = (
    <Link to="/employer/jobs" className="mb-2 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-navy-900 dark:hover:text-white">
      <ArrowLeft className="h-4 w-4" /> {t('nav.myJobs')}
    </Link>
  );

  if (data.error && !data.data) {
    return (
      <>
        <PageHeader back={back} title={t('applicants.title')} />
        <ErrorMessage error={data.error} onRetry={data.error.status === 403 || data.error.status === 404 ? undefined : data.reload} />
      </>
    );
  }

  const a = selected;
  const applicant = a?.applicantId;

  return (
    <>
      <PageHeader
        back={back}
        title={t('applicants.title')}
        subtitle={job ? `${job.title} · ${locationLabel(t, job.location)} · ${t('jobs.deadline')}: ${formatDate(job.applicationDeadline)}` : ''}
        actions={
          job && (
            <Link to={`/jobs/${job._id}`} className="btn btn-secondary">
              <ExternalLink className="h-4 w-4" /> {t('employerJobs.viewListing')}
            </Link>
          )
        }
      />
      <Tabs
        tabs={tabs}
        active={status}
        onChange={(s) => {
          setStatus(s);
          setPage(1);
        }}
        className="mb-4"
      />
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
          <input
            type="search"
            className="input pl-9"
            placeholder={t('applicants.search')}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            aria-label={t('applicants.search')}
          />
        </div>
        <select className="input sm:w-44" value={sort} onChange={(e) => setSort(e.target.value)} aria-label={t('jobs.sortBy')}>
          <option value="newest">{t('jobs.sortNewest')}</option>
          <option value="oldest">{t('jobs.sortOldest')}</option>
        </select>
      </div>

      {data.error && <ErrorMessage compact error={data.error} className="mb-4" />}
      <div className="space-y-3">
        {data.loading && !data.data && Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} lines={1} />)}
        {applications.map((app) => (
          <article key={app._id} className="card flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <Avatar src={app.applicantId?.profileImage} name={app.applicantId?.name} />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <button type="button" onClick={() => openApplicant(app)} className="font-semibold text-navy-900 hover:text-brand-700 dark:text-white">
                    {app.applicantId?.name || t('applicants.deletedUser')}
                  </button>
                  <StatusBadge kind="application" status={app.status} />
                </div>
                <p className="truncate text-sm text-slate-500">
                  {app.applicantId?.location && `${locationLabel(t, app.applicantId.location)} · `}
                  {t('applications.appliedAgo', { time: timeAgo(app.appliedAt) })}
                </p>
                {app.applicantId?.skills?.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {app.applicantId.skills.slice(0, 4).map((s) => (
                      <span key={s} className="chip py-0.5 text-[11px]">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {(app.resumeUrl || app.applicantId?.resumeUrl) && (
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => viewResume(app)}>
                  <FileText className="h-4 w-4" /> {t('applicants.cv')}
                </button>
              )}
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => openApplicant(app)}>
                {t('common.review')}
              </button>
              {app.status !== 'accepted' && (
                <button type="button" className="btn btn-success btn-sm" onClick={() => updateStatus(app, 'accepted')} disabled={busy}>
                  <Check className="h-4 w-4" /> {t('applicants.accept')}
                </button>
              )}
              {app.status !== 'rejected' && (
                <button type="button" className="btn btn-danger-outline btn-sm" onClick={() => updateStatus(app, 'rejected')} disabled={busy}>
                  <X className="h-4 w-4" /> {t('applicants.reject')}
                </button>
              )}
            </div>
          </article>
        ))}
        {!data.loading && applications.length === 0 && (
          <div className="card">
            <EmptyState icon={Users} title={status || debouncedQ ? t('applicants.noneFiltered') : t('applicants.none')} description={t('applicants.noneHint')} />
          </div>
        )}
      </div>
      <Pagination className="mt-6" pagination={data.data?.pagination} onChange={setPage} />

      <Modal
        open={Boolean(a)}
        onClose={() => setSelected(null)}
        title={applicant?.name || t('applicants.deletedUser')}
        description={a ? t('applications.submittedOn', { date: formatDateTime(a.appliedAt) }) : ''}
        size="xl"
        footer={
          a && (
            <>
              {a.status !== 'pending' && (
                <button type="button" className="btn btn-secondary" onClick={() => updateStatus(a, 'pending')} disabled={busy}>
                  <RotateCcw className="h-4 w-4" /> {t('applicants.resetPending')}
                </button>
              )}
              {a.status !== 'rejected' && (
                <button type="button" className="btn btn-danger-outline" onClick={() => updateStatus(a, 'rejected')} disabled={busy}>
                  <X className="h-4 w-4" /> {t('applicants.reject')}
                </button>
              )}
              {a.status !== 'accepted' && (
                <button type="button" className="btn btn-success" onClick={() => updateStatus(a, 'accepted')} disabled={busy}>
                  <Check className="h-4 w-4" /> {t('applicants.accept')}
                </button>
              )}
            </>
          )
        }
      >
        {a && (
          <div className="grid gap-6 md:grid-cols-[1fr_16rem]">
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-semibold">{t('apply.coverLetter')}</h3>
                <p className="prose-job mt-2 rounded-xl bg-slate-50 p-4 text-sm dark:bg-navy-950">{a.coverLetter}</p>
              </div>
              {applicant?.professionalSummary && (
                <div>
                  <h3 className="text-sm font-semibold">{t('profile.summary')}</h3>
                  <p className="prose-job mt-2 text-sm">{applicant.professionalSummary}</p>
                </div>
              )}
              {applicant?.experience?.length > 0 && (
                <div>
                  <h3 className="flex items-center gap-1.5 text-sm font-semibold">
                    <Briefcase className="h-4 w-4 text-brand-600" /> {t('profile.experience')}
                  </h3>
                  <ul className="mt-2 space-y-2">
                    {applicant.experience.map((e) => (
                      <li key={e._id} className="text-sm">
                        <span className="font-medium">{e.title}</span>
                        {e.company && <span className="text-slate-500"> · {e.company}</span>}
                        <span className="block text-xs text-slate-500">
                          {formatDate(e.startDate, { month: 'short', year: 'numeric' })} – {e.current ? t('profile.present') : formatDate(e.endDate, { month: 'short', year: 'numeric' })}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {applicant?.education?.length > 0 && (
                <div>
                  <h3 className="flex items-center gap-1.5 text-sm font-semibold">
                    <GraduationCap className="h-4 w-4 text-brand-600" /> {t('profile.education')}
                  </h3>
                  <ul className="mt-2 space-y-1.5">
                    {applicant.education.map((e) => (
                      <li key={e._id} className="text-sm">
                        <span className="font-medium">{e.institution}</span>
                        <span className="text-slate-500"> {[e.qualification, e.fieldOfStudy].filter(Boolean).join(', ')}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div>
                <label htmlFor="employer-notes" className="label">
                  {t('applicants.notes')}
                </label>
                <textarea id="employer-notes" rows={3} maxLength={1000} className="input" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t('applicants.notesPlaceholder')} />
                <p className="field-hint">{t('applicants.notesHint')}</p>
                {notes !== (a.employerNotes || '') && (
                  <button type="button" className="btn btn-secondary btn-sm mt-2" disabled={busy} onClick={() => updateStatus(a, a.status)}>
                    {t('applicants.saveNotes')}
                  </button>
                )}
              </div>
            </div>
            <aside className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar src={applicant?.profileImage} name={applicant?.name} size="lg" />
                <StatusBadge kind="application" status={a.status} />
              </div>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                {applicant?.email && (
                  <li className="flex items-center gap-2 break-all">
                    <Mail className="h-4 w-4 shrink-0" /> <a href={`mailto:${applicant.email}`} className="hover:underline">{applicant.email}</a>
                  </li>
                )}
                {applicant?.phone && (
                  <li className="flex items-center gap-2">
                    <Phone className="h-4 w-4 shrink-0" /> <a href={`tel:${applicant.phone.replace(/\s/g, '')}`} className="hover:underline">{applicant.phone}</a>
                  </li>
                )}
                {applicant?.location && (
                  <li className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 shrink-0" /> {locationLabel(t, applicant.location)}
                  </li>
                )}
              </ul>
              {applicant?.skills?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {applicant.skills.map((s) => (
                    <span key={s} className="chip">
                      {s}
                    </span>
                  ))}
                </div>
              )}
              {(a.resumeUrl || applicant?.resumeUrl) ? (
                <button type="button" className="btn btn-primary w-full" onClick={() => viewResume(a)}>
                  <FileText className="h-4 w-4" /> {t('applicants.viewCv')}
                </button>
              ) : (
                <p className="rounded-xl bg-slate-50 p-3 text-xs text-slate-500 dark:bg-navy-950">{t('applicants.noCv')}</p>
              )}
              {applicant?._id && (
                <Link to={`/profile/${applicant._id}`} className="btn btn-secondary w-full">
                  {t('applicants.fullProfile')}
                </Link>
              )}
            </aside>
          </div>
        )}
      </Modal>
    </>
  );
}
