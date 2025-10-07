<template>
  <div class="manajemen-user">
    <div class="page-container card-shadow-1">
      <header class="page-header-alt card-shadow-2">
        <h1 class="page-title-alt">
          <font-awesome-icon :icon="['fas', 'users']" /> Manajemen User
        </h1>
        <p class="page-subtitle-alt">Kelola semua pengguna dalam sistem</p>
      </header>
      <div class="toolbar">
        <div class="left-section">
          <button class="modern-button primary" @click="openAddUserModal">
            <font-awesome-icon :icon="['fas', 'plus']" />
            <span>Tambah User</span>
          </button>
        </div>

        <div class="right-section">
          <div class="dropdown-container-role">
            <font-awesome-icon :icon="['fas', 'user-tag']" />
            <select
              id="filter-role"
              class="dropdown-select"
              v-model="filterRole"
              @change="resetPagination"
            >
              <option value="">Semua Role</option>
              <option value="admin">Admin</option>
              <option value="puskesmas">Puskesmas</option>
            </select>
          </div>

          <div class="search-container">
            <font-awesome-icon :icon="['fas', 'search']" class="search-icon" />
            <input
              type="text"
              placeholder="Cari User..."
              class="search-input"
              v-model="searchQuery"
              @input="handleSearchInput"
            />
            <button v-if="searchQuery" class="clear-search" @click="clearSearch">
              <font-awesome-icon :icon="['fas', 'times']" />
            </button>
          </div>
        </div>
      </div>

      <div class="table-status" v-if="!isLoading && totalUsers > 0">
        <p class="results-text">
          <span class="results-count">{{ totalUsers }}</span> users ditemukan
          <span v-if="searchQuery" class="search-term">untuk "{{ searchQuery }}"</span>
        </p>
      </div>

      <div class="table-container-enhanced">
        <table class="data-table-enhanced">
          <thead>
            <tr>
              <th class="narrow-cell">No</th>
              <th>Username</th>
              <th>Nama</th>
              <th>Role</th>
              <th>Alamat (Puskesmas)</th>
              <th class="action-header">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="isLoading">
              <td colspan="6" class="loading-cell">
                <div class="loading-container">
                  <div class="loading-content">
                    <div class="spinner"></div>
                    <p>Memuat data...</p>
                  </div>
                </div>
              </td>
            </tr>
            <tr v-else-if="!isLoading && paginatedUsers.length === 0">
              <td colspan="6" class="empty-state">
                <div class="empty-state-content">
                  <font-awesome-icon :icon="['fas', 'users-slash']" class="empty-icon" />
                  <h3>Data tidak ditemukan</h3>
                  <p>Tidak ada user yang sesuai dengan kriteria pencarian atau filter Anda.</p>
                </div>
              </td>
            </tr>
            <tr v-else v-for="(user, index) in paginatedUsers" :key="user.id">
              <td class="narrow-cell">{{ index + 1 + (currentPage - 1) * pageSize }}</td>
              <td>{{ user.username }}</td>
              <td>{{ user.name }}</td>
              <td>
                <span class="role-badge" :class="getRoleBadgeClass(user.role)">
                  {{
                    user.role === "puskesmas"
                      ? "Puskesmas"
                      : user.role.charAt(0).toUpperCase() + user.role.slice(1)
                  }}
                </span>
              </td>
              <td>{{ user.address }}</td>
              <td class="action-cell">
                <div class="action-buttons-container">
                  <button class="action-button edit" @click="openEditUserModal(user)" title="Edit User">
                    <font-awesome-icon :icon="['fas', 'edit']" />
                    <span>Edit</span>
                  </button>
                  <button
                    class="action-button detail"
                    @click="viewUserDetails(user)"
                    title="Lihat Detail"
                  >
                    <font-awesome-icon :icon="['fas', 'eye']" />
                    <span>Detail</span>
                  </button>
                  <button
                    class="action-button delete"
                    @click="confirmDelete(user.id)"
                    title="Hapus User"
                  >
                    <font-awesome-icon :icon="['fas', 'trash']" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="pagination-container" v-if="totalPages > 0">
      </div>

      <div class="pagination-container" v-if="totalPages > 0">
          <div class="pagination-info-side">
              <p class="pagination-text">
                  Baris per halaman:
                  <div class="pagination-dropdown-wrapper">
                      <select v-model.number="pageSize" @change="resetPagination" class="pagination-dropdown-select">
                          <option value="10">10</option>
                          <option value="25">25</option>
                          <option value="100">100</option>
                      </select>
                  </div>
                  Menampilkan <strong>{{ firstItemIndex + 1 }} - {{ lastItemIndex }}</strong> dari <strong>{{ totalUsers }}</strong> user
              </p>
          </div>

          <nav class="pagination-nav" aria-label="Pagination">
              <button class="pagination-button prev-next" @click="prevPage" :disabled="currentPage === 1">
                  <font-awesome-icon :icon="['fas', 'chevron-left']" />
              </button>
              
              <template v-for="(item, index) in paginationItems" :key="index">
                  <button v-if="item !== 'ellipsis'" :class="['pagination-button', { 'active': currentPage === item }]" @click="goToPage(item)">
                      {{ item }}
                  </button>
                  <div v-else class="pagination-ellipsis">...</div>
              </template>
              
              <button class="pagination-button prev-next" @click="nextPage" :disabled="currentPage === totalPages">
                  <font-awesome-icon :icon="['fas', 'chevron-right']" />
              </button>
          </nav>
      </div>
    </div>

    <AddNewUserModal
      v-if="showAddUserModal"
      @close="closeAddUserModal"
      @user-added="handleUserAddedSuccess"
      @user-add-failed="handleUserAddFailed"
    />

    <EditUserModal
        v-if="showEditUserModal"
        :userId="selectedUserIdForEdit"
        :visible="showEditUserModal"
        @close="closeEditUserModal"
        @user-updated="handleUserUpdatedSuccess"
        @user-update-failed="handleUserUpdateFailed"
    />

    <UserDetailModal v-if="showDetailModal" :user="selectedUser" @close="closeDetailModal" />

  </div>
