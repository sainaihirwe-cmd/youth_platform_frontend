import axios from 'axios';
import i18n from '../i18n';

export const API_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

/** Origin of the backend, used to build URLs for uploaded images ('' when the API is same-origin). */
export const API_ORIGIN = /^https?:\/\//i.test(API_URL) ? new URL(API_URL).origin : '';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // the JWT lives in an HTTP-only cookie
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  config.headers['Accept-Language'] = i18n.language || 'en';
  return config;
});

/** Normalised error thrown by every service call. */
export class ApiRequestError extends Error {
  constructor(message, { status = 0, errors = [], code } = {}) {
    super(message);
    this.status = status;
    this.errors = errors;
    this.code = code;
  }
}

const AUTH_PASSTHROUGH = ['/auth/login', '/auth/admin/login', '/auth/register', '/auth/me', '/auth/session', '/auth/logout'];

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isCancel(error)) return Promise.reject(error);
    const status = error.response?.status || 0;
    const data = error.response?.data;
    let message;
    if (!error.response) {
      message =
        error.code === 'ECONNABORTED' ? i18n.t('errors.timeout') : i18n.t('errors.network');
    } else if (data instanceof Blob) {
      message = status === 403 ? i18n.t('errors.forbidden') : status === 404 ? i18n.t('errors.notFound') : i18n.t('errors.generic');
    } else {
      message = data?.message || i18n.t('errors.generic');
    }

    // Session expired or revoked while using the app: let AuthContext react.
    const url = error.config?.url || '';
    if (status === 401 && !AUTH_PASSTHROUGH.some((p) => url.startsWith(p))) {
      window.dispatchEvent(new CustomEvent('auth:expired', { detail: { message } }));
    }
    if (status === 403 && /suspended/i.test(message)) {
      window.dispatchEvent(new CustomEvent('auth:suspended', { detail: { message } }));
    }

    return Promise.reject(new ApiRequestError(message, { status, errors: data?.errors || [], code: error.code }));
  }
);

/** Unwraps the { success, data, pagination, message } envelope. */
export const unwrap = (res) => res.data;

/** Builds a displayable URL for an uploaded image (local or Cloudinary). */
export function assetUrl(path) {
  if (!path) return '';
  if (/^https?:\/\//i.test(path) || path.startsWith('blob:') || path.startsWith('data:')) return path;
  return `${API_ORIGIN}${path}`;
}

/**
 * Opens a protected file (resume) in a new tab. Local files are fetched with credentials and shown
 * via an object URL so the auth cookie is sent even when the API is on another domain.
 */
export async function openProtectedFile(url, filename) {
  if (!url) return;
  if (/^https?:\/\//i.test(url)) {
    window.open(url, '_blank', 'noopener');
    return;
  }
  // Open the tab synchronously (avoids popup blockers), then point it at the blob
  const tab = window.open('', '_blank');
  try {
    const path = url.startsWith('/api/') ? url.slice(4) : url;
    const res = await api.get(path, { responseType: 'blob' });
    const blobUrl = URL.createObjectURL(res.data);
    if (tab) {
      tab.location.href = blobUrl;
    } else {
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename || 'resume';
      a.click();
    }
    setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
  } catch (err) {
    if (tab) tab.close();
    throw err;
  }
}

export default api;
