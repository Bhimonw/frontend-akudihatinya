// src/stores/tokenManager.js
import { authService } from './auth.js';

// Interval waktu untuk memeriksa token (dalam milidetik)
// 30 menit = 1800000 ms
const TOKEN_CHECK_INTERVAL = 1800000;

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
    
    // Hapus pemanggilan langsung saat aplikasi dimulai
    // this.checkAndRefreshToken(); -- Hapus atau komentari baris ini
    
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
      // Periksa validitas token terlebih dahulu
      const isTokenValid = await authService.validateToken();
      
      // Hanya refresh jika token tidak valid
      if (!isTokenValid) {
        console.log('Token tidak valid, melakukan refresh...');
        await authService.refreshToken();
      } else {
        console.log('Token masih valid, tidak perlu refresh');
      }
    } catch (error) {
      console.error('Failed to refresh token:', error);
    }
  }
}

export const tokenManager = new TokenManager();