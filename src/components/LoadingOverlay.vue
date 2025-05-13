<!-- src/components/LoadingOverlay.vue -->
<template>
    <transition name="fade">
      <div v-if="show" class="loading-overlay">
        <div class="loading-content">
          <div class="spinner"></div>
          <p>{{ message }}</p>
        </div>
      </div>
    </transition>
  </template>
  
  <script>
  export default {
    name: 'LoadingOverlay',
    props: {
      show: {
        type: Boolean,
        default: false
      },
      message: {
        type: String,
        default: 'Loading...'
      }
    }
  }
  </script>
  
  <style scoped>
  .loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(255, 255, 255, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
  }
  
  .loading-content {
    text-align: center;
    background-color: white;
    padding: 20px 40px;
    border-radius: 10px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  .spinner {
    width: 40px;
    height: 40px;
    margin: 0 auto 20px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid var(--primary-500, #097678);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  p {
    margin: 0;
    font-family: 'Inter', sans-serif;
    color: #333;
  }
  
  /* Transition animations */
  .fade-enter-active, .fade-leave-active {
    transition: opacity 0.3s;
  }
  .fade-enter-from, .fade-leave-to {
    opacity: 0;
  }
  </style>