</template>

<script>
import apiClient from "../../api.js";
import Swal from "sweetalert2";

import AddNewUserModal from "../../components/modals/AddNewUser.vue";
import EditUserModal from "../../components/modals/EditUserModal.vue";
import UserDetailModal from "../../components/modals/UserDetailModal.vue";
import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faUsers, faPlus, faSearch, faTimes, faSpinner, faUsersSlash,
  faEdit, faEye, faTrash, faChevronLeft, faChevronRight, faUserTag,
  faUserPlus, faAt, faKey, faHospital, faUser, faExclamationCircle, faEyeSlash
} from '@fortawesome/free-solid-svg-icons';

library.add(
  faUsers, faPlus, faSearch, faTimes, faSpinner, faUsersSlash,
  faEdit, faEye, faTrash, faChevronLeft, faChevronRight, faUserTag,
  faUserPlus, faAt, faKey, faHospital, faUser, faExclamationCircle, faEyeSlash
);


export default {
  name: "ManajemenUser",
  components: {
    AddNewUserModal,
    EditUserModal,
    UserDetailModal,
  },
  data() {
    return {
      users: [],
      currentPage: 1,
      pageSize: 10,
      searchQuery: "",
      filterRole: "",
      showAddUserModal: false,
      showEditUserModal: false,
      selectedUserIdForEdit: null,
      selectedUser: null,
      showDetailModal: false,
      isLoading: false,
      searchTimeout: null,
    };
  },
  computed: {
    // ... bagian computed tetap sama ...
    totalUsers() {
      return this.filteredUsers.length;
    },
    totalPages() {
      if (this.totalUsers === 0) return 0;
      return Math.ceil(this.totalUsers / this.pageSize);
    },
    firstItemIndex() {
      if (this.totalUsers === 0) return -1;
      return (this.currentPage - 1) * this.pageSize;
    },
    lastItemIndex() {
      if (this.totalUsers === 0) return 0;
      const calculatedLastIndex = this.currentPage * this.pageSize;
      return Math.min(calculatedLastIndex, this.totalUsers);
    },
    filteredUsers() {
      return this.users.filter((user) => {
        const searchLower = this.searchQuery.toLowerCase();
        const roleMatch = this.filterRole
          ? user.role.toLowerCase() === this.filterRole.toLowerCase()
          : true;

        const searchMatch =
          (user.username && user.username.toLowerCase().includes(searchLower)) ||
          (user.name && user.name.toLowerCase().includes(searchLower)) ||
          (user.role && user.role.toLowerCase().includes(searchLower)) ||
          (user.address && user.address.toLowerCase().includes(searchLower));

        return searchMatch && roleMatch;
      });
    },
    paginatedUsers() {
      if (this.totalUsers === 0) return [];
      if (this.totalPages > 0 && this.currentPage > this.totalPages) {
        this.currentPage = this.totalPages;
      }
      const start = Math.max(0, this.firstItemIndex);
      const end = Math.max(start, this.lastItemIndex);
      return this.filteredUsers.slice(start, end);
    },
    paginationItems() {
        const result = [];
        const totalPages = this.totalPages;
        const currentPage = this.currentPage;

        // Jika total halaman sedikit, tampilkan semua
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) {
                result.push(i);
            }
            return result;
        }
        
        result.push(1);

        if (currentPage > 4) {
            result.push('ellipsis');
        }

        let startRange = (currentPage <= 4) ? 2 : currentPage - 1;
        let endRange = (currentPage >= totalPages - 3) ? totalPages - 1 : currentPage + 1;
        if(currentPage <= 4) endRange = 5;
        if(currentPage >= totalPages - 3) startRange = totalPages - 4;

        for (let i = startRange; i <= endRange; i++) {
            if (i > 1 && i < totalPages) {
                result.push(i);
            }
        }

        if (currentPage < totalPages - 3) {
            result.push('ellipsis');
        }
        
        result.push(totalPages);
        
        return [...new Set(result)]; 
    },
  },
  methods: {
    async fetchUsers() {
      this.isLoading = true;
      try {
        const response = await apiClient.get("/admin/users", {
          params: {
            page: this.currentPage,
            per_page: this.pageSize,
            role: this.filterRole || undefined,
            search: this.searchQuery || undefined,
          }
        });

        // Laravel resource collection shape: { data: [...], meta: {...pagination...} }
        const payload = response.data;
        const rows = payload.data || [];
        const meta = payload.meta || payload; // fallback if pagination structure default

        this.users = rows.map((user) => ({
          id: user.id,
          username: user.username,
          name: user.name,
          role: user.role,
          address: user.puskesmas?.name || (user.role === "admin" ? "Kantor Pusat" : "Belum ada data puskesmas"),
          email: user.email || "",
          phone: user.phone || "",
          profile_picture_url: user.profile_picture_url,
          puskesmas_detail: user.puskesmas,
          created_at: user.created_at,
          updated_at: user.updated_at,
        }));

        // Update pagination meta from server
        if (meta) {
          this.serverTotal = meta.total || this.users.length;
          this.currentPage = meta.current_page || this.currentPage;
          this.pageSize = meta.per_page || this.pageSize;
          this.lastPage = meta.last_page || 1;
          this.from = meta.from || 0;
          this.to = meta.to || 0;
        }
      } catch (error) {
        console.error("Gagal mengambil data pengguna:", error.response || error);
        if (error.response && error.response.status === 401) {
          Swal.fire({
            title: "Sesi Tidak Valid",
            text: "Sesi Anda tidak valid. Silakan login ulang.",
            icon: "error",
          });
        } else {
          Swal.fire("Error!", "Gagal memuat data pengguna.", "error");
        }
      } finally {
        this.isLoading = false;
      }
    },
    // ... metode lainnya tetap sama ...
    handleSearchInput() {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        this.resetPagination();
      }, 500);
    },
    getRoleBadgeClass(role) {
      const roleLower = role ? role.toLowerCase() : "";
      if (roleLower === "admin") return "role-admin";
      if (roleLower === "puskesmas") return "role-petugas"; // Keep as 'petugas' for consistency with current style
      return "role-user";
    },
    clearSearch() {
      this.searchQuery = "";
      this.resetPagination();
    },
    openAddUserModal() {
      this.showAddUserModal = true;
    },
    closeAddUserModal() {
      this.showAddUserModal = false;
    },
    async handleUserAddedSuccess(message) {
      this.closeAddUserModal();
      await Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: message || "User berhasil ditambahkan!",
          confirmButtonColor: '#047d78'
      });
      await this.fetchUsers();
      this.resetPagination();
    },
    handleUserAddFailed(errorMessage) {
      Swal.fire('Gagal!', errorMessage, 'error');
    },
    openEditUserModal(user) {
        this.selectedUserIdForEdit = user.id;
        this.showEditUserModal = true;
    },
    closeEditUserModal() {
        this.showEditUserModal = false;
        this.selectedUserIdForEdit = null;
    },
    async handleUserUpdatedSuccess(updatedUser) {
        this.closeEditUserModal();
        await Swal.fire({
            icon: 'success',
            title: 'Berhasil!',
            text: 'Data user berhasil diperbarui.',
            confirmButtonColor: '#047d78'
        });
        await this.fetchUsers();
    },
    handleUserUpdateFailed(errorMessage) {
        Swal.fire('Gagal!', errorMessage, 'error');
    },
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.fetchUsers();
      }
    },
    nextPage() {
      if (this.currentPage < (this.lastPage || this.totalPages)) {
        this.currentPage++;
        this.fetchUsers();
      }
    },
    goToPage(page) {
      if (page !== this.currentPage) {
        this.currentPage = page;
        this.fetchUsers();
      }
    },
    resetPagination() {
      this.currentPage = 1;
      this.fetchUsers();
    },
    viewUserDetails(user) {
      this.selectedUser = user;
      if (this.selectedUser) {
        this.showDetailModal = true;
      }
    },
    closeDetailModal() {
      this.showDetailModal = false;
      this.selectedUser = null;
    },
    async confirmDelete(id) {
        const result = await Swal.fire({
            title: 'Apakah Anda yakin?',
            text: 'Anda akan menghapus user ini! Tindakan ini tidak dapat dibatalkan.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Ya, hapus!',
            cancelButtonText: 'Batal',
            showLoaderOnConfirm: true,
            preConfirm: async () => {
                try {
                    // --- PERUBAHAN DI SINI ---
                    // Logika token dan header manual dihapus
                    await apiClient.delete(`/admin/users/${id}`); // Menggunakan apiClient
                    // --- AKHIR PERUBAHAN ---
                    return true;
                } catch (error) {
                    let errorMessage = error.response?.data?.message || error.message || "Terjadi kesalahan saat menghapus data.";
                    Swal.showValidationMessage(errorMessage);
                    return false;
                }
            },
            allowOutsideClick: () => !Swal.isLoading()
        });

        if (result.isConfirmed) {
            if (result.value === true) {
                Swal.fire('Berhasil!', 'User berhasil dihapus.', 'success');
                await this.fetchUsers();
                if (this.paginatedUsers.length === 0 && this.currentPage > 1) {
                    this.currentPage = Math.max(1, this.totalPages);
                } else if (this.currentPage > this.totalPages && this.totalPages > 0) {
                    this.currentPage = this.totalPages;
                }
            }
        }
    },
  },
  created() {
    this.fetchUsers();
  },
  watch: {
    filterRole() {
      this.resetPagination();
    },
  },
  beforeUnmount() {
    clearTimeout(this.searchTimeout);
  }
};
</script>

