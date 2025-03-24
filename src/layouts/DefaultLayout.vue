<template>
    <div class="layout">
      <!-- Sidebar -->
      <Sidebar :isSidebarOpen="isSidebarOpen" />
  
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
  import Navbar from '../components/Navbar.vue';
  
  export default {
    components: {
      Sidebar,
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
  }
  
  /* Main Content */
  .main-content {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    background: #f7f8f9; /* Background color for the main content area */
  }
  </style>