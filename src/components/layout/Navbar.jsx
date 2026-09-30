import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import Logo from '../common/Logo';
import LanguageSelector from '../common/LanguageSelector';
import ThemeToggle from '../common/ThemeToggle';
import NotificationDropdown from './NotificationDropdown';
import UserMenu from './UserMenu';

const LINKS = [
  { to: '/', key: 'nav.home', end: true },
  { to: '/jobs', key: 'nav.findJobs' },
  { to: '/about', key: 'nav.about' },
  { to: '/contact', key: 'nav.contact' },
];

export default function Navbar() {
  const { t } = useTranslation();
  const { user, homePath } = useAuth();
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => setOpen(false), [location.pathname]);

  const linkClass = ({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-md dark:border-navy-800 dark:bg-navy-950/90">
      <nav className="container-page flex h-16 items-center justify-between gap-4" aria-label={t('nav.main')}>
        <Logo />
        <div className="hidden items-center gap-1 lg:flex">
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={linkClass}>
              {t(l.key)}
            </NavLink>
          ))}
          {(!user || user.role === 'employer') && (
            <NavLink to={user ? '/employer/jobs/create' : '/register?role=employer'} className={linkClass}>
              {t('nav.postJob')}
            </NavLink>
          )}
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <LanguageSelector className="hidden sm:inline-flex" />
          <ThemeToggle />
          {user ? (
            <>
              <NotificationDropdown />
              <Link to={homePath} className="btn btn-primary btn-sm hidden sm:inline-flex">
                {t('nav.dashboard')}
              </Link>
              <UserMenu />
            </>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Link to="/login" className="btn btn-ghost btn-sm">
                {t('nav.login')}
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                {t('nav.register')}
              </Link>
            </div>
          )}
          <button
            type="button"
            className="btn-ghost rounded-lg p-2 lg:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? t('common.close') : t('nav.openMenu')}
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>
      {open && (
        <div className="animate-slide-up border-t border-slate-200 bg-white lg:hidden dark:border-navy-800 dark:bg-navy-950">
          <div className="container-page flex flex-col gap-1 py-3">
            {LINKS.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end} className={linkClass}>
                {t(l.key)}
              </NavLink>
            ))}
            {(!user || user.role === 'employer') && (
              <NavLink to={user ? '/employer/jobs/create' : '/register?role=employer'} className={linkClass}>
                {t('nav.postJob')}
              </NavLink>
            )}
            <div className="mt-2 flex items-center justify-between gap-2 border-t border-slate-100 pt-3 dark:border-navy-800">
              <LanguageSelector />
              {user ? (
                <Link to={homePath} className="btn btn-primary btn-sm">
                  {t('nav.dashboard')}
                </Link>
              ) : (
                <div className="flex gap-2">
                  <Link to="/login" className="btn btn-secondary btn-sm">
                    {t('nav.login')}
                  </Link>
                  <Link to="/register" className="btn btn-primary btn-sm">
                    {t('nav.register')}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
