import { useTranslation } from 'react-i18next';

const TONES = {
  green: 'bg-green-50 text-green-700 ring-1 ring-green-600/20 dark:bg-green-500/10 dark:text-green-300 dark:ring-green-400/20',
  red: 'bg-red-50 text-red-700 ring-1 ring-red-600/20 dark:bg-red-500/10 dark:text-red-300 dark:ring-red-400/20',
  amber: 'bg-amber-50 text-amber-800 ring-1 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-400/20',
  blue: 'bg-brand-50 text-brand-700 ring-1 ring-brand-600/20 dark:bg-brand-500/10 dark:text-brand-300 dark:ring-brand-400/20',
  slate: 'bg-slate-100 text-slate-700 ring-1 ring-slate-500/20 dark:bg-navy-800 dark:text-slate-300 dark:ring-slate-400/20',
  purple: 'bg-violet-50 text-violet-700 ring-1 ring-violet-600/20 dark:bg-violet-500/10 dark:text-violet-300 dark:ring-violet-400/20',
};

const MAP = {
  application: { pending: 'amber', accepted: 'green', rejected: 'red' },
  job: { draft: 'slate', published: 'green', closed: 'amber', removed: 'red', expired: 'slate' },
  report: { pending: 'amber', under_review: 'blue', resolved: 'green', dismissed: 'slate' },
  verification: { pending: 'amber', verified: 'green', rejected: 'red' },
  account: { active: 'green', suspended: 'red' },
  message: { new: 'blue', read: 'slate', archived: 'slate' },
  role: { job_seeker: 'blue', employer: 'purple', admin: 'slate' },
};

/** Renders a translated, colour-coded status pill. `kind` selects the status family. */
export default function StatusBadge({ kind = 'application', status, className = '' }) {
  const { t } = useTranslation();
  const tone = TONES[MAP[kind]?.[status] || 'slate'];
  return (
    <span className={`badge ${tone} ${className}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" aria-hidden />
      {t(`status.${kind}.${status}`)}
    </span>
  );
}
