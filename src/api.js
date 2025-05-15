// src/api.js
import axios from "axios";
import { authService } from "./stores/auth.js";

const apiClient = axios.create({
  baseURL: "http://localhost:8000/api",
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Tambahkan token ke semua request
apiClient.interceptors.request.use(
  config => {
    // Skip authorization header for login/refresh endpoints
    if (config.url.includes('/login') || config.url.includes('/refresh')) {
      return config;
    }
    
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Handle 401 responses dengan refresh token
apiClient.interceptors.response.use(
  response => response,
  async (error) => {
    const originalRequest = error.config;

    // Jika error bukan 401 atau request sudah pernah retry, reject langsung
    if (!error.response || error.response.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Tandai request ini sebagai sudah di-retry
    originalRequest._retry = true;

    // Jika proses refresh sedang berlangsung, tambahkan request ke antrian
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(token => {
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          return apiClient(originalRequest);
        })
        .catch(err => Promise.reject(err));
    }

    // Mulai proses refresh token
    isRefreshing = true;

    try {
      console.log("Token expired, attempting refresh from API interceptor");
      const newToken = await authService.refreshToken();
      
      // Proses berhasil, update token untuk request original dan antrian
      processQueue(null, newToken);
      originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
      
      return apiClient(originalRequest);
    } catch (refreshError) {
      // Proses refresh gagal, reject semua request dalam antrian
      processQueue(refreshError, null);
      
      // Cek apakah error disebabkan oleh refresh token yang expired
      if (refreshError.response && 
          (refreshError.response.status === 401 || 
           refreshError.response.data?.message?.includes('expired'))) {
        console.error("Refresh token expired, redirecting to login");
        authService.logout(); // Ini akan mengarahkan ke halaman login
      }
      
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default apiClient;