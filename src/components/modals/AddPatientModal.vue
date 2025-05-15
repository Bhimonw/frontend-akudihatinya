<template>
  <div class="modal-overlay" v-if="show" @click="closeModal">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h2>Tambah Pasien</h2>
        <button class="close-button" @click.prevent="closeModal">
          ✕
        </button>
      </div>
      <div class="modal-body">
        <!-- Tampilan Daftar Pasien -->
        <div v-if="!showNewPatientForm" class="patient-selection">
          <!-- Toolbar -->
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
          <!-- Patient Table -->
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
                <!-- Indikator Loading -->
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
                <!-- Data Pasien -->
                <tr v-else-if="filteredPatients.length > 0" v-for="(patient, index) in filteredPatients" :key="patient.id">
                  <td>{{ (currentPage - 1) * pageSize + index + 1 }}</td>
                  <td>{{ patient.name || '-'}}</td>
                  <td>{{ patient.nik || '-'}}</td>
                  <td>{{ patient.bpjs || '-'}}</td>
                  <td>{{ patient.gender === "male" ? "Laki-laki" : "Perempuan" || '-'}}</td>
                  <td>{{ patient.dob || '-'}}</td>
                  <td>{{ patient.age || '-'}}</td>
                  <td>{{ patient.address || '-'}}</td>
                  <td>
                    <button class="action-button select" @click="selectPatient(patient)">
                      Tambahkan
                    </button>
                  </td>
                </tr>
                <!-- Pesan "Tidak Ada Data" -->
                <tr v-else>
                  <td colspan="9" class="no-data-message">Tidak ada data pasien yang sesuai dengan pencarian</td>
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
                <!-- Pagination Buttons -->
                <nav
                  class="isolate inline-flex -space-x-px rounded-md shadow-xs"
                  aria-label="Pagination"
                >
                  <!-- Tombol Previous -->
                  <button
                    class="pagination-button prev"
                    @click="prevPage"
                    :disabled="currentPage === 1"
                  >
                    <font-awesome-icon :icon="['fas', 'chevron-left']" />
                  </button>
                  <!-- Page numbers and ellipsis -->
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
          <div class="modal-footer">
            <button class="cancel-button" @click="closeModal">Batal</button>
          </div>
        </div>
        <!-- Form Tambah Pasien Baru -->
        <div v-else class="new-patient-form">
          <h3>Tambah Pasien Baru</h3>
          <form @submit.prevent="submitNewPatient">
            <div class="form-row">
              <div class="form-group">
                <label for="name">Nama</label>
                <input type="text" id="name" v-model="formData.name" placeholder="Masukkan nama" required />
              </div>
              <div class="form-group">
                <label for="nik">NIK</label>
                <input type="text" id="nik" v-model="formData.nik" placeholder="Masukkan NIK" required />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="bpjs">No. BPJS</label>
                <input type="text" id="bpjs" v-model="formData.bpjs" placeholder="Masukkan No. BPJS" />
              </div>
              <div class="form-group">
                <label for="gender">Jenis Kelamin</label>
                <select id="gender" v-model="formData.gender" required>
                  <option value="">Pilih Jenis Kelamin</option>
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="dob">Tanggal Lahir</label>
                <input type="date" id="dob" v-model="formData.dob" required />
              </div>
              <div class="form-group">
                <label for="age">Umur</label>
                <input type="number" id="age" v-model="formData.age" placeholder="Masukkan umur" min="0" required />
              </div>
            </div>
            <div class="form-group full-width">
              <label for="address">Alamat</label>
              <textarea 
                id="address" 
                v-model="formData.address" 
                placeholder="Masukkan alamat" 
                rows="3" 
                required
              ></textarea>
            </div>
            <div class="button-container">
              <button type="button" class="cancel-button" @click="showNewPatientForm = false">
                Kembali
              </button>
              <button type="submit" class="submit-button">Simpan</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Swal from 'sweetalert2';
import axios from "axios";

