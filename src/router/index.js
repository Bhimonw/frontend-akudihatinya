// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import DefaultLayout from '../layouts/DefaultLayout.vue';

//Home Page
import Home from '../views/Home.vue'

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

import { useAuthStore} from '../stores/auth';

const routes = [
  // Homepage Route
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { requiresGuest: false }
  },

  // Auth Routes
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

  //Admin Routes
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
  // { path: '/', redirect: '/auth/login' },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Middleware untuk route guards
// Middleware untuk route guards
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  
  // Jika rute sebelumnya dan tujuan sama, hindari pemeriksaan duplikat
  if (from.path === to.path) {
    return next();
  }

  // Cek localStorage terlebih dahulu
  const isAuthenticated = localStorage.getItem('isLoggedIn') === 'true';
  const isAdminUser = localStorage.getItem('userRole') === 'admin';

  console.log('Route navigation:');
  console.log('to.path:', to.path);
  console.log('isAuthenticated (local):', isAuthenticated);
  
  // Untuk halaman login atau public, tidak perlu verifikasi server
  if (to.path === '/auth/login' || to.path === '/') {
    if (isAuthenticated) {
      return next(isAdminUser ? '/admin/dashboard' : '/user/dashboard');
    }
    return next();
  }
  
  // Untuk halaman yang memerlukan auth, verifikasi dengan server jika sudah login di localStorage
  if (to.meta.requiresAuth) {
    if (!isAuthenticated) {
      return next('/auth/login');
    }
    
    // Verifikasi di server hanya jika belum pernah diverifikasi (gunakan state checking dari store)
    if (!authStore.isCheckingAuth && !authStore.user) {
      try {
        const isStillAuthenticated = await authStore.checkAuth();
        
        if (!isStillAuthenticated) {
          return next('/auth/login');
        }
      } catch (error) {
        console.error('Auth verification failed:', error);
        return next('/auth/login');
      }
    }
  }

  // Cek role sesuai rute
  if (to.meta.isAdmin === true && !isAdminUser && isAuthenticated) {
    return next({ path: '/user/dashboard' });
  }

  if (to.meta.isAdmin === false && isAdminUser && isAuthenticated) {
    return next({ path: '/admin/dashboard' });
  }

  // Jika semua kondisi terpenuhi, lanjutkan ke halaman yang diminta
  next();
});

export default router;