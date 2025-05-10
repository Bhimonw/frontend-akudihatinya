<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
import { useAuthStore } from './stores/auth';

export default {
  name: 'App',
  setup() {
    const authStore = useAuthStore();
    
    // Verifikasi autentikasi saat aplikasi dimulai
    const verifyAuth = async () => {
      if (localStorage.getItem('isLoggedIn') === 'true') {
        try {
          await authStore.fetchCsrfToken();
          await authStore.checkAuth();
        } catch (error) {
          console.error('Failed to verify authentication:', error);
          authStore.clearAuth();
        }
      }
    };
    
    // Panggil verifikasi saat komponen dibuat
    verifyAuth();
  }
}
</script>
<style>
/* Global styles */
body {
  margin: 0;
  font-family: Arial, sans-serif;
  background-color: #f4f5f7;
}

#app {
  display: flex;
  flex-direction: column;
  height: 100vh;
}
</style>
