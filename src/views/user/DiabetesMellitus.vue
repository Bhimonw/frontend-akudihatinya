<template>
  <div class="diabetes-mellitus">
    <!-- Page Container -->
    <div class="page-container">
      <!-- Toolbar -->
      <div class="toolbar">
        <!-- Dropdown Tahun -->
        <div class="dropdown-container-year">
          <select class="dropdown-select" v-model="selectedYear">
            <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
            <font-awesome-icon :icon="['fas', 'chevron-down']" class="dropdown-icon" />
          </select>
        </div>

        <!-- Search Bar dan Tombol Tambah Data -->
        <div class="right-section">
          <!-- Search Bar -->
          <div class="search-container">
            <input type="text" placeholder="Search..." class="search-input" v-model="searchQuery" />
            <button class="search-button">
              <font-awesome-icon :icon="['fas', 'search']" />
            </button>
          </div>

          <!-- Tombol Tambah Data -->
          <button class="add-data-button">
            <font-awesome-icon :icon="['fas', 'plus']" />
            Tambah Data
          </button>
        </div>
      </div>

      <!-- Tabel Data Pasien -->
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th rowspan="2">Aksi</th>
              <th rowspan="2">No</th>
              <th rowspan="2">Nama Pasien</th>
              <th rowspan="2">NIK</th>
              <th rowspan="2">Nomor BPJS</th>
              <th rowspan="2">Jenis Kelamin</th>
              <th rowspan="2">Tanggal Lahir</th>
              <th rowspan="2">Umur</th>
              <th rowspan="2">Alamat</th>
              <th colspan="13">Bulan</th>
            </tr>
            <tr>
              <th>Jan</th>
              <th>Feb</th>
              <th>Mar</th>
              <th>Apr</th>
              <th>Mei</th>
              <th>Jun</th>
              <th>Jul</th>
              <th>Agu</th>
              <th>Sep</th>
              <th>Okt</th>
              <th>Nov</th>
              <th>Des</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(patient, index) in paginatedPatients" :key="patient.id">
              <td>
                <div class="action-buttons">
                  <button class="action-button edit" @click="editPatient(patient.id)">
                    <font-awesome-icon :icon="['fas', 'edit']" />
                  </button>
                  <button class="action-button delete" @click="deletePatient(patient.id)">
                    <font-awesome-icon :icon="['fas', 'trash']" />
                  </button>
              </div>
              </td>
              <td>{{ index + 1 }}</td>
              <td>{{ patient.name }}</td>
              <td>{{ patient.nik }}</td>
              <td>{{ patient.bpjs }}</td>
              <td>{{ patient.gender }}</td>
              <td>{{ patient.dob }}</td>
              <td>{{ patient.age }}</td>
              <td>{{ patient.address }}</td>
              <td v-for="(month, idx) in patient.months" :key="idx">{{ month }}</td>
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
  </div>
</template>

<script>
import { patientData } from "../../data/dummyData.js";

