// src/api.js
import axios from "axios";
import { useAuthStore } from "./stores/authStore";

// Hybrid runtime config resolution order:
// 1. window.__RUNTIME_CONFIG__.API_BASE_URL (injected at deploy time)
// 2. Vite build-time env (import.meta.env.VITE_API_BASE_URL)
// 3. Fallback relative /api (same-origin deploy assumption)
function resolveBaseUrl() {
    const runtime = typeof window !== 'undefined' && window.__RUNTIME_CONFIG__?.API_BASE_URL;
    const envVar = import.meta.env.VITE_API_BASE_URL;
    let candidate = runtime || envVar || `${window.location.origin}/api`;
    if (candidate.endsWith('/')) candidate = candidate.slice(0, -1);
    // Warn if obviously misconfigured in production
    if (import.meta.env.PROD && /localhost|127\.0\.0\.1/.test(candidate)) {
        // eslint-disable-next-line no-console
        console.warn('[api] WARNING: API base seems to point to localhost in production build:', candidate);
    }
    return candidate;
}

const apiClient = axios.create({ baseURL: resolveBaseUrl() });

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

        if (!error.response || originalRequest._retry) {
            return Promise.reject(error);
        }

        // Langsung keluar jika status bukan 401
        if (error.response.status !== 401) {
            return Promise.reject(error);
        }

        const url = originalRequest.url || '';
        const isLoginAttempt = url.includes('/login');
        const isRefreshEndpoint = url.includes('/refresh');

        // Jangan coba refresh jika:
        // - Ini request login yang gagal
        // - Ini request refresh itu sendiri
        // - Tidak ada refresh token tersimpan
        if (isLoginAttempt || isRefreshEndpoint || !authStore.refreshTokenVal) {
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