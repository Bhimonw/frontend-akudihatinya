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
import ListPasien from '../views/user/ListPasien.vue';
import DetailPasienLP from '../views/user/DetailPasienLP.vue';
import DiabetesMellitus from '../views/user/DiabetesMellitus.vue';
import Hipertensi from '../views/user/Hipertensi.vue';
import TambahDataPeserta from '../views/user/TambahDataPeserta.vue';
import DetailPasien from '../views/user/DetailPasien.vue';
import DetailPasienHT from '../views/user/DetailPasienHT.vue';

import { getAuthState, isAdmin as checkAdmin, isAdmin } from '../stores/auth';

const routes = [
  // Admin Routes
  {
    path: '/auth',
    children: [
      {
        path: 'login',
        name:"Login",
        component: Login,
        meta: {requiresGuest: true},
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
        meta: { requiresAuth: true, isAdmin: true, title: 'Admin Dashboard' },
      },
      {
        path: 'manajemen-user',
        component: ManajemenUser,
        meta: { requiresAuth: true, isAdmin: true, title: 'Manajemen User' },
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
        meta: { requiresAuth: true, isAdmin: false, title: 'Dashboard' },
      },
      {
        path: 'list-pasien',
        component: ListPasien,
        meta: { requiresAuth: true, isAdmin: false, title: 'Daftar Pasien' },
      },
      {
        path: 'list-pasien/detail-pasien',
        component: DetailPasienLP,
        name: "DetailPasienLP",
        meta: { requiresAuth: true, isAdmin: false, title: 'DetailPasien' },
      },
      {
        path: 'diabetes-mellitus',
        component: DiabetesMellitus,
        meta: { requiresAuth: true, isAdmin: false, title: 'Laporan Pemantauan Diabetes Mellitus' },
      },
      {
        path: 'hipertensi',
        component: Hipertensi,
        meta: { requiresAuth: true, isAdmin: false, title: 'Laporan Pemantauan Hipertensi' },
      },
      {
        path: '/tambah-data-peserta',
        name: 'TambahDataPeserta',
        component: TambahDataPeserta,
        meta: { requiresAuth: true, isAdmin: false},
      },
      {
        path: 'diabetes-mellitus/patient/:id',
      name: "DetailPasien",
      component: DetailPasien,
      meta: { requiresAuth: true, isAdmin: false, title: 'Detail Pasien'},
      },
      {
        path: 'hipertensi/detail-pasien/:id',
        name: "DetailPasienHT",
        component: DetailPasienHT,
        meta: { requiresAuth: true, isAdmin: false, title: 'Detail Pasien' },
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

// Middleware untuk route guards
router.beforeEach((to, from, next) => {
  const isAuthenticated = !!getAuthState().token; // Periksa apakah pengguna sudah login
  const isAdmin = checkAdmin(); // Periksa apakah pengguna adalah admin

  if (to.meta.requiresAuth && !isAuthenticated) {
    // Jika halaman membutuhkan autentikasi tetapi pengguna belum login
    next({ name: 'Login' }); // Redirect ke halaman login
  } else if (to.meta.isAdmin !== undefined && to.meta.isAdmin !== isAdmin) {
    // Jika role pengguna tidak sesuai dengan halaman yang diminta
    if (isAdmin) {
      next({ path: '/admin/dashboard' }); // Redirect ke halaman admin jika role admin
    } else {
      next({ path: '/user/dashboard' }); // Redirect ke halaman user jika role user
    }
  } else {
    next(); // Lanjutkan ke halaman yang diminta
  }
});

export default router;