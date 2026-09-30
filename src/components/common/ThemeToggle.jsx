import { Moon, Sun } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';

export default function ThemeToggle({ className = '' }) {
  const { isDark, toggleTheme } = useTheme();
  const { t } = useTranslation();
  const label = isDark ? t('nav.lightMode') : t('nav.darkMode');
  return (
    <button type="button" onClick={toggleTheme} className={`btn-ghost rounded-lg p-2 ${className}`} aria-label={label} title={label}>
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
}
