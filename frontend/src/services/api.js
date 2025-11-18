import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Invitation Card APIs
export const invitationAPI = {
  create: (data) => api.post('/invitations', data),
  getAll: () => api.get('/invitations'),
  getById: (cardId) => api.get(`/invitations/${cardId}`),
  update: (cardId, data) => api.put(`/invitations/${cardId}`, data),
  publish: (cardId) => api.post(`/invitations/${cardId}/publish`),
  delete: (cardId) => api.delete(`/invitations/${cardId}`),
};

// RSVP APIs
export const rsvpAPI = {
  submit: (data) => api.post('/rsvp', data),
  getForCard: (cardId) => api.get(`/rsvp/card/${cardId}`),
  checkRSVP: (cardId, email) => api.get(`/rsvp/check/${cardId}/${email}`),
};

// Health check
export const healthCheck = () => api.get('/health');

export default api;
