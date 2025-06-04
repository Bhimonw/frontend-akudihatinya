// src/stores/authStore.js
import { defineStore } from 'pinia';
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
        async login(username, password) {
            // isLoadingAuth bisa di-set true di sini jika ingin ada loading global saat login
            // this.isLoadingAuth = true;
            try {
                const response = await apiClient.post('/login', { username, password });
                this.setUser(response.data);
                // this.isLoadingAuth = false;
                return response.data;
            } catch (error) {
                // this.isLoadingAuth = false;
                this.clearAuthData();
                throw error;
            }
        },
        async performRefresh() {
            if (!this.refreshTokenVal) {
                this.logout(); // Langsung logout jika tidak ada refresh token
                throw new Error('Refresh token tidak ditemukan, logout.');
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
                console.log("Attempting to refresh token from authStore...");
                const response = await apiClient.post('/refresh', { refresh_token: this.refreshTokenVal });
                this.setUser(response.data); // setUser akan mengupdate accessToken, dll.
                this.processQueue(null, response.data.access_token);
                return response.data.access_token;
            } catch (error) {
                console.error('Error refreshing token in authStore:', error);
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
            this.clearAuthData();
            // Hentikan token refresher jika ada
            // tokenManager.stopTokenRefresher(); // (Pastikan tokenManager bisa diakses atau ada metode global)
            router.push('/auth/login').catch(() => {}); // Gunakan router push, bukan window.location
        },
        async validateCurrentToken() {
            if (!this.accessToken) return false;
            try {
                // Anda bisa menambahkan validasi sisi klien (expiry) di sini dulu
                // const decoded = decodeJwt(this.accessToken);
                // if (decoded && decoded.exp * 1000 < Date.now()) {
                //   console.log("Access token expired (client-side check)");
                //   return false;
                // }

                await apiClient.get('/users/me'); // Endpoint ini akan menggunakan token dari header default
                return true;
            } catch (error) {
                console.warn("Token validation failed:", error.response?.status);
                return false; // Gagal validasi (mungkin 401)
            }
        },
        async initAuth() {
            this.isLoadingAuth = true;
            if (window.location.pathname === '/auth/login' && !this.accessToken && !this.refreshTokenVal) {
                this.isLoadingAuth = false;
                this.clearAuthData(); // Pastikan bersih jika ke login tanpa token
                return;
            }

            if (this.accessToken) {
                apiClient.defaults.headers.common['Authorization'] = `Bearer ${this.accessToken}`;
                const isValid = await this.validateCurrentToken();
                if (isValid) {
                    console.log("Token is valid from initAuth.");
                    // User data sudah dimuat dari localStorage, bisa di-refresh di sini jika perlu
                    this.isLoadingAuth = false;
                    return;
                } else if (this.refreshTokenVal) {
                    console.log("Token invalid, attempting refresh from initAuth.");
                    try {
                        await this.performRefresh();
                        // Jika berhasil, user/token sudah di-set
                    } catch (e) {
                        // Gagal refresh, performRefresh sudah handle logout
                        console.log("Refresh failed in initAuth, user logged out.");
                    }
                } else {
                    this.logout(); // Token tidak valid, tidak ada refresh token
                }
            } else if (this.refreshTokenVal) {
                console.log("No access token, but refresh token exists. Attempting refresh from initAuth.");
                try {
                    await this.performRefresh();
                } catch (e) {
                    console.log("Initial refresh failed, user logged out.");
                }
            } else {
                // Tidak ada token sama sekali, pastikan diarahkan ke login (router guard akan handle ini)
                this.clearAuthData();
                console.log("No tokens found, ensuring redirect to login via router guard.");
            }
            this.isLoadingAuth = false;
        }
    }
});