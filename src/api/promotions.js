import api from './index';

export const promotionAPI = {
  getAll: (params) => api.get('/promotions/admin/all', { params }),
  getById: (id) => api.get(`/promotions/${id}`),
  create: (data) => api.post('/promotions', data),
  update: (id, data) => api.put(`/promotions/${id}`, data),
  delete: (id) => api.delete(`/promotions/${id}`),
};

export default promotionAPI;