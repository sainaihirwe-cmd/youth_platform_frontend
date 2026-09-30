import { Link } from 'react-router-dom';
import { Target, Eye, HeartHandshake, Layers, Smartphone, ShieldCheck, Languages, MapPinned } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

export default function AboutPage() {
  const { t } = useTranslation();
  useDocumentTitle(t('about.title'));

  const objectives = ['obj1', 'obj2', 'obj3', 'obj4', 'obj5'];
  const values = [
    { icon: Layers, key: 'centralised' },
    { icon: MapPinned, key: 'local' },
    { icon: ShieldCheck, key: 'safe' },
    { icon: Smartphone, key: 'mobile' },
    { icon: Languages, key: 'bilingual' },
    { icon: HeartHandshake, key: 'inclusive' },
  ];

  return (
    <>
      <section className="bg-navy-900 py-16 text-center dark:bg-navy-950">
        <div className="container-page max-w-3xl">
          <h1 className="text-3xl font-extrabold text-white sm:text-4xl">{t('about.title')}</h1>
          <p className="mt-4 text-lg text-slate-300">{t('about.intro')}</p>
        </div>
      </section>

      <section className="container-page grid gap-6 py-14 md:grid-cols-2">
        <div className="card p-7">
          <Target className="h-8 w-8 text-brand-600" aria-hidden />
          <h2 className="mt-4 text-xl font-bold">{t('about.problemTitle')}</h2>
          <p className="mt-2 leading-7 text-slate-600 dark:text-slate-400">{t('about.problemText')}</p>
        </div>
        <div className="card p-7">
          <Eye className="h-8 w-8 text-green-600" aria-hidden />
          <h2 className="mt-4 text-xl font-bold">{t('about.solutionTitle')}</h2>
          <p className="mt-2 leading-7 text-slate-600 dark:text-slate-400">{t('about.solutionText')}</p>
        </div>
      </section>

      <section className="bg-white py-14 dark:bg-navy-900/40">
        <div className="container-page max-w-4xl">
          <h2 className="text-center text-2xl font-bold">{t('about.objectivesTitle')}</h2>
          <ol className="mt-8 space-y-4">
            {objectives.map((k, i) => (
              <li key={k} className="card flex gap-4 p-5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">{i + 1}</span>
                <p className="text-slate-700 dark:text-slate-300">{t(`about.${k}`)}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="container-page py-14">
        <h2 className="text-center text-2xl font-bold">{t('about.valuesTitle')}</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {values.map(({ icon: Icon, key }) => (
            <div key={key} className="card p-6">
              <Icon className="h-6 w-6 text-brand-600" aria-hidden />
              <h3 className="mt-3 font-semibold">{t(`about.values.${key}.title`)}</h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{t(`about.values.${key}.text`)}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-wrap justify-center gap-3">
          <Link to="/jobs" className="btn btn-primary">
            {t('landing.browseJobs')}
          </Link>
          <Link to="/register?role=employer" className="btn btn-secondary">
            {t('landing.employerCta')}
          </Link>
        </div>
      </section>
    </>
  );
}
