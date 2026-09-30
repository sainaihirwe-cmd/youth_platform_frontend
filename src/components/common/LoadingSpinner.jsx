import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function LoadingSpinner({ size = 'md', label, fullPage = false, className = '' }) {
  const { t } = useTranslation();
  const dim = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-10 w-10' }[size];
  const content = (
    <div className={`flex flex-col items-center justify-center gap-3 text-slate-500 dark:text-slate-400 ${className}`} role="status">
      <Loader2 className={`${dim} animate-spin text-brand-600`} aria-hidden />
      {label !== false && <span className="text-sm">{label || t('common.loading')}</span>}
    </div>
  );
  if (fullPage) return <div className="flex min-h-[60vh] items-center justify-center">{content}</div>;
  return content;
}
