import api, { unwrap } from './api';

export const authService = {
  register: (data) => api.post('/auth/register', data).then(unwrap),
  login: (data) => api.post('/auth/login', data).then(unwrap),
  adminLogin: (data) => api.post('/auth/admin/login', data).then(unwrap),
  logout: () => api.post('/auth/logout').then(unwrap),
  me: () => api.get('/auth/me').then(unwrap),
  session: () => api.get('/auth/session').then(unwrap),
  changePassword: (data) => api.put('/auth/change-password', data).then(unwrap),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }).then(unwrap),
  resetPassword: (data) => api.post('/auth/reset-password', data).then(unwrap),
};