<style scoped>
/* Fallback or component-specific variables */
:root {
  --primary-50: #eef7f7;
  --primary-100: #d1e9e8;
  --primary-200: #a3d3d1;
  --primary-300: #75c2bf; /* Used for scrollbar thumb */
  --primary-400: #47b1ac;
  --primary-500: #047d78;
  --primary-600: #036a65;
  --primary-700: #025752;
  --primary-800: #024542;
  --gray-50: #f9fafb;
  --gray-100: #f3f4f6;
  --gray-200: #e5e7eb;
  --gray-300: #d1d5db;
  --gray-400: #9ca3af;
  --gray-500: #6b7280;
  --gray-600: #4b5563;
  --gray-700: #374151;
  --gray-800: #1f2937;
  --gray-900: #111827;
  --success-50: #f0fdf4;
  --success-500: #22c55e;
  --success-600: #16a34a;
  --warning-50: #fffbeb;
  --warning-500: #f59e0b;
  --warning-600: #d97706;
  --error-50: #fef2f2;
  --error-100: #fee2e2;
  --error-200: #fecaca;
  --error-500: #ef4444;
  --error-600: #dc2626;
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  --font-sans: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji",
    "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
}

/* Using semantic names for shadows */
.card-shadow-1 {
  box-shadow: var(--shadow-md);
}
.card-shadow-2 {
  box-shadow: var(--shadow-lg);
}

