<template>
  <div class="modal-overlay" @click.self="closeModal">
    <div class="modal-container">
      <div class="modal-header">
        <h2 class="modal-title">
          <font-awesome-icon :icon="['fas', 'info-circle']" class="header-icon" />
          Detail Pengguna
        </h2>
        <button class="close-button" @click="closeModal" aria-label="Tutup">
          <font-awesome-icon :icon="['fas', 'times']" />
        </button>
      </div>

      <div class="modal-body">
        <div v-if="isLoadingDetail" class="loading-state-container">
          <div class="spinner"></div>
          <p>Memuat detail pengguna...</p>
        </div>

        <div v-else class="user-profile">
          <div class="user-avatar-container">
            <div class="user-avatar">
              <img v-if="userProfilePictureUrl" :src="userProfilePictureUrl" alt="User Profile" class="profile-picture-display" />
              <font-awesome-icon v-else :icon="['fas', 'user']" />
            </div>
            <div class="user-name-container">
              <h3 class="user-name">{{ userDetail.name }}</h3>
              </div>
          </div>

          <div class="user-details">
            <div class="detail-section">
              <h4 class="section-title">Informasi Akun</h4>
              <div class="detail-grid">
                <div class="detail-item">
                  <div class="detail-label">
                    <font-awesome-icon :icon="['fas', 'user']" />
                    <span>Username</span>
                  </div>
                  <div class="detail-value">{{ userDetail.username }}</div>
                </div>

                <div class="detail-item">
                  <div class="detail-label">
                    <font-awesome-icon :icon="['fas', 'user-tag']" />
                    <span>Role</span>
                  </div>
                  <div class="detail-value">
                    <span class="role-badge" :class="getRoleBadgeClass(userDetail.role)">
                      {{
                        userDetail.role === "puskesmas"
                          ? "Puskesmas"
                          : userDetail.role?.charAt(0).toUpperCase() + userDetail.role?.slice(1)
                      }}
                    </span>
                  </div>
                </div>

                <div class="detail-item full-width-item">
                  <div class="detail-label">
                    <font-awesome-icon :icon="['fas', 'map-marker-alt']" />
                    <span>Alamat</span>
                  </div>
                  <div class="detail-value">{{ getUserAddress(userDetail) }}</div>
                </div>
              </div>
            </div>

            <div class="detail-section">
              <h4 class="section-title">Detail Waktu</h4>
              <div class="detail-grid">
                <div class="detail-item">
                  <div class="detail-label">
                    <font-awesome-icon :icon="['fas', 'calendar-plus']" />
                    <span>Tanggal Dibuat</span>
                  </div>
                  <div class="detail-value">{{ formatDate(userDetail.created_at) }}</div>
                </div>

                <div class="detail-item">
                  <div class="detail-label">
                    <font-awesome-icon :icon="['fas', 'calendar-check']" />
                    <span>Terakhir Diperbarui</span>
                  </div>
                  <div class="detail-value">{{ formatDate(userDetail.updated_at) }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// Use centralized api client
import apiClient from '../../api';
import Swal from 'sweetalert2';
import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faTimes, faUser, faUserTag, faMapMarkerAlt, faCalendarPlus,
  faInfoCircle, faCalendarCheck, faHospital, faIdBadge, faSpinner // Tambahkan faSpinner
} from '@fortawesome/free-solid-svg-icons';

library.add(
  faTimes, faUser, faUserTag, faMapMarkerAlt, faCalendarPlus,
  faInfoCircle, faCalendarCheck, faHospital, faIdBadge, faSpinner
);

