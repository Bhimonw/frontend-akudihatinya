import { defineStore } from 'pinia';
import axios from '../api'; // Import Axios instance

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
    storedRefreshToken: null,
    isAdmin: false,
    isRefreshing: false, // Flag untuk menghindari race condition
    refreshSubscribers: [], // Queue untuk permintaan yang menunggu refresh token
  }),

  actions: {
    /**
     * Fungsi untuk login
     */
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
        console.log('API Response:', result);

        this.setUser(result);
        this.setupInterceptors();
      } catch (error) {
        throw error;
      }
    },

    /**
     * Fungsi untuk logout
     */
    logout() {
      this.$reset(); // Reset state ke nilai awal
      localStorage.clear(); // Hapus semua data dari localStorage
      this.removeInterceptors();
      window.location.href = '/auth/login'; // Redirect ke halaman login
    },

    /**
     * Fungsi untuk restore autentikasi saat aplikasi dimuat ulang
     */
    restoreAuth() {
      const token = localStorage.getItem('token');
      const refreshToken = localStorage.getItem('refresh_token');
      const user = localStorage.getItem('user');
      const isAdmin = localStorage.getItem('isadmin');

      if (token && refreshToken && user) {
        this.token = token;
        this.storedRefreshToken = refreshToken;
        this.user = JSON.parse(user);
        this.isAdmin = isAdmin === 'true';
        this.setupInterceptors();
      }
    },

    /**
     * Fungsi untuk menyimpan user setelah login atau restore
     */
    setUser(data) {
      console.log('Raw API response:', data);

      if (!data || !data.access_token || !data.access_token) {
        console.error('Invalid token data', data);
        return;
      }

      // Update state
      this.token = data.access_token;
      this.storedRefreshToken = data.refresh_token;
      this.user = data.user;
      this.isAdmin = data.user.role === 'admin';

      // Simpan ke localStorage
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('isadmin', this.isAdmin);

      console.log('State after update - refreshToken:', this.refreshToken);
    },

    /**
     * Fungsi untuk refresh token
     */
    async refreshToken() {
      try {
        const refreshTokenStored = this.storedRefreshToken || localStorage.getItem('refresh_token');
        const oldAccessToken = this.token || localStorage.getItem('token');

        if (!refreshTokenStored || !oldAccessToken) {
          throw new Error('Refresh token atau access token tidak ditemukan');
        }

        const response = await fetch('http://localhost:8000/api/refresh', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${oldAccessToken}`,
          },
          body: JSON.stringify({ refresh_token: refreshTokenStored }),
        });

        if (!response.ok) {
          throw new Error('Gagal memperbarui token');
        }

        const result = await response.json();
        console.log("Refresh token response:", result)
        this.setUser(result); // Update state dengan token baru
        return true;
      } catch (error) {
        console.error('Error refreshing token:', error);
        this.logout(); // Logout jika refresh gagal
        throw error;
      }
    },

    /**
     * Setup interceptor sekali saja untuk mencegah kebocoran memori
     */
    setupInterceptors() {
      this.removeInterceptors();
    
      // Request interceptor
      axios.interceptors.request.use(
        async (config) => {
          // Skip untuk request login atau refresh
          if (
            config.url.includes('/login') ||
            config.url.includes('/refresh')
          ) {
            return config;
          }
    
          const token = this.token || localStorage.getItem('token');
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
          return config;
        },
        (error) => Promise.reject(error)
      );
    
      // Response interceptor - Menangani 401 error
      axios.interceptors.response.use(
        (response) => response,
        async (error) => {
          if (error.response?.status === 401 && !error.config._retry) {
            error.config._retry = true;
    
            if (!this.isRefreshing) {
              this.isRefreshing = true;
    
              try {
                await this.refreshToken();
                this.isRefreshing = false;
    
                // Retry semua permintaan yang menunggu refresh token
                this.refreshSubscribers.forEach((callback) => callback(this.token));
                this.refreshSubscribers = [];
    
                // Retry permintaan asli
                error.config.headers.Authorization = `Bearer ${this.token}`;
                return axios(error.config);
              } catch (refreshError) {
                this.isRefreshing = false;
                //this.logout();
                return Promise.reject(refreshError);
              }
            } else {
              // Tambahkan permintaan ke queue jika sedang menunggu refresh token
              return new Promise((resolve, reject) => {
                this.refreshSubscribers.push((newToken) => {
                  error.config.headers.Authorization = `Bearer ${newToken}`;
                  resolve(axios(error.config));
                });
              });
            }
          }
    
          return Promise.reject(error);
        }
      );
    },

    /**
     * Hapus interceptor saat logout
     */
    removeInterceptors() {
      axios.interceptors.request.eject(this.requestInterceptorId);
      axios.interceptors.response.eject(this.responseInterceptorId);
    },
  },
});

/**
 * Helper functions untuk mendapatkan state auth
 */
export const getAuthState = () => {
  const authStore = useAuthStore();
  return {
    token: authStore.token,
    isAdmin: authStore.isAdmin,
  };
};

export const isAdmin = () => {
  const authStore = useAuthStore();
  return authStore.isAdmin;
};