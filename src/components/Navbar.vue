<template>
  <header class="navbar">
    <!-- Left Section: Menu Button + Page Title -->
    <div class="left-section">
      <div class="menu-button" @click="$emit('toggle-sidebar')">
        <font-awesome-icon :icon="['fas', 'bars']" class="menu-icon" />
      </div>
      <h1 class="page-title">{{ pageTitle }}</h1>
    </div>

    <!-- Profile Section -->
    <div
      class="profile-section"
      :class="{ 'active-dropdown': isDropdownOpen }"
      @click="toggleDropdown"
    >
      <!-- Mask Group (Profile Picture) -->
      <div class="mask-group">
        <div class="ellipse"></div>
        <img
          src="../../src/assets/profile.jpg"
          alt="Profile Icon"
          class="profile-icon"
        />
      </div>

      <!-- User Information -->
      <div class="user-info">
        <div class="department-container">
          <p class="department">{{ userData.name || 'User' }}</p>
          <div class="dropdown-indicator" @click.stop="toggleDropdown">
            <font-awesome-icon :icon="['fas', 'chevron-down']" class="dropdown-icon" />
          </div>
        </div>
      </div>
    </div>

    <!-- Dropdown Menu -->
    <div v-if="isDropdownOpen" class="dropdown-menu">
      <div class="dropdown-header">
        <div class="mask-group">
          <div class="ellipse"></div>
          <img src="../../src/assets/profile.jpg" alt="Profile Icon" class="profile-icon" />
        </div>
        <div class="dropdown-user-info">
          <p class="dropdown-department">{{ userData.name || 'User' }}</p>
          <p class="dropdown-role">{{ userData.role || 'User' }}</p>
          <p v-if="userData.puskesmas" class="dropdown-role">{{ userData.puskesmas.nama_puskesmas }}</p>
        </div>
      </div>
      <hr class="dropdown-divider" />
      <div class="dropdown-item">
        <div class="dropdown-icon">
          <font-awesome-icon :icon="['fas', 'user']" />
        </div>
        <p>Lihat Profil</p>
      </div>
      <div class="dropdown-item">
        <div class="dropdown-icon">
          <font-awesome-icon :icon="['fas', 'moon']" />
        </div>
        <p>Mode Gelap</p>
        <label class="switch">
          <input type="checkbox" />
          <span class="slider round"></span>
        </label>
      </div>
      <div class="dropdown-item" @click="handleLogout">
        <div class="dropdown-icon">
          <font-awesome-icon :icon="['fas', 'sign-out-alt']" />
        </div>
        <p>Logout</p>
      </div>
    </div>
  </header>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth'; // Change this line
import Swal from 'sweetalert2';

