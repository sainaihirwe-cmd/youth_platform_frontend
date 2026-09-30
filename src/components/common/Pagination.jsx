import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

function pageList(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, total, current, current - 1, current + 1]);
  if (current <= 3) [2, 3, 4].forEach((p) => pages.add(p));
  if (current >= total - 2) [total - 1, total - 2, total - 3].forEach((p) => pages.add(p));
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out = [];
  sorted.forEach((p, i) => {
    if (i && p - sorted[i - 1] > 1) out.push('…');
    out.push(p);
  });
  return out;
}

export default function Pagination({ pagination, onChange, className = '' }) {
  const { t } = useTranslation();
  if (!pagination || pagination.pages <= 1) return null;
  const { page, pages, total, limit } = pagination;
  const from = (page - 1) * limit + 1;
  const to = Math.min(total, page * limit);

  return (
    <nav className={`flex flex-col items-center justify-between gap-3 sm:flex-row ${className}`} aria-label={t('pagination.label')}>
      <p className="text-sm text-slate-500 dark:text-slate-400">{t('pagination.showing', { from, to, total })}</p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => onChange(page - 1)}
          disabled={page <= 1}
          aria-label={t('pagination.previous')}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {pageList(page, pages).map((p, i) =>
          p === '…' ? (
            <span key={`e${i}`} className="px-2 text-slate-400">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onChange(p)}
              aria-current={p === page ? 'page' : undefined}
              className={`min-w-8 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
                p === page
                  ? 'bg-brand-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-navy-800'
              }`}
            >
              {p}
            </button>
          )
        )}
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => onChange(page + 1)}
          disabled={page >= pages}
          aria-label={t('pagination.next')}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </nav>
  );
}
