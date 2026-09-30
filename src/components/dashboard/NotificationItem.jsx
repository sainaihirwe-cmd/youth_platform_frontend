import { Bell, Briefcase, CheckCircle2, FileText, Flag, ShieldAlert } from 'lucide-react';

const ICONS = {
  application_status: { icon: CheckCircle2, cls: 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400' },
  new_application: { icon: FileText, cls: 'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400' },
  job_activity: { icon: Briefcase, cls: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400' },
  report_update: { icon: Flag, cls: 'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400' },
  account: { icon: ShieldAlert, cls: 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400' },
  system: { icon: Bell, cls: 'bg-slate-100 text-slate-600 dark:bg-navy-800 dark:text-slate-300' },
};

export function NotificationIcon({ type }) {
  const { icon: Icon, cls } = ICONS[type] || ICONS.system;
  return (
    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${cls}`}>
      <Icon className="h-4 w-4" aria-hidden />
    </span>
  );
}