export default {
  props: {
    pageTitle: {
      type: String,
      required: true,
    },
  },
  emits: ['toggle-sidebar'],
  setup() {
    const router = useRouter();
    const authStore = useAuthStore(); // Add this line to get the store instance
    const isDropdownOpen = ref(false);
    const userData = ref({
      name: 'Loading...',
      role: 'Loading...',
      puskesmas: null
    });

    // Function to fetch user data from API
    const fetchUserData = async () => {
      try {
        const response = await authStore.fetchUserData();
        if (response && response.user) {
          userData.value = response.user;
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      }
    };

    const toggleDropdown = () => {
      isDropdownOpen.value = !isDropdownOpen.value;
    };

    const closeDropdown = (event) => {
      if (isDropdownOpen.value && !event.target.closest('.profile-section')) {
        isDropdownOpen.value = false;
      }
    };

    const handleLogout = async () => {
      // Tampilkan notifikasi konfirmasi
      const confirmation = await Swal.fire({
        title: 'Apakah Anda Yakin?',
        text: 'Anda akan keluar dari aplikasi.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Ya, Logout!',
        cancelButtonText: 'Batal',
      });

      // Jika pengguna membatalkan logout
      if (!confirmation.isConfirmed) {
        return;
      }
      try {
        // Use the auth store to handle logout
        authStore.logout();
        // Show success notification
        Swal.fire({
          title: 'Berhasil',
          text: 'Anda telah berhasil logout.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (error) {
        console.error('Failed to logout:', error);
        
        // Show failure notification
        Swal.fire({
          title: 'Gagal!',
          text: 'Terjadi kesalahan saat logout. Silakan coba lagi.',
          icon: 'error',
        });
      }
    };

    onMounted(() => {
      fetchUserData(); // Fetch user data saat komponen dimuat
      window.addEventListener('click', closeDropdown);
    });

    return {
      isDropdownOpen,
      toggleDropdown,
      userData,
      handleLogout,
    };
  },
};
</script>

<style scoped>

  /* Navbar Container */
.navbar {
  width: 100%; /* Mengambil lebar penuh dari area konten */
  height: 78px;
  background: #f7f8f9; /* Warna latar belakang navbar */
  display: flex;
  justify-content: space-between; /* Menyusun elemen di kiri dan kanan */
  align-items: center; /* Pusatkan elemen secara vertikal */
  padding: 0 30px; /* Padding untuk ruang di dalam navbar */
  box-sizing: border-box;
}

/* Left Section: Menu Button + Page Title */
.left-section {
  display: flex; /* Gunakan flexbox untuk menyusun elemen horizontal */
  align-items: center; /* Pusatkan elemen secara vertikal */
  gap: 10px; /* Jarak antara tombol menu dan judul halaman */
}

/* Menu Button */
.menu-button {
  cursor: pointer; /* Ubah kursor menjadi pointer saat hover */
}

.menu-icon {
  color: var(--accent-500); /* Warna ikon biru */
  font-size: 24px; /* Ukuran ikon */
  transition: transform 0.3s ease; /* Animasi halus saat hover */
}

.menu-button:hover .menu-icon {
  transform: scale(1.1); /* Efek zoom saat hover */
}

/* Page Title */
.page-title {
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  font-size: 26px;
  line-height: 31px;
  color: #232859; /* Warna teks gelap */
  margin: 0; /* Hilangkan margin default dari elemen h1 */
}

/* Profile Section */
.profile-section {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  position: relative; /* Agar dropdown muncul relatif terhadap profile-section */
}

/* Mask Group (Avatar) */
.mask-group {
  position: relative;
  width: 44px;
  height: 44px;
}

/* Ellipse (Lingkaran Avatar) */
.ellipse {
  position: absolute;
  width: 44px;
  height: 44px; /* Warna latar belakang lingkaran */
  border-radius: 50%;
  transition: transform 0.3s ease; /* Animasi halus saat hover */
}

.profile-section:hover .ellipse,
.profile-section.active-dropdown .ellipse {
  transform: scale(1.1); /* Zoom pada avatar saat hover atau dropdown aktif */
}

/* Profile Icon */
.profile-icon {
  position: absolute;
  width: 48.4px;
  height: 46.93px;
  left: -2px;
  top: -2px;
  border-radius: 50%; /* Pastikan gambar tetap bulat */
}

/* User Information */
.user-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

/* Department Container */
.department-container {
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
}

/* Department Name */
.department {
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  font-size: 16px;
  line-height: 19px;
  color: #45464b;
  margin: 0;
}

/* Dropdown Indicator */
.dropdown-indicator {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.dropdown-icon {
  color: #94979e; /* Warna ikon abu-abu */
  font-size: 12px;
  transition: transform 0.3s ease; /* Animasi rotasi saat hover */
}

.profile-section:hover .dropdown-icon,
.profile-section.active-dropdown .dropdown-icon {
  transform: rotate(180deg); /* Putar ikon panah saat dropdown aktif */
}

/* Dropdown Menu */
.dropdown-menu {
  position: absolute;
  top: 78px; /* Sesuaikan dengan tinggi navbar */
  right: 30px; /* Sesuaikan dengan padding navbar */
  width: 250px;
  background: #ffffff; /* Warna latar belakang dropdown */
  border-radius: 10px; /* Sudut melengkung */
  box-shadow: 0px 4px 16px rgba(0, 0, 0, 0.1); /* Bayangan halus */
  z-index: 1000; /* Pastikan dropdown berada di atas elemen lain */
  padding: 16px;
  display: flex;
  flex-direction: column;
}

/* Dropdown Header */
.dropdown-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}

.dropdown-user-info {
  display: flex;
  flex-direction: column;
}

.dropdown-department {
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  font-size: 14px;
  color: #05080c;
  margin: 0;
}

.dropdown-role {
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  font-size: 12px;
  color: #868686;
  margin: 0;
}

/* Dropdown Divider */
.dropdown-divider {
  border: 0.5px solid #e1e1e1;
  margin: 8px 0;
}

/* Dropdown Item */
.dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  cursor: pointer;
  border-radius: 6px; /* Sudut melengkung */
  transition: background-color 0.3s ease; /* Animasi halus saat hover */
}

.dropdown-item:hover {
  background-color: #f7f8f9; /* Warna latar belakang hover */
}

.dropdown-icon {
  color: #05080c; /* Warna ikon dropdown item */
  font-size: 16px;
}

.dropdown-item p {
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  font-size: 12px;
  color: #05080c;
  margin: 0;
}

/* Switch */
.switch {
  position: relative;
  display: inline-block;
  width: 36px;
  height: 20px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #d2d5da; /* Warna slider default */
  border-radius: 100px; /* Bentuk slider melengkung */
  transition: 0.3s; /* Animasi halus saat toggle */
}

.slider:before {
  position: absolute;
  content: '';
  height: 16px;
  width: 16px;
  left: 2px;
  bottom: 2px;
  background-color: #ffffff; /* Warna bola slider */
  border-radius: 50%; /* Bentuk bola slider bulat */
  transition: 0.3s; /* Animasi halus saat toggle */
}

input:checked + .slider {
  background-color: #4685fd; /* Warna slider saat aktif */
}

input:checked + .slider:before {
  transform: translateX(16px); /* Geser bola slider ke kanan */
}
  </style>