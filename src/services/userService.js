import api, { unwrap } from './api';

export const userService = {
  getProfile: () => api.get('/users/profile').then(unwrap),
  updateProfile: (data) => api.put('/users/profile', data).then(unwrap),
  deleteAccount: (password) => api.delete('/users/profile', { data: { password } }).then(unwrap),
  uploadProfileImage: (file) => {
    const form = new FormData();
    form.append('image', file);
    return api.post('/users/profile-image', form).then(unwrap);
  },
  uploadResume: (file, onUploadProgress) => {
    const form = new FormData();
    form.append('resume', file);
    return api.post('/users/resume', form, { onUploadProgress }).then(unwrap);
  },
  deleteResume: () => api.delete('/users/resume').then(unwrap),
  getPublicProfile: (id) => api.get(`/users/${id}`).then(unwrap),
};