/* General Page Styles */
.manajemen-user {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  background-color: var(--gray-50);
  min-height: 100vh;
  box-sizing: border-box;
  padding: 30px;
  font-family: var(--font-sans);
}

.page-container {
  width: 100%;
  max-width: 1400px;
  background: #ffffff;
  border-radius: var(--radius-xl);
  padding: 30px;
  overflow: hidden;
}

.page-header-alt {
  background-color: var(--primary-500);
  color: white;
  padding: 24px 30px;
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  margin: -30px -30px 30px -30px;
  box-shadow: var(--shadow-lg);
}

.page-title-alt {
  font-size: 1.875rem;
  font-weight: 600;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-title-alt .svg-inline--fa {
  font-size: 1.1em;
}

.page-subtitle-alt {
  font-size: 1rem;
  font-weight: 300;
  opacity: 0.95;
  margin: 0;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 24px;
  gap: 20px;
  flex-wrap: wrap;
}

.left-section,
.right-section {
  display: flex;
  align-items: flex-end;
  gap: 16px;
  flex-wrap: wrap;
}

/* Dropdown Styles (for role) */
.dropdown-container-role {
  position: relative;
  width: 180px;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
}

.dropdown-container-role .svg-inline--fa {
  font-size: 1rem;
  color: var(--gray-600);
}

.dropdown-select {
  width: 100%;
  height: 42px;
  padding: 8px;
  border: 1px solid #eaeaea;
  border-radius: 10px;
  font-family: "Inter", sans-serif;
  font-size: 14px;
  color: #000000;
  background: #ffffff;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  outline: none;
  padding-right: 30px;
}

/* Custom dropdown arrow for .dropdown-select */
.dropdown-container-role::after {
  content: "▼";
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 12px;
  color: #9aa0a8;
  pointer-events: none;
}

.dropdown-select:hover {
  border-color: var(--primary-500);
}

.dropdown-select:focus {
  outline: none;
  border-color: var(--primary-500);
  box-shadow: 0 0 0 3px rgba(4, 125, 120, 0.2);
}

.modern-button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: var(--radius-md);
  font-family: var(--font-sans);
  font-size: 0.9375rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.1s, box-shadow 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  line-height: 1.5;
  box-shadow: var(--shadow-sm);
}

