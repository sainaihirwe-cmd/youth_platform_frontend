import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

export default function NotFoundPage() {
  const { t } = useTranslation();
  useDocumentTitle(t('notFound.title'));
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <Compass className="h-14 w-14 text-brand-600" aria-hidden />
      <p className="mt-6 text-sm font-semibold uppercase tracking-widest text-brand-600">404</p>
      <h1 className="mt-2 text-3xl font-extrabold">{t('notFound.title')}</h1>
      <p className="mt-3 max-w-md text-slate-600 dark:text-slate-400">{t('notFound.text')}</p>
      <div className="mt-8 flex gap-3">
        <Link to="/" className="btn btn-primary">
          {t('notFound.home')}
        </Link>
        <Link to="/jobs" className="btn btn-secondary">
          {t('nav.findJobs')}
        </Link>
      </div>
    </div>
  );
}
