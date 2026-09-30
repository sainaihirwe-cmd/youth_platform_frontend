import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Runs an async loader and tracks { data, error, loading }. Re-runs when `deps` change.
 * Stale responses (from an earlier run) are ignored, so fast filter changes never show old data.
 */
export function useAsync(loader, deps = [], { immediate = true, keepPreviousData = true } = {}) {
  const [state, setState] = useState({ data: null, error: null, loading: immediate });
  const runId = useRef(0);
  const loaderRef = useRef(loader);
  loaderRef.current = loader;

  const run = useCallback(async () => {
    runId.current += 1;
    const id = runId.current;
    setState((s) => ({ data: keepPreviousData ? s.data : null, error: null, loading: true }));
    try {
      const data = await loaderRef.current();
      if (id === runId.current) setState({ data, error: null, loading: false });
      return data;
    } catch (error) {
      if (id === runId.current) setState((s) => ({ data: keepPreviousData ? s.data : null, error, loading: false }));
      return undefined;
    }
  }, [keepPreviousData]);

  useEffect(() => {
    if (immediate) run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  const setData = useCallback((updater) => {
    setState((s) => ({ ...s, data: typeof updater === 'function' ? updater(s.data) : updater }));
  }, []);

  return { ...state, reload: run, setData };
}
