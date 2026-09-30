import { useRef, useState } from 'react';
import { FileText, UploadCloud, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { validateFile } from '../../utils/format';

/** Drag-and-drop file picker with client-side type/size validation (the API validates again). */
export default function FileDropzone({ file, onChange, accept, extensions, maxMb, label, hint, error: externalError, disabled }) {
  const { t } = useTranslation();
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');

  const pick = (f) => {
    if (!f) return;
    const problem = validateFile(f, { extensions, maxMb });
    if (problem) {
      setError(t(problem.key, problem.params));
      onChange(null);
      if (inputRef.current) inputRef.current.value = '';
      return;
    }
    setError('');
    onChange(f);
  };

  const shownError = error || externalError;

  return (
    <div>
      {label && <p className="label">{label}</p>}
      {file ? (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-green-200 bg-green-50 p-3 dark:border-green-900/60 dark:bg-green-950/30">
          <div className="flex min-w-0 items-center gap-3">
            <FileText className="h-5 w-5 shrink-0 text-green-600" aria-hidden />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">{file.name}</p>
              <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          </div>
          <button
            type="button"
            className="btn-ghost rounded-lg p-1.5"
            onClick={() => {
              onChange(null);
              if (inputRef.current) inputRef.current.value = '';
            }}
            disabled={disabled}
            aria-label={t('common.remove')}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            pick(e.dataTransfer.files?.[0]);
          }}
          className={`flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 text-center transition ${
            dragging
              ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10'
              : shownError
                ? 'border-red-300 dark:border-red-800'
                : 'border-slate-300 hover:border-brand-400 hover:bg-slate-50 dark:border-navy-700 dark:hover:bg-navy-800/50'
          }`}
        >
          <UploadCloud className="h-7 w-7 text-brand-600" aria-hidden />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{t('forms.dropFile')}</span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {hint || t('forms.fileHint', { types: extensions.join(', ').toUpperCase(), size: maxMb })}
          </span>
        </button>
      )}
      <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={(e) => pick(e.target.files?.[0])} />
      {shownError && (
        <p className="field-error" role="alert">
          {shownError}
        </p>
      )}
    </div>
  );
}
