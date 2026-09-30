import { useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  BadgeCheck,
  Banknote,
  Briefcase,
  Building2,
  CalendarClock,
  CheckCircle2,
  Clock,
  Eye,
  Flag,
  Globe,
  ListChecks,
  Mail,
  MapPin,
  Phone,
  Share2,
  Users,
  AlertTriangle,
  Pencil,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Avatar from '../../components/common/Avatar';
import Skeleton from '../../components/common/Skeleton';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import CategoryIcon from '../../components/common/CategoryIcon';
import JobCard from '../../components/jobs/JobCard';
import SaveJobButton from '../../components/jobs/SaveJobButton';
import ReportModal from '../../components/jobs/ReportModal';
import ApplicationForm from '../../components/forms/ApplicationForm';
import { useAsync } from '../../hooks/useAsync';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { jobService } from '../../services/jobService';
import { daysUntil, formatDate, formatSalary, timeAgo } from '../../utils/format';
import { categoryLabel, locationLabel } from '../../utils/labels';

function DetailSkeleton() {
  return (
    <div className="container-page grid gap-8 py-10 lg:grid-cols-[1fr_22rem]">
      <div className="card space-y-4 p-6">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-40 w-full" />
      </div>
      <div className="card space-y-3 p-6">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}

export default function JobDetailsPage() {
  const { id } = useParams();
  const { t } = useTranslation();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [applyOpen, setApplyOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  const detail = useAsync(() => jobService.get(id).then((r) => r.data), [id, user?._id], { keepPreviousData: false });
  const related = useAsync(() => jobService.related(id).then((r) => r.data), [id]);
  const job = detail.data?.job;
  useDocumentTitle(job?.title);

  if (detail.loading && !detail.data) return <DetailSkeleton />;
  if (detail.error) {
    return (
      <div className="container-page py-16">
        {detail.error.status === 404 ? (
          <div className="card">
            <EmptyState
              icon={Briefcase}
              title={t('jobDetails.notFound')}
              description={detail.error.message}
              action={
                <Link to="/jobs" className="btn btn-primary btn-sm">
                  {t('jobDetails.browseOther')}
                </Link>
              }
            />
          </div>
        ) : (
          <ErrorMessage error={detail.error} onRetry={detail.reload} />
        )}
      </div>
    );
  }
  if (!job) return null;

  const { employer, isOpen, isExpired, isOwner, application } = detail.data;
  const days = daysUntil(job.applicationDeadline);

  const onApplyClick = () => {
    if (!user) {
      navigate('/login', { state: { from: location, message: t('jobDetails.loginToApply') } });
      return;
    }
    setApplyOpen(true);
  };

  const onApplied = (app, message) => {
    setApplyOpen(false);
    toast.success(message || t('apply.success'));
    detail.setData((d) => ({ ...d, application: { _id: app._id, status: app.status, appliedAt: app.appliedAt } }));
  };

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: job.title, url });
      else {
        await navigator.clipboard.writeText(url);
        toast.success(t('jobDetails.linkCopied'));
      }
    } catch {
      /* the user cancelled the share sheet */
    }
  };

  const applyPanel = () => {
    if (isOwner) {
      return (
        <div className="space-y-2">
          <p className="text-sm text-slate-600 dark:text-slate-400">{t('jobDetails.youOwnThis', { count: detail.data.applicationCount || 0 })}</p>
          <Link to={`/employer/jobs/${job._id}/applications`} className="btn btn-primary w-full">
            <Users className="h-4 w-4" /> {t('jobDetails.viewApplicants')}
          </Link>
          {job.status !== 'removed' && (
            <Link to={`/employer/jobs/${job._id}/edit`} className="btn btn-secondary w-full">
              <Pencil className="h-4 w-4" /> {t('jobDetails.editJob')}
            </Link>
          )}
        </div>
      );
    }
    if (application) {
      return (
        <div className="space-y-3 rounded-xl bg-green-50 p-4 dark:bg-green-500/10">
          <p className="flex items-center gap-2 font-semibold text-green-800 dark:text-green-300">
            <CheckCircle2 className="h-5 w-5" /> {t('jobDetails.alreadyApplied')}
          </p>
          <p className="text-sm text-green-800/80 dark:text-green-200/80">{t('jobDetails.appliedOn', { date: formatDate(application.appliedAt) })}</p>
          <div className="flex items-center justify-between">
            <StatusBadge kind="application" status={application.status} />
            <Link to="/seeker/applications" className="text-sm font-medium text-brand-700 hover:underline dark:text-brand-300">
              {t('jobDetails.trackApplication')}
            </Link>
          </div>
        </div>
      );
    }
    if (!isOpen) {
      return (
        <div className="flex items-start gap-2 rounded-xl bg-amber-50 p-4 text-sm text-amber-900 dark:bg-amber-500/10 dark:text-amber-200">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          {job.status === 'removed' ? t('jobDetails.removed') : isExpired ? t('jobDetails.expired') : t('jobDetails.closed')}
        </div>
      );
    }
    if (user && user.role !== 'job_seeker') {
      return <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600 dark:bg-navy-800 dark:text-slate-300">{t('jobDetails.onlySeekers')}</p>;
    }
    return (
      <button type="button" onClick={onApplyClick} className="btn btn-primary btn-lg w-full">
        {t('jobs.applyNow')}
      </button>
    );
  };

  const facts = [
    { icon: MapPin, label: t('jobs.location'), value: [locationLabel(t, job.location), job.address].filter(Boolean).join(' · ') },
    { icon: Briefcase, label: t('jobs.jobType'), value: t(`jobTypes.${job.jobType}`) },
    { icon: Banknote, label: t('jobs.salary'), value: formatSalary(job.salary, job.paymentType) },
    { icon: Users, label: t('jobs.vacancies'), value: t('jobs.workersNeeded', { count: job.vacancies }) },
    { icon: CalendarClock, label: t('jobs.deadline'), value: formatDate(job.applicationDeadline) },
    { icon: Clock, label: t('jobs.postedOn'), value: formatDate(job.publishedAt || job.createdAt) },
  ];

  return (
    <div className="container-page py-8 sm:py-10">
      <button type="button" onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/jobs'))} className="mb-5 flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-navy-900 dark:text-slate-400 dark:hover:text-white">
        <ArrowLeft className="h-4 w-4" /> {t('common.back')}
      </button>

      <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-6">
          <section className="card p-6 sm:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <Avatar src={employer?.companyLogo} name={employer?.companyName || job.title} size="lg" square />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  {job.status !== 'published' && <StatusBadge kind="job" status={job.status} />}
                  {job.status === 'published' && isExpired && <StatusBadge kind="job" status="expired" />}
                  {job.category && (
                    <span className="chip">
                      <CategoryIcon name={job.category.icon} className="h-3.5 w-3.5" /> {categoryLabel(t, job.category)}
                    </span>
                  )}
                </div>
                <h1 className="mt-2 text-2xl font-bold leading-tight sm:text-3xl">{job.title}</h1>
                <p className="mt-1 flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                  {employer ? (
                    <Link to={`/profile/${job.employerId}`} className="font-medium hover:text-brand-700 hover:underline dark:hover:text-brand-300">
                      {employer.companyName}
                    </Link>
                  ) : (
                    t('jobs.privateEmployer')
                  )}
                  {employer?.verificationStatus === 'verified' && <BadgeCheck className="h-4 w-4 text-brand-600" aria-label={t('jobs.verifiedEmployer')} />}
                </p>
                <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                  <span>{t('jobs.posted', { time: timeAgo(job.publishedAt || job.createdAt) })}</span>
                  <span className="flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5" /> {t('jobDetails.views', { count: job.views || 0 })}
                  </span>
                </p>
              </div>
            </div>

            <dl className="mt-6 grid gap-3 rounded-2xl bg-slate-50 p-4 sm:grid-cols-2 lg:grid-cols-3 dark:bg-navy-950/60">
              {facts.map((f) => (
                <div key={f.label} className="flex items-start gap-3">
                  <f.icon className="mt-0.5 h-5 w-5 shrink-0 text-brand-600 dark:text-brand-400" aria-hidden />
                  <div className="min-w-0">
                    <dt className="text-xs text-slate-500 dark:text-slate-400">{f.label}</dt>
                    <dd className="text-sm font-medium text-slate-800 dark:text-slate-200">{f.value}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </section>

          <section className="card p-6 sm:p-8">
            <h2 className="text-lg font-semibold">{t('jobDetails.description')}</h2>
            <div className="prose-job mt-3">{job.description}</div>

            {job.responsibilities?.length > 0 && (
              <>
                <h2 className="mt-8 text-lg font-semibold">{t('jobDetails.responsibilities')}</h2>
                <ul className="mt-3 space-y-2">
                  {job.responsibilities.map((r, i) => (
                    <li key={i} className="flex gap-2 text-[15px] text-slate-700 dark:text-slate-300">
                      <ListChecks className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden /> {r}
                    </li>
                  ))}
                </ul>
              </>
            )}

            {job.requirements?.length > 0 && (
              <>
                <h2 className="mt-8 text-lg font-semibold">{t('jobDetails.requirements')}</h2>
                <ul className="mt-3 space-y-2">
                  {job.requirements.map((r, i) => (
                    <li key={i} className="flex gap-2 text-[15px] text-slate-700 dark:text-slate-300">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" aria-hidden /> {r}
                    </li>
                  ))}
                </ul>
              </>
            )}

            {job.skillsRequired?.length > 0 && (
              <>
                <h2 className="mt-8 text-lg font-semibold">{t('jobDetails.skills')}</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {job.skillsRequired.map((s) => (
                    <span key={s} className="chip">
                      {s}
                    </span>
                  ))}
                </div>
              </>
            )}

            <h2 className="mt-8 text-lg font-semibold">{t('jobDetails.payment')}</h2>
            <p className="mt-2 text-[15px] text-slate-700 dark:text-slate-300">
              {formatSalary(job.salary, job.paymentType)}
              {job.paymentDetails && <span className="block text-sm text-slate-500 dark:text-slate-400">{job.paymentDetails}</span>}
            </p>
          </section>

          <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-500/10 dark:text-amber-200">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
            <p>{t('jobDetails.safetyTip')}</p>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="card space-y-4 p-6 lg:sticky lg:top-24">
            {isOpen && days !== null && (
              <p className={`text-sm font-medium ${days <= 3 ? 'text-red-600 dark:text-red-400' : 'text-slate-600 dark:text-slate-300'}`}>
                {days === 0 ? t('jobs.closesToday') : t('jobs.daysLeft', { count: days })}
              </p>
            )}
            {applyPanel()}
            <div className="flex gap-2">
              {!isOwner && <SaveJobButton jobId={job._id} variant="button" className="flex-1" />}
              <button type="button" onClick={share} className="btn btn-secondary flex-1">
                <Share2 className="h-4 w-4" /> {t('jobDetails.share')}
              </button>
            </div>
            {user && !isOwner && user.role !== 'admin' && (
              <button type="button" onClick={() => setReportOpen(true)} className="flex w-full items-center justify-center gap-1.5 text-xs font-medium text-slate-500 hover:text-red-600">
                <Flag className="h-3.5 w-3.5" /> {t('jobDetails.reportJob')}
              </button>
            )}
          </div>

          {employer && (
            <div className="card p-6">
              <h2 className="flex items-center gap-2 text-base font-semibold">
                <Building2 className="h-4 w-4 text-brand-600" /> {t('jobDetails.aboutEmployer')}
              </h2>
              <div className="mt-4 flex items-center gap-3">
                <Avatar src={employer.companyLogo} name={employer.companyName} square />
                <div className="min-w-0">
                  <p className="truncate font-semibold">{employer.companyName}</p>
                  {employer.industry && <p className="text-xs text-slate-500">{employer.industry}</p>}
                </div>
              </div>
              {employer.description && <p className="mt-3 line-clamp-5 text-sm text-slate-600 dark:text-slate-400">{employer.description}</p>}
              <ul className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-400">
                {employer.location && (
                  <li className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 shrink-0" /> {locationLabel(t, employer.location)}
                  </li>
                )}
                {employer.website && (
                  <li className="flex items-center gap-2">
                    <Globe className="h-4 w-4 shrink-0" />
                    <a href={employer.website} target="_blank" rel="noopener noreferrer nofollow" className="truncate text-brand-600 hover:underline">
                      {employer.website.replace(/^https?:\/\//, '')}
                    </a>
                  </li>
                )}
                {user && employer.contactEmail && (
                  <li className="flex items-center gap-2">
                    <Mail className="h-4 w-4 shrink-0" /> <a href={`mailto:${employer.contactEmail}`} className="truncate hover:underline">{employer.contactEmail}</a>
                  </li>
                )}
                {user && employer.phone && (
                  <li className="flex items-center gap-2">
                    <Phone className="h-4 w-4 shrink-0" /> {employer.phone}
                  </li>
                )}
              </ul>
              <Link to={`/profile/${job.employerId}`} className="btn btn-secondary btn-sm mt-4 w-full">
                {t('jobDetails.viewEmployer')}
              </Link>
            </div>
          )}
        </aside>
      </div>

      {related.data?.length > 0 && (
        <section className="mt-14">
          <h2 className="text-xl font-bold">{t('jobDetails.related')}</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.data.map((j) => (
              <JobCard key={j._id} job={j} compact />
            ))}
          </div>
        </section>
      )}

      <Modal
        open={applyOpen}
        onClose={() => !submitting && setApplyOpen(false)}
        title={t('apply.title')}
        description={`${job.title} · ${employer?.companyName || ''}`}
        size="lg"
        closeOnBackdrop={!submitting}
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setApplyOpen(false)} disabled={submitting}>
              {t('common.cancel')}
            </button>
            <button type="submit" form="application-form" className="btn btn-primary" disabled={submitting}>
              {submitting ? t('common.submitting') : t('apply.submit')}
            </button>
          </>
        }
      >
        <ApplicationForm job={job} onSuccess={onApplied} onSubmittingChange={setSubmitting} />
      </Modal>

      <ReportModal open={reportOpen} onClose={() => setReportOpen(false)} jobId={job._id} targetName={job.title} />
    </div>
  );
}