export default {
  name: "UserDetailModal",
  props: {
    user: { // This prop will still contain the initial user data passed from parent
      type: Object,
      required: true
    }
  },
  data() {
    return {
      userDetail: {}, // This will hold the detailed user data fetched from API
      isLoadingDetail: false, // State untuk menampilkan/menyembunyikan loading
      userProfilePictureUrl: null,
    };
  },
  methods: {
    closeModal() {
      this.$emit('close');
    },
    async fetchUserDetail() {
      this.isLoadingDetail = true; // Mulai loading
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          Swal.fire({
            title: "Sesi Berakhir!",
            text: "Sesi Anda telah berakhir. Silakan login kembali.",
            icon: "warning",
          });
          this.closeModal(); // Close modal if no token
          return;
        }

        const params = {};
        // Only include puskesmas_id if the user is a puskesmas role and has a puskesmas_detail
        if (this.user.role === 'puskesmas' && this.user.puskesmas_detail && this.user.puskesmas_detail.id) {
          params.puskesmas_id = this.user.puskesmas_detail.id;
        }
        
        const response = await apiClient.get(`/admin/users/${this.user.id}`, {
          headers: { Authorization: `Bearer ${token}` },
          params: params
        });

        // Access the 'user' property from response.data based on your provided JSON
        this.userDetail = response.data.user;

        // Set profile picture URL
        this.userProfilePictureUrl = this.userDetail.profile_picture;

      } catch (error) {
        console.error("Error fetching user detail:", error.response || error);
        let errorMessage = "Gagal memuat detail pengguna.";
        if (error.response && error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        }
        Swal.fire('Error!', errorMessage, 'error');
        this.closeModal(); // Close modal on error
      } finally {
        this.isLoadingDetail = false; // Selesai loading, baik berhasil maupun gagal
      }
    },
    getRoleBadgeClass(role) {
      const roleLower = role ? role.toLowerCase() : "";
      if (roleLower === 'admin') return 'role-admin';
      if (roleLower === 'puskesmas') return 'role-puskesmas';
      return 'role-user'; // Default for other roles
    },
    getUserAddress(user) {
      if (user.role === 'admin') {
        return 'Kantor Pusat';
      } else if (user.role === 'puskesmas' && user.puskesmas && user.puskesmas.name) {
        return user.puskesmas.name;
      }
      return 'Belum ada data puskesmas';
    },
    getPuskesmasName(user) {
      if (user.role === 'puskesmas' && user.puskesmas && user.puskesmas.name) {
        return user.puskesmas.name;
      }
      return '-'; // Return '-' if not a puskesmas role or no puskesmas data
    },
    formatDate(dateString) {
      if (!dateString) return '-';
      try {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('id-ID', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }).format(date);
      } catch (error) {
        return dateString; // Return original string if formatting fails
      }
    }
  },
  watch: {
    user: {
      immediate: true, // Fetch details when component is created or user prop changes
      handler(newUser) {
        if (newUser && newUser.id) {
          this.userDetail = { ...newUser }; // Initialize with prop data to prevent empty display
          this.fetchUserDetail();
        }
      }
    }
  },
};
</script>

<style scoped>
/* Base colors for consistency */
:root {
  --primary-50: #ECFDF5;
  --primary-100: #D1FAE5;
  --primary-200: #A7F3D0;
  --primary-300: #6EE7B7;
  --primary-400: #34D399;
  --primary-500: #10B981; /* Main primary color */
  --primary-600: #059669;
  --primary-700: #047857;
  --primary-800: #065F46;
  --primary-900: #064E3B;
  
  --neutral-50: #F9FAFB;
  --neutral-100: #F3F4F6;
  --neutral-200: #E5E7EB;
  --neutral-300: #D1D5DB;
  --neutral-400: #9CA3AF;
  --neutral-500: #6B7280;
  --neutral-600: #4B5563;
  --neutral-700: #374151;
  --neutral-800: #1F2937;
  --neutral-900: #111827;
  
  --danger-50: #FEF2F2;
  --danger-500: #EF4444;
  --danger-700: #B91C1C;
  
  --warning-500: #F59E0B;
  
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}


/* Modal Overlay (background) */
.modal-overlay {
  position: fixed;
  z-index: 1000;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px); /* Consistent with AddNewPatient */
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Modal Container */
.modal-container {
  background-color: #ffffff;
  border-radius: 12px;
  max-width: 700px;
  width: 100%;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1); /* Consistent with AddNewPatient */
  animation: modalAppear 0.3s ease-out forwards;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden; /* Ensure content stays within rounded corners */
}

