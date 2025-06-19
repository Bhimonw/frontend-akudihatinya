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
                  <button class="action-button edit" @click="editUser(user)" title="Edit User">
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
        <div class="pagination-wrapper">
          <div class="pagination-info">
            <div class="showing-text">
              <p class="text-sm text-gray-700 flex items-center gap-2">
                <span>Menampilkan</span>
                <strong>{{ paginatedUsers.length > 0 ? firstItemIndex + 1 : 0 }}-{{ lastItemIndex }}</strong>
                <span>dari</span>
                <strong>{{ totalUsers }}</strong>
                <span>item</span>
              </p>
            </div>

            <div class="rows-per-page">
              <span>Baris per halaman:</span>
              <div class="dropdown-container select-wrapper">
                <select
                  id="rowsPerPage"
                  v-model="pageSize"
                  @change="resetPagination"
                  class="dropdown-select modern-select"
                >
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="100">100</option>
                </select>
              </div>
            </div>
          </div>

          <nav class="pagination-controls" aria-label="Pagination">
            <button
              class="pagination-button prev"
              @click="prevPage"
              :disabled="currentPage === 1"
              :class="{ disabled: currentPage === 1 }"
            >
              <font-awesome-icon :icon="['fas', 'chevron-left']" />
              <span class="button-text">Sebelumnya</span>
            </button>
            <div class="page-numbers">
              <button
                v-for="page in displayedPages"
                :key="page"
                :class="['pagination-button page-number', { active: currentPage === page }]"
                @click="goToPage(page)"
              >
                {{ page }}
              </button>
            </div>
            <button
              class="pagination-button next"
              @click="nextPage"
              :disabled="currentPage === totalPages"
              :class="{ disabled: currentPage === totalPages }"
            >
              <span class="button-text">Selanjutnya</span>
              <font-awesome-icon :icon="['fas', 'chevron-right']" />
            </button>
          </nav>
        </div>
      </div>
    </div>

    <AddNewUserModal
      v-if="showAddUserModal"
      @close="closeAddUserModal"
      @submit="handleUserSubmit"
      :isSubmitting="isSubmitting"
    />

    <ConfirmModal
      v-if="showConfirmModal"
      :title="'Konfirmasi Hapus User'"
      :message="'Apakah Anda yakin ingin menghapus user ini?'"
      @confirm="deleteUser"
      @cancel="closeConfirmModal"
    />

    <UserDetailModal v-if="showDetailModal" :user="selectedUser" @close="closeDetailModal" />

    <div v-if="isOverallLoading" class="top-loading-bar">
      <div class="loading-bar-progress"></div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import AddNewUserModal from "../../components/modals/AddNewUser.vue";
import ConfirmModal from "../../components/modals/ConfirmModal.vue";
import UserDetailModal from "../../components/modals/UserDetailModal.vue";
import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faUsers, faPlus, faSearch, faTimes, faSpinner, faUsersSlash,
  faEdit, faEye, faTrash, faChevronLeft, faChevronRight, faUserTag
} from '@fortawesome/free-solid-svg-icons';

library.add(
  faUsers, faPlus, faSearch, faTimes, faSpinner, faUsersSlash,
  faEdit, faEye, faTrash, faChevronLeft, faChevronRight, faUserTag
);


