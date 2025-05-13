// src/stores/tokenManager.js
import { authService } from './auth.js';

// Interval waktu untuk memeriksa token (dalam milidetik)
// 5 menit = 300000 ms
const TOKEN_CHECK_INTERVAL = 60000;

class TokenManager {
  constructor() {
    this.intervalId = null;
  }

  // Mulai pemeriksaan token secara berkala
  startTokenRefresher() {
    // Bersihkan interval sebelumnya jika ada
    this.stopTokenRefresher();
    
    // Set interval baru
    this.intervalId = setInterval(() => {
      this.checkAndRefreshToken();
    }, TOKEN_CHECK_INTERVAL);
    
    // Juga periksa segera saat aplikasi dimulai
    this.checkAndRefreshToken();
    
    console.log('Token refresher started');
  }

  // Hentikan pemeriksaan token
  stopTokenRefresher() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('Token refresher stopped');
    }
  }

  // Periksa dan refresh token jika diperlukan
  async checkAndRefreshToken() {
    const token = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refresh_token');
    
    if (!token || !refreshToken) {
      this.stopTokenRefresher();
      return;
    }
    
    try {
      // Sebagai optimasi, kita bisa melakukan refresh token
      // tanpa perlu memeriksa validitas token terlebih dahulu
      // Ini akan mengurangi jumlah API call dan waktu yang dibutuhkan
      
      // Jika token mendekati kadaluarsa atau sudah kadaluarsa
      // akan ditangani dengan refresh token secara otomatis
      console.log('Proactively refreshing token...');
      await authService.refreshToken();
    } catch (error) {
      console.error('Failed to refresh token:', error);
      // Jika gagal, mungkin refreshToken juga kadaluarsa
      // authService.logout() akan dipanggil dalam refreshToken() jika diperlukan
    }
  }
}

export const tokenManager = new TokenManager();