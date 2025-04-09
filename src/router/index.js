// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import DefaultLayout from '../layouts/DefaultLayout.vue';

//Auth
import Login from '../views/auth/Login.vue'

// Admin Views
import AdminDashboard from '../views/admin/Dashboard.vue';
import ManajemenUser from '../views/admin/ManajemenUser.vue';

// User Views
import UserDashboard from '../views/user/Dashboard.vue';
import DiabetesMellitus from '../views/user/DiabetesMellitus.vue';
import Hipertensi from '../views/user/Hipertensi.vue';
import TambahDataPeserta from '../views/user/TambahDataPeserta.vue';
import DetailPasien from '../views/user/DetailPasien.vue';

const routes = [
  // Admin Routes
  {
    path: '/auth',
    children: [
      {
        path: 'login',
        name:"Login",
        component: Login,
      },
    ],
  },
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
      {
        path: '/tambah-data-peserta',
        name: 'TambahDataPeserta',
        component: TambahDataPeserta,
      },
      {
        path: 'diabetes-mellitus/patient/:id',
      name: "DetailPasien",
      component: DetailPasien,
      meta: { title: 'Detail Pasien' },
      },
    ],
  },

  // Default Route (Redirect to User Dashboard)
  // { path: '/', redirect: '/user/dashboard' },
  { path: '/', redirect: '/auth/login' },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;