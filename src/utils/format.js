import i18n from '../i18n';

const locale = () => (i18n.language === 'rw' ? 'rw-RW' : 'en-RW');

export function formatNumber(n) {
  if (n == null || Number.isNaN(Number(n))) return '0';
  try {
    return new Intl.NumberFormat(locale()).format(n);
  } catch {
    return new Intl.NumberFormat('en').format(n);
  }
}

export function formatCompact(n) {
  try {
    return new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(n || 0);
  } catch {
    return String(n || 0);
  }
}

export function formatDate(value, opts = { day: 'numeric', month: 'short', year: 'numeric' }) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  try {
    return new Intl.DateTimeFormat(locale(), opts).format(d);
  } catch {
    return new Intl.DateTimeFormat('en', opts).format(d);
  }
}

export function formatDateTime(value) {
  return formatDate(value, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

/** "3 days ago" style relative time, localised through i18n keys. */
export function timeAgo(value) {
  if (!value) return '';
  const t = i18n.t.bind(i18n);
  const seconds = Math.round((Date.now() - new Date(value).getTime()) / 1000);
  if (seconds < 60) return t('time.justNow');
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return t('time.minutesAgo', { count: minutes });
  const hours = Math.round(minutes / 60);
  if (hours < 24) return t('time.hoursAgo', { count: hours });
  const days = Math.round(hours / 24);
  if (days < 30) return t('time.daysAgo', { count: days });
  return formatDate(value);
}

/** Days remaining until a deadline (negative when passed). */
export function daysUntil(value) {
  if (!value) return null;
  return Math.ceil((new Date(value).getTime() - Date.now()) / 86400000);
}

export function formatSalary(salary, paymentType) {
  const t = i18n.t.bind(i18n);
  if (paymentType === 'negotiable' && !salary?.min && !salary?.max) return t('jobs.negotiable');
  const cur = salary?.currency || 'RWF';
  const min = salary?.min;
  const max = salary?.max;
  let amount;
  if (min && max && min !== max) amount = `${formatNumber(min)} - ${formatNumber(max)} ${cur}`;
  else if (min || max) amount = `${formatNumber(min || max)} ${cur}`;
  else return t('jobs.salaryNotSpecified');
  const per = paymentType && paymentType !== 'negotiable' ? ` / ${t(`paymentTypes.${paymentType}`)}` : '';
  return `${amount}${per}`;
}

export function initials(name = '') {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('');
}

/** YYYY-MM-DD for <input type="date"> */
export function toDateInput(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

export function fileExtension(name = '') {
  const i = name.lastIndexOf('.');
  return i >= 0 ? name.slice(i + 1).toLowerCase() : '';
}

/**
 * Validates a File against allowed extensions and a size limit (MB).
 * Returns an i18n key (with params) describing the problem, or null.
 */
export function validateFile(file, { extensions, maxMb }) {
  if (!file) return null;
  if (!extensions.includes(fileExtension(file.name))) {
    return { key: 'validation.fileType', params: { types: extensions.join(', ').toUpperCase() } };
  }
  if (file.size > maxMb * 1024 * 1024) return { key: 'validation.fileSize', params: { size: maxMb } };
  return null;
}