.modern-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.modern-button:active:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.modern-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  box-shadow: none;
}

.modern-button.primary {
  background-color: var(--primary-500);
  color: white;
}
.modern-button.primary:hover:not(:disabled) {
  background-color: var(--primary-600);
}

.search-container {
  display: flex;
  align-items: center;
  position: relative;
  min-width: 250px;
}

.search-icon {
  position: absolute;
  left: 16px;
  color: var(--gray-400);
  font-size: 16px;
  pointer-events: none;
}

.search-input {
  width: 100%;
  height: 42px;
  padding: 12px 40px 12px 40px;
  border: 1px solid var(--gray-300);
  border-radius: var(--radius-md);
  font-family: var(--font-sans);
  font-size: 0.9375rem;
  color: var(--gray-800);
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.search-input:focus {
  border-color: var(--primary-500);
  box-shadow: 0 0 0 3px rgba(4, 125, 120, 0.2);
}

.clear-search {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  color: var(--gray-400);
  cursor: pointer;
  padding: 4px;
}

.table-status {
  margin-bottom: 12px;
}
.results-text {
  font-size: 0.9375rem;
  color: var(--gray-600);
}
.results-count {
  font-weight: 600;
  color: var(--gray-900);
}
.search-term {
  font-style: italic;
}

.table-container-enhanced {
  overflow-x: auto;
  margin-bottom: 24px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--gray-200);
  background-color: white; /* Important for loading state background */
  scrollbar-width: thin;
  scrollbar-color: var(--primary-300) var(--gray-100);
}
.table-container-enhanced::-webkit-scrollbar {
  height: 8px;
  width: 8px;
}
.table-container-enhanced::-webkit-scrollbar-track {
  background: var(--gray-100);
  border-radius: 4px;
}
.table-container-enhanced::-webkit-scrollbar-thumb {
  background-color: var(--primary-300);
  border-radius: 4px;
}
.table-container-enhanced::-webkit-scrollbar-thumb:hover {
  background-color: var(--primary-400);
}

