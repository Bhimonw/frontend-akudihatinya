<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
import { onMounted } from 'vue';
import { restoreAuth } from './stores/auth';

export default {
  name: 'App',
  created() {
    restoreAuth();
  },
  setup() {
    onMounted(() => {
      restoreAuth();
    });
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