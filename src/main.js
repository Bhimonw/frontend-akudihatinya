import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import router from './router/index.js';

import './assets/styles/global.css';

import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

library.add(fas);

const app = createApp(App);
app.use(router);

app.component('font-awesome-icon', FontAwesomeIcon);

app.mount('#app');