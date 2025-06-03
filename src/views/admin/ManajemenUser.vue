<template>
  <div class="manajemen-user">
    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">Manajemen User</h1>
        <p class="page-subtitle">Kelola semua pengguna dalam sistem</p>
      </div>

      <div class="toolbar">
        <div class="left-section">
          <button class="add-data-button" @click="openAddUserModal">
            <font-awesome-icon :icon="['fas', 'plus']" />
            <span>Tambah User</span>
          </button>
        </div>

        <div class="right-section">
          <div class="filter-container">
            <select class="filter-select" v-model="filterRole" @change="resetPagination">
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
              @input="resetPagination"
            />
            <button v-if="searchQuery" class="clear-search" @click="clearSearch">
              <font-awesome-icon :icon="['fas', 'times']" />
            </button>
          </div>
        </div>
      </div>

      <div class="table-status">
        <p class="results-text">
          <span class="results-count">{{ totalUsers }}</span> users ditemukan
          <span v-if="searchQuery" class="search-term">untuk "{{ searchQuery }}"</span>
        </p>
      </div>

      <div class="table-container">
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
            <tr v-if="isLoading && paginatedUsers.length === 0 && users.length === 0">
              <td colspan="6" class="empty-state">
                 <div class="empty-state-content">
                    <font-awesome-icon :icon="['fas', 'spinner']" spin class="empty-icon" />
                    <h3>Memuat data...</h3>
                  </div>
              </td>
            </tr>
            <tr v-for="(user, index) in paginatedUsers" :key="user.id">
              <td class="narrow-cell">{{ index + 1 + (currentPage - 1) * pageSize }}</td>
              <td>{{ user.username }}</td>
              <td>{{ user.name }}</td>
              <td>
                <span class="role-badge" :class="getRoleBadgeClass(user.role)">
                  {{ user.role === 'puskesmas' ? 'Puskesmas' : (user.role.charAt(0).toUpperCase() + user.role.slice(1)) }}
                </span>
              </td>
              <td>{{ user.address }}</td>
              <td class="action-cell">
                <div class="action-buttons-container">
                  <button class="action-button edit" @click="editUser(user)" title="Edit User">
                    <font-awesome-icon :icon="['fas', 'edit']" />
                    <span>Edit</span>
                  </button>
                  <button class="action-button detail" @click="viewUserDetails(user)" title="Lihat Detail">
                    <font-awesome-icon :icon="['fas', 'eye']" />
                    <span>Detail</span>
                  </button>
                  <button class="action-button delete" @click="confirmDelete(user.id)" title="Hapus User">
                    <font-awesome-icon :icon="['fas', 'trash']" />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="!isLoading && paginatedUsers.length === 0">
              <td colspan="6" class="empty-state">
                <div class="empty-state-content">
                  <font-awesome-icon :icon="['fas', 'users-slash']" class="empty-icon" />
                  <h3>Data tidak ditemukan</h3>
                  <p>Tidak ada user yang sesuai dengan kriteria pencarian atau filter Anda.</p>
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
              <div class="dropdown-container">
                <select id="rowsPerPage" v-model="pageSize" @change="resetPagination" class="dropdown-select">
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
              :class="{ 'disabled': currentPage === 1 }"
            >
              <font-awesome-icon :icon="['fas', 'chevron-left']" />
              <span class="button-text">Sebelumnya</span>
            </button>
            <div class="page-numbers">
              <button
                v-for="page in displayedPages"
                :key="page"
                :class="['pagination-button page-number', { 'active': currentPage === page }]"
                @click="goToPage(page)"
              >
                {{ page }}
              </button>
            </div>
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

    <UserDetailModal
      v-if="showDetailModal"
      :user="selectedUser"
      @close="closeDetailModal"
    />
  </div>
</template>

