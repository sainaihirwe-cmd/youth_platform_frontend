import { useState } from 'react';
import { assetUrl } from '../../services/api';
import { initials } from '../../utils/format';

const SIZES = { xs: 'h-7 w-7 text-[10px]', sm: 'h-9 w-9 text-xs', md: 'h-11 w-11 text-sm', lg: 'h-16 w-16 text-lg', xl: 'h-24 w-24 text-2xl' };

/** Round avatar for people, rounded square for companies. Falls back to initials. */
export default function Avatar({ src, name = '', size = 'md', square = false, className = '' }) {
  const [failed, setFailed] = useState(false);
  const shape = square ? 'rounded-xl' : 'rounded-full';
  const url = assetUrl(src);
  if (url && !failed) {
    return (
      <img
        src={url}
        alt={name}
        onError={() => setFailed(true)}
        className={`${SIZES[size]} ${shape} shrink-0 border border-slate-200 bg-white object-cover dark:border-navy-700 ${className}`}
        loading="lazy"
      />
    );
  }
  return (
    <span
      className={`${SIZES[size]} ${shape} inline-flex shrink-0 items-center justify-center bg-gradient-to-br from-brand-500 to-navy-800 font-bold text-white ${className}`}
      aria-label={name}
    >
      {initials(name) || '?'}
    </span>
  );
}
