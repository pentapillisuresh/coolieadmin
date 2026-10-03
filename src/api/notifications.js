import api from './index';
export const notificationAPI = {
  send: (data) => api.post('/notifications', data),
  getMine: (params) => api.get('/notifications', { params }),
};
export default notificationAPI;
