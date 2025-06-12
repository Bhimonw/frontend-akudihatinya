// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/authStore';
import DefaultLayout from '../layouts/DefaultLayout.vue';
import ProfileLayout from '../layouts/ProfileLayout.vue';

//Auth
import Login from '../views/auth/Login.vue';

import Profile from '../views/user/ProfilePage.vue';
// Admin Views
import AdminDashboard from '../views/admin/Dashboard.vue';
import ManajemenUser from '../views/admin/ManajemenUser.vue';
import ManagePuskesmasTarget from '../views/admin/ManagePuskesmasTarget.vue';

// User Views
import UserDashboard from '../views/user/Dashboard.vue';
import ListPasien from '../views/user/ListPasien.vue';
import DetailPasienLP from '../views/user/DetailPasienLP.vue';
import DiabetesMellitus from '../views/user/DiabetesMellitus.vue';
import Hipertensi from '../views/user/Hipertensi.vue';
import TambahDataPeserta from '../views/user/TambahDataPeserta.vue';
import DetailPasienDM from '../views/user/DetailPasienDM.vue';
import DetailPasienHT from '../views/user/DetailPasienHT.vue';

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
    path: '/profile',
    component: ProfileLayout,
    children: [
      {
        path: '',
        name: 'ProfilePage',
        component: Profile,
        meta: { requiresAuth: true, title: 'Profil Pengguna' },
      }
    ]
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
      {
        path: 'manajemen-target-puskesmas',
        component: ManagePuskesmasTarget,
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
        meta: { requiresAuth: true, isAdmin: false, title: 'Detail Pasien' },
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
      meta: { requiresAuth: true, isAdmin: false, title: 'Detail Pasien Diabetes Mellitus' },
      },
      {
        path: 'hipertensi/patient/:id',
        name: "DetailPasienHT",
        component: DetailPasienHT,
        meta: { requiresAuth: true, isAdmin: false, title: 'Detail Pasien Hipertensi' },
      },
    ],
  },

  // Default Route (Redirect to Login)
  { path: '/', redirect: '/auth/login' },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore();
  
    // Tunggu initAuth selesai jika belum dan rute memerlukan info auth
    // Ini penting agar keputusan routing tidak dibuat prematur
    if (authStore.isLoadingAuth && (to.meta.requiresAuth || to.meta.requiresGuest !== undefined)) {
        try {
            // Ini bisa jadi event atau menunggu promise sederhana dari initAuth
            // Cara sederhana: tunggu isLoadingAuth menjadi false
            await new Promise(resolve => {
                const unwatch = authStore.$subscribe((mutation, state) => {
                    if (!state.isLoadingAuth) {
                        unwatch();
                        resolve();
                    }
                });
                // Jika sudah false saat ini, langsung resolve
                if (!authStore.isLoadingAuth) {
                    unwatch();
                    resolve();
                }
            });
        } catch (e) {
            console.error("Error waiting for auth init in router guard:", e);
            // Mungkin fallback ke login jika ada error kritis
            return next({ name: 'Login', query: { redirect: to.fullPath } });
        }
    }

    const isAuthenticated = authStore.isAuthenticated;
    const isAdminUser = authStore.isAdmin;

    // Halaman login
    if (to.name === 'Login') {
      if (isAuthenticated) {
        return next(isAdminUser ? { path: '/admin/dashboard' } : { path: '/user/dashboard' });
      }
      return next();
    }

    // Halaman lain// Rute yang memerlukan autentikasi
    if (to.meta.requiresAuth && !isAuthenticated) {
      console.log('Router Guard: requiresAuth=true, not authenticated. Redirecting to Login.');
      return next({ name: 'Login', query: { redirect: to.fullPath } });
    }
  
    // Rute yang memerlukan role admin
    if (to.meta.isAdmin !== undefined && isAuthenticated) { // Cek isAuthenticated juga
      if (to.meta.isAdmin && !isAdminUser) { // Membutuhkan admin, tapi user bukan admin
        return next({ path: '/user/dashboard' }); // Atau halaman error akses
      }
      if (!to.meta.isAdmin && isAdminUser) { // Tidak boleh admin (misal user page), tapi user adalah admin
        return next({ path: '/admin/dashboard' }); // Redirect admin ke dashboardnya
      }
    }
  
    // Jika semua kondisi terpenuhi
    next();
  });

export default router;