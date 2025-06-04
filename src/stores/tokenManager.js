// src/stores/tokenManager.js
import { useAuthStore } from './authStore.js';

const TOKEN_CHECK_INTERVAL = 1800000; // 30 menit
const TOKEN_EXPIRY_THRESHOLD = 5 * 60 * 1000; // Refresh 5 menit sebelum kedaluwarsa

// Fungsi helper untuk mendekode JWT (ambil dari authStore atau definisikan di sini)
function decodeJwt(token) {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        console.error("Failed to decode JWT", e);
        return null;
    }
}

class TokenManager {
  constructor() {
    this.intervalId = null;
  }

  startTokenRefresher() {
    this.stopTokenRefresher();
    const authStore = useAuthStore(); // Dapatkan instance store
    if (!authStore.isAuthenticated) { // Jangan mulai jika tidak ada auth awal
        console.log('Token refresher not started: user not authenticated.');
        return;
    }
    
    this.intervalId = setInterval(() => {
      this.checkAndRefreshTokenIfNeeded();
    }, TOKEN_CHECK_INTERVAL); // Cek setiap 30 menit apakah perlu refresh
    console.log('Token refresher started.');
    // Pertimbangkan untuk menjalankan checkAndRefreshTokenIfNeeded sekali saat start jika perlu
    // this.checkAndRefreshTokenIfNeeded();
  }

  stopTokenRefresher() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('Token refresher stopped');
    }
  }

  async checkAndRefreshTokenIfNeeded() {
    const authStore = useAuthStore();
    
    if (!authStore.accessToken || !authStore.refreshTokenVal) {
      console.log('Token refresher: No tokens found, stopping.');
      this.stopTokenRefresher();
      authStore.logout(); // Pastikan logout jika token hilang
      return;
    }

    const decodedToken = decodeJwt(authStore.accessToken);
    if (decodedToken && decodedToken.exp) {
        const expiryTime = decodedToken.exp * 1000;
        const currentTime = Date.now();
        if (expiryTime > currentTime + TOKEN_EXPIRY_THRESHOLD) {
            console.log('Token Manager: Access token is still valid and not near expiry.');
            return; // Token masih valid dan belum dekat kedaluwarsa
        }
        console.log('Token Manager: Access token is expired or near expiry.');
    } else {
        // Jika tidak bisa decode atau tidak ada exp, mungkin validasi dengan API tetap diperlukan
        // Atau asumsikan perlu refresh jika tidak ada info expiry
        console.warn('Token Manager: Could not decode token or no expiry info, proceeding with API validation/refresh logic.');
        // Opsional: lakukan validasi API jika tidak ada info expiry
        // const isTokenValid = await authStore.validateCurrentToken();
        // if (isTokenValid) {
        //     console.log('Token Manager: Token validated by API, no refresh needed yet.');
        //     return;
        // }
    }
    
    try {
      console.log('Token Manager: Attempting to refresh token.');
      await authStore.performRefresh();
        console.log('Token Manager: Token refreshed successfully.');
    } catch (error) {
      console.error('Token Manager: Failed to refresh token:', error.message);
        // performRefresh di authStore akan menangani logout jika gagal
    }
  }
}

export const tokenManager = new TokenManager();