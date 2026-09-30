import { Link } from 'react-router-dom';
import { formatNumber } from '../../utils/format';

const TONES = {
  blue: 'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400',
  green: 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400',
  amber: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
  red: 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400',
  navy: 'bg-navy-50 text-navy-700 dark:bg-navy-800 dark:text-slate-200',
  violet: 'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400',
};

export default function StatCard({ label, value, icon: Icon, tone = 'blue', to, hint }) {
  const body = (
    <div className="card flex h-full items-start justify-between gap-3 p-5 transition hover:shadow-card-hover">
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
        <p className="mt-2 text-3xl font-bold tracking-tight text-navy-900 dark:text-white">{formatNumber(value)}</p>
        {hint && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
      </div>
      {Icon && (
        <span className={`rounded-xl p-2.5 ${TONES[tone]}`}>
          <Icon className="h-5 w-5" aria-hidden />
        </span>
      )}
    </div>
  );
  return to ? (
    <Link to={to} className="block rounded-2xl focus-visible:outline-2">
      {body}
    </Link>
  ) : (
    body
  );
}
