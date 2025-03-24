<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App',
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