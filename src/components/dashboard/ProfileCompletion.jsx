import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function ProfileCompletion({ percent, missing = [], to, keyPrefix = 'completion' }) {
  const { t } = useTranslation();
  const color = percent >= 80 ? 'bg-green-500' : percent >= 50 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <section className="card p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">{t('completion.title')}</h2>
        <span className="text-sm font-bold text-navy-900 dark:text-white">{percent}%</span>
      </div>
      <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-navy-800" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${percent}%` }} />
      </div>
      {missing.length > 0 ? (
        <>
          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">{t('completion.improve')}</p>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {missing.slice(0, 5).map((m) => (
              <li key={m} className="chip">
                {t(`${keyPrefix}.items.${m}`)}
              </li>
            ))}
          </ul>
          {to && (
            <Link to={to} className="btn btn-secondary btn-sm mt-4 w-full">
              {t('completion.complete')}
            </Link>
          )}
        </>
      ) : (
        <p className="mt-3 text-sm text-green-700 dark:text-green-400">{t('completion.done')}</p>
      )}
    </section>
  );
}
