<template>
  <div id="app">
    <loading-overlay :show="isLoading" message="Memverifikasi autentikasi..." />
    <router-view />
  </div>
</template>

<script>

export default {
  name: 'App',
  data() {
    return {
      isLoading: false
    }
  },
  created() {
    console.log('App created - checking auth state...');
    
    // Check authentication status
    const token = localStorage.getItem('token');
    if (token) {
      console.log('User is authenticated');
    } else {
      console.log('User is not authenticated');
    }
    
    // Set loading state based on global state
    this.isLoading = window.isAuthLoading;
  },
  mounted() {
    // Update loading state when global state changes
    const checkLoadingState = () => {
      this.isLoading = window.isAuthLoading;
    };
    
    // Check regularly until loading is complete
    const interval = setInterval(() => {
      checkLoadingState();
      if (!window.isAuthLoading) {
        clearInterval(interval);
      }
    }, 100);
  }
};
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
