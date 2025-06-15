<template>
  <div class="diabetes-mellitus">
    <div class="page-container">
      <div class="toolbar">
        <div class="left-section">
          <button class="add-data-button" @click="openAddPatientModal">
            <font-awesome-icon :icon="['fas', 'plus']" />
            Tambah Pasien Baru
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
              <th>Nomor BPJS</th>
              <th>Jenis Kelamin</th>
              <th>Tanggal Lahir</th>
              <th>Umur</th>
              <th>Alamat</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="isLoading">
              <td colspan="9">
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
              <td>{{ patient.bpjs_number || '-'}}</td>
              <td>{{ patient.gender === "male" ? "Laki-laki" : "Perempuan" || '-'}}</td>
              <td>{{ formatDate(patient.birth_date) || '-'}}</td>
              <td>{{ patient.age || '-'}}</td>
              <td>{{ patient.address || '-'}}</td>
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
              <td colspan="9" class="no-data">Tidak ada data pasien.</td>
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
    <AddPatientModal
      v-if="showAddPatientModal"
      @close="closeAddPatientModal"
      @patient-created="handlePatientCreated" 
    />
  </div>
</template>

<script>
import apiClient from "../../api.js"; 
import Swal from "sweetalert2";
import AddPatientModal from "../../components/modals/AddNewPatient.vue";

export default {
  name: "ListPasien",
  components: {
    AddPatientModal,
  },
  data() {
    return {
      patients: [], 
      currentPage: 1,
      pageSize: 10,
      searchQuery: "",
      showAddPatientModal: false,
      totalPatients: 0,
      totalPages: 0,
      links: {},
      isLoading: false,
      searchTImeout: null,
    };
  },
  computed: {
    // ... (computed properties remain the same as previous version) ...
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
      // Jika tanggal kosong atau tidak valid, kembalikan strip (-)
      if (!dateString) {
        return '-';
      }

      const date = new Date(dateString);
      // Cek apakah tanggal yang dihasilkan valid
      if (isNaN(date.getTime())) {
          return dateString; // Kembalikan string asli jika formatnya tidak dikenali
      }

      // Daftar nama bulan dalam Bahasa Indonesia
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
      // ... (fetchPatients logic remains the same as previous version) ...
      this.isLoading = true;
      try {
        const token = localStorage.getItem("token"); 
        if (!token) {
          Swal.fire("Error", "Sesi tidak valid. Silakan login kembali.", "error");
          this.isLoading = false;
          return;
        }
        const response = await apiClient.get("/puskesmas/patients", {
          params: {
            search: this.searchQuery || undefined,
            per_page: this.pageSize,
            page: this.currentPage,
          },
        });

        if (!response.data || !response.data.meta) {
          Swal.fire("Error", "Terjadi kesalahan: Struktur respons API tidak sesuai.", "error");
          this.isLoading = false;
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
            text: "Your Session has Expired. Please login again.",
            icon: "warning",
          }).then(() => {
            this.$router.push('/login'); 
          });
        } else {
          Swal.fire("Error!", "Gagal memuat data pasien. Silakan coba lagi.", "error");
        }
      } finally {
        this.isLoading = false;
      }
    },
    openAddPatientModal() {
      this.showAddPatientModal = true;
    },
    closeAddPatientModal() {
      this.showAddPatientModal = false;
    },
    handlePatientCreated(newPatientData) {
      // This method is called when AddNewPatientModal successfully creates a patient
      // newPatientData contains the response from the API (the created patient object)
      console.log("Patient created:", newPatientData);
      // The modal closes itself on success.
      // Parent ensures its state for modal visibility is also updated if needed,
      // though AddNewPatientModal emitting 'close' already handles this.
      this.fetchPatients(); // Refresh the patient list
    },
    // The old handlePatientSubmit method is removed as its logic is now in AddNewPatientModal.vue
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
      // 1. Hapus timeout sebelumnya untuk me-reset timer setiap kali ada ketukan baru
      clearTimeout(this.searchTimeout);

      // 2. Atur timeout baru. Kode di dalamnya hanya akan berjalan setelah 500ms
      //    jika tidak ada ketukan tombol baru dalam rentang waktu tersebut.
      this.searchTimeout = setTimeout(() => {
        // 3. Logika asli dipindahkan ke dalam callback setTimeout
        if (this.currentPage !== 1) {
          // Mereset ke halaman 1 akan otomatis memicu watcher `currentPage` untuk memanggil API
          this.currentPage = 1;
        } else {
          // Jika sudah di halaman 1, panggil API secara langsung
          this.fetchPatients();
        }
      }, 1000); // Penundaan 500 milidetik
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

/* Dropdown untuk tombol download/unduh */
.download-dropdown {
  position: relative;
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

/* Menu dropdown untuk download */
.download-menu {
  position: absolute;
  top: 100%;
  left: 0;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.15);
  margin-top: 5px;
  z-index: 100;
  min-width: 180px;
  overflow: hidden;
}

/* Opsi download */
.download-option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  width: 100%;
  border: none;
  background: transparent;
  text-align: left;
  font-family: "Inter", sans-serif;
  font-size: 14px;
  color: #4f5867;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.download-option:hover {
  background-color: #f3f4f6;
  color: var(--primary-500);
}

/* Separator antara opsi */
.download-option:not(:last-child) {
  border-bottom: 1px solid #eaeaea;
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
  
  .download-menu {
    width: 100%;
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
  background: var(--secondary-100); /* Make sure --secondary-100 is defined in your global styles or :root */
  color: var(--primary-500);
  transition: background-color 0.3s ease, transform 0.3s ease;
}

.action-button.detail:hover {
  background: var(--secondary-300); /* Make sure --secondary-300 is defined */
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

/* No Data Display */
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
</style>