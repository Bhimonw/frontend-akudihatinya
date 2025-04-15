<template>
  <div class="diabetes-mellitus">
    <!-- Page Container -->
    <div class="page-container">
      <!-- Toolbar -->
      <div class="toolbar">
        <!-- Bagian Kiri -->
        <div class="left-section">
          <!-- Bagian Dropdown Tahun -->
          <div class="dropdown-container-year">
            <select id="yearPicker" class="dropdown-select" v-model="selectedYear">
              <option v-for="year in years" :key="year" :value="String(year)">{{ year }}</option>
            </select>
          </div>
          <!-- Tombol Tambah Data Peserta (with click handler to open modal) -->
          <button class="add-data-button" @click="openAddPatientModal">
            <font-awesome-icon :icon="['fas', 'plus']" />
            Tambah Pasien
          </button>
          <!-- Tombol Download Laporan dengan Dropdown -->
          <div class="download-dropdown">
            <button class="download-report-button" @click="toggleDownloadMenu">
              <font-awesome-icon :icon="['fas', 'download']" />
              Unduh Data
              <font-awesome-icon :icon="['fas', 'caret-down']" />
            </button>
            <div class="download-menu" v-show="isDownloadMenuOpen">
              <button class="download-option" @click="downloadExcel">
                <font-awesome-icon :icon="['fas', 'file-excel']" />
                Unduh Excel
              </button>
              <button class="download-option" @click="downloadPDF">
                <font-awesome-icon :icon="['fas', 'file-pdf']" />
                Unduh PDF
              </button>
            </div>
          </div>
        </div>
        <!-- Bagian Kanan -->
        <div class="right-section">
          <!-- Search Bar -->
          <div class="search-container">
            <font-awesome-icon :icon="['fas', 'search']" class="search-icon" />
            <input type="text" placeholder="Cari Data..." class="search-input" v-model="searchQuery" />
          </div>
        </div>
      </div>
      <!-- Tabel Data Pasien -->
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
              <td>{{ patient.name || '-' }}</td>
              <td>{{ patient.nik || '-'}}</td>
              <td>{{ patient.bpjs_number || '-' }}</td>
              <td>{{ patient.gender === "male" ? "Laki-laki" : "Perempuan" || '-'}}</td>
              <td>{{ patient.birth_date || '-'}}</td>
              <td>{{ patient.age || '-'}}</td>
              <td class="action-button-container">{{ patient.address || '-'}}</td>
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
              <td colspan="9" class="no-data">Tidak ada data.</td>
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
                {{ firstItemIndex + 1 }}-{{ lastItemIndex }} dari {{ totalPatients }} item
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
                v-for="page in totalPages"
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
    <AddPatientModal 
      :show="showAddPatientModal" 
      @close="closeAddPatientModal"
      @submit="handlePatientSubmit"
      :selected-year="selectedYear"
    />
  </div>
</template>

<script>
import Swal from 'sweetalert2';
import axios from 'axios';
import AddPatientModal from "../../components/modals/AddPatientModal.vue";

