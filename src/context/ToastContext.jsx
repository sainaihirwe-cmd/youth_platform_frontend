import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { CheckCircle2, AlertTriangle, Info, X, XCircle } from 'lucide-react';

const ToastContext = createContext(null);

const STYLES = {
  success: { icon: CheckCircle2, cls: 'text-green-600 dark:text-green-400' },
  error: { icon: XCircle, cls: 'text-red-600 dark:text-red-400' },
  warning: { icon: AlertTriangle, cls: 'text-amber-600 dark:text-amber-400' },
  info: { icon: Info, cls: 'text-brand-600 dark:text-brand-400' },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id) => setToasts((list) => list.filter((t) => t.id !== id)), []);

  const push = useCallback(
    (type, message, { duration = 4500, title } = {}) => {
      if (!message) return;
      idRef.current += 1;
      const id = idRef.current;
      setToasts((list) => [...list.slice(-3), { id, type, message, title }]);
      if (duration) setTimeout(() => dismiss(id), duration);
    },
    [dismiss]
  );

  const toast = useMemo(
    () => ({
      success: (m, o) => push('success', m, o),
      error: (m, o) => push('error', m, { duration: 6500, ...o }),
      warning: (m, o) => push('warning', m, o),
      info: (m, o) => push('info', m, o),
    }),
    [push]
  );

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div
        data-print-hide
        className="pointer-events-none fixed inset-x-0 top-3 z-[100] flex flex-col items-center gap-2 px-4 sm:inset-x-auto sm:right-4 sm:top-4 sm:items-end"
        aria-live="polite"
        role="status"
      >
        {toasts.map((t) => {
          const { icon: Icon, cls } = STYLES[t.type];
          return (
            <div
              key={t.id}
              className="card pointer-events-auto flex w-full max-w-sm animate-slide-up items-start gap-3 p-4 shadow-card-hover"
            >
              <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${cls}`} aria-hidden />
              <div className="min-w-0 flex-1 text-sm">
                {t.title && <p className="font-semibold text-navy-900 dark:text-white">{t.title}</p>}
                <p className="text-slate-700 dark:text-slate-300">{t.message}</p>
              </div>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                className="rounded-md p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
