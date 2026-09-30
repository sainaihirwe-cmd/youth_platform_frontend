import { useTranslation } from 'react-i18next';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { usePublicSettings } from '../../hooks/usePublicSettings';

/** Renders the privacy policy or terms from translation resources (`legal.privacy` / `legal.terms`). */
export default function LegalPage({ doc }) {
  const { t } = useTranslation();
  const { settings } = usePublicSettings();
  const title = t(`legal.${doc}.title`);
  useDocumentTitle(title);
  const sections = t(`legal.${doc}.sections`, { returnObjects: true, email: settings.contactEmail });

  return (
    <div className="container-page max-w-3xl py-12">
      <h1 className="text-3xl font-extrabold">{title}</h1>
      <p className="mt-2 text-sm text-slate-500">{t('legal.updated', { date: '28 September 2026' })}</p>
      <p className="mt-6 leading-7 text-slate-700 dark:text-slate-300">{t(`legal.${doc}.intro`)}</p>
      <div className="mt-8 space-y-8">
        {Array.isArray(sections) &&
          sections.map((s, i) => (
            <section key={s.heading}>
              <h2 className="text-lg font-semibold">
                {i + 1}. {s.heading}
              </h2>
              <p className="mt-2 whitespace-pre-line leading-7 text-slate-700 dark:text-slate-300">{s.body}</p>
            </section>
          ))}
      </div>
    </div>
  );
}
