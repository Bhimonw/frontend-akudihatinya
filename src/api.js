import axios from "axios";
import { useAuthStore } from "../src/stores/auth.js"; // Import store auth

const apiClient = axios.create({
  baseURL: "http://localhost:8000/api",
});

// Request Interceptor
apiClient.interceptors.request.use(
  async (config) => {
    const authStore = useAuthStore();
    const token = authStore.token || localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = (callback) => {
  refreshSubscribers.push(callback);
};

const onTokenRefreshed = (newToken) => {
  refreshSubscribers.forEach((callback) => callback(newToken));
  refreshSubscribers = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const authStore = useAuthStore();
    console.log("Interceptor detected error:", error); // Debugging
    if (error.response?.status === 401 && !error.config._retry) {
      console.log("401 detected, attempting to refresh token..."); // Debugging
      error.config._retry = true;
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          await authStore.refreshToken();
          isRefreshing = false;
          onTokenRefreshed(authStore.token);
          error.config.headers.Authorization = `Bearer ${authStore.token}`;
          return apiClient(error.config); // Retry request with new token
        } catch (refreshError) {
          isRefreshing = false;
          //authStore.logout(); // Logout jika refresh token gagal
          return Promise.reject(refreshError);
        }
      } else {
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((newToken) => {
            error.config.headers.Authorization = `Bearer ${newToken}`;
            resolve(apiClient(error.config));
          });
        });
      }
    }
    return Promise.reject(error);
  }
);
export default apiClient;