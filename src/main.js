// src/main.js
import { createApp } from 'vue';
import App from './App.vue';
import router from './router/index.js';
import { createPinia } from 'pinia'
import { useAuthStore } from './stores/authStore';
import apiClient from './api.js';

import './style.css';
import { tokenManager } from './stores/tokenManager.js';
import './assets/styles/global.css';
import './assets/styles/swal-custom.css';

import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import LoadingOverlay from './components/LoadingOverlay.vue';

library.add(fas);

const app = createApp(App);
const pinia = createPinia(); // Buat instance Pinia
app.use(pinia); // Gunakan Pinia

// Ambil auth store setelah Pinia di-use
const authStore = useAuthStore(); // Pindahkan ini ke dalam setup App.vue atau setelah app dibuat jika perlu akses awal

console.log('Mounting Vue app immediately...');
app.config.globalProperties.$api = apiClient;
app.component('font-awesome-icon', FontAwesomeIcon);
app.component('loading-overlay', LoadingOverlay);
app.use(router);
app.mount('#app');

// Inisialisasi autentikasi secara paralel
// authStore akan mengelola state isLoadingAuth
console.log('Initializing authentication in background...');
authStore.initAuth().then(() => { // initAuth di authStore
    console.log('Background authentication process finished.');
    if (authStore.isAuthenticated) {
        console.log('Starting token manager after successful auth init.');
        tokenManager.startTokenRefresher(); // Pastikan tokenManager juga menggunakan authStore jika perlu
    }
}).catch(error => {
    console.error('Background authentication initialization failed:', error);
    // App sudah ter-mount, router guards akan menangani jika auth gagal
});