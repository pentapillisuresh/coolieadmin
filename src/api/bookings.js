import api from './index';

export const bookingAPI = {
  getAll: (params) => api.get('/bookings', { params }),
  getById: (id) => api.get(`/bookings/${id}`),
  assignWorker: (id, data) => api.post(`/bookings/${id}/assign`, data),
  reassignWorker: (id, data) => api.put(`/bookings/${id}/reassign`, data),
  cancel: (id, data) => api.put(`/bookings/${id}/cancel`, data),
  getTimeline: (id) => api.get(`/bookings/${id}/timeline`),
};

export default bookingAPI;