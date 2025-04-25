<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
import { onMounted } from 'vue';
import { useAuthStore } from './stores/auth';

export default {
  name: 'App',
  created() {
    const authStore = useAuthStore();
    authStore.restoreAuth();
  },
  setup() {
    const authStore = useAuthStore();
    console.log('Current refreshToken:', authStore.refreshToken);
    onMounted(() => {
      authStore.restoreAuth();
    });
  },
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