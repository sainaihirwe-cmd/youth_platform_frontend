import { useEffect, useState } from 'react';
import { publicService } from '../services/publicService';

// Cached for the lifetime of the page so the footer and contact page share one request
let cache = null;
let inflight = null;

const FALLBACK = {
  siteName: 'JobConnect Rwanda',
  contactEmail: 'support@jobconnect.rw',
  contactPhone: '+250 788 000 000',
  contactAddress: 'Kigali, Rwanda',
  allowSeekerRegistration: true,
  allowEmployerRegistration: true,
};

export function usePublicSettings() {
  const [settings, setSettings] = useState(cache);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (cache) return;
    inflight =
      inflight ||
      publicService.settings().then((res) => {
        cache = res.data;
        return cache;
      });
    inflight
      .then(setSettings)
      .catch((err) => {
        inflight = null;
        setError(err);
        setSettings(FALLBACK);
      });
  }, []);

  return { settings: settings || FALLBACK, loaded: Boolean(settings), error };
}

export function invalidatePublicSettings() {
  cache = null;
  inflight = null;
}
