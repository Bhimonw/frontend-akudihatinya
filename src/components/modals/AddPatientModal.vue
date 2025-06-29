<template>
  <div v-if="show">
    <div class="modal-overlay" v-if="!showNewPatientForm" @click="closeModal">
      <div class="modal-container" @click.stop>
        <div class="modal-header">
          <h2>Tambah Pasien</h2>
          <button class="close-button" @click.prevent="closeModal">✕</button>
        </div>
        <div class="modal-body">
          <div class="patient-selection">
            <div class="patient-toolbar">
              <div class="search-container">
                <font-awesome-icon :icon="['fas', 'search']" class="search-icon" />
                <input
                  type="text"
                  class="search-input"
                  placeholder="Cari pasien..."
                  v-model="searchPatientQuery"
                />
              </div>
              <button class="add-new-patient-button" @click="showNewPatientForm = true">
                <font-awesome-icon :icon="['fas', 'plus']" />
                Tambah Pasien Baru
              </button>
            </div>
            <div class="table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>No.</th>
                    <th>Nama</th>
                    <th>NIK</th>
                    <th>No. BPJS</th>
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
                  <tr v-else-if="filteredPatients.length > 0" v-for="(patient, index) in filteredPatients" :key="patient.id">
                    <td>{{ (currentPage - 1) * pageSize + index + 1 }}</td>
                    <td>{{ patient.name || '-' }}</td>
                    <td>{{ patient.nik || '-' }}</td>
                    <td>{{ patient.bpjs_number || '-' }}</td> <td>{{ patient.gender === "male" ? "Laki-laki" : "Perempuan" || '-' }}</td>
                    <td>{{ patient.birth_date || '-' }}</td> <td>{{ patient.age || '-' }}</td>
                    <td>{{ patient.address || '-' }}</td>
                    <td>
                      <button class="action-button select" @click="selectPatient(patient)">
                        Tambahkan
                      </button>
                    </td>
                  </tr>
                  <tr v-else>
                    <td colspan="9" class="no-data-message">Tidak ada data pasien yang sesuai dengan pencarian</td>
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
                      {{ firstItemIndex + 1 }}-{{ lastItemIndex }} dari
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
                      :disabled="currentPage === totalPages"
                    >
                      <font-awesome-icon :icon="['fas', 'chevron-right']" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button class="cancel-button" @click="closeModal">Batal</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <AddNewPatientModal
      v-else
      :show="showNewPatientForm"
      @close="showNewPatientForm = false"
      @patient-created="handleNewPatientCreated"
    />
  </div>
</template>

<script>
import Swal from 'sweetalert2';
import apiClient from "../../api.js"; // Menggunakan apiClient
import AddNewPatientModal from "../../components/modals/AddNewPatient.vue";