export default {
  name: "DiabetesMellitus",
  components: {
    AddPatientModal
  },
  data() {
    const currentYear = new Date().getFullYear();
    const startYear = 2000;
    const years = Array.from({ length: currentYear - startYear + 1 }, (_, i) => startYear + i).reverse();
    return {
      patients: [], // Data pasien dari API
      currentPage: 1,
      pageSize: 10,
      searchQuery: "",
      selectedYear: String(currentYear),
      years: years,
      isDownloadMenuOpen: false,
      showAddPatientModal: false,
      totalPatients: 0,
      totalPages: 0,
      links: {},
      isLoading: false
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
      return Math.min(this.firstItemIndex * this.patients.length, this.totalPatients);
    }
  },
  methods: {
    async fetchPatients() {
      this.isLoading = true;
      
      try {
        const token = localStorage.getItem("token"); 
        if (!token) {
          console.error("Token tidak ditemukan");
          return;
        }

        const response = await axios.get("http://localhost:8000/api/puskesmas/patients", {
          params: {
            disease_type: "dm",
            year: this.selectedYear,
            search: this.searchQuery,
            per_page: this.pageSize,
            page: this.currentPage,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("API Response:", response.data);

        if (!response.data || !response.data.meta) {
          console.error("Invalid API response structure:", response.data);
          alert("Terjadi kesalahan: Struktur respons API tidak sesuai.");
          return;
        }

        const { data, meta } = response.data;

        // IMPORTANT: Ensure data is properly converted from object to array
        this.patients = typeof data === 'object' && !Array.isArray(data) 
          ? Object.values(data) 
          : data;
          
        // Fix the meta data processing as well
        this.totalPatients = Array.isArray(meta.total) ? meta.total[0] : meta.total;
        this.pageSize = Array.isArray(meta.per_page) ? meta.per_page[0] : meta.per_page;
        this.currentPage = Array.isArray(meta.current_page) ? meta.current_page[0] : meta.current_page;
        this.totalPages = Array.isArray(meta.last_page) ? meta.last_page[0] : meta.last_page;
        this.links = meta.links;
        
        console.log("Processed patient data:", this.patients);
        console.log("Total Patients:", this.totalPatients);
        console.log("Current Page:", this.currentPage, "of", this.totalPages);
      } catch (error) {
        console.error("Error fetching patients:", error);
        alert("Terjadi kesalahan saat memuat data pasien.");
      } finally {
        this.isLoading = false;
      }
    },
    async deleteExaminationYear(patientId) {
    // Gunakan SweetAlert untuk konfirmasi
    const confirmation = await Swal.fire({
      title: 'Apakah Anda yakin?',
      text: "Anda akan menghapus data pemeriksaan pasien ini!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal'
    });

    // Jika pengguna membatalkan, hentikan proses
    if (!confirmation.isConfirmed) {
      return;
    }

    try {
      // Construct the payload
      const payload = {
        year: this.selectedYear,
        examination_type: "dm",
      };
      console.log("Payload being sent:", payload); // Debugging: Log the payload
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Token tidak ditemukan");
        Swal.fire({
          icon: 'error',
          title: 'Sesi Berakhir',
          text: 'Silakan login kembali.',
        });
        return;
      }

      const response = await axios.put(
        `http://localhost:8000/api/puskesmas/patients/${patientId}/examination-year`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("API Response:", response.data);
      if (!response.data || !response.data.message) {
        console.error("Invalid API response structure:", response.data);
        Swal.fire({
          icon: 'error',
          title: 'Kesalahan',
          text: 'Struktur respons API tidak sesuai.',
        });
        return;
      }

      // Tampilkan notifikasi sukses menggunakan SweetAlert
      Swal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: 'Data berhasil dihapus!',
      });

      this.fetchPatients(); // Refresh patient list after deletion
    } catch (error) {
      console.error("Error deleting examination year:", error.response?.data || error.message);

      // Tampilkan notifikasi gagal menggunakan SweetAlert
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: 'Terjadi kesalahan saat menghapus data. Silakan coba lagi.',
      });
    }
  },
    openAddPatientModal() {
      this.showAddPatientModal = true;
    },
    closeAddPatientModal() {
      this.showAddPatientModal = false;
    },
    handlePatientSubmit(formData) {
      console.log("Data yang disimpan:", formData);
      alert("Data berhasil disimpan!");
      this.closeAddPatientModal();
      this.fetchPatients(); // Muat ulang data setelah menambahkan pasien
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
        name: "DetailPasien",
        params: { id },
        query: { year: this.selectedYear } // Kirim tahun sebagai query parameter
      });
    },
    toggleDownloadMenu() {
      this.isDownloadMenuOpen = !this.isDownloadMenuOpen;
      if (this.isDownloadMenuOpen) {
        setTimeout(() => {
          document.addEventListener('click', this.closeDownloadMenu);
        }, 0);
      }
    },
    closeDownloadMenu(event) {
      const downloadContainer = document.querySelector('.download-dropdown');
      if (downloadContainer && !downloadContainer.contains(event.target)) {
        this.isDownloadMenuOpen = false;
        document.removeEventListener('click', this.closeDownloadMenu);
      }
    },
    downloadExcel() {
      console.log("Mengunduh data dalam format Excel...");
      alert("Mengunduh data dalam format Excel");
      this.isDownloadMenuOpen = false;
    },
    downloadPDF() {
      console.log("Mengunduh data dalam format PDF...");
      alert("Mengunduh data dalam format PDF");
      this.isDownloadMenuOpen = false;
    }
  },
  watch: {
    currentPage() {
      this.fetchPatients();
    },
    selectedYear() {
      this.currentPage = 1; // Reset halaman saat tahun berubah
      this.fetchPatients();
    },
    searchQuery() {
      this.currentPage = 1; // Reset halaman saat pencarian berubah
      this.fetchPatients();
    },
    pageSize() {
      this.currentPage = 1; // Reset halaman saat jumlah baris per halaman berubah
      this.fetchPatients();
    }
  },
  created() {
    this.fetchPatients(); // Muat data pasien saat komponen dibuat
  }
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