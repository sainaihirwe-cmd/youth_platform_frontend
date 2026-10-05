import { CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Logo from '../components/common/Logo';
import LanguageSelector from '../components/common/LanguageSelector';
import ThemeToggle from '../components/common/ThemeToggle';

/** Split-screen layout for authentication pages. */
export default function AuthLayout({ title, subtitle, children, variant = 'default' }) {
  const { t } = useTranslation();
  const isAdmin = variant === 'admin';
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className={`relative hidden overflow-hidden p-12 lg:flex lg:flex-col ${isAdmin ? 'bg-navy-950' : 'bg-navy-900'}`}>
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-brand-600/30 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-green-500/10 blur-3xl" aria-hidden />
        <Logo light />
        <div className="relative my-auto max-w-md">
          <h2 className="text-3xl font-extrabold leading-tight text-white">{isAdmin ? t('auth.adminPanelTitle') : t('auth.sideTitle')}</h2>
          <p className="mt-4 text-slate-300">{isAdmin ? t('auth.adminPanelText') : t('auth.sideText')}</p>
          {!isAdmin && (
            <ul className="mt-8 space-y-3 text-slate-200">
              {['sidePoint1', 'sidePoint2', 'sidePoint3'].map((k) => (
                <li key={k} className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-400" aria-hidden /> {t(`auth.${k}`)}
                </li>
              ))}
            </ul>
          )}
        </div>
        <p className="relative text-xs text-slate-400">© {new Date().getFullYear()} JobConnect Rwanda</p>
      </div>
      <div className="flex flex-col">
        <div className="flex items-center justify-between p-4 sm:p-6">
          <div className="lg:hidden">
            {/* Just the mark on very narrow phones, so the language and theme controls fit */}
            <span className="min-[380px]:hidden">
              <Logo compact />
            </span>
            <span className="hidden min-[380px]:block">
              <Logo />
            </span>
          </div>
          <div className="ml-auto flex shrink-0 items-center gap-2">
            <LanguageSelector />
            <ThemeToggle />
          </div>
        </div>
        <main id="main" className="flex flex-1 items-center justify-center px-4 pb-12 sm:px-6">
          <div className="w-full max-w-md">
            <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
            {subtitle && <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{subtitle}</p>}
            <div className="mt-8">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}
