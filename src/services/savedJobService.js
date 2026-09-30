import api, { unwrap } from './api';

export const savedJobService = {
  list: (params) => api.get('/saved-jobs', { params }).then(unwrap),
  ids: () => api.get('/saved-jobs/ids').then(unwrap),
  save: (jobId) => api.post(`/saved-jobs/${jobId}`).then(unwrap),
  remove: (jobId) => api.delete(`/saved-jobs/${jobId}`).then(unwrap),
};
