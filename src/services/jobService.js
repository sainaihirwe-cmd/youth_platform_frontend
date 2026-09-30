import api, { unwrap } from './api';

/** Removes empty values so they are not sent as query parameters. */
export function cleanParams(params = {}) {
  return Object.fromEntries(
    Object.entries(params).filter(
      ([, v]) => v !== undefined && v !== null && v !== '' && !(Array.isArray(v) && !v.length)
    )
  );
}

export const jobService = {
  list: (params, config) => api.get('/jobs', { params: cleanParams(params), ...config }).then(unwrap),
  featured: (limit) => api.get('/jobs/featured', { params: cleanParams({ limit }) }).then(unwrap),
  stats: () => api.get('/jobs/stats').then(unwrap),
  get: (id) => api.get(`/jobs/${id}`).then(unwrap),
  related: (id) => api.get(`/jobs/${id}/related`).then(unwrap),
  create: (data) => api.post('/jobs', data).then(unwrap),
  update: (id, data) => api.put(`/jobs/${id}`, data).then(unwrap),
  remove: (id) => api.delete(`/jobs/${id}`).then(unwrap),
  setStatus: (id, status) => api.patch(`/jobs/${id}/status`, { status }).then(unwrap),
};
