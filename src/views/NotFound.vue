<template>
  <div class="not-found-container">
    <div class="background-elements">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
      <div class="circle circle-3"></div>
    </div>

    <div class="content-wrapper">
      <div class="illustration-container">
        <svg width="280" height="220" viewBox="0 0 280 220" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M125.5 204.5C189.5 228 274 195 275.5 131.5C277 68 206 -8.5 137.5 1.5C69 11.5 -6.5 76 1.5 141.5C9.5 207 61.5 181 125.5 204.5Z" fill="#F3F4F6"/>
          <path d="M198.818 133.455C221.737 110.536 218.428 73.0446 195.509 50.1256C172.59 27.2066 135.098 23.8973 112.179 46.8163C89.2604 69.7353 92.5696 107.227 115.489 130.146C138.408 153.065 175.9 156.374 198.818 133.455Z" fill="white" stroke="#E5E7EB" stroke-width="2"/>
          <path d="M141.707 110.157L170.157 81.7071" stroke="#D1D5DB" stroke-width="10" stroke-linecap="round"/>
          <path d="M149.818 95.4545C167.971 77.3018 165.719 47.9048 147.566 30.752C129.413 13.5992 99.7891 11.6465 82.6364 29.8C65.4836 47.9527 67.7364 77.3497 85.8891 94.5025C104.042 111.655 133.666 113.608 149.818 95.4545Z" fill="#047D78" fill-opacity="0.1"/>
          
          <text x="139" y="99" font-family="Inter, sans-serif" font-size="32" font-weight="800" fill="#047D78" text-anchor="middle">?</text>
          
          <path d="M60 70L80 70" stroke="#3B82F6" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" opacity="0.5" transform="rotate(45 70 70)"/>
          <path d="M70 60L70 80" stroke="#3B82F6" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" opacity="0.5" transform="rotate(45 70 70)"/>
          
          <circle cx="215" cy="40" r="5" fill="#EF4444" opacity="0.4"/>
          <circle cx="230" cy="150" r="8" fill="#10B981" opacity="0.3"/>
          <circle cx="70" cy="175" r="6" fill="#3B82F6" opacity="0.2"/>
        </svg>
      </div>

      <h1 class="error-code">404</h1>
      <h2 class="error-title">Oops! Halaman Tidak Ditemukan</h2>

      
      <router-link :to="destinationRoute" class="action-button">
        <font-awesome-icon :icon="['fas', 'arrow-left']" class="button-icon" />
        <span>{{ buttonText }}</span>
        <div class="button-shine"></div>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useAuthStore } from '../stores/authStore';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';

// Daftarkan ikon yang akan digunakan
library.add(faArrowLeft);

const authStore = useAuthStore();

// Tentukan tujuan link berdasarkan status otentikasi pengguna
const destinationRoute = computed(() => {
  if (authStore.isAuthenticated) {
    // Arahkan ke dashboard yang sesuai (admin/user) jika sudah login
    return authStore.isAdmin ? '/admin/dashboard' : '/user/dashboard';
  }
  // Arahkan ke halaman login jika belum login
  return '/auth/login';
});

// Tentukan teks tombol berdasarkan status otentikasi
const buttonText = computed(() => {
  return authStore.isAuthenticated ? 'Kembali ke Dashboard' : 'Kembali ke Halaman Login';
});
</script>

<style scoped>
/* Gunakan variabel warna dari tema Anda jika memungkinkan */
:root {
  --primary-500: #047d78;
  --primary-600: #036a65;
  --primary-700: #025752;
  --gray-50: #f9fafb;
  --gray-200: #e5e7eb;
  --gray-500: #6b7280;
  --gray-700: #374151;
  --gray-800: #1f2937;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.not-found-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: var(--gray-50); /* Latar belakang */
  font-family: "Inter", sans-serif;
  padding: 1.5rem;
  text-align: center;
  overflow: hidden; /* Penting untuk animasi latar belakang */
  position: relative; /* Untuk posisi elemen latar belakang */
}

/* --- Elemen Latar Belakang (Circles) --- */
.background-elements {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none; /* Agar tidak menghalangi interaksi */
  overflow: hidden;
}

.circle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.1; /* Transparansi agar tidak terlalu dominan */
  filter: blur(50px); /* Efek blur untuk tampilan yang lembut */
  animation: floatCircle 15s ease-in-out infinite alternate;
}