export default {
  props: {
    show: {
      type: Boolean,
      required: true,
    },
    selectedYear: { // Receive selectedYear as a prop
      type: String,
      required: true,
    },
  },
  data() {
    return {
      patients: [], // Array untuk menyimpan data pasien dari API
      searchPatientQuery: "",
      showNewPatientForm: false,
      isLoading: false, // State untuk loading
      currentPage: 1,
      pageSize: 10,
      totalPatients: 0,
    };
  },
  computed: {
    firstItemIndex() {
      return (this.currentPage - 1) * this.pageSize;
    },
    lastItemIndex() {
      return Math.min(this.currentPage * this.pageSize, this.totalPatients);
    },
    paginatedPatients() {
      return this.filteredPatients;
    },
    filteredPatients() {
      return this.patients;
    },
    paginationItems() {
      const result = [];
      const totalPages = this.totalPages;
      const currentPage = this.currentPage;

      // For 7 or fewer pages, show all
      if (totalPages <= 7) {
        for (let i = 1; i <= totalPages; i++) {
          result.push(i);
        }
        return result;
      }
      // Always show first page
      result.push(1);

    // Case 1: Current page is near the beginning
    if (currentPage <= 4) {
      for (let i = 2; i <= 5; i++) {
        result.push(i);
      }
      result.push('ellipsis');
      result.push(totalPages);
      return result;
    }
    // Case 2: Current page is near the end
    if (currentPage >= totalPages - 3) {
        result.push('ellipsis');
        for (let i = totalPages - 4; i < totalPages; i++) {
          result.push(i);
        }
        return result;
      }

      // Case 3: Current page is in the middle
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
      if (page !== 'ellipsis') {
        this.currentPage = page;
        this.fetchPatients();
      }
    },
    resetPagination() {
      this.currentPage = 1;
      this.fetchPatients();
    },
    async fetchPatients(page = this.currentPage) {
      this.isLoading = true; // Aktifkan loading
      try {
        const token = localStorage.getItem("token"); // Ambil token dari localStorage
        if (!token) {
          console.error("Token tidak ditemukan");
          return;
        }
        const response = await axios.get("http://localhost:8000/api/puskesmas/patients", {
          params:{
            page: page,
            per_page: this. pageSize,
            search: this.searchPatientQuery || undefined,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        // Validasi struktur respons API
        if (!response.data || !response.data.meta) {
          console.error("Invalid API response structure:", response.data);
          alert("Terjadi kesalahan: Struktur respons API tidak sesuai.");
          return;
        }
        
        const { data, meta } = response.data;
        // Proses respons API
        this.patients = typeof data === 'object' && !Array.isArray(data) 
          ? Object.values(data) 
          : data;
          
        // Fix the meta data processing as well
        this.totalPatients = Array.isArray(meta.total) ? meta.total[0] : meta.total;
        this.pageSize = Array.isArray(meta.per_page) ? meta.per_page[0] : meta.per_page;
        this.currentPage = Array.isArray(meta.current_page) ? meta.current_page[0] : meta.current_page;
        this.totalPages = Array.isArray(meta.last_page) ? meta.last_page[0] : meta.last_page;
        this.links = meta.links;
      } catch (error) {
        Swal.fire({
          title: "Error!",
          text: "Gagal memuat data pasien. Silakan coba lagi.",
          icon: "error",
        });
      } finally {
        this.isLoading = false;
      }
    },
    closeModal() {
      this.$emit("close");
      this.resetForm();
    },
    async selectPatient(patient) {
      try {
        // Validasi selectedYear
        if (!this.selectedYear) {
          console.error("Selected year is missing or invalid.");
          Swal.fire({
            icon: "error",
            title: "Kesalahan",
            text: "Tahun pemeriksaan tidak valid. Silakan pilih tahun yang sesuai.",
          });
          return;
        }

        // Convert selectedYear to a number
        const yearAsNumber = parseInt(this.selectedYear, 10);
        if (isNaN(yearAsNumber)) {
          console.error("Invalid year format:", this.selectedYear);
          Swal.fire({
            icon: "error",
            title: "Kesalahan",
            text: "Format tahun tidak valid. Harap periksa input.",
          });
          return;
        }

        // Tampilkan dialog konfirmasi dengan SweetAlert2
        const confirmation = await Swal.fire({
          title: "Konfirmasi",
          html: `Apakah Anda yakin akan menambahkan <strong>${patient.name}</strong> ke data pasien Diabetes Mellitus tahun <strong>${this.selectedYear}</strong>?`,
          icon: "question",
          showCancelButton: true,
          confirmButtonText: "Ya, Tambahkan",
          cancelButtonText: "Batal",
        });

        // Jika pengguna membatalkan, hentikan proses
        if (!confirmation.isConfirmed) {
          return;
        }

        // Buat payload untuk API
        const payload = {
          year: yearAsNumber, // Ensure year is a number
          examination_type: "dm",
        };

        console.log("Payload being sent:", payload); // Debugging: Log the payload

        // Ambil token dari localStorage
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("Token tidak ditemukan");
          Swal.fire({
            icon: "error",
            title: "Sesi Berakhir",
            text: "Silakan login kembali.",
          });
          return;
        }

        // Kirim data ke API
        const response = await axios.post(
          `http://localhost:8000/api/puskesmas/patients/${patient.id}/examination-year`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("API Response:", response.data);

        // Validasi respons API
        if (!response.data || !response.data.message) {
          console.error("Invalid API response structure:", response.data);
          Swal.fire({
            icon: "error",
            title: "Kesalahan",
            text: "Struktur respons API tidak sesuai.",
          });
          return;
        }

        // Tampilkan notifikasi sukses menggunakan SweetAlert
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Data pasien berhasil ditambahkan!",
        });

        // Emit event ke parent component
        this.$emit("submit", patient);

        // Tutup modal
        this.closeModal();
      } catch (error) {
        console.error("Error adding examination year:", error.response?.data || error.message);

        // Tampilkan notifikasi gagal menggunakan SweetAlert
        Swal.fire({
          icon: "error",
          title: "Kesalahan",
          text: "Gagal menambahkan tahun pemeriksaan. Silakan coba lagi.",
        });
      }
    },
    async submitNewPatient() {
      // Tampilkan dialog konfirmasi dengan SweetAlert2
      const result = await Swal.fire({
        title: 'Konfirmasi',
        text: 'Apakah Anda yakin akan menyimpan data ini?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Ya',
        cancelButtonText: 'Batal',
      });

      // Jika pengguna membatalkan, hentikan proses
      if (!result.isConfirmed) {
        return;
      }

      try {
        // Buat objek pasien baru
        const newPatient = {
          ...this.formData,
          id: Date.now(),
        };

        // Emit data ke parent component
        this.$emit("submit", newPatient);

        // Tampilkan notifikasi sukses
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Data berhasil disimpan!',
        });

        // Tutup modal
        this.closeModal();
      } catch (error) {
        console.error("Error saving patient:", error);

        // Tampilkan notifikasi error jika terjadi kesalahan
        Swal.fire({
          icon: 'error',
          title: 'Kesalahan',
          text: 'Gagal menyimpan data. Silakan coba lagi.',
        });
      }
    },
    resetForm() {
      this.formData = {
        id: null,
        name: "",
        nik: "",
        bpjs: "",
        gender: "",
        dob: "",
        age: "",
        address: "",
      };
      this.showNewPatientForm = false;
      this.searchPatientQuery = "";
    },
  },
  watch: {
    searchPatientQuery(newVal) {
      this.resetPagination();
    },
    show: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          this.fetchPatients(this.currentPage);
        }
      }
    }
  },
  created() {
    if (this.show) {
      this.fetchPatients(); // Muat data pasien saat komponen dibuat
    }
  },
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-container {
  background: #ffffff;
  border-radius: 10px;
  width: 90%;
  max-width: 900px;
  max-height: 90vh;
  box-shadow: 0px 4px 25px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eaeaea;
  flex-shrink: 0;
}