@keyframes modalAppear {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Modal Header - Styled like AddNewPatient */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 24px; /* Adjusted padding */
  border-bottom: 1px solid var(--neutral-200); /* Consistent border */
  background-color: var(--primary-50); /* Consistent background */
}

.modal-title {
  font-family: var(--font-sans); /* Use defined font variable */
  font-size: 20px;
  font-weight: 600;
  color: var(--primary-700); /* Consistent title color */
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px; /* Gap for icon */
}

.header-icon {
  color: var(--primary-500); /* Icon color */
  font-size: 1.1em; /* Adjust size relative to text */
}

.close-button {
  background: transparent;
  border: none;
  font-size: 20px; /* Larger icon */
  color: var(--neutral-500); /* Consistent color */
  cursor: pointer;
  width: 36px; /* Larger hit area */
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%; /* Rounded button */
  transition: all 0.2s ease;
}

.close-button:hover {
  background-color: var(--neutral-200);
  color: var(--neutral-800);
}

/* Modal Body */
.modal-body {
  padding: 24px;
  overflow-y: auto;
  flex-grow: 1;
  scrollbar-width: thin;
  scrollbar-color: var(--neutral-400) var(--neutral-100);
}

.modal-body::-webkit-scrollbar {
  width: 8px;
}
.modal-body::-webkit-scrollbar-track {
  background: var(--neutral-100);
  border-radius: 10px;
}
.modal-body::-webkit-scrollbar-thumb {
  background-color: var(--neutral-400);
  border-radius: 10px;
}

/* Loading State Container */
.loading-state-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px; /* Ensure loading spinner has space */
  gap: 16px;
  color: var(--primary-500);
  font-weight: 600;
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid var(--primary-500);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}


/* User Profile */
.user-profile {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Avatar dan Nama */
.user-avatar-container {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--neutral-200); /* Consistent border */
}

.user-avatar {
  width: 80px;
  height: 80px;
  background-color: var(--neutral-200);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  color: var(--neutral-500);
  overflow: hidden; /* Ensure image fits within circle */
  flex-shrink: 0; /* Prevent shrinking on small screens */
}

.user-avatar .profile-picture-display {
  width: 100%;
  height: 100%;
  object-fit: cover; /* Cover the area, cropping if necessary */
}

.user-name-container {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.user-name {
  font-size: 24px;
  font-weight: 600;
  color: var(--neutral-900);
  margin: 0;
}

/* Role Badge */
.role-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  text-transform: capitalize;
  width: fit-content;
}

.role-badge.role-admin {
  background-color: var(--danger-50);
  color: var(--danger-700);
}

.role-badge.role-puskesmas {
  background-color: var(--primary-100);
  color: var(--primary-700);
}

.role-badge.role-user {
  background-color: var(--neutral-100);
  color: var(--neutral-600);
}

/* User Details */
.user-details {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.detail-section {
  background-color: white; /* Added background */
  border-radius: 10px;
  border: 1px solid var(--neutral-200); /* Consistent border */
  padding: 20px; /* Consistent padding */
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05); /* Consistent shadow */
  transition: box-shadow 0.3s ease;
}

.detail-section:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--neutral-700);
  margin: 0;
  padding-bottom: 12px; /* Increased padding */
  border-bottom: 1px solid var(--neutral-200); /* Consistent border */
  margin-bottom: 16px; /* Added margin-bottom */
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-item.full-width-item {
  grid-column: 1 / -1; /* Make it span full width in grid */
}

.detail-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--neutral-600);
}

.detail-value {
  font-size: 16px;
  color: var(--neutral-800);
  font-weight: 500;
  line-height: 1.5; /* Improve readability for multi-line address */
}

/* No modal footer needed as per instructions */

/* Responsive Adjustments */
@media (max-width: 640px) {
  .modal-container {
    width: calc(100% - 32px);
    margin: 0 16px;
  }
  
  .user-avatar-container {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .user-name-container {
    align-items: center; /* Center name and badge when column layout */
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>