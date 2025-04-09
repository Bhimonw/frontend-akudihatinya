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
            <input type="text" placeholder="Search..." class="search-input" v-model="searchQuery" />
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
            <tr v-for="(patient, index) in paginatedPatients" :key="patient.id">
              <td>{{ index + 1 }}</td>
              <td>{{ patient.name }}</td>
              <td>{{ patient.nik }}</td>
              <td>{{ patient.bpjs }}</td>
              <td>{{ patient.gender }}</td>
              <td>{{ patient.dob }}</td>
              <td>{{ patient.age }}</td>
              <td>{{ patient.address }}</td>
              <td>
                <button class="action-button detail" @click="viewPatientDetails(patient.id)">
                  Lihat Detail
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
      v-if="showAddPatientModal" 
      @close="closeAddPatientModal"
      @submit="handlePatientSubmit"
    />
  </div>
</template>

<script>
import { patientData } from "../../data/dummyData.js";
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
      patients: patientData,
      currentPage: 1,
      pageSize: 10,
      searchQuery: "",
      selectedYear: String(currentYear),
      years: years,
      isDownloadMenuOpen: false,
      showAddPatientModal: false
    };
  },
  computed: {
    totalPatients() {
      return this.filteredPatients.length;
    },
    totalPages() {
      return Math.ceil(this.totalPatients / this.pageSize);
    },
    firstItemIndex() {
      return (this.currentPage - 1) * this.pageSize;
    },
    lastItemIndex() {
      return Math.min(this.currentPage * this.pageSize, this.totalPatients);
    },
    filteredPatients() {
      return this.patients.filter((patient) => {
        const matchesSearch = patient.name.toLowerCase().includes(this.searchQuery.toLowerCase());
        const matchesYear = !this.selectedYear || patient.year === this.selectedYear;
        return matchesSearch && matchesYear;
      });
    },
    paginatedPatients() {
      return this.filteredPatients.slice(this.firstItemIndex, this.lastItemIndex);
    },
  },
  methods: {
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
    viewPatientDetails(id) {
      this.$router.push({ name: "DetailPasien", params: { id }});
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
    },
  },
  beforeDestroy() {
    document.removeEventListener('click', this.closeDownloadMenu);
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
</style>