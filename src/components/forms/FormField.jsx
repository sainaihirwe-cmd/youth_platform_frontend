import { forwardRef, useId } from 'react';
import { useTranslation } from 'react-i18next';
import { LOCATION_GROUPS } from '../../utils/constants';

/** Label + control + error/hint wrapper. `children` receives the generated id. */
export function Field({ label, error, hint, required, children, className = '', htmlFor }) {
  const autoId = useId();
  const id = htmlFor || autoId;
  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="label">
          {label}
          {required && <span className="ml-0.5 text-red-500" aria-hidden>*</span>}
        </label>
      )}
      {typeof children === 'function' ? children(id) : children}
      {error ? (
        <p className="field-error" role="alert">
          {error}
        </p>
      ) : (
        hint && <p className="field-hint">{hint}</p>
      )}
    </div>
  );
}

export const Input = forwardRef(function Input({ label, error, hint, required, className = '', inputClassName = '', ...props }, ref) {
  return (
    <Field label={label} error={error} hint={hint} required={required} className={className}>
      {(id) => (
        <input
          id={id}
          ref={ref}
          aria-invalid={Boolean(error)}
          className={`input ${error ? 'input-error' : ''} ${inputClassName}`}
          {...props}
        />
      )}
    </Field>
  );
});

export const Textarea = forwardRef(function Textarea({ label, error, hint, required, className = '', rows = 4, ...props }, ref) {
  return (
    <Field label={label} error={error} hint={hint} required={required} className={className}>
      {(id) => (
        <textarea id={id} ref={ref} rows={rows} aria-invalid={Boolean(error)} className={`input ${error ? 'input-error' : ''}`} {...props} />
      )}
    </Field>
  );
});

export const Select = forwardRef(function Select({ label, error, hint, required, className = '', children, ...props }, ref) {
  return (
    <Field label={label} error={error} hint={hint} required={required} className={className}>
      {(id) => (
        <select id={id} ref={ref} aria-invalid={Boolean(error)} className={`input ${error ? 'input-error' : ''}`} {...props}>
          {children}
        </select>
      )}
    </Field>
  );
});

/** Grouped Rwanda locations (provinces and districts). */
export function LocationOptions({ placeholder }) {
  const { t } = useTranslation();
  return (
    <>
      <option value="">{placeholder || t('forms.selectLocation')}</option>
      {LOCATION_GROUPS.map((g) => (
        <optgroup key={g.label} label={t(`locations.${g.label}`, g.label)}>
          {g.options.map((o) => (
            <option key={o} value={o}>
              {o === g.label ? t('locations.allOf', { place: t(`locations.${o}`, o) }) : t(`locations.${o}`, o)}
            </option>
          ))}
        </optgroup>
      ))}
    </>
  );
}

export function Checkbox({ label, description, className = '', ...props }) {
  const id = useId();
  return (
    <label htmlFor={id} className={`flex cursor-pointer items-start gap-3 ${className}`}>
      <input id={id} type="checkbox" className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-600 accent-brand-600" {...props} />
      <span className="text-sm">
        <span className="font-medium text-slate-800 dark:text-slate-200">{label}</span>
        {description && <span className="block text-slate-500 dark:text-slate-400">{description}</span>}
      </span>
    </label>
  );
}
