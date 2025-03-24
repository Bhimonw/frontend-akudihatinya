<template>
    <div class="content">
      <h1>{{ contentText }}</h1>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        contentText: 'Hello!',
      };
    },
  };
  </script>
  
  <style scoped>
  .content {
    padding: 20px;
    text-align: center;
  }
  </style>