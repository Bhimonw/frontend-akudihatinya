<template>
  <div class="sidebar" :class="{ collapsed: !isSidebarOpen }">
    <!-- Top Bar (Profile Placeholder) -->
    <div class="top-bar">
      <div class="profile-placeholder">
        <div class="circle">
          <img
            :src="profileImageSrc"
            alt="Profile Picture"
            class="profile-image"
          />
        </div>
      </div>
      <h3 v-if="isSidebarOpen" class="app-name">Akudihatinya</h3>
    </div>

    <ul class="menu-list">
      <li
        v-for="item in menuItems"
        :key="item.key"
        class="menu-item"
        :class="{ active: activeMenu === item.key }"
        @click="navigate(item)"
      >
        <font-awesome-icon :icon="['fas', item.icon]" class="menu-icon" />
        <span v-if="isSidebarOpen" class="menu-text">{{ item.label }}</span>
      </li>
    </ul>
  </div>
</template>

<script>
import defaultProfileImage from '../assets/ptm-icon.jpg';

export default {
  props: {
    isSidebarOpen: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      profileImageSrc: defaultProfileImage,
      activeMenu: 'dashboard', // Akan diinisialisasi ulang di created()
      menuItems: [
        { key: 'dashboard', label: 'Dashboard', icon: 'chart-line' },
        { key: 'manajemen-user', label: 'Manajemen User', icon: 'users' },
        { key: 'sasaran-puskesmas', label: 'Sasaran Tahunan', icon: 'bullseye' },
      ],
    };
  },
  methods: {
    // Fungsi untuk memperbarui activeMenu berdasarkan path saat ini
    updateActiveMenu() {
      const currentPath = this.$route.path;
      // Memastikan bahwa hanya rute yang diawali dengan '/admin/' yang diproses
      if (currentPath.startsWith('/admin/')) {
        const currentKey = currentPath.substring('/admin/'.length);
        const foundItem = this.menuItems.find(item => item.key === currentKey);
        if (foundItem) {
          this.activeMenu = foundItem.key;
        } else {
          // Fallback jika tidak ada item yang cocok, bisa diatur ke default atau tidak ada yang aktif
          this.activeMenu = ''; // Atau 'dashboard' jika Anda ingin default
        }
      } else {
        // Jika rute bukan di bawah '/admin/', mungkin tidak ada menu yang aktif
        this.activeMenu = ''; // Atau 'dashboard' jika Anda ingin default
      }
    },
    navigate(item) {
      // Tidak perlu set activeMenu di sini karena akan di-handle oleh watcher $route
      this.$router.push(`/admin/${item.key}`);
    },
  },
  created() {
    // Panggil updateActiveMenu saat komponen dibuat
    this.updateActiveMenu();
  },
  watch: {
    // Panggil updateActiveMenu setiap kali route berubah
    '$route': 'updateActiveMenu'
  }
};
</script>

<style scoped>
/* Sidebar Container */
.sidebar {
  width: 270px; /* Open width */
  height: 100vh;
  background: #ffffff;
  box-shadow: 0px 306px 122px rgba(163, 163, 163, 0.01),
    0px 172px 103px rgba(163, 163, 163, 0.05),
    0px 77px 77px rgba(163, 163, 163, 0.09),
    0px 19px 42px rgba(163, 163, 163, 0.1);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 16px 0px 48px;
  gap: 10px;
  z-index: 2; /* Ensure sidebar is above other elements */
  transition: width 0.3s ease; /* Smooth transition for collapsing */
}

.sidebar.collapsed {
  width: 90px; /* Increased width for collapsed state */
  align-items: center; /* Center items horizontally when collapsed */
}

/* Top Bar */
.top-bar {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0px 8px 0px 20px;
  gap: 10px;

  width: 100%;
  height: 40px;
  transition: all 0.3s ease; /* Smooth transition for alignment */

  margin-bottom: 44px;
}

.sidebar.collapsed .top-bar {
  justify-content: center; /* Center items horizontally when collapsed */
  padding: 0px; /* Remove padding when collapsed */
}

.profile-placeholder {
  position: relative;
  width: 40px;
  height: 40px;
  border: 2px solid #bbbbbb;
  border-radius: 99999px;
  overflow: hidden; /* Memastikan gambar tetap circular */
}

.circle {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: #f0f0f0; /* Placeholder background */
  display: flex;
  justify-content: center;
  align-items: center;
}

.profile-image {
  width: 100%;
  height: 100%;
  object-fit: cover; /* Memastikan gambar menutupi area lingkaran */
}

.placeholder {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: #f0f0f0; /* Placeholder background */
}
.app-name {
  font-family: "Poppins", sans-serif;
  font-weight: 700;
  font-size: 20px;
  line-height: 30px;
  color: var(--primary-500);
  white-space: nowrap; /* Prevent text wrapping */
}

/* Menu List */
.menu-list {
  display: flex;
  flex-direction: column;
  align-items: flex-start; /* Align items to the left by default */
  padding: 0px 20px;
  gap: 16px;

  width: 100%;
}

.menu-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 12px;
  gap: 12px;

  width: 100%;
  height: 50px;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.menu-item:hover {
  background: #f2f9f9;
}

.menu-item.active {
  background: var(--secondary-100);
}

.menu-icon {
  width: 24px;
  height: 24px;
  color: #8f8f8f;
  transition: transform 0.3s ease; /* Smooth scaling for active state */
}

.menu-item.active .menu-icon {
  color: var(--primary-500);
  transform: scale(1.2); /* Slightly enlarge active icon */
}

.menu-text {
  font-family: "Inter", sans-serif;
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  color: #8f8f8f;
  white-space: nowrap; /* Prevent text wrapping */
}

.menu-item.active .menu-text {
  color: var(--primary-500);
}

/* Section Label */
.section-label {
  width: 100%;
  font-size: 10px;
}

.section-label span {
  font-family: "Inter", sans-serif;
  font-weight: 400;
  font-size: 16px;
  line-height: 24px;
  color: #6e6e6e;
}

/* Adjustments for Collapsed State */
.sidebar.collapsed .menu-list {
  align-items: center; /* Center items horizontally when collapsed */
}

.sidebar.collapsed .menu-item {
  justify-content: center; /* Center icons horizontally when collapsed */
  padding: 12px 0px; /* Remove horizontal padding when collapsed */
}

.sidebar.collapsed .menu-text {
  display: none; /* Hide text labels when collapsed */
}

.sidebar.collapsed .section-label {
  display: none; /* Hide section labels when collapsed */
}
</style>