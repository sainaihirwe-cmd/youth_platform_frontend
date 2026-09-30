import api, { unwrap } from './api';

export const reportService = {
  /** @param {{ reportedJobId?: string, reportedUserId?: string, reason: string, description?: string }} data */
  create: (data) => api.post('/reports', data).then(unwrap),
  mine: (params) => api.get('/reports/my-reports', { params }).then(unwrap),
};
