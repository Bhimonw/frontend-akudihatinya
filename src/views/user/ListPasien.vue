<template>
  <div class="diabetes-mellitus"> <!-- Nama kelas bisa diubah agar lebih generik jika perlu -->
    <div class="page-container">
      <div class="toolbar">
        <div class="left-section">
          <button class="add-data-button" @click="openAddGeneralPatientModal">
            <font-awesome-icon :icon="['fas', 'plus']" />
            Tambah Pasien Baru
          </button>
          <!-- Tombol Unduh Ditambahkan Di Sini -->
          <button class="download-report-button" @click="downloadExcel" :disabled="isDownloading">
            <font-awesome-icon :icon="['fas', isDownloading ? 'spinner' : 'download']" :spin="isDownloading" />
            {{ isDownloading ? 'Mengunduh...' : 'Unduh Excel' }}
          </button>
        </div>
        <div class="right-section">
          <div class="search-container">
            <font-awesome-icon :icon="['fas', 'search']" class="search-icon" />
            <input
              type="text"
              placeholder="Cari Data..."
              class="search-input"
              v-model="searchQuery"
            />
          </div>
        </div>
      </div>

      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>No</th>
              <th>Nama Pasien</th>
              <th>NIK</th>
              <th>Jenis Kelamin</th>
              <th>Tanggal Lahir</th>
              <th>Umur</th>
              <th>Alamat</th>
              <th>Nomor Telepon</th>
              <th>Nomor BPJS</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="isLoading">
              <td colspan="10"> <!-- Colspan diubah menjadi 10 -->
                <div class="loading-container">
                  <div class="loading-content">
                    <div class="spinner"></div>
                    <p>Memuat data...</p>
                  </div>
                </div>
              </td>
            </tr>
            <tr v-else v-for="(patient, index) in patients" :key="patient.id">
              <td>{{ (currentPage - 1) * pageSize + index + 1 }}</td>
              <td>{{ patient.name || '-'}}</td>
              <td>{{ patient.nik || '-'}}</td>
              <td>{{ patient.gender === "male" ? "Laki-laki" : "Perempuan" || '-'}}</td>
              <td>{{ formatDate(patient.birth_date) || '-'}}</td>
              <td>{{ patient.age || '-'}}</td>
              <td>{{ patient.address || '-'}}</td>
              <td>{{ patient.phone_number || '-' }}</td>
              <td>{{ patient.bpjs_number || '-'}}</td>
              <td>
                <button
                  class="action-button detail"
                  @click="viewPatientDetails(patient.id)"
                >
                  Lihat Detail
                </button>
              </td>
            </tr>
            <tr v-if="!isLoading && patients.length === 0">
              <td colspan="10" class="no-data">Tidak ada data pasien.</td> <!-- Colspan diubah menjadi 10 -->
            </tr>
          </tbody>
        </table>
      </div>
      <div class="pagination-container">
        <div class="flex items-center justify-between bg-white px-4 py-3 sm:px-6">
          <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p class="text-sm text-gray-700 flex items-center gap-2">
                Baris per halaman:
                <div class="dropdown-container">
                  <select
                    id="rowsPerPage"
                    v-model="pageSize"
                    @change="resetPagination"
                    class="dropdown-select"
                  >
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="100">100</option>
                  </select>
                </div>
                {{ totalPatients > 0 ? firstItemIndex + 1 : 0 }}-{{ lastItemIndex }} dari
                {{ totalPatients }} item
              </p>
            </div>
            <nav class="isolate inline-flex -space-x-px rounded-md shadow-xs" aria-label="Pagination">
              <button
                class="pagination-button prev"
                @click="prevPage"
                :disabled="currentPage === 1"
              >
                <font-awesome-icon :icon="['fas', 'chevron-left']" />
              </button>
              <template v-for="(item, index) in paginationItems">
                <button
                  v-if="item !== 'ellipsis'"
                  :key="'page-' + index"
                  :class="[
                    currentPage === item ? 'active' : '',
                    'pagination-button',
                  ]"
                  @click="goToPage(item)"
                >
                  {{ item }}
                </button>
                <div
                  v-else
                  :key="'ellipsis-' + index"
                  class="pagination-ellipsis"
                >
                  ...
                </div>
              </template>
              <button
                class="pagination-button next"
                @click="nextPage"
                :disabled="currentPage === totalPages || totalPages === 0"
              >
                <font-awesome-icon :icon="['fas', 'chevron-right']" />
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
    <AddGeneralPatientModal
      v-if="showAddGeneralPatientModal"
      :show="showAddGeneralPatientModal"
      @close="closeAddGeneralPatientModal"
      @patient-created="handleGeneralPatientCreated"
    />
  </div>
