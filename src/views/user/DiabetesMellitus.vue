<template>
  <div class="diabetes-mellitus">
    <!-- Page Container -->
    <div class="page-container">
      <h1>Diabetes Mellitus</h1>
      <p>Halaman ini menampilkan data pasien dengan Diabetes Mellitus.</p>

      <!-- Toolbar -->
      <div class="toolbar">
        <!-- Dropdown Tahun -->
        <div class="dropdown">
          <select class="dropdown-select">
            <option value="2023">2023</option>
            <option value="2022">2022</option>
            <option value="2021">2021</option>
          </select>
        </div>

        <!-- Tombol Search -->
        <div class="search-container">
          <input type="text" placeholder="Search..." class="search-input" />
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

      <!-- Tabel Data Pasien -->
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th rowspan="2">No</th>
              <th rowspan="2">Nama Pasien</th>
              <th rowspan="2">NIK</th>
              <th rowspan="2">Nomor BPJS</th>
              <th rowspan="2">Jenis Kelamin</th>
              <th rowspan="2">Tanggal Lahir</th>
              <th rowspan="2">Umur</th>
              <th colspan="13">Bulan</th>
              <th rowspan="2">Aksi</th>
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
            <tr v-for="(patient, index) in patients" :key="patient.id">
              <td>{{ index + 1 }}</td>
              <td>{{ patient.name }}</td>
              <td>{{ patient.nik }}</td>
              <td>{{ patient.bpjs }}</td>
              <td>{{ patient.gender }}</td>
              <td>{{ patient.dob }}</td>
              <td>{{ patient.age }}</td>
              <td v-for="(month, idx) in patient.months" :key="idx">{{ month }}</td>
              <td>
                <button class="action-button red">
                  <font-awesome-icon :icon="['fas', 'trash']" />
                </button>
                <button class="action-button green">
                  <font-awesome-icon :icon="['fas', 'edit']" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="pagination">
        <button class="pagination-button prev">
          <font-awesome-icon :icon="['fas', 'chevron-left']" />
          Sebelumnya
        </button>
        <button class="pagination-button next">
          Berikutnya
          <font-awesome-icon :icon="['fas', 'chevron-right']" />
        </button>
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
      patients: patientData, // Mengambil data dari file dummy
    };
  },
};
</script>

<style scoped>
/* Root Styles */
.diabetes-mellitus {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 26px;
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
  overflow-y: auto;
  max-height: calc(100vh - 52px);
}

/* Toolbar */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

/* Dropdown */
.dropdown-select {
  width: 147px;
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
  overflow-x: auto;
  margin-bottom: 20px;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-family: "Inter", sans-serif;
  font-size: 14px;
  color: #5f5f5f;
}

.data-table thead {
  background: #f3f3f3;
}

.data-table th,
.data-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #d7d7d7;
}

.data-table th {
  font-weight: 600;
  color: #5f5f5f;
}

.data-table tbody tr:hover {
  background: #f7f8f9;
}

/* Action Buttons */
.action-button {
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s ease;
}

.action-button.red {
  background: #dc2626;
  color: #ffffff;
}

.action-button.green {
  background: #4ade80;
  color: #ffffff;
}

.action-button.red:hover {
  background: #b91c1c;
}

.action-button.green:hover {
  background: #22c55e;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination-button {
  display: flex;
  align-items: center;
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

.pagination-button.prev {
  background: #9aa0a8;
}

.pagination-button.next {
  background: #3a72dc;
}

.pagination-button.prev:hover {
  background: #7a8088;
}

.pagination-button.next:hover {
  background: #2a5dbd;
}
</style>