import api, { unwrap } from './api';

export const categoryService = {
  list: (all = false) => api.get('/categories', { params: all ? { all: 'true' } : {} }).then(unwrap),
  create: (data) => api.post('/categories', data).then(unwrap),
  update: (id, data) => api.put(`/categories/${id}`, data).then(unwrap),
  remove: (id) => api.delete(`/categories/${id}`).then(unwrap),
};
