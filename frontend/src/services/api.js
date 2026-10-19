import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor to attach JWT token for authenticated organizer requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('eventhub_admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Public Endpoints ─────────────────────────────────────────
export const getEvents = () => API.get('/events');
export const getEvent = (id) => API.get(`/events/${id}`);
export const registerForEvent = (data) => API.post('/register', data);
export const getMyRegistrations = (email) =>
  API.get(`/my-registrations?email=${encodeURIComponent(email)}`);
export const cancelRegistration = (id) => API.delete(`/registrations/${id}`);

// ── Organizer/Admin Endpoints ────────────────────────────────
export const adminLogin = (credentials) => API.post('/admin/login', credentials);
export const getAdminProfile = () => API.get('/admin/me');
export const getAdminStats = () => API.get('/admin/stats');
export const getAdminRegistrations = () => API.get('/admin/registrations');
export const deleteAdminRegistration = (id) => API.delete(`/admin/registrations/${id}`);
export const createAdminEvent = (eventData) => API.post('/admin/events', eventData);
export const updateAdminEvent = (id, eventData) => API.put(`/admin/events/${id}`, eventData);
export const deleteAdminEvent = (id) => API.delete(`/admin/events/${id}`);

export default API;
