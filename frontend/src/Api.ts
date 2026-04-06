import axios from 'axios';

// Create a centralized Axios instance for the Handrix backend
const api = axios.create({
  baseURL: 'http://localhost:3000', // Adjust in production
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach JWT token if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
