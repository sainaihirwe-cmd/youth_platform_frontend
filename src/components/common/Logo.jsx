import { Link } from 'react-router-dom';

export default function Logo({ to = '/', light = false, compact = false }) {
  return (
    <Link to={to} className="flex items-center gap-2.5" aria-label="JobConnect Rwanda home">
      <svg viewBox="0 0 64 64" className="h-9 w-9 shrink-0" aria-hidden>
        <rect width="64" height="64" rx="14" fill={light ? '#ffffff' : '#0b1f3a'} />
        <path d="M20 24h24a4 4 0 0 1 4 4v16a4 4 0 0 1-4 4H20a4 4 0 0 1-4-4V28a4 4 0 0 1 4-4Z" fill="#2563eb" />
        <path d="M26 24v-3a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v3" stroke={light ? '#0b1f3a' : '#fff'} strokeWidth="3" fill="none" strokeLinecap="round" />
        <circle cx="32" cy="36" r="4" fill="#22c55e" />
      </svg>
      {!compact && (
        <span className="leading-tight">
          <span className={`block text-[15px] font-extrabold tracking-tight ${light ? 'text-white' : 'text-navy-900 dark:text-white'}`}>
            JobConnect
          </span>
          <span className={`block text-[11px] font-semibold uppercase tracking-[0.18em] ${light ? 'text-brand-200' : 'text-brand-600 dark:text-brand-400'}`}>
            Rwanda
          </span>
        </span>
      )}
    </Link>
  );
}
