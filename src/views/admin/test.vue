<template>
    <div class="patient-details">
      <!-- Main Content -->
      <div class="main-content">
        
        <!-- Tombol Kembali -->
         <button class="action-button back" @click="$router.go(-1)">
          <font-awesome-icon :icon="['fas', 'arrow-left']"/>
          Kembali
         </button>

        <!-- Breadcrumb -->
        <div class="breadcrumb">
          <span><router-link to="/user/diabetes-mellitus">Diabetes Mellitus</router-link></span>
          <span> / </span>
          <span>Detail Pasien</span>
        </div>
  
        <!-- Profile Section -->
        <div class="profile-section">
          <h2>Detail Pasien</h2>
          <div class="profile-info">
            <div class="info-item">
              <span class="label">Nama Lengkap :</span>
              <span class="value">{{ patient.name }}</span>
            </div>
            <div class="info-item">
              <span class="label">Jenis Kelamin :</span>
              <span class="value">{{ patient.gender === 'L' ? 'Laki-Laki' : 'Perempuan' }}</span>
            </div>
            <div class="info-item">
              <span class="label">NIK :</span>
              <span class="value">{{ patient.nik }}</span>
            </div>
            <div class="info-item">
              <span class="label">Nomor BPJS :</span>
              <span class="value">{{ patient.bpjs }}</span>
            </div>
            <div class="info-item">
              <span class="label">Tanggal Lahir :</span>
              <span class="value">{{ patient.dob }}</span>
            </div>
            <div class="info-item">
              <span class="label">Umur :</span>
              <span class="value">{{ patient.age }}</span>
            </div>
          </div>
        </div>
  
        <div class="examination-data">
          <h3>Data Pemeriksaan Pasien</h3>
          <!-- Dropdown Tahun -->
          <div class="dropdown-container-year">
            <select class="dropdown-select" v-model="selectedYear">
              <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
            </select>
          </div>
          <!-- Search Bar -->
          <div class="search-container">
            <input type="text" placeholder="Search..." class="search-input" v-model="searchQuery" />
            <button class="search-button">
              <font-awesome-icon :icon="['fas', 'search']" />
            </button>
          </div>
  
          <!-- Tabel Data Pemeriksaan -->
          <table class="data-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Tanggal Pemeriksaan</th>
                <th>Hasil Pemeriksaan Gula Darah</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(exam, index) in paginatedExams" :key="exam.id">
                <td>{{ index + 1 }}</td>
                <td>{{ exam.date }}</td>
                <td>
                  <div class="exam-results">
                    <div class="result-item">
                      <span class="label">Tidak Puasa (mg/dL)</span>
                      <span class="value">{{ exam.fastingGlucose || '-' }}</span>
                    </div>
                    <div class="result-item">
                      <span class="label">Puasa (mg/dL)</span>
                      <span class="value">{{ exam.postPrandialGlucose || '-' }}</span>
                    </div>
                    <div class="result-item">
                      <span class="label">HbA1c (%)</span>
                      <span class="value">{{ exam.hba1c || '-' }}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <button class="action-button edit" @click="editExam(exam.id)">
                    <font-awesome-icon :icon="['fas', 'edit']" />
                  </button>
                  <button class="action-button delete" @click="deleteExam(exam.id)">
                    <font-awesome-icon :icon="['fas', 'trash']" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
  
          <!-- Pagination -->
          <div class="pagination-container">
            <nav aria-label="Pagination">
              <ul class="pagination">
                <li class="page-item" :class="{ disabled: currentPage === 1 }">
                  <a class="page-link" href="#" @click.prevent="prevPage">Sebelumnya</a>
                </li>
                <li class="page-item" v-for="page in totalPages" :key="page" :class="{ active: currentPage === page }">
                  <a class="page-link" href="#" @click.prevent="goToPage(page)">{{ page }}</a>
                </li>
                <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                  <a class="page-link" href="#" @click.prevent="nextPage">Berikutnya</a>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </div>
  </template>

