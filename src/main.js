import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import router from './router/index.js';

import './assets/styles/global.css';

import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faHome, faUserGear, faChartLine, faDisease, faHeartPulse, faBars, faChevronDown } from '@fortawesome/free-solid-svg-icons';

library.add(faHome, faUserGear, faChartLine, faDisease, faHeartPulse, faBars, faChevronDown);

const app = createApp(App);
app.use(router);

app.component('font-awesome-icon', FontAwesomeIcon);

app.mount('#app');