</template>

<script>
import apiClient from "../../api.js"; 
import Swal from "sweetalert2";
import AddGeneralPatientModal from "../../components/modals/AddGeneralPatientModal.vue";
import { library } from '@fortawesome/fontawesome-svg-core';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

library.add(faSpinner);

export default {
  name: "ListPasien",
  components: {
    AddGeneralPatientModal,
  },
  data() {
    return {
      patients: [], 
      currentPage: 1,
      pageSize: 10,
      searchQuery: "",
      showAddGeneralPatientModal: false,
      totalPatients: 0,
      totalPages: 0,
      links: {},
      isLoading: false,
      isDownloading: false, // State untuk loading unduh
      searchTimeout: null,
    };
  },
  computed: {
    firstItemIndex() {
      return (this.currentPage - 1) * this.pageSize;
    },
    lastItemIndex() {
      const currentLast = this.currentPage * this.pageSize;
      return Math.min(currentLast, this.totalPatients);
    },
    paginationItems() {
      const result = [];
      const totalPages = this.totalPages;
      const currentPage = this.currentPage;
      
      if (totalPages === 0) return [];
      if (totalPages <= 7) {
        for (let i = 1; i <= totalPages; i++) {
          result.push(i);
        }
        return result;
      }
      
      result.push(1);
      let lastPushed = 1;

      if (currentPage <= 4) {
        for (let i = 2; i <= Math.min(5, totalPages -1) ; i++) {
          result.push(i);
          lastPushed = i;
        }
        if (totalPages > lastPushed + 1 && lastPushed < totalPages -1 ) result.push('ellipsis');
      } else if (currentPage >= totalPages - 3) {
        if (1 < totalPages - 5) result.push('ellipsis');
        for (let i = Math.max(2, totalPages - 4); i < totalPages; i++) {
          if(i > lastPushed) {
             result.push(i);
             lastPushed = i;
          }
        }
      } else {
        if (1 < currentPage - 2) result.push('ellipsis');
        result.push(currentPage - 1);
        result.push(currentPage);
        result.push(currentPage + 1);
        lastPushed = currentPage + 1;
        if (totalPages > lastPushed + 1 && lastPushed < totalPages -1) result.push('ellipsis');
      }
      if(lastPushed < totalPages) result.push(totalPages);
      
      return result.filter((item, index, self) => { 
          if (item === 'ellipsis' && self[index -1] === 'ellipsis') return false;
          return true;
      });
    },
  },
  methods: {
    formatDate(dateString) {
      if (!dateString) {
        return '-';
      }
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return dateString;
      }
      const monthNames = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
      ];
      const day = date.getDate();
      const monthIndex = date.getMonth();
      const year = date.getFullYear();
      return `${day} ${monthNames[monthIndex]} ${year}`;
    },
    async fetchPatients() {
      this.isLoading = true;
      try {
        const response = await apiClient.get("/puskesmas/patients", {
          params: {
            disease_type: "all", // Mengambil semua data pasien
            search: this.searchQuery || undefined,
            per_page: this.pageSize,
            page: this.currentPage,
          },
        });

        if (!response.data || !response.data.meta) {
          Swal.fire("Error", "Terjadi kesalahan: Struktur respons API tidak sesuai.", "error");
          return;
        }
        
        const { data, meta } = response.data;
        this.patients = Array.isArray(data) ? data : Object.values(data || {});
        this.totalPatients = parseInt(meta.total) || 0;
        this.pageSize = parseInt(meta.per_page) || 10;
        this.currentPage = parseInt(meta.current_page) || 1;
        this.totalPages = parseInt(meta.last_page) || 0;
        this.links = meta.links || {};

      } catch (error) {
        if (error.response?.status === 401) {
          Swal.fire({
            title: "Session Expired!",
            text: "Sesi Anda telah berakhir. Silakan login kembali.",
            icon: "warning",
          }).then(() => {
            // Logika logout atau redirect
          });
        } else {
          Swal.fire("Error!", "Gagal memuat data pasien. Silakan coba lagi.", "error");
        }
      } finally {
        this.isLoading = false;
      }
    },
    async downloadExcel() {
      if (this.isDownloading) return;
      this.isDownloading = true;

      try {
        const response = await apiClient.get('/puskesmas/patients-export-excel', {
          params: {
            disease_type: 'all', // Sesuai permintaan
            search: this.searchQuery || undefined,
          },
          responseType: 'blob',
        });

        const blob = new Blob([response.data], { type: response.headers['content-type'] });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        
        const fileName = `data_semua_pasien.xlsx`;
        
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        Swal.fire('Berhasil!', 'Data pasien berhasil diunduh.', 'success');

      } catch (error) {
        console.error("Error downloading excel file:", error);
        Swal.fire('Gagal!', 'Terjadi kesalahan saat mengunduh data.', 'error');
      } finally {
        this.isDownloading = false;
      }
    },
    openAddGeneralPatientModal() {
      this.showAddGeneralPatientModal = true;
    },
    closeAddGeneralPatientModal() {
      this.showAddGeneralPatientModal = false;
    },
    handleGeneralPatientCreated() {
      // Langsung refresh list tanpa konfirmasi examination
      this.fetchPatients();
    },
    prevPage() {
      if (this.currentPage > 1) this.currentPage--;
    },
    nextPage() {
      if (this.currentPage < this.totalPages) this.currentPage++;
    },
    goToPage(page) {
      if (page !== 'ellipsis' && page !== this.currentPage) this.currentPage = page;
    },
    resetPagination() {
      if (this.currentPage !== 1) {
        this.currentPage = 1;
      } else {
        this.fetchPatients(); 
      }
    },
    viewPatientDetails(id) {
      this.$router.push({ name: "DetailPasienLP", params: { id } });
    },
  },
  watch: {
    currentPage() { this.fetchPatients(); },
    pageSize() {
      if (this.currentPage !== 1) this.currentPage = 1; 
      else this.fetchPatients();
    },
    searchQuery() {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        if (this.currentPage !== 1) {
          this.currentPage = 1;
        } else {
          this.fetchPatients();
        }
      }, 500);
    },
  },
  created() {
    this.fetchPatients(); 
  },
  beforeUnmount() {
    clearTimeout(this.searchTimeout);
  },
};
</script>

