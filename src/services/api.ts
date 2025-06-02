import axios from 'axios';

// Create axios instance with defaults
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'An error occurred';
    console.error('API Error:', message);
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  sendOTP: async (type: 'email' | 'phone', value: string) => {
    const response = await api.post('/auth/send-otp', { type, value });
    return response.data;
  },
  
  verifyOTP: async (type: 'email' | 'phone', value: string, otp: string) => {
    const response = await api.post('/auth/verify-otp', { type, value, otp });
    return response.data;
  },
  
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
  
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Export other API services...
export { chatAPI, formsAPI, ekycAPI, digiLockerAPI } from './api.services';
export default api;