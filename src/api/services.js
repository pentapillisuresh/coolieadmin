import api from './index';

export const serviceAPI = {
  getAll: (params) => api.get('/services', { params }),
  getById: (id) => api.get(`/services/${id}`),
  create: (data) => api.post('/services', data),
  update: (id, data) => api.put(`/services/${id}`, data),
  delete: (id) => api.delete(`/services/${id}`),
  toggleStatus: (id) => api.patch(`/services/${id}/toggle`),
  getTop: (params) => api.get('/services/top', { params }),
};

export default serviceAPI;