export default {
  name: "DiabetesMellitus",
  data() {
    return {
      patients: patientData, // Data pasien dari sumber dummy
      currentPage: 1, // Halaman saat ini
      pageSize: 10, // Jumlah item per halaman
      searchQuery: "", // Query pencarian
      selectedYear: "2023", // Tahun terpilih di dropdown
      years: ["2023", "2022", "2021"], // Daftar tahun
    };
  },
  methods: {
    resetPagination() {
      this.currentPage = 1;
    },
  },
  computed: {
    // Total jumlah pasien
    totalPatients() {
      return this.filteredPatients.length;
    },
    // Total jumlah halaman berdasarkan ukuran halaman
    totalPages() {
      return Math.ceil(this.totalPatients / this.pageSize);
    },
    // Indeks item pertama di halaman saat ini
    firstItemIndex() {
      return (this.currentPage - 1) * this.pageSize;
    },
    // Indeks item terakhir di halaman saat ini
    lastItemIndex() {
      return Math.min(this.currentPage * this.pageSize, this.totalPatients);
    },
    // Data pasien yang difilter berdasarkan query pencarian dan tahun
    filteredPatients() {
      return this.patients.filter((patient) => {
        const matchesSearch = patient.name.toLowerCase().includes(this.searchQuery.toLowerCase());
        const matchesYear = !this.selectedYear || patient.year === this.selectedYear;
        return matchesSearch && matchesYear;
      });
    },
    // Data pasien yang ditampilkan di halaman saat ini
    paginatedPatients() {
      return this.filteredPatients.slice(this.firstItemIndex, this.lastItemIndex);
    },
  },
  methods: {
    // Pindah ke halaman sebelumnya
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    },
    // Pindah ke halaman berikutnya
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    },
    // Pindah ke halaman tertentu
    goToPage(page) {
      this.currentPage = page;
    },
    // Simulasi hapus pasien
    deletePatient(id) {
      console.log(`Pasien dengan ID ${id} telah dihapus.`);
    },
    // Simulasi edit pasien
    editPatient(id) {
      console.log(`Pasien dengan ID ${id} sedang diedit.`);
    },
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
  max-width: 1400px; /* Lebar maksimal saat layar besar */
  background: #ffffff;
  border-radius: 10px;
  padding: 26px;
  box-shadow: 0px 4px 16px rgba(0, 0, 0, 0.1);
  overflow-x: auto; /* Aktifkan scroll horizontal jika konten melebihi lebar */
}

/* Toolbar */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap; /* Izinkan toolbar membungkus elemen jika layar sempit */
}

/* Right Section */
.right-section {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap; /* Izinkan search bar dan tombol tambah data membungkus */
}


/* Dropdown */
.dropdown-container-year {
  position: relative;
  width: 147px; /* Sesuaikan dengan lebar dropdown */
}

.dropdown-container-year::after {
  content: "▼"; /* Simbol panah bawah */
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 12px;
  color: #9aa0a8;
  pointer-events: none; /* Pastikan tidak bisa diklik */
}

/* Dropdown Icon (Chevron Down) */
.dropdown-icon-year {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 12px;
  color: #9aa0a8;
  pointer-events: none; /* Pastikan tidak bisa diklik */
}

/* Search Container */
.search-container {
  display: flex;
  align-items: center;
  position: relative;
}

.search-input {
  width: 251px;
  height: 42px;
  padding: 10px;
  border: 1px solid #cdcfD4;
  border-radius: 10px;
  font-family: "Inter", sans-serif;
  font-size: 14px;
  color: #4f5867;
  outline: none;
}

.search-button {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  cursor: pointer;
  color: #9aa0a8;
}

.search-button:hover {
  color: #3a72dc;
}

/* Add Data Button */
.add-data-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 20px;
  background: #3a72dc;
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
  background: #2a5dbd;
}

/* Table Container */
.table-container {
  overflow-x: auto; /* Aktifkan scroll horizontal jika tabel melebihi lebar */
  margin-bottom: 20px;
}

/* Data Table */
.data-table {
  width: 100%;
  border-collapse: collapse;
  font-family: "Inter", sans-serif;
  font-size: 14px;
  color: #5f5f5f;
  table-layout: auto;
  min-width: 1200px; /* Pastikan tabel memiliki lebar minimum */
}

/* Header dan Data Cell */
.data-table th,
.data-table td {
  padding: 12px;
  text-align: center; /* Default rata kiri untuk data */
  border: 1px solid #d7d7d7; /* Garis vertikal dan horizontal */
  word-wrap: break-word;
}


/* Kolom Nama Pasien */
.data-table tr:first-child th:nth-child(3),
.data-table tr:first-child td:nth-child(3) {
  min-width: 250px;
}
/* Kolom Alamat */
.data-table tr:first-child th:nth-child(9),
.data-table tr:first-child td:nth-child(9) {
  min-width: 250px;
}

.data-table tr:last-child th,
.data-table tr:last-child td {
  min-width: 50px;
  max-width: 50px;
}


/* Action Buttons */
.action-button {
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 16px;
  margin: 0 4px;
  transition: color 0.3s ease;
}

.action-button.delete {
  color: #dc2626; /* Merah untuk delete */
}

.action-button.edit {
  color: #4ade80; /* Hijau untuk edit */
}

