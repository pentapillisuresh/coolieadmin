import api from './index';
export const documentAPI = {
  getAll: (params) => api.get('/documents', { params }),
  getById: (id) => api.get(`/documents/${id}`),
  verify: (id) => api.patch(`/documents/${id}/verify`),
  delete: (id) => api.delete(`/documents/${id}`),
};
export default documentAPI;
