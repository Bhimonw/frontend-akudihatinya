// src/config/api.js
// Centralized API configuration

export const API_CONFIG = {
  // Base URL from environment variable
  BASE_URL: import.meta.env.VITE_API_BASE_URL,
  
  // API endpoints
  ENDPOINTS: {
    LOGIN: '/login',
    LOGOUT: '/logout',
    REFRESH: '/auth/refresh',
    USER_ME: '/users/me',
    CHANGE_PASSWORD: '/change-password',
    ADMIN_USERS: '/admin/users',
    STATISTICS: '/statistics'
  },
  
  // Request timeout (in milliseconds)
  TIMEOUT: 10000,
  
  // Headers
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

// Helper function to build full URL
export const buildApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Helper function to get authorization header
export const getAuthHeader = (token) => {
  return token ? { Authorization: `Bearer ${token}` } : {};
};