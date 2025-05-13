
// src/stores/auth.js
import axios from 'axios';

class AuthService {
  constructor() {
    this.isRefreshing = false;
    this.refreshSubscribers = [];
    this.requestInterceptorId = null;
    this.responseInterceptorId = null;
  }
    // Get current token
  getToken() {
    return localStorage.getItem('token');
  }

  // Get current auth state from localStorage
  getAuthState() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    const isAdmin = localStorage.getItem('isadmin') === 'true';
    
    return {
      token,
      user: user ? JSON.parse(user) : null,
      isAdmin,
      refreshToken: localStorage.getItem('refresh_token')
    };
  }

  // Login method
  async login(username, password) {
    try {
      const response = await fetch('http://localhost:8000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(JSON.stringify(errorData));
      }

      const result = await response.json();
      console.log('API Login Response:', result);

      this.setUser(result);
      this.setupInterceptors();
      
      return result;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Logout method
  logout() {
    // Clear all localStorage data
    localStorage.clear();
    
    // Remove interceptors
    this.removeInterceptors();
    
    // Reset internal state
    this.isRefreshing = false;
    this.refreshSubscribers = [];
    
    // Redirect to login
    window.location.href = '/auth/login';
  }

  // Store user data in localStorage
  setUser(data) {
    console.log('Setting user data:', data);

    if (!data) {
      console.error('Invalid user data: data is null or undefined');
      return;
    }

    if (!data.access_token) {
      console.error('Invalid token data: missing access_token', data);
      return;
    }

    if (!data.refresh_token) {
      console.error('Invalid token data: missing refresh_token', data);
      return;
    }

    // Save to localStorage
    localStorage.setItem('token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);

    if (data.user) {
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('isadmin', data.user.role === 'admin' ? 'true' : 'false');
    } else {
      console.warn('User data is missing in the response');
    }

    console.log('Data saved to localStorage successfully');
  }

  // Refresh token method with optimizations
  async refreshToken() {
    try {
      const refreshTokenStored = localStorage.getItem('refresh_token');
      
      if (!refreshTokenStored) {
        throw new Error('Refresh token tidak ditemukan');
      }

      console.log("Attempting to refresh token...");
      
      // Gunakan fetch API yang lebih ringan daripada axios untuk refresh token
      // Ini dapat mengurangi overhead dan membuat proses lebih cepat
      const response = await fetch('http://localhost:8000/api/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshTokenStored }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Refresh token API error:", errorData);
        throw new Error('Gagal memperbarui token: ' + (errorData.message || response.statusText));
      }

      const result = await response.json();
      console.log("Refresh token successful, new token received");
      
      this.setUser(result);
      return result.access_token;
    } catch (error) {
      console.error('Error refreshing token:', error);
      // Logout hanya jika error bukan dari network issues
      if (!(error instanceof TypeError && error.message.includes('Failed to fetch'))) {
        this.logout();
      }
      throw error;
    }
  }
  
  // Setup Axios interceptors
  setupInterceptors() {
    this.removeInterceptors();

    const axiosInstance = axios.create({
      baseURL: "http://localhost:8000/api"
    });

    // Request interceptor
    this.requestInterceptorId = axiosInstance.interceptors.request.use(
      async (config) => {
        // Skip untuk request login atau refresh
        if (
          config.url.includes('/login') ||
          config.url.includes('/refresh')
        ) {
          return config;
        }

        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - Handle 401 errors
    this.responseInterceptorId = axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          if (!this.isRefreshing) {
            this.isRefreshing = true;
            
            try {
              const newToken = await this.refreshToken();
              
              // Update the Authorization for the original request
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              
              // Process other queued requests
              this.refreshSubscribers.forEach(callback => callback(newToken));
              this.refreshSubscribers = [];
              
              this.isRefreshing = false;
              
              // Retry the original request with the new token
              return axiosInstance(originalRequest);
            } catch (refreshError) {
              this.isRefreshing = false;
              this.refreshSubscribers = [];
              this.logout();
              return Promise.reject(refreshError);
            }
          } else {
            // If refresh is already in progress, add the request to the queue
            return new Promise((resolve, reject) => {
              this.refreshSubscribers.push(newToken => {
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                resolve(axiosInstance(originalRequest));
              });
            });
          }
        }
        
        return Promise.reject(error);
      }
    );
    
    // Replace global axios instance
    axios.defaults.baseURL = axiosInstance.defaults.baseURL;
    Object.assign(axios, axiosInstance);
  }

  // Remove interceptors
  removeInterceptors() {
    if (this.requestInterceptorId !== null) {
      axios.interceptors.request.eject(this.requestInterceptorId);
      this.requestInterceptorId = null;
    }
    if (this.responseInterceptorId !== null) {
      axios.interceptors.response.eject(this.responseInterceptorId);
      this.responseInterceptorId = null;
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!localStorage.getItem('token');
  }

  // Check if user is admin
  isAdmin() {
    return localStorage.getItem('isadmin') === 'true';
  }

  // Get current user
  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  // Validasi token dengan API call
  async validateToken() {
    try {
      // Panggil endpoint yang membutuhkan autentikasi
      const token = localStorage.getItem('token');
      
      if (!token) {
        return false;
      }
      
      // Request ke endpoint user untuk memvalidasi token
      // Sesuaikan dengan endpoint API Anda
      const response = await axios.get('http://localhost:8000/api/users/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      return response.status === 200;
    } catch (error) {
      if (error.response?.status === 401) {
        console.log("Token tidak valid, perlu refresh");
        // Token tidak valid, tapi tidak perlu refresh di sini
        // karena akan ditangani oleh interceptor
        return false;
      }
      
      console.error("Validasi token error:", error);
      return false; // Error lain
    }
  }
}

// Export singleton instance
export const authService = new AuthService();

// Helper functions for backward compatibility
export const getAuthState = () => authService.getAuthState();
export const isAdmin = () => authService.isAdmin();

export async function initAuth() {
  // Jangan cek autentikasi jika di halaman login
  if (window.location.pathname === '/auth/login') {
    return;
  }

  const token = localStorage.getItem('token');
  const refreshToken = localStorage.getItem('refresh_token');

  // Setup interceptors if there's a token
  if (token) {
    authService.setupInterceptors();
  }

  try {
    // Tidak ada token dan refresh token, arahkan ke login
    if (!token && !refreshToken) {
      window.location.href = '/auth/login';
      return;
    }

    // Jika ada token, validasi dengan API
    if (token) {
      const isTokenValid = await authService.validateToken();
      
      if (!isTokenValid && refreshToken) {
        // Token tidak valid, coba refresh
        console.log("Token tidak valid, mencoba refresh...");
        await authService.refreshToken();
      } else if (!isTokenValid) {
        // Token tidak valid dan tidak ada refresh token
        console.log("Token tidak valid dan tidak ada refresh token");
        authService.logout();
      } else {
        console.log("Token valid, melanjutkan aplikasi");
      }
    } 
    // Jika hanya ada refresh token, coba refresh
    else if (refreshToken) {
      try {
        console.log("No access token, but refresh token exists. Attempting to refresh...");
        await authService.refreshToken();
      } catch (refreshError) {
        console.error("Failed to refresh token:", refreshError);
        authService.logout();
      }
    }
  } catch (err) {
    console.error("Authentication check failed", err);
    authService.logout();
  }
}