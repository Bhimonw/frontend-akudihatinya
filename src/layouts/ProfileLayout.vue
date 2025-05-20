<template>
    <div class="layout">
      <!-- Page Content -->
      <div class="content">
        <router-view />
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'ProfileLayout'
  }
  </script>
  
  <style scoped>
  /* Layout Container */
  .layout {
    display: flex;
    height: 100vh;
    overflow: hidden;
  }
  
  /* Content */
  .content {
    flex-grow: 1;
    height: 100vh;
    overflow-y: auto;
    background-color: #f7f8f9;
  }
  </style>