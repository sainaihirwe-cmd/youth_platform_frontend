import api, { unwrap } from './api';

export const publicService = {
  settings: () => api.get('/settings/public').then(unwrap),
  contact: (data) => api.post('/contact', data).then(unwrap),
};
