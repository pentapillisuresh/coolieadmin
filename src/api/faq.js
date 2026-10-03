import api from './index';

export const faqAPI = {
  getAll: (params) => api.get('/faq', { params }),
  getById: (id) => api.get(`/faq/${id}`),
  create: (data) => api.post('/faq', data),
  update: (id, data) => api.put(`/faq/${id}`, data),
  delete: (id) => api.delete(`/faq/${id}`),
};

export default faqAPI;