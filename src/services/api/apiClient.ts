import axios from 'axios';

// In dev mode with Vite proxy, use relative paths so requests go through the proxy.
// In production or if VITE_API_URL is set explicitly, use that absolute URL.
const BASE_URL = import.meta.env.VITE_API_URL || '';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach Auth token if available
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('fedtrust_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

