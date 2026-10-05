import { Languages } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LANGUAGES } from '../../i18n';

/** `className` controls display too (default inline-flex), so callers can pass e.g. "hidden sm:inline-flex". */
export default function LanguageSelector({ className = 'inline-flex', selectClassName = '' }) {
  const { i18n, t } = useTranslation();
  const current = (i18n.resolvedLanguage || i18n.language || 'en').slice(0, 2);
  return (
    <label className={`relative items-center ${className}`}>
      <span className="sr-only">{t('nav.language')}</span>
      <Languages className="pointer-events-none absolute left-2.5 h-4 w-4 text-slate-500 dark:text-slate-400" aria-hidden />
      <select
        value={current}
        onChange={(e) => i18n.changeLanguage(e.target.value)}
        className={`cursor-pointer appearance-none rounded-lg border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:border-navy-700 dark:bg-navy-900 dark:text-slate-200 dark:hover:bg-navy-800 ${selectClassName}`}
      >
        {LANGUAGES.map((l) => (
          <option key={l.code} value={l.code}>
            {l.short} · {l.label}
          </option>
        ))}
      </select>
    </label>
  );
}
