import api from './index';
export const jobAPI = {
  getAll: (params) => api.get('/jobs', { params }),
  getById: (id) => api.get(`/jobs/${id}/byworker`),
  getHistory: (id) => api.get(`/jobs/${id}/history`),
  reassign: (id, workerId) => api.put(`/jobs/${id}/reassign`, { workerId }),
  cancel: (id, data = {}) => api.put(`/jobs/${id}/cancel`, data),
};
export default jobAPI;