export default {
  components: {
    AddNewPatientModal
  },
  props: {
    show: {
      type: Boolean,
      required: true,
    },
    selectedYear: {
      type: String,
      required: true,
    },
    examinationType: {
      type: String,
      required: true,
      validator: function (value) {
        return ["dm", "ht"].includes(value); // Menggunakan 'ht' agar konsisten dengan API
      }
    }
  },
  data() {
    return {
      patients: [],
      searchPatientQuery: "",
      showNewPatientForm: false,
      isLoading: false,
      currentPage: 1,
      pageSize: 10,
      totalPatients: 0,
      totalPages: 0,
    };
  },
  computed: {
    // ... Bagian computed tidak ada perubahan ...
    firstItemIndex() {
      if (this.totalPatients === 0) return -1;
      return (this.currentPage - 1) * this.pageSize;
    },
    lastItemIndex() {
      return Math.min(this.currentPage * this.pageSize, this.totalPatients);
    },
    filteredPatients() {
      return this.patients;
    },
    paginationItems() {
      const result = [];
      const totalPages = this.totalPages;
      const currentPage = this.currentPage;
      if (totalPages <= 7) {
        for (let i = 1; i <= totalPages; i++) result.push(i);
        return result;
      }
      result.push(1);
      if (currentPage > 4) result.push('ellipsis');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) {
        if (!result.includes(i)) result.push(i);
      }
      if (currentPage < totalPages - 3) result.push('ellipsis');
      if (!result.includes(totalPages)) result.push(totalPages);
      return result;
    },
  },
  methods: {
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
      if (page !== 'ellipsis' && page !== this.currentPage) {
        this.currentPage = page;
        this.fetchPatients();
      }
    },
    resetPagination() {
      this.currentPage = 1;
      this.fetchPatients();
    },
    async fetchPatients(page = this.currentPage) {
      this.isLoading = true;
      try {
        const response = await apiClient.get("/puskesmas/patients", {
          params: {
            page: page,
            per_page: this.pageSize,
            search: this.searchPatientQuery || undefined,
            exclude_year: this.selectedYear,
            exclude_type: this.examinationType,
          },
        });
        
        const { data, meta } = response.data;
        this.patients = data || [];
        this.totalPatients = meta.total || 0;
        this.pageSize = meta.per_page || 10;
        this.currentPage = meta.current_page || 1;
        this.totalPages = meta.last_page || 0;

      } catch (error) {
        console.error("Error fetching patients:", error);
        Swal.fire({
          title: "Gagal Memuat Data",
          text: "Tidak dapat memuat daftar pasien. Silakan coba lagi.",
          icon: "error",
          confirmButtonColor: '#d33',
        });
      } finally {
        this.isLoading = false;
      }
    },
    closeModal() {
      this.$emit("close");
      this.resetForm();
    },
    handleNewPatientCreated(newlyCreatedPatient) {
      this.selectPatient(newlyCreatedPatient);
    },
    async selectPatient(patient) {
      try {
        const yearAsNumber = parseInt(this.selectedYear, 10);
        if (isNaN(yearAsNumber)) {
          Swal.fire("Kesalahan", "Format tahun tidak valid.", "error");
          return;
        }
        
        // Membuat nama penyakit dinamis untuk pesan konfirmasi
        const diseaseName = this.examinationType === 'dm' ? 'Diabetes Mellitus' : 'Hipertensi';
        
        const confirmation = await Swal.fire({
          title: "Konfirmasi",
          html: `Anda yakin akan menambahkan <strong>${patient.name}</strong> ke data pasien ${diseaseName} tahun <strong>${this.selectedYear}</strong>?`,
          icon: "question",
          showCancelButton: true,
          confirmButtonText: "Ya, Tambahkan",
          confirmButtonColor: '#10B981',
          cancelButtonText: "Batal",
          cancelButtonColor: '#6B7280',
        });

        if (!confirmation.isConfirmed) return;

        const payload = {
          year: yearAsNumber,
          examination_type: this.examinationType,
        };

        await apiClient.post(
          `/puskesmas/patients/${patient.id}/examination-year`,
          payload
        );

        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: `Pasien ${patient.name} berhasil ditambahkan ke daftar tahun ${this.selectedYear}.`,
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false,
        });

        this.$emit("submit", patient);
        this.closeModal();

      } catch (error) {
        console.error("Error adding examination year:", error.response?.data || error.message);
        const errorMessage = error.response?.data?.message || "Gagal menambahkan tahun pemeriksaan.";
        Swal.fire({
          title: "Gagal Menambahkan", 
          text: errorMessage, 
          icon: "error",
          confirmButtonColor: '#d33',
        });
      }
    },
    resetForm() {
      this.showNewPatientForm = false;
      this.searchPatientQuery = "";
      this.currentPage = 1;
    },
  },
  watch: {
    searchPatientQuery() {
      // Tambahkan debounce untuk pencarian agar tidak memanggil API di setiap ketikan
      if (this.searchTimeout) clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        this.resetPagination();
      }, 500); // Tunggu 500ms setelah user berhenti mengetik
    },
    show: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          this.resetForm();
          this.fetchPatients(1);
        }
      }
    }
  },
};
</script>

