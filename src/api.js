import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:8000",
  withCredentials: true, // Penting: Memastikan cookie dikirim dengan setiap request
  headers: {
    'X-Requested-With': 'XMLHttpRequest', // Penting untuk Laravel Sanctum
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

// Request Interceptor
apiClient.interceptors.request.use(
  async (config) => {
    // Jika route bukan /sanctum/csrf-cookie atau /api/login, 
    // tambahkan header Authorization jika ada token
    if (!config.url.includes('/sanctum/csrf-cookie') && 
        !config.url.includes('/api/login')) {
      // Tambahkan header khusus jika diperlukan
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Cek apakah error adalah 401 (Unauthenticated)
    if (error.response && error.response.status === 401) {
      // Jika user sudah login (menurut localStorage)
      if (localStorage.getItem('isLoggedIn') === 'true') {
        // Hapus data auth dari localStorage
        localStorage.removeItem('user');
        localStorage.removeItem('isAdmin');
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userRole');
        
        // Redirect ke halaman login
        window.location.href = '/auth/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;