import api, { downloadFile, unwrap } from './api';
import { cleanParams } from './jobService';

export const adminService = {
  dashboard: () => api.get('/admin/dashboard').then(unwrap),
  analytics: (months = 6) => api.get('/admin/analytics', { params: { months } }).then(unwrap),

  users: (params) => api.get('/admin/users', { params: cleanParams(params) }).then(unwrap),
  user: (id) => api.get(`/admin/users/${id}`).then(unwrap),
  setUserStatus: (id, isSuspended, reason) =>
    api.patch(`/admin/users/${id}/status`, { isSuspended, ...(reason ? { reason } : {}) }).then(unwrap),
  setVerification: (id, verificationStatus, notes) =>
    api.patch(`/admin/users/${id}/verification`, { verificationStatus, ...(notes ? { notes } : {}) }).then(unwrap),
  deleteUser: (id) => api.delete(`/admin/users/${id}`).then(unwrap),

  jobs: (params) => api.get('/admin/jobs', { params: cleanParams(params) }).then(unwrap),
  moderateJob: (id, action, reason) =>
    api.patch(`/admin/jobs/${id}/moderate`, { action, ...(reason ? { reason } : {}) }).then(unwrap),
  deleteJob: (id) => api.delete(`/jobs/${id}`).then(unwrap),

  reports: (params) => api.get('/admin/reports', { params: cleanParams(params) }).then(unwrap),
  updateReport: (id, data) => api.patch(`/admin/reports/${id}`, data).then(unwrap),
  exportReportsCsv: (params) => downloadFile('/admin/reports/export', cleanParams({ ...params, format: 'csv' }), 'jobconnect-reports.csv'),
  reportsForPrint: (params) => api.get('/admin/reports/export', { params: cleanParams({ ...params, format: 'json' }) }).then(unwrap),

  settings: () => api.get('/admin/settings').then(unwrap),
  updateSettings: (data) => api.put('/admin/settings', data).then(unwrap),

  messages: (params) => api.get('/admin/messages', { params: cleanParams(params) }).then(unwrap),
  updateMessage: (id, status) => api.patch(`/admin/messages/${id}`, { status }).then(unwrap),
};
