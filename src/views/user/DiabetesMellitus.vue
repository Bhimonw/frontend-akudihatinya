<template>
  <div class="diabetes-mellitus">
    <div class="page-container">
      <div class="toolbar">
        <div class="left-section">
          <div class="dropdown-container-year">
            <select id="yearPicker" class="dropdown-select" v-model="selectedYear">
              <option v-for="year in years" :key="year" :value="String(year)">{{ year }}</option>
            </select>
          </div>
          <button class="add-data-button" @click="openAddPatientModal">
            <font-awesome-icon :icon="['fas', 'plus']" />
            Tambah Pasien
          </button>
          <button class="download-report-button" @click="downloadExcel" :disabled="isDownloading">
            <font-awesome-icon :icon="['fas', isDownloading ? 'spinner' : 'download']" :spin="isDownloading" />
            {{ isDownloading ? 'Mengunduh...' : 'Unduh Excel' }}
          </button>
        </div>
        <div class="right-section">
          <div class="search-container">
            <font-awesome-icon :icon="['fas', 'search']" class="search-icon" />
            <input type="text" placeholder="Cari Data..." class="search-input" v-model="searchQuery" />
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
              <td colspan="10"> <div class="loading-container">
                  <div class="loading-content">
                    <div class="spinner"></div>
                    <p>Memuat data...</p>
                  </div>
                </div>
              </td>
            </tr>
            <tr v-else v-for="(patient, index) in patients" :key="patient.id">
              <td>{{ (currentPage - 1) * pageSize + index + 1 }}</td>
              <td>{{ patient.name || '-' }}</td>
              <td>{{ patient.nik || '-'}}</td>
              <td>{{ patient.gender === "male" ? "Laki-laki" : "Perempuan" || '-'}}</td>
              <td>{{ formatDate(patient.birth_date) || '-'}}</td>
              <td>{{ patient.age || '-'}}</td>
              <td class="action-button-container">{{ patient.address || '-'}}</td>
              <td>{{ patient.phone_number || '-' }}</td> 
              <td>{{ patient.bpjs_number || '-' }}</td>
              <td>
                <div class="action-buttons-container">
                  <button class="action-button detail" @click="viewPatientDetails(patient.id)">
                    <font-awesome-icon :icon="['fas', 'eye']" />
                    Lihat Detail
                  </button>
                  <button class="action-button delete" @click="deleteExaminationYear(patient.id)">
                    <font-awesome-icon :icon="['fas', 'trash']" />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="!isLoading && paginatedPatients.length === 0">
              <td colspan="10" class="no-data">Tidak ada data.</td> </tr>
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
                  <select id="rowsPerPage" v-model="pageSize" @change="resetPagination" class="dropdown-select">
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="100">100</option>
                  </select>
                </div>
                {{ firstItemIndex + 1 }}-{{ lastItemIndex }} dari {{ totalPatients }} item
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
                :disabled="currentPage === totalPages"
              >
                <font-awesome-icon :icon="['fas', 'chevron-right']" />
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
    <AddPatientModal 
      :show="showAddPatientModal" 
      @close="closeAddPatientModal"
      @submit="handlePatientSubmit"
      :selected-year="selectedYear"
      examination-type="dm"
    />
  </div>
</template>

<script>
import Swal from 'sweetalert2';
import apiClient from "../../api.js";
import AddPatientModal from "../../components/modals/AddPatientModal.vue";
// Pastikan untuk menambahkan faSpinner jika belum ada
import { library } from '@fortawesome/fontawesome-svg-core';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

library.add(faSpinner);

