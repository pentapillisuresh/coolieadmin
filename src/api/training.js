import api from './index';

export const trainingAPI = {
  getAll: (params) => api.get('/training', { params }),
  getById: (id) => api.get(`/training/${id}`),
  create: (data) => api.post('/training', data),
  update: (id, data) => api.put(`/training/${id}`, data),
  delete: (id) => api.delete(`/training/${id}`),
  addVideo: (trainingId, data) => api.post(`/training/${trainingId}/videos`, data),
  updateVideo: (videoId, data) => api.put(`/training/videos/${videoId}`, data),
  deleteVideo: (videoId) => api.delete(`/training/videos/${videoId}`),
  createQuiz: (trainingId, data) => api.post(`/training/${trainingId}/quiz`, data),
  addQuestion: (quizId, data) => api.post(`/training/quiz/${quizId}/questions`, data),
};

export default trainingAPI;