/** Simple accessible tab bar. `tabs` = [{ id, label, count? }] */
export default function Tabs({ tabs, active, onChange, className = '' }) {
  return (
    <div className={`-mx-1 overflow-x-auto ${className}`}>
      <div role="tablist" className="inline-flex min-w-full gap-1 border-b border-slate-200 px-1 dark:border-navy-800">
        {tabs.map((tab) => {
          const selected = tab.id === active;
          return (
            <button
              key={tab.id}
              role="tab"
              type="button"
              aria-selected={selected}
              onClick={() => onChange(tab.id)}
              className={`-mb-px flex items-center gap-2 whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition ${
                selected
                  ? 'border-brand-600 text-brand-700 dark:text-brand-300'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className={`rounded-full px-2 py-0.5 text-[11px] ${selected ? 'bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-200' : 'bg-slate-100 text-slate-600 dark:bg-navy-800 dark:text-slate-300'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
