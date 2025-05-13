// src/main.js
import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import router from './router/index.js';
import { initAuth, authService } from './stores/auth.js';
import apiClient from './api.js';
import { tokenManager } from './stores/tokenManager.js';

import './assets/styles/global.css';

import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import LoadingOverlay from './components/LoadingOverlay.vue';

library.add(fas);

// Global loading state
window.isAuthLoading = true;

// Ensure auth is initialized before app is mounted
console.log('Initializing authentication...');
initAuth()
  .then(() => {
    console.log('Authentication initialized successfully');
    window.isAuthLoading = false;
    
    // Create the Vue app
    const app = createApp(App);
    
    // Add apiClient globally
    app.config.globalProperties.$api = apiClient;
    
    // Register components
    app.component('font-awesome-icon', FontAwesomeIcon);
    app.component('loading-overlay', LoadingOverlay);
    
    // Use router
    app.use(router);
    
    // Start token refresher if user is authenticated
    if (authService.isAuthenticated()) {
      console.log('Starting token manager');
      tokenManager.startTokenRefresher();
    }
    
    // Mount the app
    app.mount('#app');
  })
  .catch(error => {
    console.error('Failed to initialize authentication:', error);
    window.isAuthLoading = false;
    
    // Still mount the app even if auth fails
    const app = createApp(App);
    app.use(router);
    app.component('font-awesome-icon', FontAwesomeIcon);
    app.component('loading-overlay', LoadingOverlay);
    app.mount('#app');
  });