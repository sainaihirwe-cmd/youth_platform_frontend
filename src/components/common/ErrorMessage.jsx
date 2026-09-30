import { AlertCircle, RefreshCw, WifiOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/** Displays an API/network error with an optional retry action. */
export default function ErrorMessage({ error, message, onRetry, compact = false, className = '' }) {
  const { t } = useTranslation();
  const text = message || error?.message || t('errors.generic');
  const isNetwork = error && !error.status;
  const Icon = isNetwork ? WifiOff : AlertCircle;

  if (compact) {
    return (
      <div className={`flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300 ${className}`} role="alert">
        <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        <span>{text}</span>
      </div>
    );
  }

  return (
    <div className={`card flex flex-col items-center gap-3 p-8 text-center ${className}`} role="alert">
      <div className="rounded-full bg-red-50 p-3 dark:bg-red-950/50">
        <Icon className="h-6 w-6 text-red-600 dark:text-red-400" aria-hidden />
      </div>
      <div>
        <p className="font-semibold text-navy-900 dark:text-white">{t('errors.title')}</p>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{text}</p>
      </div>
      {onRetry && (
        <button type="button" onClick={onRetry} className="btn btn-secondary btn-sm">
          <RefreshCw className="h-4 w-4" /> {t('common.retry')}
        </button>
      )}
    </div>
  );
}
