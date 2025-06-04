<template>
  <div class="app-root-component"> <router-view v-if="authStore.isAuthReady" />
  </div>
</template>

<script setup>
import { useAuthStore } from './stores/authStore';
// import LoadingOverlay from './components/LoadingOverlay.vue'; // Jika belum global

const authStore = useAuthStore();

// Tidak perlu created/mounted untuk window.isAuthLoading lagi
// Pemeriksaan token di console.log pada created() App.vue juga tidak begitu penting
// karena authStore.initAuth akan menanganinya.
console.log('App component setup - auth loading state:', authStore.isLoadingAuth);
</script>

<style>
/* Global styles */
html, body {
  height: 100%;
  margin: 0; /* Tailwind Preflight biasanya sudah melakukan ini */
  padding: 0; /* Tailwind Preflight biasanya sudah melakukan ini */
  overflow: hidden; /* PENTING: Mencegah scrollbar di html dan body */
}

#app {
  /* flex-grow: 1; */
  display: flex;
  flex-direction: column;
  height: 100vh;
}
.app-root-component {
  flex-grow: 1; /* Membuatnya mengisi #app (dari index.html) */
  display: flex;
  flex-direction: column; /* Agar DefaultLayout bisa mengisi dengan flex-grow */
  /* background-color: lightseagreen; */ /* Untuk debug - ini adalah root dari App.vue */
}
</style>