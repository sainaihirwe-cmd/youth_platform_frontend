import { Bookmark, BookmarkCheck } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useSavedJobs } from '../../context/SavedJobsContext';

/** Bookmark toggle. Guests are sent to login; employers/admins do not see it. */
export default function SaveJobButton({ jobId, variant = 'icon', className = '' }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { isSaved, isPending, toggle } = useSavedJobs();
  const navigate = useNavigate();
  const location = useLocation();

  if (user && user.role !== 'job_seeker') return null;
  const saved = isSaved(jobId);
  const pending = isPending(jobId);
  const label = saved ? t('savedJobs.unsave') : t('savedJobs.save');

  const onClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate('/login', { state: { from: location, message: t('savedJobs.loginToSave') } });
      return;
    }
    toggle(jobId);
  };

  const Icon = saved ? BookmarkCheck : Bookmark;
  if (variant === 'button') {
    return (
      <button type="button" onClick={onClick} disabled={pending} className={`btn ${saved ? 'btn-secondary text-brand-700 dark:text-brand-300' : 'btn-secondary'} ${className}`} aria-pressed={saved}>
        <Icon className={`h-4 w-4 ${saved ? 'fill-brand-600 text-brand-600' : ''}`} /> {saved ? t('savedJobs.savedLabel') : t('savedJobs.save')}
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      aria-pressed={saved}
      aria-label={label}
      title={label}
      className={`rounded-lg p-2 transition hover:bg-slate-100 disabled:opacity-50 dark:hover:bg-navy-800 ${saved ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'} ${className}`}
    >
      <Icon className={`h-5 w-5 ${saved ? 'fill-brand-600/15' : ''}`} />
    </button>
  );
}
