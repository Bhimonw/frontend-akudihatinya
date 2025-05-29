<template>
  <div class="manajemen-user">
    <!-- Page Container -->
    <div class="page-container">
      <!-- Page Header (Baru) -->
      <div class="page-header">
        <h1 class="page-title">Manajemen User</h1>
        <p class="page-subtitle">Kelola semua pengguna dalam sistem</p>
      </div>

      <!-- Toolbar -->
      <div class="toolbar">
        <!-- Bagian Kiri -->
        <div class="left-section">
          <!-- Tombol Tambah User (with click handler to open modal) -->
          <button class="add-data-button" @click="openAddUserModal">
            <font-awesome-icon :icon="['fas', 'plus']" />
            <span>Tambah User</span>
          </button>
        </div>

        <!-- Bagian Kanan -->
        <div class="right-section">
          <!-- Filter Dropdown (New) -->
          <div class="filter-container">
            <select class="filter-select" v-model="filterRole">
              <option value="">Semua Role</option>
              <option value="admin">Admin</option>
              <option value="petugas">Puskemas</option>
            </select>
          </div>
          
          <!-- Search Bar -->
          <div class="search-container">
            <font-awesome-icon :icon="['fas', 'search']" class="search-icon" />
            <input 
              type="text" 
              placeholder="Cari User..." 
              class="search-input" 
              v-model="searchQuery" 
              @input="resetPagination"
            />
            <button v-if="searchQuery" class="clear-search" @click="clearSearch">
              <font-awesome-icon :icon="['fas', 'times']" />
            </button>
          </div>
        </div>
      </div>

      <!-- Table Status -->
      <div class="table-status">
        <p class="results-text">
          <span class="results-count">{{ totalUsers }}</span> users ditemukan
          <span v-if="searchQuery" class="search-term">untuk "{{ searchQuery }}"</span>
        </p>
      </div>

      <!-- Tabel Data User -->
      <div class="table-container">
        <table class="data-table-enhanced">
          <thead>
            <tr>
              <th class="narrow-cell">No</th>
              <th>Username</th>
              <th>Nama</th>
              <th>Role</th>
              <th>Sasaran</th>
              <th>Alamat</th>
              <th class="action-header">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(user, index) in paginatedUsers" :key="user.id">
              <td class="narrow-cell">{{ index + 1 + (currentPage - 1) * pageSize }}</td>
              <td>{{ user.username }}</td>
              <td>{{ user.name }}</td>
              <td>
                <span class="role-badge" :class="getRoleBadgeClass(user.role)">
                  {{ user.role }}
                </span>
              </td>
              <td>{{ user.target || '-' }}</td>
              <td>{{ user.address }}</td>
              <td class="action-cell">
                <div class="action-buttons-container">
                  <button class="action-button edit" @click="editUser(user.id)" title="Edit User">
                    <font-awesome-icon :icon="['fas', 'edit']" />
                    <span>Edit</span>
                  </button>
                  <button class="action-button detail" @click="viewUserDetails(user.id)" title="Lihat Detail">
                    <font-awesome-icon :icon="['fas', 'eye']" />
                    <span>Detail</span>
                  </button>
                  <button class="action-button delete" @click="confirmDelete(user.id)" title="Hapus User">
                    <font-awesome-icon :icon="['fas', 'trash']" />
                  </button>
                </div>
              </td>
            </tr>
            <!-- Empty State -->
            <tr v-if="paginatedUsers.length === 0">
              <td colspan="7" class="empty-state">
                <div class="empty-state-content">
                  <font-awesome-icon :icon="['fas', 'search']" class="empty-icon" />
                  <h3>Data tidak ditemukan</h3>
                  <p>Tidak ada user yang sesuai dengan kriteria pencarian.</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="pagination-container">
        <div class="pagination-wrapper">
          <div class="pagination-info">
            <!-- Showing Text -->
            <div class="showing-text">
              <p class="text-sm text-gray-700 flex items-center gap-2">
                <span>Menampilkan</span>
                <strong>{{ firstItemIndex + 1 }}-{{ lastItemIndex }}</strong>
                <span>dari</span>
                <strong>{{ totalUsers }}</strong>
                <span>item</span>
              </p>
            </div>
            
            <div class="rows-per-page">
              <span>Baris per halaman:</span>
              <div class="dropdown-container">
                <select id="rowsPerPage" v-model="pageSize" @change="resetPagination" class="dropdown-select">
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="100">100</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Pagination Buttons -->
          <nav class="pagination-controls" aria-label="Pagination">
            <!-- Tombol Previous -->
            <button
              class="pagination-button prev"
              @click="prevPage"
              :disabled="currentPage === 1"
              :class="{ 'disabled': currentPage === 1 }"
            >
              <font-awesome-icon :icon="['fas', 'chevron-left']" />
              <span class="button-text">Sebelumnya</span>
            </button>

            <!-- Nomor Halaman -->
            <div class="page-numbers">
              <button
                v-for="page in displayedPages"
                :key="page"
                :class="[
                  currentPage === page ? 'active' : '',
                  'pagination-button page-number',
                ]"
                @click="goToPage(page)"
              >
                {{ page }}
              </button>
            </div>

            <!-- Tombol Next -->
            <button
              class="pagination-button next"
              @click="nextPage"
              :disabled="currentPage === totalPages"
              :class="{ 'disabled': currentPage === totalPages }"
            >
              <span class="button-text">Selanjutnya</span>
              <font-awesome-icon :icon="['fas', 'chevron-right']" />
            </button>
          </nav>
        </div>
      </div>
    </div>
    
    <!-- Import the modal from separate file but don't define its content here -->
    <AddUserModal 
      v-if="showAddUserModal" 
      @close="closeAddUserModal"
      @submit="handleUserSubmit"
    />

    <!-- Confirm Delete Modal -->
    <ConfirmModal
      v-if="showConfirmModal"
      :title="'Konfirmasi Hapus User'"
      :message="'Apakah Anda yakin ingin menghapus user ini?'"
      @confirm="deleteUser"
      @cancel="closeConfirmModal"
    />

    <!-- User Detail Modal (Baru) -->
    <UserDetailModal
      v-if="showDetailModal"
      :user="selectedUser"
      @close="closeDetailModal"
    />
  </div>
