import { useId } from 'react';
import { Link } from 'react-router-dom';

/**
 * JobConnect Rwanda mark: a briefcase under the rising sun of the Rwandan flag
 * (blue, yellow and green). Keep in sync with public/favicon.svg and public/brand/*.svg.
 */
export function LogoMark({ className = 'h-9 w-9' }) {
  // Unique gradient ids: the logo renders several times per page (navbar, sidebar, footer)
  const id = useId().replace(/:/g, '');
  return (
    <svg viewBox="0 0 64 64" className={`shrink-0 ${className}`} aria-hidden focusable="false">
      <defs>
        <linearGradient id={`${id}t`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#13305a" />
          <stop offset="1" stopColor="#0b1f3a" />
        </linearGradient>
        <linearGradient id={`${id}s`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fde047" />
          <stop offset="1" stopColor="#f59e0b" />
        </linearGradient>
        <linearGradient id={`${id}c`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3b82f6" />
          <stop offset="1" stopColor="#1d4ed8" />
        </linearGradient>
        <clipPath id={`${id}k`}>
          <rect x="11" y="29" width="42" height="26" rx="5.5" />
        </clipPath>
      </defs>
      <rect width="64" height="64" rx="15" fill={`url(#${id}t)`} />
      <path d="M32 7.5v5.5M17.6 12.6l3.4 4.4M46.4 12.6 43 17M9.5 23.4l5.2 2M54.5 23.4l-5.2 2" stroke="#facc15" strokeWidth="3.6" strokeLinecap="round" />
      <path d="M18.5 31.5a13.5 13.5 0 0 1 27 0Z" fill={`url(#${id}s)`} />
      <g clipPath={`url(#${id}k)`}>
        <rect x="11" y="29" width="42" height="26" fill={`url(#${id}c)`} />
        <rect x="11" y="48.5" width="42" height="7" fill="#16a34a" />
      </g>
      <rect x="27.5" y="36" width="9" height="6.5" rx="1.8" fill="#fff" />
    </svg>
  );
}

export default function Logo({ to = '/', light = false, compact = false }) {
  return (
    <Link to={to} className="flex items-center gap-2.5" aria-label="JobConnect Rwanda home">
      <LogoMark />
      {!compact && (
        <span className="leading-[1.05]">
          <span className={`block text-[17px] font-extrabold tracking-tight ${light ? 'text-white' : 'text-navy-900 dark:text-white'}`}>
            Job<span className={light ? 'text-brand-400' : 'text-brand-600 dark:text-brand-400'}>Connect</span>
          </span>
          <span className={`block text-[10px] font-semibold uppercase tracking-[0.3em] ${light ? 'text-yellow-400' : 'text-slate-500 dark:text-yellow-400'}`}>
            Rwanda
          </span>
        </span>
      )}
    </Link>
  );
}
