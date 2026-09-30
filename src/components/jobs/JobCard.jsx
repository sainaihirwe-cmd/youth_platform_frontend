import { Link } from 'react-router-dom';
import { BadgeCheck, Banknote, CalendarClock, Clock, MapPin, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Avatar from '../common/Avatar';
import CategoryIcon from '../common/CategoryIcon';
import SaveJobButton from './SaveJobButton';
import { daysUntil, formatSalary, timeAgo } from '../../utils/format';
import { categoryLabel, locationLabel } from '../../utils/labels';

export default function JobCard({ job, showSave = true, compact = false }) {
  const { t } = useTranslation();
  const employer = job.employer || {};
  const days = daysUntil(job.applicationDeadline);
  const closingSoon = days !== null && days >= 0 && days <= 3;

  return (
    <article className="card group relative flex h-full flex-col p-5 transition hover:-translate-y-0.5 hover:shadow-card-hover">
      <div className="flex items-start gap-3">
        <Avatar src={employer.companyLogo} name={employer.companyName || job.title} square />
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 text-base font-semibold leading-snug">
            <Link to={`/jobs/${job._id}`} className="after:absolute after:inset-0 hover:text-brand-700 dark:hover:text-brand-300">
              {job.title}
            </Link>
          </h3>
          <p className="mt-0.5 flex items-center gap-1 truncate text-sm text-slate-600 dark:text-slate-400">
            <span className="truncate">{employer.companyName || t('jobs.privateEmployer')}</span>
            {employer.verificationStatus === 'verified' && (
              <BadgeCheck className="h-4 w-4 shrink-0 text-brand-600" aria-label={t('jobs.verifiedEmployer')} />
            )}
          </p>
        </div>
        {showSave && (
          <div className="relative z-10">
            <SaveJobButton jobId={job._id} />
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        <span className="badge bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">{t(`jobTypes.${job.jobType}`)}</span>
        {job.category && (
          <span className="chip">
            <CategoryIcon name={job.category.icon} className="h-3.5 w-3.5" /> {categoryLabel(t, job.category)}
          </span>
        )}
        {job.isFeatured && (
          <span className="badge bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
            <Star className="h-3 w-3 fill-current" /> {t('jobs.featured')}
          </span>
        )}
      </div>

      <dl className={`mt-4 grid gap-2 text-sm text-slate-600 dark:text-slate-400 ${compact ? '' : 'sm:grid-cols-1'}`}>
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
          <dt className="sr-only">{t('jobs.location')}</dt>
          <dd className="truncate">{locationLabel(t, job.location)}</dd>
        </div>
        <div className="flex items-center gap-2">
          <Banknote className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
          <dt className="sr-only">{t('jobs.salary')}</dt>
          <dd className="truncate font-medium text-slate-800 dark:text-slate-200">{formatSalary(job.salary, job.paymentType)}</dd>
        </div>
      </dl>

      <div className="mt-auto flex items-center justify-between gap-2 pt-4">
        <div className="flex flex-col gap-0.5 text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" aria-hidden /> {t('jobs.posted', { time: timeAgo(job.publishedAt || job.createdAt) })}
          </span>
          {days !== null && days >= 0 && (
            <span className={`flex items-center gap-1 ${closingSoon ? 'font-medium text-red-600 dark:text-red-400' : ''}`}>
              <CalendarClock className="h-3.5 w-3.5" aria-hidden />
              {days === 0 ? t('jobs.closesToday') : t('jobs.daysLeft', { count: days })}
            </span>
          )}
        </div>
        <Link to={`/jobs/${job._id}`} className="btn btn-primary btn-sm relative z-10">
          {t('jobs.applyNow')}
        </Link>
      </div>
    </article>
  );
}
