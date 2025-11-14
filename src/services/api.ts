import axios from 'axios';

const { VITE_API_BASE_URL } = import.meta.env;

if (!VITE_API_BASE_URL) {
  throw new Error('VITE_API_BASE_URL is not defined. Please set it in your environment configuration.');
}

export const API_BASE_URL = VITE_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper function to get fresh token from Firebase
const getFreshToken = async (): Promise<string | null> => {
  try {
    // Import auth dynamically to avoid circular dependencies
    const { auth } = await import('./firebase');
    const currentUser = auth.currentUser;
    if (currentUser) {
      // Force token refresh to get a new token
      const token = await currentUser.getIdToken(true);
      localStorage.setItem('token', token);
      return token;
    }
    return null;
  } catch (error) {
    console.error('Error getting fresh token:', error);
    return null;
  }
};

// Add a request interceptor to include the auth token
api.interceptors.request.use(
  async (config) => {
    let token = localStorage.getItem('token');
    
    // If no token, try to get a fresh one from Firebase
    if (!token) {
      console.log('[api interceptor] No token in localStorage, fetching fresh token...');
      token = await getFreshToken();
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      // Log token info (first 20 chars only for security)
      console.log(`[api interceptor] Adding token to request: ${token.substring(0, 20)}... (URL: ${config.url})`);
    } else {
      console.warn('[api interceptor] No token available for request:', config.url);
    }
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
  async (error) => {
    const originalRequest = error.config;

    // Log error details
    if (error.config?.url?.includes('/user-posts')) {
      console.error('[api interceptor] Error from /user-posts:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
    }

    // If we get a 401 and haven't already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log('[api interceptor] Got 401, attempting token refresh...');
      originalRequest._retry = true;

      try {
        // Try to get a fresh token
        const newToken = await getFreshToken();
        
        if (newToken) {
          console.log('[api interceptor] Got fresh token, retrying request...');
          // Update the authorization header with the new token
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          // Retry the original request with the new token
          return api(originalRequest);
        } else {
          console.warn('[api interceptor] No user logged in, redirecting to login');
          // No user logged in, redirect to login
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
      } catch (refreshError) {
        console.error('[api interceptor] Token refresh failed:', refreshError);
        // Token refresh failed, redirect to login
        localStorage.removeItem('token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
