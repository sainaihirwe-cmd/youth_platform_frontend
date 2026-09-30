import { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Field } from './FormField';

const PasswordInput = forwardRef(function PasswordInput({ label, error, hint, required, className = '', ...props }, ref) {
  const [show, setShow] = useState(false);
  const { t } = useTranslation();
  return (
    <Field label={label} error={error} hint={hint} required={required} className={className}>
      {(id) => (
        <div className="relative">
          <input
            id={id}
            ref={ref}
            type={show ? 'text' : 'password'}
            aria-invalid={Boolean(error)}
            className={`input pr-11 ${error ? 'input-error' : ''}`}
            {...props}
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            aria-label={show ? t('auth.hidePassword') : t('auth.showPassword')}
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      )}
    </Field>
  );
});

export default PasswordInput;

/** Visual password strength meter for the password rules enforced by the API. */
export function PasswordStrength({ value = '' }) {
  const { t } = useTranslation();
  const rules = [
    ['length', value.length >= 8],
    ['lower', /[a-z]/.test(value)],
    ['upper', /[A-Z]/.test(value)],
    ['number', /\d/.test(value)],
    ['symbol', /[^A-Za-z0-9]/.test(value)],
  ];
  const score = rules.filter(([, ok]) => ok).length;
  const colors = ['bg-red-500', 'bg-red-500', 'bg-amber-500', 'bg-amber-500', 'bg-green-500', 'bg-green-600'];
  if (!value) return null;
  return (
    <div className="mt-2 space-y-2" aria-live="polite">
      <div className="flex gap-1">
        {rules.map((_, i) => (
          <span key={i} className={`h-1 flex-1 rounded-full ${i < score ? colors[score] : 'bg-slate-200 dark:bg-navy-800'}`} />
        ))}
      </div>
      <ul className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-xs">
        {rules.map(([key, ok]) => (
          <li key={key} className={ok ? 'text-green-600 dark:text-green-400' : 'text-slate-500 dark:text-slate-400'}>
            {ok ? '✓' : '•'} {t(`auth.passwordRules.${key}`)}
          </li>
        ))}
      </ul>
    </div>
  );
}
