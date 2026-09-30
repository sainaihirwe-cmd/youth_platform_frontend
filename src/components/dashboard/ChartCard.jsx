import EmptyState from '../common/EmptyState';
import { BarChart3 } from 'lucide-react';

/** Card wrapper for Recharts charts, with a consistent empty state. */
export default function ChartCard({ title, subtitle, children, empty, emptyText, className = '', actions }) {
  return (
    <section className={`card p-5 ${className}`}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">{title}</h2>
          {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>}
        </div>
        {actions}
      </div>
      {empty ? <EmptyState icon={BarChart3} title={emptyText} className="py-8" /> : <div className="h-64 w-full">{children}</div>}
    </section>
  );
}
