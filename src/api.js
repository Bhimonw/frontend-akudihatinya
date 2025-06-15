// src/api.js
import axios from "axios";
import { useAuthStore } from "./stores/authStore";

const apiClient = axios.create({
  baseURL: "http://localhost:8000/api",
});

apiClient.interceptors.request.use(
  config => {
    const authStore = useAuthStore(); // Akses store di dalam interceptor
    if (config.url.includes('/login') || config.url.includes('/refresh')) {
      return config;
    }
    
    const token = authStore.accessToken; // Ambil dari store
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

apiClient.interceptors.response.use(
  response => response,
  async (error) => {
    const authStore = useAuthStore(); // Akses store
    const originalRequest = error.config;

    if (!error.response || error.response.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Hindari refresh loop untuk endpoint /refresh itu sendiri
    if (originalRequest.url.includes('/refresh')) {
        authStore.logout(); // Gagal refresh token, langsung logout
        return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (authStore.isRefreshingToken) { // Gunakan flag dari store
      return new Promise((resolve, reject) => {
        authStore.failedQueue.push({ resolve, reject }); // Gunakan queue dari store
      })
        .then(token => {
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          return apiClient(originalRequest);
        })
        .catch(err => Promise.reject(err));
    }

    try {
      console.log("Token expired, attempting refresh from API interceptor");
      const newToken = await authStore.performRefresh(); // Panggil dari store
      originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
        // performRefresh di store sudah handle logout jika gagal total
      console.error("Refresh error caught in interceptor, logout should have been handled by authStore.performRefresh");
      return Promise.reject(refreshError);
    }
  }
);

export default apiClient;