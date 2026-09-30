import api, { unwrap } from './api';

export const applicationService = {
  /** @param {{ jobId: string, coverLetter: string, resume?: File, useProfileResume?: boolean }} data */
  apply: ({ jobId, coverLetter, resume, useProfileResume = true }, onUploadProgress) => {
    const form = new FormData();
    form.append('jobId', jobId);
    form.append('coverLetter', coverLetter);
    form.append('useProfileResume', String(useProfileResume));
    if (resume) form.append('resume', resume);
    return api.post('/applications', form, { onUploadProgress }).then(unwrap);
  },
  mine: (params) => api.get('/applications/my-applications', { params }).then(unwrap),
  stats: () => api.get('/applications/stats').then(unwrap),
  get: (id) => api.get(`/applications/${id}`).then(unwrap),
  updateStatus: (id, status, employerNotes) =>
    api
      .patch(`/applications/${id}/status`, { status, ...(employerNotes !== undefined ? { employerNotes } : {}) })
      .then(unwrap),
  withdraw: (id) => api.delete(`/applications/${id}`).then(unwrap),
};
