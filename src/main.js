import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import router from './router/index.js';
import { createPinia } from 'pinia';
import { useAuthStore } from './stores/auth.js';

import './assets/styles/global.css';

import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

library.add(fas);

const app = createApp(App);

const pinia = createPinia();
app.use(pinia);

app.use(router);

app.component('font-awesome-icon', FontAwesomeIcon);

app.mount('#app');

// Restore auth state on app load
const authStore = useAuthStore();
authStore.restoreAuth();