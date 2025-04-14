<template>
  <div class="manajemen-user">
    <!-- Page Container -->
    <div class="page-container">
      <!-- Toolbar -->
      <div class="toolbar">
        <!-- Bagian Kiri -->
        <div class="left-section">
          <!-- Tombol Tambah User (with click handler to open modal) -->
          <button class="add-data-button" @click="openAddUserModal">
            <font-awesome-icon :icon="['fas', 'plus']" />
            Tambah User
          </button>
        </div>

        <!-- Bagian Kanan -->
        <div class="right-section">
          <!-- Search Bar -->
          <div class="search-container">
            <font-awesome-icon :icon="['fas', 'search']" class="search-icon" />
            <input type="text" placeholder="Cari User..." class="search-input" v-model="searchQuery" />
          </div>
        </div>
      </div>

      <!-- Tabel Data User -->
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>No</th>
              <th>Username</th>
              <th>Nama</th>
              <th>Role</th>
              <th>Alamat</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(user, index) in paginatedUsers" :key="user.id">
              <td>{{ index + 1 + (currentPage - 1) * pageSize }}</td>
              <td>{{ user.username }}</td>
              <td>{{ user.name }}</td>
              <td>{{ user.role }}</td>
              <td>{{ user.address }}</td>
              <td class="action-cell">
                <button class="action-button edit" @click="editUser(user.id)">
                  <font-awesome-icon :icon="['fas', 'edit']" />
                  Edit
                </button>
                <button class="action-button detail" @click="viewUserDetails(user.id)">
                  Detail
                </button>
                <button class="action-button delete" @click="confirmDelete(user.id)">
                  <font-awesome-icon :icon="['fas', 'trash']" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="pagination-container">
        <div class="flex items-center justify-between bg-white px-4 py-3 sm:px-6">
          <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <!-- Showing Text -->
            <div>
              <p class="text-sm text-gray-700 flex items-center gap-2">
                Baris per halaman:
                <div class="dropdown-container">
                  <select id="rowsPerPage" v-model="pageSize" @change="resetPagination" class="dropdown-select">
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="100">100</option>
                  </select>
                </div>
                {{ firstItemIndex + 1 }}-{{ lastItemIndex }} dari {{ totalUsers }} item
              </p>
            </div>

            <!-- Pagination Buttons -->
            <nav class="isolate inline-flex -space-x-px rounded-md shadow-xs" aria-label="Pagination">
              <!-- Tombol Previous -->
              <button
                class="pagination-button prev"
                @click="prevPage"
                :disabled="currentPage === 1"
              >
                <font-awesome-icon :icon="['fas', 'chevron-left']" />
              </button>

              <!-- Nomor Halaman -->
              <button
                v-for="page in displayedPages"
                :key="page"
                :class="[
                  currentPage === page ? 'active' : '',
                  'pagination-button',
                ]"
                @click="goToPage(page)"
              >
                {{ page }}
              </button>

              <!-- Tombol Next -->
              <button
                class="pagination-button next"
                @click="nextPage"
                :disabled="currentPage === totalPages"
              >
                <font-awesome-icon :icon="['fas', 'chevron-right']" />
              </button>
            </nav>
          </div>
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
  </div>
</template>

<script>
import axios from 'axios';
import AddUserModal from "../../components/modals/AddNewUser.vue";
import ConfirmModal from "../../components/modals/ConfirmModal.vue";

export default {
  name: "ManajemenUser",
  components: {
    AddUserModal,
    ConfirmModal
  },
  data() {
    return {
      users: [],
      currentPage: 1,
      pageSize: 10,
      searchQuery: "",
      showAddUserModal: false,
      showConfirmModal: false,
      userToDelete: null
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
        return (
          user.username.toLowerCase().includes(searchLower) ||
          user.name.toLowerCase().includes(searchLower) ||
          user.role.toLowerCase().includes(searchLower) ||
          user.address.toLowerCase().includes(searchLower)
        );
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
          address: user.puskesmas?.name || 'Unknown Puskesmas',
        }));
      } catch (error) {
        console.error('Gagal mengambil data pengguna:', error);
      }
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
      alert("Data user berhasil disimpan!");
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
      // Navigate to user details page
      this.$router.push({ name: "DetailUser", params: { id }});
    },
    editUser(id) {
      // Navigate to edit user page or open edit modal
      console.log("Edit user with ID:", id);
      alert("Fitur edit user sedang dalam pengembangan");
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
        alert("User berhasil dihapus!");
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
}

/* Page Container */
.page-container {
  width: 100%;
  max-width: 1400px;
  background: #ffffff;
  border-radius: 10px;
  padding: 26px;
  box-shadow: 0px 4px 16px rgba(0, 0, 0, 0.1);
  overflow-x: auto;
}

/* Toolbar */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

/* Bagian Kiri */
.left-section {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

/* Bagian Kanan */
.right-section {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

/* Dropdown Select */
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
</style>