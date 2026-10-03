import api from './index';

export const workerAPI = {
  getAll: (params) => api.get('/workers', { params }),
  getById: (id) => api.get(`/workers/${id}`),
  getFullDetails: (id) => api.get(`/workers/admin/${id}/full`),
  verify: (id) => api.put(`/workers/${id}/verify`),
  verifyBank: (id) => api.put(`/workers/${id}/bank/verify`),
  delete: (id) => api.delete(`/workers/${id}`),
  getProfessions: () => api.get('/workers/professions'),
  getStats: () => api.get('/workers/stats'),
};

export default workerAPI;