.circle-1 {
  width: 300px;
  height: 300px;
  background-color: var(--primary-500);
  top: 10%;
  left: 15%;
  animation-delay: 0s;
}

.circle-2 {
  width: 200px;
  height: 200px;
  background-color: #3B82F6; /* Warna biru */
  bottom: 5%;
  right: 20%;
  animation-delay: 3s;
}

.circle-3 {
  width: 250px;
  height: 250px;
  background-color: #EF4444; /* Warna merah */
  top: 40%;
  left: -5%;
  animation-delay: 6s;
}

@keyframes floatCircle {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  25% {
    transform: translate(20px, -30px) scale(1.05);
  }
  50% {
    transform: translate(-10px, 40px) scale(0.95);
  }
  75% {
    transform: translate(30px, 10px) scale(1.02);
  }
}

/* --- Konten Utama (404, Ilustrasi, Tombol) --- */
.content-wrapper {
  position: relative; /* Agar z-index bekerja */
  z-index: 10; /* Pastikan konten di atas elemen latar belakang */
  max-width: 500px;
  width: 100%;
  animation: fadeInUp 0.8s ease-out;
  /* Tidak ada lagi background-color atau box-shadow di sini */
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.illustration-container {
  margin-bottom: 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
  /* Animasi float langsung pada SVG untuk kontrol lebih baik */
}

.illustration-container svg {
  display: block;
  margin: 0 auto;
  animation: float 6s ease-in-out infinite; /* Animasi float pada SVG itu sendiri */
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-15px);
  }
}

.error-code {
  font-size: 8rem; /* Ukuran lebih besar untuk dampak visual */
  font-weight: 900; /* Lebih tebal */
  color: var(--primary-500);
  margin: 0;
  line-height: 1;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1); /* Sedikit bayangan teks */
}

.error-title {
  font-size: 2rem; /* Ukuran lebih besar */
  font-weight: 700;
  color: var(--gray-800);
  margin: 1rem 0 0.5rem;
    padding-bottom: 25px;
}

.error-description {
  font-size: 1.1rem; /* Ukuran teks sedikit lebih besar */
  color: var(--gray-500);
  margin: 0 auto 3rem; /* Spasi lebih banyak sebelum tombol */
  max-width: 450px;
  line-height: 1.7;
}

.action-button {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 2.5rem; /* Padding lebih besar */
  background: linear-gradient(135deg, var(--primary-500), var(--primary-600));
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease-out;
  box-shadow: 0 6px 15px -3px rgba(4, 125, 120, 0.4); /* Bayangan lebih kuat */
  letter-spacing: 0.05em; /* Spasi huruf lebih lebar */
  text-transform: uppercase; /* Huruf kapital semua */
}

.action-button:hover {
  transform: translateY(-5px); /* Efek hover lebih dramatis */
  box-shadow: 0 10px 20px -5px rgba(4, 125, 120, 0.5); /* Bayangan hover lebih kuat */
}

.action-button:active {
  transform: translateY(-2px);
  box-shadow: 0 5px 10px -2px rgba(4, 125, 120, 0.3);
}

.button-icon {
  font-size: 1.25rem; /* Ikon sedikit lebih besar */
}

.button-shine {
  content: "";
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: rgba(255, 255, 255, 0.15); /* Lebih jelas efek sinarnya */
  transform: rotate(45deg);
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.action-button:hover .button-shine {
  opacity: 1;
  transform: rotate(30deg) translate(10%, -10%);
}

@media (max-width: 768px) {
  .error-code {
    font-size: 6rem;
  }
  .error-title {
    font-size: 1.75rem;
  }
  .error-description {
    font-size: 1rem;
  }
  .action-button {
    padding: 0.875rem 2rem;
  }
  .circle-1, .circle-2, .circle-3 {
    width: 200px;
    height: 200px;
    filter: blur(30px);
  }
}

@media (max-width: 576px) {
  .not-found-container {
    padding: 1rem;
  }
  .error-code {
    font-size: 4.5rem;
  }
  .error-title {
    font-size: 1.3rem;
  }
  .error-description {
    font-size: 0.9rem;
    margin-bottom: 2rem;
  }
  .action-button {
    width: 100%;
    justify-content: center;
    padding: 1rem;
  }
  .circle-1, .circle-2, .circle-3 {
    width: 150px;
    height: 150px;
    filter: blur(20px);
  }
}
</style>