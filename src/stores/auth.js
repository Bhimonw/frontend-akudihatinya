import { defineStore } from 'pinia';
import axios from '../api'; // Import Axios instance

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    isAdmin: false,
    isRefreshing: false, // Flag untuk menghindari race condition
    refreshSubscribers: [], // Queue untuk permintaan yang menunggu refresh token
  }),

  actions: {
    async login(username, password) {
      try {
        const response = await fetch('http://localhost:8000/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
          credentials: 'include',
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(JSON.stringify(errorData));
        }

        const result = await response.json();
        console.log('API Response:', result);

        this.setUser(result);
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userRole', this.user.role);

        return result;
      } catch (error) {
        throw error;
      }
    },

    logout() {
      this.$reset(); // Reset state ke nilai awal

      // Hapus status login dari localStorage
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userRole');

       // Hapus cookie dengan request ke backend
       fetch('http://localhost:8000/api/logout', {
        method: 'POST',
        credentials: 'include',
      }).finally(() => {
        window.location.href = '/auth/login';
      });
    },

    /**
     * Fungsi untuk menyimpan user setelah login atau restore
     */
    setUser(data) {

      if (!data || !data.user) {
        console.error('Invalid user data', data);
        return;
      }

      // Update state
      this.user = data.user;
      this.isAdmin = data.user.role === 'admin';

      console.log('State after update - refreshToken:', this.user, this.isAdmin);
    },

    /**
     * Fungsi untuk refresh token
     */
    async refreshToken() {
      try {
        const response = await fetch('http://localhost:8000/api/refresh', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
        if (!response.ok) {
          throw new Error('Gagal memperbarui token');
        }

        const result = await response.json();
        console.log("Refresh token response:", result)

       // Update user info if available
        if (result.user) {
          this.setUser(result);
        }
        return true;

      } catch (error) {
        console.error('Error refreshing token:', error);
        this.logout(); // Logout jika refresh gagal
        throw error;
      }
    },

    async fetchUserData() {
      try {
        const response = await axios.get('users/me');
        if (response.data && response.data.user) {
          this.setUser({
            user: response.data.user
          });
          return response.data;
        }
        return null;
      } catch (error) {
        console.error('Error fetching user data:', error);
        return null;
      }
    },
    
    checkAuth() {
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
      const userRole = localStorage.getItem('userRole');
      
      this.isAdmin = userRole === 'admin';
      
      return isLoggedIn;
    }
  },
});

/**
 * Helper functions untuk mendapatkan state auth
 */
export const getAuthState = () => {
  const authStore = useAuthStore();
  return {
    token: document.cookie.includes('access_token'), // Cek keberadaan cookie saja
    isAdmin: authStore.isAdmin,
  };
};

export const isAdmin = () => {
  const authStore = useAuthStore();
  return authStore.isAdmin;
};