export default {
  name: "DiabetesMellitus",
  components: {
    AddPatientModal
  },
  data() {
    const currentYear = new Date().getFullYear();
    const startYear = 2024;
    const years = Array.from({ length: currentYear - startYear + 1 }, (_, i) => startYear + i).reverse();
    return {
      patients: [], // Data pasien dari API
      currentPage: 1,
      pageSize: 10,
      searchQuery: "",
      selectedYear: String(currentYear),
      years: years,
      isDownloading: false, // State untuk loading download
      showAddPatientModal: false,
      totalPatients: 0,
      totalPages: 0,
      links: {},
      isLoading: false,
      searchTimeout: null,
    };
  },
  computed: {
    filteredPatients() {
      return this.patients;
    },
    paginatedPatients() {
      return this.filteredPatients;
    },
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
      
      if (totalPages <= 7) {
        for (let i = 1; i <= totalPages; i++) {
          result.push(i);
        }
        return result;
      }
      
      result.push(1);
      
      if (currentPage <= 4) {
        for (let i = 2; i <= 5; i++) {
          result.push(i);
        }
        result.push('ellipsis');
        result.push(totalPages);
        return result;
      }
      
      if (currentPage >= totalPages - 3) {
        result.push('ellipsis');
        for (let i = totalPages - 4; i < totalPages; i++) {
          result.push(i);
        }
        return result;
      }
      
      result.push('ellipsis');
      result.push(currentPage - 1);
      result.push(currentPage);
      result.push(currentPage + 1);
      result.push('ellipsis');
      result.push(totalPages);
      
      return result;
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
            disease_type: "dm",
            year: this.selectedYear,
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
            // authStore.logout() akan menangani redirect
          });
        } else {
          Swal.fire("Error!", "Gagal memuat data pasien. Silakan coba lagi.", "error");
        }
      } finally {
        this.isLoading = false;
      }
    },
    async deleteExaminationYear(patientId) {
      const confirmation = await Swal.fire({
        title: 'Apakah Anda yakin?',
        text: "Anda akan menghapus data pemeriksaan pasien ini untuk tahun yang dipilih!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Ya, hapus!',
        cancelButtonText: 'Batal'
      });

      if (!confirmation.isConfirmed) {
        return;
      }

      try {
        const payload = {
          year: this.selectedYear,
          examination_type: "dm",
        };
        await apiClient.put(
          `/puskesmas/patients/${patientId}/examination-year`,
          payload
        );

        Swal.fire('Berhasil!', 'Data pemeriksaan berhasil dihapus.', 'success');
        this.fetchPatients();
      } catch (error) {
        console.error("Error deleting examination year:", error.response?.data || error.message);
        if (error.response?.status !== 401) {
             Swal.fire({
                icon: 'error',
                title: 'Gagal',
                text: error.response?.data?.message || 'Terjadi kesalahan saat menghapus data.',
            });
        }
      }
    },
    openAddPatientModal() {
      this.showAddPatientModal = true;
    },
    closeAddPatientModal() {
      this.showAddPatientModal = false;
    },
    handlePatientSubmit(patientData) {
      console.log("Data yang disimpan:", patientData);
      this.closeAddPatientModal();
      this.fetchPatients();
    },
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.fetchPatients();
      }
    },
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
        this.fetchPatients();
      }
    },
    goToPage(page) {
      this.currentPage = page;
      this.fetchPatients();
    },
    resetPagination() {
      this.currentPage = 1;
      this.fetchPatients();
    },
    viewPatientDetails(id) {
      this.$router.push({
        name: "DetailPasienDM",
        params: { id },
        query: { year: this.selectedYear }
      });
    },
    async downloadExcel() {
      if (this.isDownloading) return;
      this.isDownloading = true;

      try {
        const response = await apiClient.get('/puskesmas/patients-export-excel', {
          params: {
            disease_type: 'dm',
            year: this.selectedYear,
            search: this.searchQuery || undefined,
          },
          responseType: 'blob', // Penting untuk menerima file
        });

        const blob = new Blob([response.data], { type: response.headers['content-type'] });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        
        const fileName = `data_pasien_dm_${this.selectedYear}.xlsx`;
        
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
  },
  watch: {
    currentPage() {
      this.fetchPatients();
    },
    selectedYear() {
      if (this.currentPage !== 1) {
        this.currentPage = 1;
      } else {
        this.fetchPatients();
      }
    },
    pageSize() {
      if (this.currentPage !== 1) {
        this.currentPage = 1;
      } else {
        this.fetchPatients();
      }
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
/* Root Styles */
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

/* Dropdown Tahun */
.dropdown-container-year {
  position: relative;
  width: 147px;
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

/* Dropdown Icon (Chevron Down) */
.dropdown-container-year::after {
  content: "▼";
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 12px;
  color: #9aa0a8;
  pointer-events: none;
}

/* Tombol Tambah Data Peserta */
.add-data-button {
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

.add-data-button:hover {
  background: var(--primary-700);
}

/* Tombol download Laporan */
.download-report-button {
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

.download-report-button:hover {
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
  padding: 20px;
}

.data-table tr {
  height: 60px;
}

.action-buttons-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-width: 200px;
  width: 200px;
}

/* Action Button */
.action-button {
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.3s ease, transform 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.action-button.detail {
  border: 1px solid var(--primary-300);
  background: var(--secondary-100);
  color: var(--primary-500);
}

.action-button.detail:hover {
  background: var(--secondary-300);
  transform: scale(1.05);
}

.action-button.delete {
  border: none;
  background: white;
  color: #e53935;
  border: 1px solid #e53935;
  border-radius: 6px;
  padding: 8px 12px;
  height: 36px;
  width: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-button.delete:hover {
  background: #ffebee;
  color: #c62828;
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

/* Pagination */
.pagination-container {
  background-color: #ffffff;
  border-radius: 8px;
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
  color: var(--primary-500);
}

/* Halaman Aktif */
.pagination-button.active {
  color: var(--primary-500);
  font-weight: 600;
}

/* Tombol Previous dan Next */
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

/* Spinner Style */
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
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Loading Text Style */
.loading-content p {
  margin: 0;
  color: var(--primary-500);
  font-weight: 600;
}

/* Pesan "Tidak Ada Data" */
.no-data {
  text-align: center;
  color: #9aa0a8;
  font-size: 16px;
  font-weight: 500;
}

</style>