<script>
import axios from 'axios';
import AddNewUserModal from "../../components/modals/AddNewUser.vue";
import ConfirmModal from "../../components/modals/ConfirmModal.vue";
import UserDetailModal from "../../components/modals/UserDetailModal.vue";

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
      isLoading: false,
      isSubmitting: false,
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
      return this.users.filter((user) => {
        const searchLower = this.searchQuery.toLowerCase();
        const roleMatch = this.filterRole ? user.role.toLowerCase() === this.filterRole.toLowerCase() : true;
        
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
    }
  },
  methods: {
    async fetchUsers() {
      this.isLoading = true;
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          this.$toast.error('Sesi Anda berakhir, silakan login kembali.');
          return;
        }
        const response = await axios.get('http://localhost:8000/api/admin/users', {
          headers: { Authorization: `Bearer ${token}` },
        });
        this.users = response.data.users.map(user => ({
          id: user.id,
          username: user.username,
          name: user.name,
          role: user.role,
          address: user.puskesmas?.name || (user.role === 'admin' ? 'Kantor Pusat' : 'Belum ada data puskesmas'),
          email: user.email || '',
          phone: user.phone || '',
          profile_picture_url: user.profile_picture_url,
          puskesmas_detail: user.puskesmas, 
          created_at: user.created_at,
          updated_at: user.updated_at,
        }));
      } catch (error) {
        console.error('Gagal mengambil data pengguna:', error.response || error);
        if (error.response && error.response.status === 401) {
            this.$toast.error('Sesi tidak valid. Silakan login ulang.');
        } else {
            this.$toast.error('Gagal memuat data pengguna.');
        }
      } finally {
        this.isLoading = false;
      }
    },
    getRoleBadgeClass(role) {
      const roleLower = role ? role.toLowerCase() : '';
      if (roleLower === 'admin') return 'role-admin';
      if (roleLower === 'puskesmas') return 'role-petugas';
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
    async handleUserSubmit(formDataFromModal) {
      console.log('ManajemenUser.vue - handleUserSubmit dipanggil dengan data:', formDataFromModal);
      this.isSubmitting = true;
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          this.$toast.error('Token tidak ditemukan. Silakan login kembali.');
          this.isSubmitting = false; // Reset state jika return awal
          return;
        }

        let apiPayload;
        let configHeaders = {
          Authorization: `Bearer ${token}`,
        };

        if (formDataFromModal.profilePicture instanceof File) {
          apiPayload = new FormData();
          apiPayload.append('username', formDataFromModal.username);
          apiPayload.append('password', formDataFromModal.password);
          apiPayload.append('name', formDataFromModal.name);
          apiPayload.append('role', formDataFromModal.role);
          apiPayload.append('profile_picture', formDataFromModal.profilePicture, formDataFromModal.profilePicture.name);
        } else {
          apiPayload = {
            username: formDataFromModal.username,
            password: formDataFromModal.password,
            name: formDataFromModal.name,
            role: formDataFromModal.role,
            profile_picture: null,
          };
          configHeaders['Content-Type'] = 'application/json';
        }
        
        // console.log("Mengirim payload:", apiPayload instanceof FormData ? "FormData" : JSON.stringify(apiPayload));

        const response = await axios.post('http://localhost:8000/api/admin/users', apiPayload, {
          headers: configHeaders,
        });

        this.$toast.success(response.data.message || "User berhasil ditambahkan!");
        this.closeAddUserModal(); 
        await this.fetchUsers();   
        this.resetPagination();    

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
        this.isSubmitting = false;
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
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                this.$toast.error('Token tidak ditemukan. Silakan login kembali.');
                this.closeConfirmModal();
                return;
            }
            // AKTIFKAN JIKA API DELETE SUDAH ADA
            // await axios.delete(`http://localhost:8000/api/admin/users/${this.userToDelete}`, {
            //     headers: { Authorization: `Bearer ${token}` },
            // });
            // this.$toast.success("User berhasil dihapus!");
            
            // SIMULASI (hapus jika API delete diaktifkan)
            this.users = this.users.filter(user => user.id !== this.userToDelete);
            this.$toast.success("User berhasil dihapus (simulasi)!");
            // END SIMULASI
            
            await this.fetchUsers(); 
            
            if (this.paginatedUsers.length === 0 && this.currentPage > 1) {
                this.currentPage = Math.max(1, this.totalPages); 
            } else if (this.currentPage > this.totalPages && this.totalPages > 0) {
                this.currentPage = this.totalPages;
            }
        } catch (error) {
            console.error('Gagal menghapus user:', error.response?.data || error.message);
            this.$toast.error(error.response?.data?.message || 'Gagal menghapus user.');
        } finally {
            this.closeConfirmModal();
        }
      }
    }
  },
  created() {
    this.fetchUsers();
  },
  watch: {
    filterRole() {
        this.resetPagination();
    },
  }
};
</script>

<style scoped>
/* Styling dari file asli Anda */
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

.page-container {
  width: 100%;
  max-width: 1400px;
  background: #ffffff;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

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

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  gap: 20px;
  flex-wrap: wrap; /* Allow wrapping on smaller screens */
}

.left-section, .right-section {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap; /* Allow inner items to wrap */
}

.filter-container {
  position: relative;
}

.filter-select, .dropdown-select {
  height: 42px;
  padding: 8px 30px 8px 16px; /* Adjusted padding for arrow */
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
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
}
.filter-select { min-width: 150px; }
.dropdown-select { min-width: 80px; }

