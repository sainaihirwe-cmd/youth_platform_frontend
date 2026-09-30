import { useState } from 'react';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Field } from './FormField';

/** Enter/comma-separated list input (skills, requirements...). Controlled: value is string[]. */
export default function TagInput({ label, value = [], onChange, placeholder, max = 30, maxLength = 50, error, hint, required, multiline = false }) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState('');

  const add = (raw) => {
    const items = (multiline ? [raw] : raw.split(',')).map((s) => s.trim()).filter(Boolean);
    if (!items.length) return;
    const next = [...value];
    for (const item of items) {
      const clipped = item.slice(0, maxLength);
      if (next.length >= max) break;
      if (!next.some((v) => v.toLowerCase() === clipped.toLowerCase())) next.push(clipped);
    }
    onChange(next);
    setDraft('');
  };

  const remove = (i) => onChange(value.filter((_, idx) => idx !== i));

  const onKeyDown = (e) => {
    if (e.key === 'Enter' || (!multiline && e.key === ',')) {
      e.preventDefault();
      add(draft);
    } else if (e.key === 'Backspace' && !draft && value.length) {
      remove(value.length - 1);
    }
  };

  return (
    <Field label={label} error={error} hint={hint || t('forms.tagHint', { max })} required={required}>
      {(id) => (
        <div>
          {value.length > 0 && (
            <ul className={`mb-2 flex ${multiline ? 'flex-col' : 'flex-wrap'} gap-1.5`}>
              {value.map((v, i) => (
                <li
                  key={`${v}-${i}`}
                  className={`${multiline ? 'flex w-full items-start justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-navy-700' : 'chip'}`}
                >
                  <span className={multiline ? 'pr-2' : ''}>{v}</span>
                  <button type="button" onClick={() => remove(i)} className="text-slate-400 hover:text-red-500" aria-label={t('common.remove')}>
                    <X className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="flex gap-2">
            <input
              id={id}
              className={`input ${error ? 'input-error' : ''}`}
              value={draft}
              maxLength={maxLength}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onKeyDown}
              onBlur={() => !multiline && draft && add(draft)}
              placeholder={placeholder}
              disabled={value.length >= max}
            />
            <button type="button" className="btn btn-secondary shrink-0" onClick={() => add(draft)} disabled={!draft.trim() || value.length >= max}>
              {t('common.add')}
            </button>
          </div>
        </div>
      )}
    </Field>
  );
}
