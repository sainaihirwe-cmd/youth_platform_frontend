import { useState, useEffect } from 'react';
import { MapPin, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LocationOptions } from '../forms/FormField';

/**
 * Keyword + location search. In `live` mode it reports every change (the parent debounces);
 * otherwise it submits on Enter / button click.
 */
export default function SearchBar({ initialQuery = '', initialLocation = '', onSearch, onChange, live = false, size = 'md' }) {
  const { t } = useTranslation();
  const [q, setQ] = useState(initialQuery);
  const [location, setLocation] = useState(initialLocation);

  useEffect(() => setQ(initialQuery), [initialQuery]);
  useEffect(() => setLocation(initialLocation), [initialLocation]);

  const submit = (e) => {
    e.preventDefault();
    onSearch?.({ q: q.trim(), location });
  };

  const big = size === 'lg';

  return (
    <form
      onSubmit={submit}
      role="search"
      className={`flex w-full flex-col gap-2 rounded-2xl bg-white p-2 shadow-card ring-1 ring-slate-200 sm:flex-row sm:items-center dark:bg-navy-900 dark:ring-navy-800 ${big ? 'sm:p-2.5' : ''}`}
    >
      <label className="relative flex-1">
        <span className="sr-only">{t('search.keywords')}</span>
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" aria-hidden />
        <input
          type="search"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            if (live) onChange?.({ q: e.target.value, location });
          }}
          placeholder={t('search.placeholder')}
          maxLength={100}
          className={`w-full rounded-xl border-0 bg-transparent pl-11 pr-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:text-white ${big ? 'py-3.5 text-base' : 'py-2.5 text-sm'}`}
        />
      </label>
      <div className="hidden h-8 w-px bg-slate-200 sm:block dark:bg-navy-700" aria-hidden />
      <label className="relative sm:w-56">
        <span className="sr-only">{t('search.location')}</span>
        <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" aria-hidden />
        <select
          value={location}
          onChange={(e) => {
            setLocation(e.target.value);
            if (live) onChange?.({ q, location: e.target.value });
          }}
          className={`w-full cursor-pointer appearance-none rounded-xl border-0 bg-transparent pl-11 pr-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:text-slate-200 dark:[&>*]:bg-navy-900 ${big ? 'py-3.5 text-base' : 'py-2.5 text-sm'}`}
        >
          <LocationOptions placeholder={t('search.allLocations')} />
        </select>
      </label>
      <button type="submit" className={`btn btn-primary ${big ? 'btn-lg' : ''}`}>
        <Search className="h-4 w-4" aria-hidden /> {t('search.button')}
      </button>
    </form>
  );
}
