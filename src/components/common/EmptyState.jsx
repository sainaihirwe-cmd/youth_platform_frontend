import { Inbox } from 'lucide-react';

export default function EmptyState({ icon: Icon = Inbox, title, description, action, className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 px-6 py-12 text-center ${className}`}>
      <div className="rounded-2xl bg-brand-50 p-4 dark:bg-brand-500/10">
        <Icon className="h-7 w-7 text-brand-600 dark:text-brand-400" aria-hidden />
      </div>
      <div className="max-w-sm">
        <p className="font-semibold text-navy-900 dark:text-white">{title}</p>
        {description && <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{description}</p>}
      </div>
      {action}
    </div>
  );
}
