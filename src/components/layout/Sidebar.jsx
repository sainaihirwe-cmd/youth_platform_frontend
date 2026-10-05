import { NavLink } from 'react-router-dom';
import { LogOut, X, ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import Logo from '../common/Logo';
import LanguageSelector from '../common/LanguageSelector';
import { NAV_BY_ROLE } from './navConfig';

function SidebarContent({ onNavigate }) {
  const { t } = useTranslation();
  const { user, logout, homePath } = useAuth();
  const { unreadCount } = useNotifications();
  const items = NAV_BY_ROLE[user?.role] || [];

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center border-b border-white/10 px-5">
        <Logo light to={homePath} />
      </div>
      <p className="px-5 pb-2 pt-5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
        {t(`roles.${user?.role}`)}
      </p>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3" aria-label={t('nav.dashboardNav')}>
        {items.map(({ to, key, icon: Icon, end, badge }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                isActive ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden />
            <span className="flex-1">{t(key)}</span>
            {badge === 'notifications' && unreadCount > 0 && (
              <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">{unreadCount > 99 ? '99+' : unreadCount}</span>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="space-y-1 border-t border-white/10 p-3">
        {/* The header hides the language picker on phones, so offer it here instead */}
        <LanguageSelector className="mb-2 flex w-full sm:hidden" selectClassName="w-full py-2.5 text-sm" />
        <NavLink to="/" onClick={onNavigate} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white">
          <ExternalLink className="h-[18px] w-[18px]" aria-hidden /> {t('nav.backToSite')}
        </NavLink>
        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-red-500/10 hover:text-red-300"
        >
          <LogOut className="h-[18px] w-[18px]" aria-hidden /> {t('nav.logout')}
        </button>
      </div>
    </div>
  );
}

/** Fixed sidebar on large screens, slide-in drawer on smaller screens. */
export default function Sidebar({ mobileOpen, onClose }) {
  const { t } = useTranslation();
  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 bg-navy-900 lg:block dark:border-r dark:border-navy-800 dark:bg-navy-950">
        <SidebarContent />
      </aside>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label={t('nav.dashboardNav')}>
          <div className="absolute inset-0 animate-fade-in bg-navy-950/60 backdrop-blur-sm" onClick={onClose} aria-hidden />
          <aside className="relative h-full w-72 max-w-[85vw] animate-slide-in-left bg-navy-900 shadow-2xl dark:bg-navy-950">
            <button
              type="button"
              onClick={onClose}
              className="absolute right-3 top-4 z-10 rounded-lg p-1.5 text-slate-300 hover:bg-white/10"
              aria-label={t('common.close')}
            >
              <X className="h-5 w-5" />
            </button>
            <SidebarContent onNavigate={onClose} />
          </aside>
        </div>
      )}
    </>
  );
}