.modal-header h2 {
  font-family: "Inter", sans-serif;
  font-size: 18px;
  font-weight: 600;
  color: #333333;
  margin: 0;
}

.close-button {
  background: transparent;
  border: none;
  font-size: 20px;
  color: #9aa0a8;
  cursor: pointer;
  padding: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  transition: background-color 0.2s ease;
}

.close-button:hover {
  color: #333333;
  background-color: #f3f4f6;
}

.modal-body {
  padding: 20px;
  overflow-y: auto;
  flex-grow: 1;
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
}

.search-container {
  position: relative;
  flex-grow: 1;
  max-width: 300px;
}

.search-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #9aa0a8;
}

.search-input {
  width: 100%;
  height: 42px;
  padding: 10px 10px 10px 36px;
  border: 1px solid #cdcfd4;
  border-radius: 10px;
  font-family: "Inter", sans-serif;
  font-size: 14px;
  color: #333333;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-500);
}

.add-new-patient-button {
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

.add-new-patient-button:hover {
  background: var(--primary-700);
}

/* Table Styles */
.table-container {
  overflow-x: auto;
  margin-bottom: 20px;
  border-radius: 10px;
  border: 1px solid #eaeaea;
  flex-grow: 1;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
}

.data-table {
  width: 100%;
  min-width: 800px;
  border-collapse: separate;
  border-spacing: 0;
  font-family: "Inter", sans-serif;
  font-size: 14px;
  color: #333333;
}

.data-table thead th {
  background: #f3f4f6;
  color: #333333;
  font-weight: 600;
  text-align: center;
  padding: 12px;
  position: sticky;
  top: 0;
  z-index: 10;
}

.data-table tbody tr:hover {
  background: #f9fafb;
}

.data-table td {
  text-align: center;
  padding: 12px;
  border-bottom: 1px solid #eaeaea;
}

.no-data-message {
  text-align: center;
  padding: 20px;
  color: #666;
  font-style: italic;
}

.action-button.select {
  padding: 6px 12px;
  background: var(--primary-100);
  color: var(--primary-500);
  border: 1px solid var(--primary-300);
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-button.select:hover {
  background: var(--primary-200);
}

/* New Patient Form Styles */
.new-patient-form {
  width: 100%;
}

.new-patient-form h3 {
  font-family: "Inter", sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: #333333;
  margin: 0 0 20px 0;
}

.form-row {
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
}

.form-group {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
  width: 100%;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 6px;
  color: #4f5867;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 10px;
  border: 1px solid #cdcfd4;
  border-radius: 8px;
  font-family: "Inter", sans-serif;
  font-size: 14px;
  color: #333333;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--primary-500);
}

.button-container {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  padding-top: 10px;
  border-top: 1px solid #eaeaea;
}

.cancel-button {
  padding: 10px 20px;
  background: #ffffff;
  color: #4f5867;
  border: 1px solid #cdcfd4;
  border-radius: 8px;
  font-family: "Inter", sans-serif;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.cancel-button:hover {
  background: #f3f4f6;
}

.submit-button {
  padding: 10px 20px;
  background: var(--primary-500);
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-family: "Inter", sans-serif;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.submit-button:hover {
  background: var(--primary-700);
}

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
.no-data-message {
  text-align: center;
  color: #9aa0a8;
  font-size: 16px;
  font-weight: 500;
  padding: 20px 0;
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

</style>