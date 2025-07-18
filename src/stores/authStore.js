// src/stores/authStore.js
import { defineStore } from 'pinia';
import axios from 'axios';
import apiClient from '../api'; // Sesuaikan path jika perlu
import router from '../router'; // Untuk navigasi terprogram

// Fungsi helper untuk mendekode JWT (sederhana, bisa pakai library seperti jwt-decode)
function decodeJwt(token) {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        return null;
    }
}

export const useAuthStore = defineStore('auth', {
    state: () => ({
        accessToken: localStorage.getItem('token') || null,
        refreshTokenVal: localStorage.getItem('refresh_token') || null,
        user: JSON.parse(localStorage.getItem('user') || 'null'),
        isAdminRole: localStorage.getItem('isadmin') === 'true',
        isLoadingAuth: true, // Mulai dengan true untuk loading awal
        isRefreshingToken: false,
        failedQueue: [],
    }),
    getters: {
        isAuthenticated: (state) => !!state.accessToken,
        currentUser: (state) => state.user,
        isAdmin: (state) => state.isAdminRole,
        isAuthReady: (state) => !state.isLoadingAuth,
    },
    actions: {
        setTokens(access_token, refresh_token) {
            this.accessToken = access_token;
            this.refreshTokenVal = refresh_token;
            localStorage.setItem('token', access_token);
            localStorage.setItem('refresh_token', refresh_token);
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
        },
        setUser(userData) {
            if (userData && userData.user) {
                this.user = userData.user;
                this.isAdminRole = userData.user.role === 'admin';
                localStorage.setItem('user', JSON.stringify(userData.user));
                localStorage.setItem('isadmin', this.isAdminRole.toString());
            } else { // Jika hanya token yang di-refresh, user tetap
                this.user = JSON.parse(localStorage.getItem('user') || 'null');
                this.isAdminRole = localStorage.getItem('isadmin') === 'true';
            }
            if (userData.access_token) this.setTokens(userData.access_token, userData.refresh_token || this.refreshTokenVal);
        },
        clearAuthData() {
            this.accessToken = null;
            this.refreshTokenVal = null;
            this.user = null;
            this.isAdminRole = false;
            localStorage.removeItem('token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user');
            localStorage.removeItem('isadmin');
            delete apiClient.defaults.headers.common['Authorization'];
        },
        
        // PERBAIKAN UTAMA: Method login dengan error handling yang lebih baik
        async login(username, password) {
            try {
                console.log('AuthStore: Attempting login...');
                const response = await apiClient.post('/login', { username, password });
                
                console.log('AuthStore: Login successful, response:', response.data);
                this.setUser(response.data);
                return response.data;
                
            } catch (error) {
                console.error('AuthStore: Login failed with error:', error);
                
                // Pastikan auth data dibersihkan saat login gagal
                this.clearAuthData();
                
                // PENTING: Jangan memodifikasi struktur error
                // Biarkan Vue component menangani error response yang lengkap
                
                // Log untuk debugging - lihat struktur error yang sebenarnya
                if (error?.response?.data) {
                    console.log('AuthStore: API Error Response Data:', error.response.data);
                    console.log('AuthStore: HTTP Status:', error.response.status);
                } else if (error?.request) {
                    console.log('AuthStore: Network Error - No response received');
                } else {
                    console.log('AuthStore: Request setup error:', error.message);
                }
                
                // Throw error asli tanpa modifikasi agar Login.vue bisa handle dengan benar
                throw error;
            }
        },
        
        async performRefresh() {
            if (!this.refreshTokenVal) {
                console.warn('AuthStore: No refresh token available');
                // Jangan logout jika ini dipanggil saat login pertama kali
                // Hanya logout jika user sudah login sebelumnya
                if (this.accessToken) {
                    console.log('AuthStore: Logging out due to missing refresh token');
                    this.logout();
                }
                // Return rejected promise tanpa throw error untuk mencegah unhandled rejection
                return Promise.reject(new Error('Refresh token tidak ditemukan'));
            }
            if (this.isRefreshingToken) { // Jika sudah ada proses refresh, tunggu promise yang ada
                 return new Promise((resolve, reject) => {
                    this.failedQueue.push({ resolve, reject });
                }).then(token => {
                    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                    return token;
                });
            }
            this.isRefreshingToken = true;
            try {
                console.log("AuthStore: Attempting to refresh token...");
                // Gunakan axios langsung untuk menghindari interceptor loop
                const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'}/refresh`, 
                    { refresh_token: this.refreshTokenVal },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        }
                    }
                );
                console.log("AuthStore: Token refresh successful");
                this.setUser(response.data); // setUser akan mengupdate accessToken, dll.
                this.processQueue(null, response.data.access_token);
                return response.data.access_token;
            } catch (error) {
                console.error('AuthStore: Error refreshing token:', error);
                this.processQueue(error, null);
                this.logout(); // Gagal refresh, logout pengguna
                throw error; // Lemparkan error agar interceptor bisa menanganinya
            } finally {
                this.isRefreshingToken = false;
            }
        },
        
        processQueue(error, token = null) {
            this.failedQueue.forEach(prom => {
                if (error) prom.reject(error);
                else prom.resolve(token);
            });
            this.failedQueue = [];
        },
        
        logout() {
            console.log('AuthStore: Performing logout...');
            this.clearAuthData();
            // Hentikan token refresher jika ada
            // tokenManager.stopTokenRefresher(); // (Pastikan tokenManager bisa diakses atau ada metode global)
            router.push('/auth/login').catch(() => {}); // Gunakan router push, bukan window.location
        },
        
        async validateCurrentToken() {
            if (!this.accessToken) {
                console.log('AuthStore: No access token to validate');
                return false;
            }
            try {
                // Validasi sisi klien (expiry) terlebih dahulu
                const decoded = decodeJwt(this.accessToken);
                if (decoded && decoded.exp * 1000 < Date.now()) {
                    console.log("AuthStore: Access token expired (client-side check)");
                    return false;
                }

                await apiClient.get('/users/me'); // Endpoint ini akan menggunakan token dari header default
                console.log('AuthStore: Token validation successful');
                return true;
            } catch (error) {
                console.warn("AuthStore: Token validation failed:", error.response?.status);
                return false; // Gagal validasi (mungkin 401)
            }
        },
        
        async initAuth() {
            console.log('AuthStore: Initializing authentication...');
            this.isLoadingAuth = true;
            
            // Jika di halaman login dan tidak ada token, skip validasi
            if (window.location.pathname === '/auth/login' && !this.accessToken && !this.refreshTokenVal) {
                console.log('AuthStore: On login page without tokens, skipping auth init');
                this.isLoadingAuth = false;
                this.clearAuthData(); // Pastikan bersih jika ke login tanpa token
                return;
            }

            if (this.accessToken) {
                apiClient.defaults.headers.common['Authorization'] = `Bearer ${this.accessToken}`;
                const isValid = await this.validateCurrentToken();
                if (isValid) {
                    console.log("AuthStore: Token is valid from initAuth.");
                    // User data sudah dimuat dari localStorage, bisa di-refresh di sini jika perlu
                    this.isLoadingAuth = false;
                    return;
                } else if (this.refreshTokenVal) {
                    console.log("AuthStore: Token invalid, attempting refresh from initAuth.");
                    try {
                        await this.performRefresh();
                        // Jika berhasil, user/token sudah di-set
                    } catch (e) {
                        // Gagal refresh, performRefresh sudah handle logout
                        console.log("AuthStore: Refresh failed in initAuth, user logged out.");
                    }
                } else {
                    console.log("AuthStore: Token invalid and no refresh token available");
                    this.logout(); // Token tidak valid, tidak ada refresh token
                }
            } else if (this.refreshTokenVal) {
                console.log("AuthStore: No access token, but refresh token exists. Attempting refresh from initAuth.");
                try {
                    await this.performRefresh();
                } catch (e) {
                    console.log("AuthStore: Initial refresh failed, user logged out.");
                }
            } else {
                // Tidak ada token sama sekali, pastikan diarahkan ke login (router guard akan handle ini)
                console.log("AuthStore: No tokens found, ensuring clean state.");
                this.clearAuthData();
            }
            this.isLoadingAuth = false;
            console.log('AuthStore: Authentication initialization completed');
        }
    }
});