import api, { unwrap } from './api';

export const notificationService = {
  list: (params) => api.get('/notifications', { params }).then(unwrap),
  unreadCount: () => api.get('/notifications/unread-count').then(unwrap),
  markRead: (id) => api.patch(`/notifications/${id}/read`).then(unwrap),
  markAllRead: () => api.patch('/notifications/read-all').then(unwrap),
  remove: (id) => api.delete(`/notifications/${id}`).then(unwrap),
};
