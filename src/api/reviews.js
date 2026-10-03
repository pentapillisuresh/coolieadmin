import api from './index';
export const reviewAPI = {
  getAll: (params) => api.get('/reviews', { params }),
  getWorkerReviews: (workerId, params) => api.get(`/reviews/worker/${workerId}`, { params }),
  delete: (id) => api.delete(`/reviews/${id}`),
};
export default reviewAPI;
