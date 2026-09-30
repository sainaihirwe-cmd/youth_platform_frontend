import { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Modal from './Modal';

/**
 * Confirmation dialog. `onConfirm` may return a promise; the dialog stays open with a loading
 * state until it settles. Optionally collects a text input (e.g. a moderation reason or password).
 */
export default function ConfirmationDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel,
  tone = 'danger',
  input,
}) {
  const { t } = useTranslation();
  const [busy, setBusy] = useState(false);
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setValue('');
      setError('');
      setBusy(false);
    }
  }, [open]);

  const handleConfirm = async (e) => {
    e?.preventDefault();
    if (input?.required && !value.trim()) {
      setError(t('validation.required'));
      return;
    }
    setBusy(true);
    setError('');
    try {
      await onConfirm(value.trim());
      onClose();
    } catch (err) {
      setError(err?.message || t('errors.generic'));
    } finally {
      setBusy(false);
    }
  };

  const btnClass = { danger: 'btn-danger', primary: 'btn-primary', success: 'btn-success' }[tone];

  return (
    <Modal
      open={open}
      onClose={busy ? () => {} : onClose}
      title={title}
      size="sm"
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={busy}>
            {t('common.cancel')}
          </button>
          <button type="submit" form="confirm-form" className={`btn ${btnClass}`} disabled={busy}>
            {busy ? t('common.processing') : confirmLabel || t('common.confirm')}
          </button>
        </>
      }
    >
      <form id="confirm-form" onSubmit={handleConfirm} className="space-y-4">
        <div className="flex gap-3">
          {tone === 'danger' && (
            <div className="h-fit rounded-full bg-red-50 p-2 dark:bg-red-950/50">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" aria-hidden />
            </div>
          )}
          <p className="text-sm text-slate-600 dark:text-slate-300">{message}</p>
        </div>
        {input && (
          <div>
            <label className="label" htmlFor="confirm-input">
              {input.label}
            </label>
            {input.type === 'textarea' ? (
              <textarea id="confirm-input" rows={3} className="input" value={value} onChange={(e) => setValue(e.target.value)} placeholder={input.placeholder} maxLength={input.maxLength || 500} />
            ) : (
              <input id="confirm-input" type={input.type || 'text'} className="input" value={value} onChange={(e) => setValue(e.target.value)} placeholder={input.placeholder} autoComplete={input.autoComplete} />
            )}
          </div>
        )}
        {error && <p className="field-error text-sm">{error}</p>}
      </form>
    </Modal>
  );
}