</template>

<script>
import axios from 'axios';
import AddUserModal from "../../components/modals/AddNewUser.vue";
import ConfirmModal from "../../components/modals/ConfirmModal.vue";
import UserDetailModal from "../../components/modals/UserDetailModal.vue";

export default {
  name: "ManajemenUser",
  components: {
    AddUserModal,
    ConfirmModal,
    UserDetailModal
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
      isLoading: false
    };
  },
  computed: {
    totalUsers() {
      return this.filteredUsers.length;
    },
    totalPages() {
      return Math.ceil(this.totalUsers / this.pageSize);
    },
    firstItemIndex() {
      return (this.currentPage - 1) * this.pageSize;
    },
    lastItemIndex() {
      return Math.min(this.currentPage * this.pageSize, this.totalUsers);
    },
    filteredUsers() {
      return this.users.filter((user) => {
        const searchLower = this.searchQuery.toLowerCase();
        const roleMatch = this.filterRole ? user.role.toLowerCase() === this.filterRole.toLowerCase() : true;
        
        const searchMatch = 
          user.username.toLowerCase().includes(searchLower) ||
          user.name.toLowerCase().includes(searchLower) ||
          user.role.toLowerCase().includes(searchLower) ||
          user.address.toLowerCase().includes(searchLower);
          
        return searchMatch && roleMatch;
      });
    },
    paginatedUsers() {
      return this.filteredUsers.slice(this.firstItemIndex, this.lastItemIndex);
    },
    displayedPages() {
      // Maximum number of page buttons to show
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
    }
  },
  methods: {
    async fetchUsers() {
      try {
        this.isLoading = true;
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('Token tidak ditemukan');
          return;
        }
        const response = await axios.get('http://localhost:8000/api/admin/users?is_admin=0', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        this.users = response.data.users.map(user => ({
          id: user.id,
          username: user.username,
          name: user.name,
          role: user.role,
          target: user.target || '',  // Tambahkan field target
          address: user.puskesmas?.name || 'Unknown Puskesmas',
          email: user.email || '',
          phone: user.phone || '',
        }));
      } catch (error) {
        console.error('Gagal mengambil data pengguna:', error);
        this.$toast.error('Gagal memuat data pengguna');
      } finally {
        this.isLoading = false;
      }
    },
    getRoleBadgeClass(role) {
      const roleLower = role.toLowerCase();
      if (roleLower === 'admin') return 'role-admin';
      if (roleLower === 'petugas') return 'role-petugas';
      return 'role-user';
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
    handleUserSubmit(formData) {
      // Add user logic here
      console.log("Data user yang disimpan:", formData);
      
      // For demo purposes, add user to the list
      const newUser = {
        id: this.users.length + 1,
        ...formData
      };
      
      this.users.push(newUser);
      this.$toast.success("Data user berhasil disimpan!");
      this.closeAddUserModal();
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
    viewUserDetails(id) {
      // Cari user berdasarkan ID
      this.selectedUser = this.users.find(user => user.id === id);
      if (this.selectedUser) {
        this.showDetailModal = true;
      }
    },
    closeDetailModal() {
      this.showDetailModal = false;
      this.selectedUser = null;
    },
    editUser(id) {
      // Navigate to edit user page or open edit modal
      console.log("Edit user with ID:", id);
      this.$toast.info("Fitur edit user sedang dalam pengembangan");
    },
    confirmDelete(id) {
      this.userToDelete = id;
      this.showConfirmModal = true;
    },
    closeConfirmModal() {
      this.showConfirmModal = false;
      this.userToDelete = null;
    },
    deleteUser() {
      if (this.userToDelete) {
        // Delete user logic
        this.users = this.users.filter(user => user.id !== this.userToDelete);
        this.$toast.success("User berhasil dihapus!");
        this.closeConfirmModal();
        
        // Reset to first page if current page is now empty
        if (this.paginatedUsers.length === 0 && this.currentPage > 1) {
          this.currentPage = Math.max(1, this.currentPage - 1);
        }
      }
    }
  },
  created() {
    this.fetchUsers();
  }
};
</script>

<style scoped>
/* Root Styles */
.manajemen-user {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  background-color: #f7f8f9;
  min-height: 100vh;
  box-sizing: border-box;
  padding: 20px;
  font-family: "Inter", sans-serif;
}

/* Page Container */
.page-container {
  width: 100%;
  max-width: 1400px;
  background: #ffffff;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

/* Page Header */
.page-header {
  margin-bottom: 30px;
  border-left: 4px solid var(--primary-500, #4f46e5);
  padding-left: 16px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #333333;
  margin: 0 0 8px 0;
}

.page-subtitle {
  font-size: 16px;
  color: #6b7280;
  margin: 0;
}

/* Toolbar */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  gap: 20px;
}

/* Bagian Kiri */
.left-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* Bagian Kanan */
.right-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* Filter Container */
.filter-container {
  position: relative;
}

.filter-select {
  height: 42px;
  padding: 8px 16px;
  border: 1px solid #eaeaea;
  border-radius: 10px;
  font-family: "Inter", sans-serif;
  font-size: 14px;
  color: #333333;
  background: #ffffff;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  min-width: 150px;
}

.filter-select:hover, .filter-select:focus {
  border-color: var(--primary-500, #4f46e5);
  outline: none;
}

/* Dropdown Select */
.dropdown-select {
  height: 42px;
  padding: 8px 16px;
  border: 1px solid #eaeaea;
  border-radius: 10px;
  font-family: "Inter", sans-serif;
  font-size: 14px;
  color: #333333;
  background: #ffffff;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  min-width: 80px;
}

.dropdown-select:hover, .dropdown-select:focus {
  border-color: var(--primary-500, #4f46e5);
  outline: none;
}

/* Tombol Tambah User */
.add-data-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: var(--primary-500, #4f46e5);
  color: #ffffff;
  font-family: "Inter", sans-serif;
  font-size: 14px;
  font-weight: 500;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0px 2px 4px rgba(79, 70, 229, 0.2);
}

.add-data-button:hover {
  background: var(--primary-600, #4338ca);
  transform: translateY(-1px);
  box-shadow: 0px 4px 8px rgba(79, 70, 229, 0.3);
}

.add-data-button:active {
  transform: translateY(0);
  box-shadow: 0px 1px 2px rgba(79, 70, 229, 0.2);
}

/* Kolom Pencarian */
.search-container {
  display: flex;
  align-items: center;
  position: relative;
  flex-grow: 1;
  max-width: 400px;
}

.search-icon {
  position: absolute;
  left: 16px;
  color: #9aa0a8;
  font-size: 16px;
  pointer-events: none;
}

.search-input {
  width: 100%;
  height: 42px;
  padding: 12px 40px 12px 40px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  font-family: "Inter", sans-serif;
  font-size: 14px;
  color: #4f5867;
  outline: none;
  transition: all 0.2s ease-in-out;
}

.search-input:hover {
  border-color: #d1d5db;
}

.search-input:focus {
  border-color: var(--primary-500, #4f46e5);
  box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.1);
}

.clear-search {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  color: #9aa0a8;
  cursor: pointer;
  font-size: 12px;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.clear-search:hover {
  color: #4f5867;
}

/* Table Status */
.table-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.results-text {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.results-count {
  font-weight: 600;
  color: #111827;
}

.search-term {
  font-style: italic;
}

/* Table Container */
.table-container {
  overflow-x: auto;
  margin-bottom: 24px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

/* Data Table Enhanced */
.data-table-enhanced {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-family: "Inter", sans-serif;
  font-size: 14px;
  color: #333333;
  background: #ffffff;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.data-table-enhanced th, .data-table-enhanced td {
  padding: 16px;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
}

.data-table-enhanced th {
  background: #f9fafb;
  font-weight: 600;
  color: #374151;
  position: sticky;
  top: 0;
  z-index: 10;
  text-transform: uppercase;
  font-size: 12px;
  letter-spacing: 0.5px;
}

.data-table-enhanced tbody tr:hover {
  background-color: #f9fafb;
  transition: background-color 0.2s ease;
}

.data-table-enhanced tbody tr:last-child td {
  border-bottom: none;
}

/* Data Table */
.data-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-family: "Inter", sans-serif;
  font-size: 14px;
  color: #333333;
  background: #ffffff;
}

/* Header */
.data-table thead th {
  background: #f9fafb;
  color: #4b5563;
  font-weight: 600;
  text-align: left;
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
  position: sticky;
  top: 0;
  z-index: 10;
}

.data-table th.narrow-cell {
  width: 60px;
}

.data-table th.action-header {
  text-align: center;
  width: 200px;
}

/* Data Rows */
.data-table tbody tr {
  transition: background-color 0.3s ease;
  border-bottom: 1px solid #f3f4f6;
}

.data-table tbody tr:last-child {
  border-bottom: none;
}

.data-table tbody tr:hover {
  background: #f9fafb;
}

/* Data Cell */
.data-table td {
  text-align: left;
  padding: 14px 16px;
  vertical-align: middle;
}

.data-table td.narrow-cell {
  width: 60px;
  text-align: center;
}

/* Role Badge */
.role-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: capitalize;
  letter-spacing: 0.5px;
}

.role-badge.role-admin {
  background-color: #fef2f2;
  color: #dc2626;
  border: 1px solid #fee2e2;
}

.role-badge.role-petugas {
  background-color: #eff6ff;
  color: #2563eb;
  border: 1px solid #dbeafe;
}

.role-badge.role-user {
  background-color: #f3f4f6;
  color: #4b5563;
  border: 1px solid #e5e7eb;
}

/* Action Cell */
.action-cell {
  text-align: center;
}

.action-buttons-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
}

/* Action Buttons */
.action-button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s ease;
  border: 1px solid transparent;
  cursor: pointer;
}

.action-button span {
  line-height: 1;
}

.action-button.detail {
  border-color: var(--primary-300, #a5b4fc);
  background: var(--secondary-100, #eef2ff);
  color: var(--primary-500, #4f46e5);
}

.action-button.detail:hover {
  background: var(--secondary-200, #e0e7ff);
  transform: translateY(-1px);
  box-shadow: 0 2px 5px rgba(79, 70, 229, 0.2);
}

.action-button.edit {
  border-color: #10b981;
  background: #d1fae5;
  color: #059669;
}

.action-button.edit:hover {
  background: #a7f3d0;
  transform: translateY(-1px);
  box-shadow: 0 2px 5px rgba(16, 185, 129, 0.2);
}

.action-button.delete {
  border-color: #ef4444;
  background: #fee2e2;
  color: #dc2626;
  padding: 8px 10px;
}

.action-button.delete:hover {
  background: #fecaca;
  transform: translateY(-1px);
  box-shadow: 0 2px 5px rgba(239, 68, 68, 0.2);
}

/* Empty State */
.empty-state {
  padding: 80px 20px;
  text-align: center;
}

.empty-state-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.empty-icon {
  font-size: 48px;
  color: #d1d5db;
  margin-bottom: 16px;
}

.empty-state h3 {
  font-size: 18px;
  font-weight: 600;
  color: #4b5563;
  margin: 0 0 8px 0;
}

.empty-state p {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

/* Scrollbar Styling */
.table-container::-webkit-scrollbar {
  height: 8px;
  width: 8px;
}

.table-container::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 4px;
}

.table-container::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

.table-container::-webkit-scrollbar-track {
  background: #f3f4f6;
}

/* Pagination */
.pagination-container {
  background-color: #ffffff;
  border-radius: 8px;
  padding: 12px 0;
}

.pagination-wrapper {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

@media (min-width: 768px) {
  .pagination-wrapper {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}

/* Pagination Info */
.pagination-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

@media (min-width: 768px) {
  .pagination-info {
    flex-direction: row;
    align-items: center;
    gap: 20px;
  }
}

.showing-text, .rows-per-page {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #6b7280;
}

.rows-per-page {
  white-space: nowrap;
}

/* Pagination Controls */
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

/* Pagination Buttons */
.pagination-button {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  height: 40px;
  padding: 0 12px;
  font-family: "Inter", sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pagination-button:hover:not(.disabled) {
  color: var(--primary-500, #4f46e5);
  border-color: var(--primary-500, #4f46e5);
  background-color: #f9fafb;
}

/* Page Number Button */
.pagination-button.page-number {
  min-width: 40px;
  width: 40px;
}

/* Halaman Aktif */
.pagination-button.active {
  color: #ffffff;
  background-color: var(--primary-500, #4f46e5);
  border-color: var(--primary-500, #4f46e5);
  font-weight: 600;
}

.pagination-button.active:hover {
  color: #ffffff;
  background-color: var(--primary-600, #4338ca);
}

/* Tombol Previous dan Next */
.pagination-button.prev,
.pagination-button.next {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 16px;
}

.pagination-button.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: #f3f4f6;
}

/* Button text for prev/next on mobile */
@media (max-width: 640px) {
  .pagination-button.prev .button-text,
  .pagination-button.next .button-text {
    display: none;
  }
  
  .pagination-button.prev,
  .pagination-button.next {
    padding: 0;
    width: 40px;
  }
}

/* Dropdown Container */
.dropdown-container {
  position: relative;
  min-width: 80px;
}

/* Responsive Adjustments */
@media (max-width: 992px) {
  .page-container {
    padding: 20px;
  }
  
  .toolbar {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  .left-section,
  .right-section {
    width: 100%;
    justify-content: space-between;
  }
  
/* Tombol Tambah User */
.add-data-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: var(--primary-500, #4f46e5);
  color: #ffffff;
  font-family: "Inter", sans-serif;
  font-size: 14px;
  font-weight: 500;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.add-data-button:hover {
  background: var(--primary-700, #3730a3);
}

/* Kolom Pencarian */
.search-container {
  display: flex;
  align-items: center;
  position: relative;
}

.search-icon {
  position: absolute;
  left: 10px;
  color: #9aa0a8;
  font-size: 16px;
  pointer-events: none;
}

.search-input {
  width: 251px;
  height: 42px;
  padding: 10px 40px 10px 40px;
  border: 1px solid #cdcfd4;
  border-radius: 10px;
  font-family: "Inter", sans-serif;
  font-size: 14px;
  color: #4f5867;
  outline: none;
}

.search-input:hover {
  border-color: var(--primary-500, #4f46e5);
}

@media (max-width: 992px) {
  .toolbar {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .left-section,
  .right-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .search-container {
    width: 100%;
  }

  .search-input {
    width: 100%;
  }

  .add-data-button {
    width: 100%;
    text-align: center;
    justify-content: center;
  }
}

/* Table Container */
.table-container {
  overflow-x: auto;
  margin-bottom: 20px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
}

/* Data Table */
.data-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-family: "Inter", sans-serif;
  font-size: 14px;
  color: #333333;
  background: #ffffff;
  border-radius: 10px;
  overflow: hidden;
}

/* Header */
.data-table thead th {
  background: #f3f4f6;
  color: #333333;
  font-weight: 600;
  text-align: center;
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
}

/* Data Rows */
.data-table tbody tr:hover {
  background: #f9fafb;
  transition: background-color 0.3s ease;
}

/* Data Cell */
.data-table td {
  text-align: center;
  padding: 12px 16px;
}

.data-table tr {
  height: 60px;
}

/* Action Cell */
.action-cell {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
}

/* Action Buttons */
.action-button {
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.3s ease, transform 0.3s ease;
}

.action-button.detail {
  border: 1px solid var(--primary-300, #a5b4fc);
  background: var(--secondary-100, #eef2ff);
  color: var(--primary-500, #4f46e5);
}

.action-button.detail:hover {
  background: var(--secondary-300, #c7d2fe);
}

.action-button.edit {
  border: 1px solid #10b981;
  background: #d1fae5;
  color: #059669;
}

.action-button.edit:hover {
  background: #a7f3d0;
}

.action-button.delete {
  border: 1px solid #ef4444;
  background: #fee2e2;
  color: #dc2626;
  padding: 8px 10px;
}

.action-button.delete:hover {
  background: #fecaca;
}

/* Scrollbar Styling */
.table-container::-webkit-scrollbar {
  height: 8px;
}

.table-container::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 4px;
}

.table-container::-webkit-scrollbar-track {
  background: #f3f4f6;
}

/* Pagination */
.pagination-container {
  background-color: #ffffff;
  border-radius: 8px;
}

/* Pagination Buttons */
.pagination-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: 0;
  font-family: "Inter", sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #9aa0a8;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: color 0.3s ease;
}

.pagination-button:hover {
  color: var(--primary-500, #4f46e5);
}

/* Halaman Aktif */
.pagination-button.active {
  color: var(--primary-500, #4f46e5);
  font-weight: 600;
}

/* Tombol Previous dan Next */
.pagination-button.prev,
.pagination-button.next {
  background-color: var(--primary-500, #4f46e5);
  color: #ffffff;
  width: auto;
  padding: 10px 16px;
  font-size: 16px;
}

.pagination-button.prev:hover,
.pagination-button.next:hover {
  background-color: var(--primary-700, #3730a3);
}

/* Tombol Disabled */
.pagination-button:disabled {
  background-color: #9aa0a8;
  color: #ffffff;
  cursor: not-allowed;
}

/* Dropdown Container */
.dropdown-container {
  position: relative;
  width: 80px;
}
}
</style>