.action-button.delete:hover {
  color: #b91c1c; /* Warna lebih gelap saat hover */
}

.action-button.edit:hover {
  color: #22c55e; /* Warna lebih gelap saat hover */
}

/* Pagination */
/* Pagination Container */
.pagination-container {
  background-color: #ffffff;
  border-radius: 8px;
}

/* Pagination Buttons */
.pagination-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px; /* Lebar tetap untuk angka halaman */
  height: 40px; /* Tinggi tetap untuk angka halaman */
  padding: 0;
  font-family: "Inter", sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #9aa0a8; /* Warna teks default abu-abu */
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: color 0.3s ease; /* Animasi warna teks */
}

.pagination-button:hover {
  color: #3a72dc; /* Warna biru saat hover */
}

/* Halaman Aktif */
.pagination-button.active {
  color: #3a72dc; /* Teks biru untuk halaman aktif */
  font-weight: 600; /* Teks lebih tebal */
}

/* Tombol Previous dan Next */
.pagination-button.prev,
.pagination-button.next {
  background-color: #3a72dc; /* Background biru */
  color: #ffffff; /* Teks putih */
  width: auto; /* Lebar otomatis */
  padding: 10px 16px; /* Padding tambahan untuk ikon */
  font-size: 16px; /* Ukuran ikon lebih besar */
}

.pagination-button.prev:hover,
.pagination-button.next:hover {
  background-color: #2a5dbd; /* Background lebih gelap saat hover */
}

/* Tombol Disabled */
.pagination-button:disabled {
  background-color: #9aa0a8; /* Background abu-abu */
  color: #ffffff; /* Teks putih */
  cursor: not-allowed; /* Ubah kursor menjadi tidak aktif */
}

/* Dropdown Baris Per Halaman */
.rows-per-page {
  display: flex;
  align-items: center;
  gap: 8px;
}

.rows-per-page label {
  font-family: "Inter", sans-serif;
  font-size: 14px;
  color: #5f5f5f;
}

.rows-per-page select {
  width: 80px;
  height: 42px;
  padding: 8px;
  border: 1px solid #eaeaea;
  border-radius: 10px;
  font-family: "Inter", sans-serif;
  font-size: 14px;
  color: #000000;
  background: #ffffff;
  cursor: pointer;
}

/* Container untuk Dropdown */
.dropdown-container {
  position: relative;
  width: 80px; /* Lebar dropdown */
}

/* Dropdown Select */
.dropdown-select {
  width: 100%;
  height: 42px;
  padding: 8px;
  border: 1px solid #eaeaea; /* Border tipis */
  border-radius: 8px; /* Sudut melengkung */
  font-family: "Inter", sans-serif;
  font-size: 14px;
  color: #000000;
  background: #ffffff;
  cursor: pointer;
  appearance: none; /* Hilangkan tampilan default dropdown */
  -webkit-appearance: none; /* Untuk browser Webkit */
  -moz-appearance: none; /* Untuk browser Mozilla */
  outline: none; /* Hilangkan outline saat fokus */
  transition: border-color 0.3s ease; /* Animasi saat hover */
}

/* Hover Effect untuk Dropdown */
.dropdown-select:hover {
  border-color: #3a72dc; /* Warna border saat hover */
}

/* Arrow Icon untuk Dropdown */
.dropdown-container::after {
  content: "▼"; /* Simbol panah bawah */
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 12px;
  color: #9aa0a8;
  pointer-events: none; /* Pastikan tidak bisa diklik */
}

/* Media Query untuk Layar Kecil */
@media (max-width: 768px) {
  .toolbar {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

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
  }
}

/* Container tombol aksi */
.action-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
}
/* Action Buttons */
.action-button {
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 16px;
  margin: 0 4px;
  transition: color 0.3s ease;
}

.action-button.delete {
  color: #dc2626; /* Merah untuk delete */
}

.action-button.edit {
  color: #4ade80; /* Hijau untuk edit */
}

.action-button.delete:hover {
  color: #b91c1c; /* Warna lebih gelap saat hover */
}

.action-button.edit:hover {
  color: #22c55e; /* Warna lebih gelap saat hover */
}

</style>