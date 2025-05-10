import { defineStore } from 'pinia';
import apiClient from '../api';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    isAdmin: localStorage.getItem('isAdmin') === 'true',
    isAuthenticated: localStorage.getItem('isLoggedIn') === 'true',
    isCheckingAuth: false, // Flag untuk tracking status pengecekan auth
    csrfTokenFetched: false, // Flag untuk tracking pengambilan CSRF token
  }),

  actions: {
    async login(username, password) {
      try {
        // Dapatkan CSRF cookie terlebih dahulu (jika belum)
        if (!this.csrfTokenFetched) {
          await this.fetchCsrfToken();
        }

        // Kirim request login
        const response = await apiClient.post('/api/login', {
          username,
          password
        });

        // Simpan data user
        this.setUser(response.data.user);
        
        // Tandai bahwa user sudah terotentikasi
        this.isAuthenticated = true;

        return response.data;
      } catch (error) {
        throw error?.response?.data || error;
      }
    },

    async logout() {
      try {
        await apiClient.post('/api/logout');
      } finally {
        this.clearAuth();
        window.location.href = '/auth/login';
      }
    },

    setUser(userData) {
      if (!userData) {
        console.error('Invalid user data');
        return;
      }

      this.user = userData;
      this.isAdmin = userData.role === 'admin';
      this.isAuthenticated = true;
      
      // Simpan data ke localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('isAdmin', this.isAdmin.toString());
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userRole', userData.role);
    },

    clearAuth() {
      // Hapus data dari localStorage
      localStorage.removeItem('user');
      localStorage.removeItem('isAdmin');
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userRole');
      
      // Reset state
      this.user = null;
      this.isAdmin = false;
      this.isAuthenticated = false;
      this.csrfTokenFetched = false;
    },

    async fetchUserData() {
      try {
        // Dapatkan CSRF cookie terlebih dahulu (jika belum)
        if (!this.csrfTokenFetched) {
          await this.fetchCsrfToken();
        }
        
        const response = await apiClient.get('/api/users/me');
        
        if (response.data && response.data.user) {
          this.setUser(response.data.user);
          return response.data;
        }
        return null;
      } catch (error) {
        console.error('Error fetching user data:', error);
        
        // Jika error 401, hapus data auth
        if (error.response && error.response.status === 401) {
          this.clearAuth();
        }
        
        return null;
      }
    },

    async checkAuth() {
      // Mencegah pemeriksaan bersamaan
      if (this.isCheckingAuth) {
        return this.isAuthenticated;
      }
      
      this.isCheckingAuth = true;
      
      try {
        // Jika sudah terotentikasi di state, periksa di server
        if (this.isAuthenticated) {
          // Dapatkan CSRF cookie terlebih dahulu (jika belum)
          if (!this.csrfTokenFetched) {
            await this.fetchCsrfToken();
          }
          
          // Verifikasi di server
          const response = await apiClient.get('/api/auth/check');
          
          // Jika tidak terotentikasi di server, hapus data lokal
          if (!response.data.authenticated) {
            this.clearAuth();
            this.isCheckingAuth = false;
            return false;
          }
          
          // Jika server mengembalikan user data (opsional)
          if (response.data.user) {
            this.setUser(response.data.user);
          }
          
          this.isCheckingAuth = false;
          return true;
        }
        
        // Jika belum terotentikasi di state, coba dapatkan data user
        const userData = await this.fetchUserData();
        this.isCheckingAuth = false;
        return !!userData;
      } catch (error) {
        console.error('Error checking auth status:', error);
        this.clearAuth();
        this.isCheckingAuth = false;
        return false;
      }
    },
    
    async fetchCsrfToken() {
      if (this.csrfTokenFetched) return;
      
      await apiClient.get('/sanctum/csrf-cookie');
      this.csrfTokenFetched = true;
    },
  },
});