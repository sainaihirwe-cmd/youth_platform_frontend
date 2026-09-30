import api, { unwrap } from './api';
import { cleanParams } from './jobService';

export const employerService = {
  getProfile: () => api.get('/employer/profile').then(unwrap),
  updateProfile: (data) => api.put('/employer/profile', data).then(unwrap),
  uploadLogo: (file) => {
    const form = new FormData();
    form.append('logo', file);
    return api.post('/employer/profile/logo', form).then(unwrap);
  },
  dashboard: () => api.get('/employer/dashboard').then(unwrap),
  jobs: (params) => api.get('/employer/jobs', { params: cleanParams(params) }).then(unwrap),
  applications: (params) => api.get('/employer/applications', { params: cleanParams(params) }).then(unwrap),
  jobApplications: (jobId, params) =>
    api.get(`/employer/jobs/${jobId}/applications`, { params: cleanParams(params) }).then(unwrap),
};
