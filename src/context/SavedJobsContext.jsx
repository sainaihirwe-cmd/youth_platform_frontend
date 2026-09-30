import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { savedJobService } from '../services/savedJobService';

const SavedJobsContext = createContext(null);

/** Tracks which jobs the current job seeker has bookmarked so every JobCard can show the right state. */
export function SavedJobsProvider({ children }) {
  const { user } = useAuth();
  const toast = useToast();
  const { t } = useTranslation();
  const [ids, setIds] = useState(() => new Set());
  const [pending, setPending] = useState(() => new Set());
  const isSeeker = user?.role === 'job_seeker';

  useEffect(() => {
    if (!isSeeker) {
      setIds(new Set());
      return;
    }
    savedJobService
      .ids()
      .then((res) => setIds(new Set(res.data.map(String))))
      .catch(() => setIds(new Set()));
  }, [isSeeker]);

  const toggle = useCallback(
    async (jobId) => {
      const id = String(jobId);
      if (pending.has(id)) return;
      setPending((p) => new Set(p).add(id));
      const wasSaved = ids.has(id);
      try {
        if (wasSaved) {
          await savedJobService.remove(id);
          setIds((s) => {
            const n = new Set(s);
            n.delete(id);
            return n;
          });
          toast.info(t('savedJobs.removed'));
        } else {
          await savedJobService.save(id);
          setIds((s) => new Set(s).add(id));
          toast.success(t('savedJobs.saved'));
        }
      } catch (err) {
        // Keep local state consistent with the server on conflicts
        if (err.status === 409) setIds((s) => new Set(s).add(id));
        else if (err.status === 404 && wasSaved) {
          setIds((s) => {
            const n = new Set(s);
            n.delete(id);
            return n;
          });
        } else toast.error(err.message);
      } finally {
        setPending((p) => {
          const n = new Set(p);
          n.delete(id);
          return n;
        });
      }
    },
    [ids, pending, toast, t]
  );

  const value = useMemo(
    () => ({ isSaved: (id) => ids.has(String(id)), isPending: (id) => pending.has(String(id)), toggle, enabled: isSeeker, count: ids.size }),
    [ids, pending, toggle, isSeeker]
  );
  return <SavedJobsContext.Provider value={value}>{children}</SavedJobsContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSavedJobs() {
  const ctx = useContext(SavedJobsContext);
  if (!ctx) throw new Error('useSavedJobs must be used within SavedJobsProvider');
  return ctx;
}
