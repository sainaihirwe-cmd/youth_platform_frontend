import { Link } from 'react-router-dom';
import { Building2, CalendarDays, FileText, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Avatar from '../common/Avatar';
import StatusBadge from '../common/StatusBadge';
import { formatDate, timeAgo } from '../../utils/format';
import { locationLabel } from '../../utils/labels';

/** A job seeker's application with job info and status. */
export default function ApplicationCard({ application, onView, onWithdraw }) {
  const { t } = useTranslation();
  const job = application.jobId;
  const employer = application.employer;
  const jobGone = !job;

  return (
    <article className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
      <Avatar src={employer?.companyLogo} name={employer?.companyName || job?.title || '?'} square />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          {jobGone ? (
            <p className="font-semibold text-slate-500">{t('applications.jobRemoved')}</p>
          ) : (
            <Link to={`/jobs/${job._id}`} className="font-semibold text-navy-900 hover:text-brand-700 dark:text-white dark:hover:text-brand-300">
              {job.title}
            </Link>
          )}
          <StatusBadge kind="application" status={application.status} />
          {job && job.status !== 'published' && <StatusBadge kind="job" status={job.status} />}
        </div>
        <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600 dark:text-slate-400">
          {employer?.companyName && (
            <span className="flex items-center gap-1">
              <Building2 className="h-3.5 w-3.5" /> {employer.companyName}
            </span>
          )}
          {job?.location && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" /> {locationLabel(t, job.location)}
            </span>
          )}
          <span className="flex items-center gap-1" title={formatDate(application.appliedAt)}>
            <CalendarDays className="h-3.5 w-3.5" /> {t('applications.appliedAgo', { time: timeAgo(application.appliedAt) })}
          </span>
          {application.resumeUrl && (
            <span className="flex items-center gap-1">
              <FileText className="h-3.5 w-3.5" /> {t('applications.resumeAttached')}
            </span>
          )}
        </p>
      </div>
      <div className="flex gap-2">
        {onView && (
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => onView(application)}>
            {t('common.view')}
          </button>
        )}
        {onWithdraw && application.status === 'pending' && (
          <button type="button" className="btn btn-danger-outline btn-sm" onClick={() => onWithdraw(application)}>
            {t('applications.withdraw')}
          </button>
        )}
      </div>
    </article>
  );
}
