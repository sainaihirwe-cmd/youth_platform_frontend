import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, LayoutDashboard, LogOut, UserRound } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../common/Avatar';

const PROFILE_PATH = { job_seeker: '/seeker/profile', employer: '/employer/profile', admin: '/admin/settings' };

export default function UserMenu() {
  const { t } = useTranslation();
  const { user, employerProfile, logout, homePath } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onClick = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!user) return null;
  const image = user.role === 'employer' ? employerProfile?.companyLogo || user.profileImage : user.profileImage;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-xl p-1 pr-2 transition hover:bg-slate-100 dark:hover:bg-navy-800"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <Avatar src={image} name={user.name} size="sm" square={user.role === 'employer'} />
        <span className="hidden text-left md:block">
          <span className="block max-w-[10rem] truncate text-sm font-semibold text-navy-900 dark:text-white">{user.name}</span>
          <span className="block text-xs text-slate-500 dark:text-slate-400">{t(`roles.${user.role}`)}</span>
        </span>
        <ChevronDown className="hidden h-4 w-4 text-slate-400 md:block" aria-hidden />
      </button>
      {open && (
        <div role="menu" className="card absolute right-0 z-50 mt-2 w-56 animate-slide-up p-1.5 shadow-card-hover">
          <div className="border-b border-slate-100 px-3 py-2 md:hidden dark:border-navy-800">
            <p className="truncate text-sm font-semibold">{user.name}</p>
            <p className="truncate text-xs text-slate-500">{user.email}</p>
          </div>
          <Link role="menuitem" to={homePath} onClick={() => setOpen(false)} className="nav-link flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4" /> {t('nav.dashboard')}
          </Link>
          <Link role="menuitem" to={PROFILE_PATH[user.role]} onClick={() => setOpen(false)} className="nav-link flex items-center gap-2">
            <UserRound className="h-4 w-4" /> {user.role === 'admin' ? t('nav.settings') : t('nav.profile')}
          </Link>
          <button
            role="menuitem"
            type="button"
            onClick={() => {
              setOpen(false);
              logout();
            }}
            className="nav-link flex w-full items-center gap-2 text-red-600 hover:text-red-700 dark:text-red-400"
          >
            <LogOut className="h-4 w-4" /> {t('nav.logout')}
          </button>
        </div>
      )}
    </div>
  );
}