.data-table-enhanced {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 0.875rem;
  color: var(--gray-700);
  background-color: #ffffff;
}
.data-table-enhanced th,
.data-table-enhanced td {
  padding: 16px;
  text-align: left;
  border-bottom: 1px solid var(--gray-200);
  border-right: 1px solid var(--gray-200);
  vertical-align: middle;
}
.data-table-enhanced th:first-child,
.data-table-enhanced td:first-child {
  border-left: 1px solid var(--gray-200);
}
.data-table-enhanced thead tr:first-child th {
  border-top: 1px solid var(--gray-200);
}

.data-table-enhanced thead th {
  background: var(--gray-100);
  font-weight: 600;
  color: var(--gray-700);
  text-transform: uppercase;
  font-size: 0.8125rem;
  letter-spacing: 0.5px;
  position: sticky;
  top: 0;
  z-index: 1;
}
.data-table-enhanced tbody tr:hover {
  background-color: var(--primary-50);
}
.data-table-enhanced tbody tr:last-child td {
  border-bottom: none;
}
.data-table-enhanced th.narrow-cell,
.data-table-enhanced td.narrow-cell {
  width: 60px;
  text-align: center;
}
.data-table-enhanced th.action-header {
  text-align: center;
  width: 230px;
}

.role-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: capitalize;
  border: 1px solid transparent;
}
.role-admin {
  background-color: var(--error-50);
  color: var(--error-600);
  border-color: var(--error-100);
}
.role-petugas {
  background-color: var(--primary-50);
  color: var(--primary-700);
  border-color: var(--primary-100);
}
.role-user {
  background-color: var(--gray-100);
  color: var(--gray-600);
  border-color: var(--gray-200);
}

.action-cell {
  text-align: center;
}
.action-buttons-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
}
.action-button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: var(--radius-md);
  font-size: 13px;
  font-weight: 500;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
}
.action-button span {
  line-height: 1;
}
.action-button.detail {
  border-color: #a5b4fc;
  background: #eef2ff;
  color: #4f46e5;
}
.action-button.detail:hover {
  background: #e0e7ff;
  transform: translateY(-1px);
}
.action-button.edit {
  border-color: #10b981;
  background: #d1fae5;
  color: #059669;
}
.action-button.edit:hover {
  background: #a7f3d0;
  transform: translateY(-1px);
}
.action-button.delete {
  border-color: var(--error-500);
  background: var(--error-100);
  color: var(--error-600);
  padding: 8px 10px;
}
.action-button.delete:hover {
  background: var(--error-200);
  transform: translateY(-1px);
}

/* Loading/Empty State within table */
.loading-cell {
  padding: 60px 20px; /* Consistent with empty state padding */
  text-align: center;
  background-color: white; /* Ensure background is white */
}