<script>
import { patientData } from "../../data/dummyData.js"; // Dummy data pasien
export default {
  name: "DetailPasien",
  data() {
    return {
      patientId: this.$route.params.id, // Ambil ID dari URL
      patient: {}, // Data pasien
      exams: [], // Riwayat pemeriksaan pasien
      selectedYear: "2023", // Tahun terpilih
      years: ["2023", "2022", "2021"], // Daftar tahun
      searchQuery: "", // Query pencarian
      currentPage: 1, // Halaman saat ini
      pageSize: 10, // Jumlah item per halaman
    };
  },
  computed: {
    filteredExams() {
      return this.exams.filter((exam) => {
        const matchesSearch = exam.date.toLowerCase().includes(this.searchQuery.toLowerCase());
        const matchesYear = !this.selectedYear || exam.year === this.selectedYear;
        return matchesSearch && matchesYear;
      });
    },
    totalExams() {
      return this.filteredExams.length;
    },
    totalPages() {
      return Math.ceil(this.totalExams / this.pageSize);
    },
    firstItemIndex() {
      return (this.currentPage - 1) * this.pageSize;
    },
    lastItemIndex() {
      return Math.min(this.currentPage * this.pageSize, this.totalExams);
    },
    paginatedExams() {
      return this.filteredExams.slice(this.firstItemIndex, this.lastItemIndex);
    },
  },
  methods: {
    getPatientData() {
      const patient = patientData.find((p) => p.id === parseInt(this.patientId)); // Cari pasien berdasarkan ID
      if (patient) {
        this.patient = patient;
      }
    },
    getExaminationData() {
      // Simulasi data riwayat pemeriksaan
      this.exams = [
        { id: 1, date: "01-01-2023", fastingGlucose: 90, postPrandialGlucose: 120, hba1c: 5.5, year: "2023" },
        { id: 2, date: "01-02-2023", fastingGlucose: 85, postPrandialGlucose: 110, hba1c: 5.4, year: "2023" },
      ];
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
  },
  mounted() {
    this.getPatientData();
    this.getExaminationData();
  },
};
</script>

<style scoped>
.patient-details {
    display: flex;
    background-color: #f7f8f9;
    min-height: 100vh;
  }
  
  .main-content {
    flex: 1;
    overflow-x: auto;
  }
  
  .breadcrumb {
    margin-bottom: 20px;
    font-size: 14px;
  }

  .action-button.back {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px; /* Padding lebih besar untuk tombol tunggal */
  border: 1px solid var(--primary-300);
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  background: var(--secondary-100); /* Warna biru untuk tombol detail */
  color: var(--primary-500);
  transition: background-color 0.3s ease, transform 0.3s ease;
  margin-bottom: 16px;
}
.action-button.back:hover {
  background: var(--secondary-300); /* Warna lebih gelap saat hover */
}
  
  .profile-section {
    background: #ffffff;
    border-radius: 10px;
    padding: 20px;
    box-shadow: 0px 4px 16px rgba(0, 0, 0, 0.1);
  }
  
  .profile-info {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
  
  .info-item {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .label {
    font-weight: 500;
    color: #5f5f5f;
  }
  
  .value {
    font-weight: 400;
    color: #333333;
  }
  
  .update-data-button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    background: #22c55e;
    color: #ffffff;
    font-family: "Inter", sans-serif;
    font-size: 14px;
    font-weight: 500;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }
  
  .update-data-button:hover {
    background: #16a34a;
  }
  
  .examination-data {
    margin-top: 20px;
    background: #ffffff;
    border-radius: 10px;
    padding: 20px;
    box-shadow: 0px 4px 16px rgba(0, 0, 0, 0.1);
  }
  
  .exam-results {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }
  
  .result-item {
    display: flex;
    flex-direction: column;
  }
  
  .pagination-container {
    margin-top: 20px;
    text-align: center;
  }
  
  .pagination {
    display: inline-flex;
    list-style: none;
    padding: 0;
    margin: 0;
  }
  
  .page-item {
    margin: 0 5px;
  }
  
  .page-link {
    display: block;
    padding: 8px 16px;
    border: none;
    border-radius: 6px;
    background: #f3f4f6;
    color: #5f5f5f;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }
  
  .page-link:hover {
    background: #e5e7eb;
  }
  
  .page-item.disabled .page-link {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .page-item.active .page-link {
    background: #3a72dc;
    color: #ffffff;
  }
</style>