export default {
  name: "ManajemenUser",
  components: {
    AddNewUserModal,
    ConfirmModal,
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
      showConfirmModal: false,
      userToDelete: null,
      selectedUser: null,
      showDetailModal: false,
      isLoading: false, // For table loading
      isSubmitting: false, // For form submission loading
      isOverallLoading: false, // For top loading bar
      searchTimeout: null, // For debouncing search
    };
  },
  computed: {
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
      // Apply filter and search here directly as we're handling pagination on client-side based on this filtered data
      // If you switch to server-side pagination/filtering, this method will change
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
    displayedPages() {
      const maxButtons = 5;
      if (this.totalPages <= maxButtons) {
        return Array.from({ length: this.totalPages }, (_, i) => i + 1);
      }
      const halfButtons = Math.floor(maxButtons / 2);
      let startPage = Math.max(1, this.currentPage - halfButtons);
      let endPage = Math.min(this.totalPages, startPage + maxButtons - 1);
      if (endPage - startPage + 1 < maxButtons) {
        startPage = Math.max(1, endPage - maxButtons + 1);
      }
      return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
    },
  },
  methods: {
    async fetchUsers() {
      this.isLoading = true; // Start table loading
      this.isOverallLoading = true; // Start top loading bar
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          this.$toast.error("Sesi Anda berakhir, silakan login kembali.");
          return;
        }
        const response = await axios.get("http://localhost:8000/api/admin/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        this.users = response.data.users.map((user) => ({
          id: user.id,
          username: user.username,
          name: user.name,
          role: user.role,
          address:
            user.puskesmas?.name ||
            (user.role === "admin" ? "Kantor Pusat" : "Belum ada data puskesmas"),
          email: user.email || "",
          phone: user.phone || "",
          profile_picture_url: user.profile_picture_url,
          puskesmas_detail: user.puskesmas,
          created_at: user.created_at,
          updated_at: user.updated_at,
        }));
      } catch (error) {
        console.error("Gagal mengambil data pengguna:", error.response || error);
        if (error.response && error.response.status === 401) {
          this.$toast.error("Sesi tidak valid. Silakan login ulang.");
        } else {
          this.$toast.error("Gagal memuat data pengguna.");
        }
      } finally {
        this.isLoading = false; // End table loading
        this.isOverallLoading = false; // End top loading bar
      }
    },
    handleSearchInput() {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        this.resetPagination(); // Reset pagination when search query changes
      }, 500); // Debounce search for 500ms
    },
    getRoleBadgeClass(role) {
      const roleLower = role ? role.toLowerCase() : "";
      if (roleLower === "admin") return "role-admin";
      if (roleLower === "puskesmas") return "role-petugas";
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
    async handleUserSubmit(formDataFromModal) {
      console.log("ManajemenUser.vue - handleUserSubmit dipanggil dengan data:", formDataFromModal);
      this.isSubmitting = true; // Start submission loading
      this.isOverallLoading = true; // Start top loading bar
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          this.$toast.error("Token tidak ditemukan. Silakan login kembali.");
          this.isSubmitting = false;
          this.isOverallLoading = false;
          return;
        }

        let apiPayload;
        let configHeaders = {
          Authorization: `Bearer ${token}`,
        };

        if (formDataFromModal.profilePicture instanceof File) {
          apiPayload = new FormData();
          apiPayload.append("username", formDataFromModal.username);
          apiPayload.append("password", formDataFromModal.password);
          apiPayload.append("name", formDataFromModal.name);
          apiPayload.append("role", formDataFromModal.role);
          apiPayload.append(
            "profile_picture",
            formDataFromModal.profilePicture,
            formDataFromModal.profilePicture.name
          );
        } else {
          apiPayload = {
            username: formDataFromModal.username,
            password: formDataFromModal.password,
            name: formDataFromModal.name,
            role: formDataFromModal.role,
            profile_picture: null,
          };
          configHeaders["Content-Type"] = "application/json";
        }

        const response = await axios.post(
          "http://localhost:8000/api/admin/users",
          apiPayload,
          {
            headers: configHeaders,
          }
        );

        this.$toast.success(response.data.message || "User berhasil ditambahkan!");
        this.closeAddUserModal();
        await this.fetchUsers(); // Re-fetch all users to update the table
        this.resetPagination(); // Reset pagination to first page after add
      } catch (error) {
        console.error("Gagal menambahkan user:", error.response ? error.response.data : error.message);
        let errorMessage = "Gagal menambahkan user.";
        if (error.response && error.response.data) {
          if (error.response.data.message) {
            errorMessage = error.response.data.message;
          } else if (error.response.data.errors) {
            const errors = error.response.data.errors;
            const firstErrorKey = Object.keys(errors)[0];
            if (firstErrorKey && errors[firstErrorKey].length > 0) {
              errorMessage = errors[firstErrorKey][0];
            } else {
              errorMessage = `Terjadi kesalahan validasi. (${error.response.status})`;
            }
          } else {
            errorMessage = `Terjadi kesalahan server. (${error.response.status})`;
          }
        } else if (error.request) {
          errorMessage = "Tidak ada respons dari server. Periksa koneksi Anda.";
        } else {
          errorMessage = error.message || "Terjadi kesalahan tidak diketahui.";
        }
        this.$toast.error(errorMessage);
      } finally {
        this.isSubmitting = false; // End submission loading
        this.isOverallLoading = false; // End top loading bar
      }
    },
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    },
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    },
    goToPage(page) {
      this.currentPage = page;
    },
    resetPagination() {
      this.currentPage = 1;
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
    editUser(user) {
      this.$toast.info(`Fitur edit untuk user ${user.name} sedang dalam pengembangan.`);
      console.log("Edit user data:", user);
    },
    confirmDelete(id) {
      this.userToDelete = id;
      this.showConfirmModal = true;
    },
    closeConfirmModal() {
      this.showConfirmModal = false;
      this.userToDelete = null;
    },
    async deleteUser() {
      if (this.userToDelete) {
        this.isOverallLoading = true; // Start top loading bar for delete
        try {
          const token = localStorage.getItem("token");
          if (!token) {
            this.$toast.error("Token tidak ditemukan. Silakan login kembali.");
            this.closeConfirmModal();
            this.isOverallLoading = false;
            return;
          }
          // AKTIFKAN JIKA API DELETE SUDAH ADA
          // await axios.delete(`http://localhost:8000/api/admin/users/${this.userToDelete}`, {
          //   headers: { Authorization: `Bearer ${token}` },
          // });
          // this.$toast.success("User berhasil dihapus!");

          // SIMULASI (hapus jika API delete diaktifkan)
          this.users = this.users.filter((user) => user.id !== this.userToDelete);
          this.$toast.success("User berhasil dihapus (simulasi)!");
          // END SIMULASI

          await this.fetchUsers(); // Re-fetch all users to update the table

          if (this.paginatedUsers.length === 0 && this.currentPage > 1) {
            this.currentPage = Math.max(1, this.totalPages);
          } else if (this.currentPage > this.totalPages && this.totalPages > 0) {
            this.currentPage = this.totalPages;
          }
        } catch (error) {
          console.error("Gagal menghapus user:", error.response?.data || error.message);
          this.$toast.error(error.response?.data?.message || "Gagal menghapus user.");
        } finally {
          this.closeConfirmModal();
          this.isOverallLoading = false; // End top loading bar for delete
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
  padding: 12px 0;
  margin-top: 24px;
}
.pagination-wrapper {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.pagination-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.showing-text,
.rows-per-page {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: var(--gray-600);
}
.pagination-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}
.page-numbers {
  display: flex;
  align-items: center;
  gap: 4px;
}
.pagination-button {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  height: 40px;
  padding: 0 12px;
  font-size: 14px;
  font-weight: 500;
  color: var(--gray-600);
  background: #ffffff;
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
}
.pagination-button:hover:not(.disabled) {
  color: var(--primary-500);
  border-color: var(--primary-500);
}
.pagination-button.page-number {
  width: 40px;
}
.pagination-button.active {
  color: #ffffff;
  background-color: var(--primary-500);
  border-color: var(--primary-500);
}
.pagination-button.prev,
.pagination-button.next {
  gap: 6px;
  padding: 0 16px;
}
.pagination-button.disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background-color: var(--gray-50);
}

/* Top Loading Bar */
.top-loading-bar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background-color: var(--primary-100);
  z-index: 9999;
  overflow: hidden;
}
.loading-bar-progress {
  width: 100%;
  height: 100%;
  background: var(--primary-500);
  animation: indeterminate-progress-targets 2s infinite linear;
  transform-origin: left;
}
@keyframes indeterminate-progress-targets {
  0% { transform: translateX(-100%) scaleX(0.5); }
  50% { transform: translateX(0%) scaleX(0.75); }
  100% { transform: translateX(100%) scaleX(0.5); }
}


@media (min-width: 768px) {
  .pagination-wrapper {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
  .pagination-info {
    flex-direction: row;
    align-items: center;
    gap: 20px;
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

  .pagination-button.prev .button-text,
  .pagination-button.next .button-text {
    display: none;
  }
  .pagination-button.prev,
  .pagination-button.next {
    width: 40px;
    padding: 0;
  }
  .pagination-wrapper {
    align-items: center;
  }
  .pagination-info {
    align-items: center;
    text-align: center;
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