<style scoped>
:root {
  --primary-50: #ECFDF5;
  --primary-100: #D1FAE5;
  --primary-200: #A7F3D0;
  --primary-300: #6EE7B7;
  --primary-400: #34D399;
  --primary-500: #10B981; /* Main primary color */
  --primary-600: #059669;
  --primary-700: #047857;
  --primary-800: #065F46;
  --primary-900: #064E3B;
  
  --neutral-50: #F9FAFB;
  --neutral-100: #F3F4F6;
  --neutral-200: #E5E7EB;
  --neutral-300: #D1D5DB;
  --neutral-400: #9CA3AF;
  --neutral-500: #6B7280;
  --neutral-600: #4B5563;
  --neutral-700: #374151;
  --neutral-800: #1F2937;
  --neutral-900: #111827;
  
  --danger-50: #FEF2F2;
  --danger-500: #EF4444;
  --danger-700: #B91C1C;
  
  --warning-500: #F59E0B;
  
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-container {
  width: 90%;
  max-width: 900px;
  max-height: 90vh;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: slideIn 0.2s ease-out;
}

@keyframes slideIn {
  from { transform: translateY(10px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.modal-header {
  padding: 18px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--neutral-200);
  background-color: var(--primary-50);
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--primary-700);
  display: flex;
  align-items: center;
}

.close-button {
  background: transparent;
  border: none;
  font-size: 20px;
  color: var(--neutral-500);
  cursor: pointer;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.close-button:hover {
  background-color: var(--neutral-200);
  color: var(--neutral-800);
}

.modal-body {
  padding: 24px;
  flex-grow: 1;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--neutral-400) var(--neutral-100);
}

.modal-body::-webkit-scrollbar {
  width: 8px;
}

.modal-body::-webkit-scrollbar-track {
  background: var(--neutral-100);
  border-radius: 10px;
}

.modal-body::-webkit-scrollbar-thumb {
  background-color: var(--neutral-400);
  border-radius: 10px;
}

/* Patient Selection View Styles */
.patient-selection {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.patient-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 16px;
  background-color: var(--neutral-50);
  border-radius: 10px;
  border: 1px solid var(--neutral-200);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.search-container {
  position: relative;
  flex-grow: 1;
  max-width: 300px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--neutral-500);
}

.search-input {
  width: 100%;
  height: 42px;
  padding: 10px 10px 10px 36px;
  border: 1px solid var(--neutral-300);
  border-radius: 8px;
  font-family: var(--font-sans);
  font-size: 14px;
  color: var(--neutral-800);
  transition: all 0.3s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-500);
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
}

/* Tetap mempertahankan warna button sesuai permintaan */
.add-new-patient-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: var(--primary-500);
  color: #ffffff;
  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: 500;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.add-new-patient-button:hover {
  background: var(--primary-600);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

/* Table Styles */
.table-container {
  overflow-x: auto;
  margin-bottom: 20px;
  border-radius: 10px;
  border: 1px solid var(--neutral-200);
  flex-grow: 1;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.data-table {
  width: 100%;
  min-width: 800px;
  border-collapse: separate;
  border-spacing: 0;
  font-family: var(--font-sans);
  font-size: 14px;
  color: var(--neutral-800);
}

.data-table thead th {
  background: var(--neutral-100);
  color: var(--neutral-700);
  font-weight: 600;
  text-align: center;
  padding: 14px 12px;
  position: sticky;
  top: 0;
  z-index: 10;
  border-bottom: 1px solid var(--neutral-200);
}

.data-table tbody tr {
  transition: background-color 0.2s ease;
}

.data-table tbody tr:hover {
  background: var(--neutral-50);
}

.data-table td {
  text-align: center;
  padding: 12px;
  border-bottom: 1px solid var(--neutral-200);
}

.no-data-message {
  text-align: center;
  padding: 20px;
  color: var(--neutral-500);
  font-style: italic;
  font-weight: 500;
}

.action-button.select {
  padding: 8px 14px;
  background: var(--primary-50);
  color: var(--primary-600);
  border: 1px solid var(--primary-200);
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-button.select:hover {
  background: var(--primary-100);
  border-color: var(--primary-300);
}

/* Modal Footer */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  padding: 16px 24px;
  border-top: 1px solid var(--neutral-200);
  background-color: var(--neutral-50);
}

.cancel-button {
  padding: 10px 20px;
  background: #ffffff;
  color: var(--neutral-700);
  border: 1px solid var(--neutral-300);
  border-radius: 8px;
  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.cancel-button:hover {
  background: var(--neutral-100);
  border-color: var(--neutral-400);
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
  border: 4px solid var(--neutral-200);
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

/* Loading Text Style */
.loading-content p {
  margin: 0;
  color: var(--primary-600);
  font-weight: 500;
  font-family: var(--font-sans);
}

/* Pagination - Mempertahankan warna sesuai permintaan */
.pagination-container {
  background-color: #ffffff;
  border-radius: 8px;
  padding: 12px;
  border-top: 1px solid var(--neutral-200);
}

.pagination-ellipsis {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  font-family: var(--font-sans);
  font-size: 14px;
  color: var(--neutral-500);
}

/* Pagination Buttons */
.pagination-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: 0;
  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: 500;
  color: var(--neutral-500);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}
.dropdown-container {
  position: relative;
  width: 80px;
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


.pagination-button:hover {
  color: var(--primary-500);
  background-color: var(--neutral-100);
}

/* Halaman Aktif */
.pagination-button.active {
  color: var(--primary-500);
  font-weight: 600;
  background-color: var(--primary-50);
}

/* Tombol Previous dan Next - Mempertahankan warna sesuai permintaan */
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
  background-color: var(--neutral-400);
  color: #ffffff;
  cursor: not-allowed;
}

/* Responsive Design */
@media (max-width: 768px) {
  .modal-container {
    width: 95%;
    max-height: 95vh;
  }
  
  .form-row {
    flex-direction: column;
    gap: 15px;
  }
  
  .patient-toolbar {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }
  
  .search-container {
    max-width: none;
  }
  
  .modal-footer {
    flex-direction: column-reverse;
    gap: 10px;
  }
  
  .cancel-button {
    width: 100%;
    justify-content: center;
  }
}
</style>