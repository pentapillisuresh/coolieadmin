import api from './index';
export const ticketAPI = {
  getAll: (params) => api.get('/tickets', { params }),
  getById: (id) => api.get(`/tickets/${id}`),
  updateStatus: (id, data) => api.put(`/tickets/${id}/status`, data),
  reply: (id, data) => api.post(`/tickets/${id}/reply`, data),
  assign: (id, data) => api.put(`/tickets/${id}/assign`, data),
  stats: () => api.get('/tickets/stats'),
};
export default ticketAPI;
