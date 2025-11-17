import axios, { AxiosHeaders } from 'axios';

const { VITE_API_BASE_URL } = import.meta.env;

if (!VITE_API_BASE_URL) {
  throw new Error('VITE_API_BASE_URL is not defined. Please set it in your environment configuration.');
}

export const API_BASE_URL = VITE_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
  (config) => {
    const headers =
      config.headers instanceof AxiosHeaders
        ? config.headers
        : new AxiosHeaders(config.headers || {});

    const token = localStorage.getItem('token');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    } else {
      console.warn('[api interceptor] No token available for request:', config.url);
    }

    // Ensure we don't force JSON when posting FormData (uploads)
    if (config.data instanceof FormData) {
      headers.delete('Content-Type');
    } else if (!headers.get('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    config.headers = headers;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => {
    // Log successful responses for debugging
    if (response.config.url?.includes('/user-posts')) {
      console.log('[api interceptor] Success response from /user-posts:', {
        status: response.status,
        dataLength: Array.isArray(response.data) ? response.data.length : 'not array',
        data: response.data
      });
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
