import { useState, useEffect } from 'react';
import { RotateCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { JOB_TYPES, POSTED_WITHIN } from '../../utils/constants';
import { LocationOptions } from '../forms/FormField';
import { categoryLabel } from '../../utils/labels';

/**
 * Filter panel for the jobs page. `value` holds the current filters (strings, jobType as array).
 * Salary inputs are committed on blur/Enter so every keystroke does not trigger a request.
 */
export default function JobFilters({ value, onChange, categories = [], onReset }) {
  const { t } = useTranslation();
  const [salary, setSalary] = useState({ minSalary: value.minSalary || '', maxSalary: value.maxSalary || '' });

  useEffect(() => setSalary({ minSalary: value.minSalary || '', maxSalary: value.maxSalary || '' }), [value.minSalary, value.maxSalary]);

  const set = (patch) => onChange({ ...value, ...patch });
  const toggleType = (type) => {
    const types = value.jobType || [];
    set({ jobType: types.includes(type) ? types.filter((x) => x !== type) : [...types, type] });
  };
  const commitSalary = () => set({ minSalary: salary.minSalary, maxSalary: salary.maxSalary });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">{t('filters.title')}</h2>
        <button type="button" onClick={onReset} className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline dark:text-brand-400">
          <RotateCcw className="h-3.5 w-3.5" /> {t('filters.reset')}
        </button>
      </div>

      <div>
        <label htmlFor="filter-location" className="label">
          {t('filters.location')}
        </label>
        <select id="filter-location" className="input" value={value.location || ''} onChange={(e) => set({ location: e.target.value })}>
          <LocationOptions placeholder={t('search.allLocations')} />
        </select>
      </div>

      <div>
        <label htmlFor="filter-category" className="label">
          {t('filters.category')}
        </label>
        <select id="filter-category" className="input" value={value.category || ''} onChange={(e) => set({ category: e.target.value })}>
          <option value="">{t('filters.allCategories')}</option>
          {categories.map((c) => (
            <option key={c._id} value={c.slug}>
              {categoryLabel(t, c)} ({c.jobCount || 0})
            </option>
          ))}
        </select>
      </div>

      <fieldset>
        <legend className="label">{t('filters.jobType')}</legend>
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
          {JOB_TYPES.map((type) => {
            const checked = (value.jobType || []).includes(type);
            return (
              <label
                key={type}
                className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${
                  checked
                    ? 'border-brand-500 bg-brand-50 text-brand-800 dark:bg-brand-500/10 dark:text-brand-200'
                    : 'border-slate-200 hover:bg-slate-50 dark:border-navy-700 dark:hover:bg-navy-800'
                }`}
              >
                <input type="checkbox" className="h-4 w-4 accent-brand-600" checked={checked} onChange={() => toggleType(type)} />
                {t(`jobTypes.${type}`)}
              </label>
            );
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend className="label">{t('filters.salary')}</legend>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            inputMode="numeric"
            className="input"
            placeholder={t('filters.min')}
            aria-label={t('filters.minSalary')}
            value={salary.minSalary}
            onChange={(e) => setSalary((s) => ({ ...s, minSalary: e.target.value }))}
            onBlur={commitSalary}
            onKeyDown={(e) => e.key === 'Enter' && commitSalary()}
          />
          <span className="text-slate-400">–</span>
          <input
            type="number"
            min="0"
            inputMode="numeric"
            className="input"
            placeholder={t('filters.max')}
            aria-label={t('filters.maxSalary')}
            value={salary.maxSalary}
            onChange={(e) => setSalary((s) => ({ ...s, maxSalary: e.target.value }))}
            onBlur={commitSalary}
            onKeyDown={(e) => e.key === 'Enter' && commitSalary()}
          />
        </div>
        <p className="field-hint">{t('filters.salaryHint')}</p>
      </fieldset>

      <div>
        <label htmlFor="filter-posted" className="label">
          {t('filters.postedWithin')}
        </label>
        <select id="filter-posted" className="input" value={value.postedWithin || ''} onChange={(e) => set({ postedWithin: e.target.value })}>
          <option value="">{t('filters.anyTime')}</option>
          {POSTED_WITHIN.map((d) => (
            <option key={d} value={d}>
              {t('filters.lastDays', { count: d })}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
