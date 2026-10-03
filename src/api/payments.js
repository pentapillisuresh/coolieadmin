import api from './index';

export const paymentAPI = {
  getReport: (params) => api.get('/payments/report', { params }),
  refund: (bookingId, data) => api.post(`/payments/booking/${bookingId}/refund`, data),
};

export default paymentAPI;