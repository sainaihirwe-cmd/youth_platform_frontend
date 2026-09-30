import { Menu } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '../common/LanguageSelector';
import ThemeToggle from '../common/ThemeToggle';
import NotificationDropdown from './NotificationDropdown';
import UserMenu from './UserMenu';

export default function DashboardHeader({ onMenuClick }) {
  const { t } = useTranslation();
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-md sm:px-6 dark:border-navy-800 dark:bg-navy-950/90">
      <button type="button" onClick={onMenuClick} className="btn-ghost -ml-1 rounded-lg p-2 lg:hidden" aria-label={t('nav.openMenu')}>
        <Menu className="h-5 w-5" />
      </button>
      <div className="flex-1" />
      <LanguageSelector className="hidden sm:inline-flex" />
      <ThemeToggle />
      <NotificationDropdown />
      <UserMenu />
    </header>
  );
}