.filter-select:hover, .filter-select:focus,
.dropdown-select:hover, .dropdown-select:focus {
  border-color: var(--primary-500, #4f46e5);
  outline: none;
}

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

.search-container {
  display: flex;
  align-items: center;
  position: relative;
  min-width: 250px; /* Minimum width for search */
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
  padding: 4px;
}

.table-status {
  margin-bottom: 12px;
}
.results-text { font-size: 14px; color: #6b7280; }
.results-count { font-weight: 600; color: #111827; }
.search-term { font-style: italic; }

.table-container {
  overflow-x: auto;
  margin-bottom: 24px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

.data-table-enhanced {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 14px;
  color: #333333;
}
.data-table-enhanced th, .data-table-enhanced td {
  padding: 16px;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
  vertical-align: middle;
}
.data-table-enhanced th {
  background: #f9fafb;
  font-weight: 600;
  color: #374151;
  text-transform: uppercase;
  font-size: 12px;
  letter-spacing: 0.5px;
  position: sticky; top: 0; z-index: 1; /* Make header sticky */
}
.data-table-enhanced tbody tr:hover { background-color: #f9fafb; }
.data-table-enhanced tbody tr:last-child td { border-bottom: none; }
.data-table-enhanced th.narrow-cell, .data-table-enhanced td.narrow-cell {
  width: 60px;
  text-align: center;
}
.data-table-enhanced th.action-header {
  text-align: center;
  width: 230px; /* Adjusted for three buttons with text */
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
}
.role-admin { background-color: #fef2f2; color: #dc2626; border: 1px solid #fee2e2;}
.role-petugas { background-color: #eff6ff; color: #2563eb; border: 1px solid #dbeafe;}
.role-user { background-color: #f3f4f6; color: #4b5563; border: 1px solid #e5e7eb;}

.action-cell { text-align: center; }
.action-buttons-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
}
.action-button {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 12px; border-radius: 8px; font-size: 13px; font-weight: 500;
  border: 1px solid transparent; cursor: pointer; transition: all 0.2s ease;
}
.action-button span { line-height: 1; }
.action-button.detail { border-color: #a5b4fc; background: #eef2ff; color: #4f46e5; }
.action-button.detail:hover { background: #e0e7ff; transform: translateY(-1px); }
.action-button.edit { border-color: #10b981; background: #d1fae5; color: #059669; }
.action-button.edit:hover { background: #a7f3d0; transform: translateY(-1px); }
.action-button.delete { border-color: #ef4444; background: #fee2e2; color: #dc2626; padding: 8px 10px; }
.action-button.delete:hover { background: #fecaca; transform: translateY(-1px); }

.empty-state { padding: 60px 20px; text-align: center; }
.empty-state-content { display: flex; flex-direction: column; align-items: center; }
.empty-icon { font-size: 48px; color: #d1d5db; margin-bottom: 16px; }
.empty-state h3 { font-size: 18px; font-weight: 600; color: #4b5563; margin-bottom: 8px; }
.empty-state p { font-size: 14px; color: #6b7280; }

.pagination-container { padding: 12px 0; margin-top: 24px; }
.pagination-wrapper { display: flex; flex-direction: column; gap: 16px; }
.pagination-info { display: flex; flex-direction: column; gap: 8px; }
.showing-text, .rows-per-page { display: flex; align-items: center; gap: 6px; font-size: 14px; color: #6b7280; }
.pagination-controls { display: flex; align-items: center; justify-content: center; gap: 4px; }
.page-numbers { display: flex; align-items: center; gap: 4px; }
.pagination-button {
  display: flex; align-items: center; justify-content: center;
  min-width: 40px; height: 40px; padding: 0 12px; font-size: 14px; font-weight: 500;
  color: #6b7280; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px;
  cursor: pointer; transition: all 0.2s ease;
}
.pagination-button:hover:not(.disabled) { color: #4f46e5; border-color: #4f46e5; }
.pagination-button.page-number { width: 40px; }
.pagination-button.active { color: #ffffff; background-color: #4f46e5; border-color: #4f46e5; }
.pagination-button.prev, .pagination-button.next { gap: 6px; padding: 0 16px; }
.pagination-button.disabled { opacity: 0.6; cursor: not-allowed; background-color: #f9fafb; }

@media (min-width: 768px) {
  .pagination-wrapper { flex-direction: row; align-items: center; justify-content: space-between; }
  .pagination-info { flex-direction: row; align-items: center; gap: 20px; }
}
@media (max-width: 640px) {
  .toolbar { flex-direction: column; align-items: stretch; }
  .left-section, .right-section { width: 100%; justify-content: space-between; }
  .right-section { flex-direction: column; align-items: stretch;}
  .search-container { width: 100%; }
  .filter-container { width: 100%; }
  .filter-select { width: 100%;}

  .pagination-button.prev .button-text, .pagination-button.next .button-text { display: none; }
  .pagination-button.prev, .pagination-button.next { width: 40px; padding:0; }
  .pagination-wrapper { align-items: center; }
  .pagination-info { align-items: center; text-align: center; }
}
</style>