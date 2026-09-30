import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Logo from '../common/Logo';
import { usePublicSettings } from '../../hooks/usePublicSettings';

export default function Footer() {
  const { t } = useTranslation();
  const { settings } = usePublicSettings();
  const year = new Date().getFullYear();

  const columns = [
    {
      title: t('footer.seekers'),
      links: [
        ['/jobs', t('footer.browseJobs')],
        ['/register?role=job_seeker', t('footer.createProfile')],
        ['/seeker/saved-jobs', t('footer.savedJobs')],
      ],
    },
    {
      title: t('footer.employers'),
      links: [
        ['/register?role=employer', t('footer.postJob')],
        ['/employer/dashboard', t('footer.employerDashboard')],
        ['/about', t('footer.howItWorks')],
      ],
    },
    {
      title: t('footer.company'),
      links: [
        ['/about', t('nav.about')],
        ['/contact', t('nav.contact')],
        ['/privacy', t('footer.privacy')],
        ['/terms', t('footer.terms')],
      ],
    },
  ];

  return (
    <footer className="mt-auto bg-navy-900 text-slate-300 dark:bg-navy-950 dark:border-t dark:border-navy-800">
      <div className="container-page grid gap-10 py-12 md:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Logo light />
          <p className="mt-4 max-w-sm text-sm leading-6 text-slate-400">{t('footer.about')}</p>
          <ul className="mt-5 space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-brand-400" aria-hidden /> {settings?.contactAddress}
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-brand-400" aria-hidden />
              <a href={`tel:${(settings?.contactPhone || '').replace(/\s/g, '')}`} className="hover:text-white">
                {settings?.contactPhone}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-brand-400" aria-hidden />
              <a href={`mailto:${settings?.contactEmail}`} className="hover:text-white">
                {settings?.contactEmail}
              </a>
            </li>
          </ul>
        </div>
        {columns.map((col) => (
          <div key={col.title}>
            <p className="text-sm font-semibold uppercase tracking-wider text-white">{col.title}</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              {col.links.map(([to, label]) => (
                <li key={to + label}>
                  <Link to={to} className="text-slate-400 transition hover:text-white">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-5 text-xs text-slate-400 sm:flex-row">
          <p>© {year} JobConnect Rwanda. {t('footer.rights')}</p>
          <p>{t('footer.madeIn')}</p>
        </div>
      </div>
    </footer>
  );
}
