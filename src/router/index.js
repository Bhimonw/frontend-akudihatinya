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
import DetailPasienDM from '../views/user/DetailPasienDM.vue';
import DetailPasienHT from '../views/user/DetailPasienHT.vue';

import { getAuthState, isAdmin } from '../stores/auth';

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
        path: 'list-pasien/patient/:id',
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
      name: "DetailPasienDM",
      component: DetailPasienDM,
      meta: { requiresAuth: true, isAdmin: false, title: 'Detail Pasien'},
      },
      {
        path: 'hipertensi/patient/:id',
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
  const isAuthenticated = !!getAuthState()?.token; // Periksa apakah pengguna sudah login
  const isAdminUser = isAdmin(); // Periksa apakah pengguna adalah admin

  // Jika halaman membutuhkan autentikasi tetapi pengguna belum login
  if (to.meta.requiresAuth && !isAuthenticated) {
    return next({ name: 'Login' });
  }

  // Jika halaman membutuhkan role admin tetapi pengguna bukan admin
  if (to.meta.isAdmin !== undefined && to.meta.isAdmin !== isAdminUser) {
    if (isAdminUser) {
      return next({ path: '/admin/dashboard' }); // Redirect ke admin dashboard
    } else {
      return next({ path: '/user/dashboard' }); // Redirect ke user dashboard
    }
  }

  // Jika semua kondisi terpenuhi, lanjutkan ke halaman yang diminta
  next();
});

export default router;