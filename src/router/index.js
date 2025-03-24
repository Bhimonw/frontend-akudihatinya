// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import DefaultLayout from '../layouts/DefaultLayout.vue';

// Admin Views
import AdminDashboard from '../views/admin/Dashboard.vue';
import ManajemenUser from '../views/admin/ManajemenUser.vue';

// User Views
import UserDashboard from '../views/user/Dashboard.vue';
import DiabetesMellitus from '../views/user/DiabetesMellitus.vue';
import Hipertensi from '../views/user/Hipertensi.vue';

const routes = [
  // Admin Routes
  {
    path: '/admin',
    component: DefaultLayout,
    children: [
      {
        path: 'dashboard',
        component: AdminDashboard,
        meta: { title: 'Admin Dashboard' },
      },
      {
        path: 'manajemen-user',
        component: ManajemenUser,
        meta: { title: 'Manajemen User' },
      },
    ],
  },

  // User Routes
  {
    path: '/user',
    component: DefaultLayout,
    children: [
      {
        path: 'dashboard',
        component: UserDashboard,
        meta: { title: 'Dashboard' },
      },
      {
        path: 'diabetes-mellitus',
        component: DiabetesMellitus,
        meta: { title: 'Diabetes Mellitus' },
      },
      {
        path: 'hipertensi',
        component: Hipertensi,
        meta: { title: 'Hipertensi' },
      },
    ],
  },

  // Default Route (Redirect to User Dashboard)
  { path: '/', redirect: '/user/dashboard' },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;