<style scoped>
.diabetes-mellitus {
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

/* Tombol Tambah Data Peserta */
.add-data-button, .download-report-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: var(--primary-500);
  color: #ffffff;
  font-family: "Inter", sans-serif;
  font-size: 14px;
  font-weight: 500;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.add-data-button:hover, .download-report-button:hover {
  background: var(--primary-700);
}

.download-report-button:disabled {
  background-color: #9aa0a8;
  cursor: not-allowed;
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
  border: 1px solid #cdcfD4;
  border-radius: 10px;
  font-family: "Inter", sans-serif;
  font-size: 14px;
  color: #4f5867;
  outline: none;
}

.search-input:hover {
  border-color: var(--primary-500);
}

@media (max-width: 992px) {
  .toolbar {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .left-section,
  .right-section {
    width: 100%;
    flex-direction: column;
    align-items: stretch; /* Ubah agar tombol memenuhi lebar */
  }

  .search-container {
    width: 100%;
  }

  .search-input {
    width: 100%;
  }

  .add-data-button,
  .download-report-button {
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

.data-table thead th {
  background: #f3f4f6;
  color: #333333;
  font-weight: 600;
  text-align: center;
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.data-table tbody tr:hover {
  background: #f9fafb;
  transition: background-color 0.3s ease;
}

.data-table td {
  text-align: center;
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
}
.data-table tbody tr:last-child td {
  border-bottom: none;
}


.data-table tr {
  height: 60px;
}

/* Loading Container Style */
.loading-container {
  width: 100%;
  height: 200px;
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
  color: #4f5867;
  font-size: 14px;
}

/* Action Button */
.action-button.detail {
  padding: 8px 16px;
  border: 1px solid var(--primary-300);
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  background: var(--secondary-100);
  color: var(--primary-500);
  transition: background-color 0.3s ease, transform 0.3s ease;
}

.action-button.detail:hover {
  background: var(--secondary-300);
  transform: scale(1.05);
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

.no-data {
  text-align: center;
  padding: 40px 20px;
  color: #6b7280;
  font-style: italic;
}

/* Pagination */
.pagination-container {
  background-color: #ffffff;
  border-radius: 8px;
}

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

.pagination-ellipsis {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  font-family: "Inter", sans-serif;
  font-size: 14px;
  color: #9aa0a8;
}

.pagination-button:hover {
  color: var(--primary-500);
}

.pagination-button.active {
  color: var(--primary-500);
  font-weight: 600;
}

.pagination-button.prev,
.pagination-button.next {
  background-color: var(--primary-500);
  color: #ffffff;
  width: auto;
  padding: 10px 16px;
  font-size: 16px;
}

.pagination-button.prev:hover,
.pagination-button.next:hover {
  background-color: var(--primary-700);
}

.pagination-button:disabled {
  background-color: #9aa0a8;
  color: #ffffff;
  cursor: not-allowed;
}

.dropdown-container {
  position: relative;
  width: 80px;
}
</style>