.loading-container {
  width: 100%; /* Take full width of cell */
  height: 100%; /* Take full height of cell */
  display: flex;
  justify-content: center;
  align-items: center;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid var(--primary-500);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-content p {
  margin: 0;
  color: var(--primary-500);
  font-weight: 600;
}

.empty-state {
  padding: 60px 20px;
  text-align: center;
  background-color: white;
}
.empty-state-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.empty-icon {
  font-size: 48px;
  color: var(--gray-300);
  margin-bottom: 16px;
}
.empty-state h3 {
  font-size: 18px;
  font-weight: 600;
  color: var(--gray-600);
  margin-bottom: 8px;
}
.empty-state p {
  font-size: 14px;
  color: var(--gray-600);
}

.pagination-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 0;
    margin-top: 1.5rem; /* 24px */
    flex-wrap: wrap;
    gap: 1.5rem;
}

.pagination-info-side {
    flex-grow: 1;
}

.pagination-text {
    font-size: 0.875rem; /* 14px */
    color: var(--gray-600);
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
}

.pagination-text strong {
    color: var(--gray-800);
    font-weight: 600;
}

.pagination-dropdown-wrapper {
    position: relative;
    display: inline-block;
}

.pagination-dropdown-select {
    padding: 0.5rem 0.75rem;
    border: 1px solid var(--gray-300);
    border-radius: var(--radius-md);
    background: white;
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--gray-700);
    cursor: pointer;
    outline: none;
    transition: border-color 0.2s ease;
}
.pagination-dropdown-select:hover {
    border-color: var(--primary-400);
}

.pagination-nav {
    display: inline-flex;
    border-radius: var(--radius-md);
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.pagination-button {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 40px;
    height: 40px;
    padding: 0 0.5rem;
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--gray-700);
    background-color: white;
    border: 1px solid var(--gray-200);
    margin-left: -1px; /* Overlap borders */
    cursor: pointer;
    transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease;
}

.pagination-button:first-child {
    border-top-left-radius: var(--radius-md);
    border-bottom-left-radius: var(--radius-md);
    margin-left: 0;
}
.pagination-button:last-child {
    border-top-right-radius: var(--radius-md);
    border-bottom-right-radius: var(--radius-md);
}

.pagination-button:hover:not(.active):not(:disabled) {
    background-color: var(--gray-100);
    color: var(--primary-600);
}

.pagination-button.active {
    background-color: var(--primary-50);
    color: var(--primary-600);
    border-color: var(--primary-300);
    z-index: 3;
    font-weight: 600;
}

.pagination-button.prev-next {
    color: var(--gray-500);
}
.pagination-button.prev-next:hover:not(:disabled) {
    background-color: var(--primary-50);
}

.pagination-button:disabled {
    color: var(--gray-400);
    background-color: var(--gray-50);
    cursor: not-allowed;
}

.pagination-ellipsis {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 40px;
    height: 40px;
    padding: 0 0.5rem;
    font-size: 0.875rem;
    color: var(--gray-700);
    background-color: white;
    border: 1px solid var(--gray-200);
    margin-left: -1px;
}

@media (max-width: 768px) {
    .pagination-container {
        flex-direction: column;
        align-items: center;
    }
    .pagination-nav {
        margin-top: 1rem;
    }
    .pagination-info-side {
        width: 100%;
        display: flex;
        justify-content: center;
    }
}

@media (max-width: 640px) {
  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }
  .left-section,
  .right-section {
    width: 100%;
    justify-content: space-between;
  }
  .right-section {
    flex-direction: column;
    align-items: stretch;
  }
  .search-container {
    width: 100%;
  }
  .dropdown-container-role {
    width: 100%;
  }

  .page-header-alt {
    margin: -16px -16px 16px -16px;
    padding: 20px 24px;
  }
  .page-title-alt {
    font-size: 1.625rem;
    gap: 10px;
  }
  .page-subtitle-alt {
    font-size: 0.9375rem;
  }
}
</style>