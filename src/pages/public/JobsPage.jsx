import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SearchX, SlidersHorizontal, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import SearchBar from '../../components/jobs/SearchBar';
import JobFilters from '../../components/jobs/JobFilters';
import JobCard from '../../components/jobs/JobCard';
import Pagination from '../../components/common/Pagination';
import { CardSkeleton } from '../../components/common/Skeleton';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';
import { useAsync } from '../../hooks/useAsync';
import { useDebounce } from '../../hooks/useDebounce';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { jobService } from '../../services/jobService';
import { categoryService } from '../../services/categoryService';
import { formatNumber } from '../../utils/format';
import { categoryLabel, locationLabel } from '../../utils/labels';

const FILTER_KEYS = ['q', 'location', 'category', 'jobType', 'minSalary', 'maxSalary', 'postedWithin', 'sort', 'page'];

function readParams(sp) {
  const f = {};
  FILTER_KEYS.forEach((k) => {
    const v = sp.get(k);
    if (v) f[k] = v;
  });
  f.jobType = f.jobType ? f.jobType.split(',') : [];
  return f;
}

export default function JobsPage() {
  const { t } = useTranslation();
  useDocumentTitle(t('jobs.title'));
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = useMemo(() => readParams(searchParams), [searchParams]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [liveQuery, setLiveQuery] = useState(filters.q || '');
  const debouncedQuery = useDebounce(liveQuery, 450);

  const update = (patch, { resetPage = true } = {}) => {
    const next = { ...filters, ...patch };
    if (resetPage) delete next.page;
    const sp = new URLSearchParams();
    Object.entries(next).forEach(([k, v]) => {
      if (Array.isArray(v)) {
        if (v.length) sp.set(k, v.join(','));
      } else if (v !== undefined && v !== null && v !== '') sp.set(k, v);
    });
    setSearchParams(sp, { replace: false });
  };

  // Debounced live keyword search while typing
  useEffect(() => {
    if ((debouncedQuery || '') !== (filters.q || '')) update({ q: debouncedQuery.trim() });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery]);

  // Keep the input in sync when the URL changes (back/forward navigation)
  useEffect(() => setLiveQuery(filters.q || ''), [filters.q]);

  const categories = useAsync(() => categoryService.list().then((r) => r.data), []);
  const query = searchParams.toString();
  const jobs = useAsync(
    () =>
      jobService.list({
        ...filters,
        jobType: filters.jobType.join(','),
        sort: filters.sort || (filters.q ? 'relevance' : 'newest'),
        limit: 12,
      }),
    [query]
  );

  useEffect(() => {
    if (drawerOpen) document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [drawerOpen]);

  const reset = () => {
    setLiveQuery('');
    setSearchParams(new URLSearchParams());
  };

  const activeChips = [];
  if (filters.location) activeChips.push(['location', locationLabel(t, filters.location)]);
  if (filters.category) {
    const c = categories.data?.find((x) => x.slug === filters.category);
    activeChips.push(['category', c ? categoryLabel(t, c) : filters.category]);
  }
  filters.jobType.forEach((jt) => activeChips.push([`jobType:${jt}`, t(`jobTypes.${jt}`)]));
  if (filters.minSalary) activeChips.push(['minSalary', `≥ ${formatNumber(filters.minSalary)}`]);
  if (filters.maxSalary) activeChips.push(['maxSalary', `≤ ${formatNumber(filters.maxSalary)}`]);
  if (filters.postedWithin) activeChips.push(['postedWithin', t('filters.lastDays', { count: Number(filters.postedWithin) })]);

  const removeChip = (key) => {
    if (key.startsWith('jobType:')) update({ jobType: filters.jobType.filter((x) => x !== key.slice(8)) });
    else update({ [key]: '' });
  };

  const filterPanel = (
    <JobFilters value={filters} categories={categories.data || []} onChange={(v) => update(v)} onReset={reset} />
  );

  const list = jobs.data?.data || [];
  const pagination = jobs.data?.pagination;

  return (
    <div className="container-page py-8 sm:py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold sm:text-3xl">{t('jobs.title')}</h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400">{t('jobs.subtitle')}</p>
      </div>

      <SearchBar
        live
        initialQuery={liveQuery}
        initialLocation={filters.location || ''}
        onChange={({ q, location }) => {
          setLiveQuery(q);
          if ((location || '') !== (filters.location || '')) update({ location });
        }}
        onSearch={({ q, location }) => {
          setLiveQuery(q);
          update({ q, location });
        }}
      />

      <div className="mt-8 grid gap-8 lg:grid-cols-[17rem_1fr]">
        <aside className="hidden lg:block">
          <div className="card sticky top-24 p-5">{filterPanel}</div>
        </aside>

        <section aria-live="polite" aria-busy={jobs.loading}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {pagination ? t('jobs.resultsCount', { count: pagination.total }) : ' '}
            </p>
            <div className="flex items-center gap-2">
              <button type="button" className="btn btn-secondary btn-sm lg:hidden" onClick={() => setDrawerOpen(true)}>
                <SlidersHorizontal className="h-4 w-4" /> {t('filters.title')}
                {activeChips.length > 0 && <span className="rounded-full bg-brand-600 px-1.5 text-[10px] text-white">{activeChips.length}</span>}
              </button>
              <label className="flex items-center gap-2 text-sm">
                <span className="hidden text-slate-500 sm:inline">{t('jobs.sortBy')}</span>
                <select
                  className="input w-auto py-1.5"
                  value={filters.sort || (filters.q ? 'relevance' : 'newest')}
                  onChange={(e) => update({ sort: e.target.value })}
                >
                  <option value="newest">{t('jobs.sortNewest')}</option>
                  <option value="oldest">{t('jobs.sortOldest')}</option>
                  <option value="relevance">{t('jobs.sortRelevance')}</option>
                  <option value="deadline">{t('jobs.sortDeadline')}</option>
                  <option value="salary">{t('jobs.sortSalary')}</option>
                </select>
              </label>
            </div>
          </div>

          {activeChips.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {activeChips.map(([key, label]) => (
                <button key={key} type="button" onClick={() => removeChip(key)} className="chip hover:bg-slate-200 dark:hover:bg-navy-700">
                  {label} <X className="h-3 w-3" />
                </button>
              ))}
              <button type="button" onClick={reset} className="text-xs font-medium text-brand-600 hover:underline dark:text-brand-400">
                {t('filters.clearAll')}
              </button>
            </div>
          )}

          {jobs.error && <ErrorMessage error={jobs.error} onRetry={jobs.reload} />}

          {!jobs.error && (
            <div className={`grid gap-5 sm:grid-cols-2 xl:grid-cols-3 ${jobs.loading && jobs.data ? 'opacity-60 transition-opacity' : ''}`}>
              {jobs.loading && !jobs.data && Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
              {list.map((job) => (
                <JobCard key={job._id} job={job} />
              ))}
            </div>
          )}

          {!jobs.loading && !jobs.error && list.length === 0 && (
            <div className="card">
              <EmptyState
                icon={SearchX}
                title={t('jobs.noResults')}
                description={t('jobs.noResultsHint')}
                action={
                  activeChips.length || filters.q ? (
                    <button type="button" className="btn btn-secondary btn-sm" onClick={reset}>
                      {t('filters.clearAll')}
                    </button>
                  ) : null
                }
              />
            </div>
          )}

          <Pagination
            className="mt-8"
            pagination={pagination}
            onChange={(page) => {
              update({ page: String(page) }, { resetPage: false });
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </section>
      </div>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label={t('filters.title')}>
          <div className="absolute inset-0 bg-navy-950/60 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} aria-hidden />
          <div className="absolute inset-y-0 right-0 flex w-full max-w-sm animate-slide-up flex-col bg-white shadow-2xl dark:bg-navy-900">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-navy-800">
              <p className="font-semibold">{t('filters.title')}</p>
              <button type="button" className="btn-ghost rounded-lg p-1.5" onClick={() => setDrawerOpen(false)} aria-label={t('common.close')}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">{filterPanel}</div>
            <div className="border-t border-slate-100 p-4 dark:border-navy-800">
              <button type="button" className="btn btn-primary w-full" onClick={() => setDrawerOpen(false)}>
                {t('filters.showResults', { count: pagination?.total ?? 0 })}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
