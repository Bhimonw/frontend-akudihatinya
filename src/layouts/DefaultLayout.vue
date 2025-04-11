<template>
  <div class="layout">
    <!-- Render sidebar berdasarkan role user -->
    <SidebarAdmin v-if="isUserAdmin" :isSidebarOpen="isSidebarOpen" />
    <Sidebar v-else :isSidebarOpen="isSidebarOpen" />
    
    <!-- Main Content -->
    <div class="main-content">
      <!-- Navbar -->
      <Navbar :pageTitle="pageTitle" @toggle-sidebar="toggleSidebar" />
      <!-- Page Content -->
      <div class="content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script>
import Sidebar from '../components/Sidebar.vue';
import SidebarAdmin from '../components/SidebarAdmin.vue';
import Navbar from '../components/Navbar.vue';
import { getAuthState } from '../stores/auth.js';

export default {
  components: {
    Sidebar,
    SidebarAdmin,
    Navbar,
  },
  data() {
    return {
      isSidebarOpen: true, // Initial state: sidebar is open
    };
  },
  computed: {
    pageTitle() {
      return this.$route.meta.title || 'Dashboard';
    },
    isUserAdmin() {
      // Mengambil status admin dari auth store
      return getAuthState().isadmin;
    }
  },
  methods: {
    toggleSidebar() {
      this.isSidebarOpen = !this.isSidebarOpen; // Toggle sidebar state
    },
  },
};
</script>

<style scoped>
/* Layout Container */
.layout {
  display: flex;
  height: 100vh;
  overflow: hidden; /* Pastikan layout tidak memiliki scrollbar tambahan */
}

/* Sidebar */
.sidebar {
  flex-shrink: 0; /* Pastikan sidebar tidak menyusut */
  width: 270px; /* Open width */
  height: 100vh;
  background: #ffffff;
  box-shadow: 0px 4px 16px rgba(0, 0, 0, 0.1);
  transition: width 0.3s ease;
}
.sidebar.collapsed {
  width: 90px; /* Collapsed width */
}

/* Main Content */
.main-content {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden; /* Pastikan main-content tidak memiliki scrollbar tambahan */
}

/* Navbar */
.navbar {
  flex-shrink: 0; /* Pastikan navbar tidak menyusut */
  width: 100%;
  height: 78px;
  background: #f7f8f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 30px;
  box-sizing: border-box;
}

/* Content */
.content {
  flex-grow: 1;
  overflow-y: auto; /* Aktifkan scrolling hanya pada content */
  padding: 26px;
  padding-top: 0;
  background-color: #f7f8f9;
  box-sizing: border-box;
}
</style>