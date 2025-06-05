<template>
  <div class="layout">
    <!-- Render sidebar berdasarkan role user -->
    <SidebarAdmin v-if="authStore.isAdmin" :isSidebarOpen="isSidebarOpen" />
    <Sidebar v-else :isSidebarOpen="isSidebarOpen" />

    <!-- Main Content -->
    <div class="main-content-wrapper">
      <!-- Navbar -->
      <Navbar :pageTitle="pageTitle" @toggle-sidebar="toggleSidebar" />
      <!-- Page Content -->
      <div class="content-area">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import Sidebar from '../components/Sidebar.vue';
import SidebarAdmin from '../components/SidebarAdmin.vue';
import Navbar from '../components/Navbar.vue';
import { useAuthStore } from '../stores/authStore.js'; // Import store Pinia

const route = useRoute();
const authStore = useAuthStore();

const isSidebarOpen = ref(true); 

const pageTitle = computed(() => {
  return route.meta.title || 'Dashboard';
});

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value; // Toggle sidebar state
};

</script>

<style scoped>
/* Layout Container */
.layout {
  display: flex;
  flex-grow: 1; /* Mengisi ruang vertikal yang diberikan oleh #app */
  height: 100vh; /* Tambahkan ini untuk memastikan layout mengisi seluruh tinggi viewport */
  /* overflow: hidden; */ /* Hapus atau komentari baris ini */
}

/* Sidebar */
.sidebar {
  flex-shrink: 0;
  width: 270px;
  height: 100%; /* Tinggi 100% dari parent (.layout) */
  background: #ffffff;
  box-shadow: 0px 4px 16px rgba(0, 0, 0, 0.1);
  transition: width 0.3s ease;
  /* Jika konten sidebar panjang dan butuh scroll internal: */
  /* overflow-y: auto; */
}
.sidebar.collapsed {
  width: 90px;
}

/* Main Content Wrapper */
.main-content-wrapper {
  flex-grow: 1; /* Mengisi sisa ruang horizontal di .layout */
  display: flex;
  flex-direction: column;
  height: 100%; /* Tinggi 100% dari parent (.layout) */
  /* overflow: hidden; */ /* Hapus atau komentari baris ini */
  min-height: 0; /* Pastikan tinggi minimum adalah 0 */
  min-width: 0;
}

/* Navbar */
.navbar {
  flex-shrink: 0;
  width: 100%;
  height: 78px;
  background: #f7f8f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 30px;
  box-sizing: border-box;
}

/* Content Area - NAMA SELECTOR DIPERBAIKI */
.content-area { /* <<<< PERBAIKAN DI SINI */
  flex-grow: 1; /* Mengisi sisa ruang vertikal di .main-content-wrapper */
  overflow-y: auto; /* Aktifkan scrolling hanya pada content-area */
  overflow-x: hidden;
  min-height: 0; /* Pastikan tinggi minimum adalah 0 */
  min-width: 0;
  padding-top: 0;
  background-color: #f7f8f9;
  box-sizing: border-box;
  /* height: calc(100vh - 78px); Tambahkan ini: tinggi viewport dikurangi tinggi navbar */
}
</style>