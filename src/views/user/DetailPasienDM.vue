<template>
  <div class="patient-details">
    <div class="main-content">
      <button class="action-button back" @click="$router.go(-1)">
        <font-awesome-icon :icon="['fas', 'arrow-left']" />
        Kembali
      </button>
      <div class="breadcrumb">
        <span><router-link to="/user/diabetes-mellitus">Diabetes Mellitus</router-link></span>
        <span> / </span>
        <span>Detail Pasien Diabetes Mellitus</span>
      </div>
      <div class="profile-section">
        <div class="profile-header">
          <h2>Informasi Pasien</h2>
        </div>

        <div v-if="isLoading" class="patient-cards">
          <div class="info-card skeleton-card" v-for="n in 3" :key="n">
            <div class="card-header">
              <div class="skeleton-icon"></div>
              <div class="skeleton-text skeleton-title"></div>
            </div>
            <div class="card-content">
              <div class="skeleton-row" v-for="i in 3" :key="i">
                <div class="skeleton-text skeleton-label"></div>
                <div class="skeleton-text skeleton-value"></div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="profile-info-container">
          <div class="patient-cards">
            <div class="info-card primary-card">
              <div class="card-header">
                <font-awesome-icon :icon="['fas', 'user-circle']" class="card-icon" />
                <h3>Identitas Utama</h3>
              </div>
              <div class="card-content">
                <div class="info-row">
                  <span class="label">Nama Lengkap</span>
                  <span class="value">{{ patient.name }}</span>
                </div>
                <div class="info-row">
                  <span class="label">NIK</span>
                  <span class="value">
                    <span>{{ patient.nik || '-' }}</span>
                    <button v-if="patient.nik && patient.nik !== '-'" @click="copyToClipboard(patient.nik)" class="copy-button">
                      <font-awesome-icon :icon="['far', 'copy']" />
                    </button>
                  </span>
                </div>
                <div class="info-row">
                  <span class="label">Jenis Kelamin</span>
                  <span class="value">
                    <span class="gender-badge" :class="patient.gender === 'Laki-Laki' ? 'male' : 'female'">
                      {{ patient.gender || '-' }}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            <div class="info-card">
              <div class="card-header">
                <font-awesome-icon :icon="['fas', 'calendar-alt']" class="card-icon" />
                <h3>Informasi Demografi</h3>
              </div>
              <div class="card-content">
                <div class="info-row">
                  <span class="label">Tanggal Lahir</span>
                  <span class="value">{{ formatDate(patient.birth_date) || '-' }}</span>
                </div>
                <div class="info-row">
                  <span class="label">Umur</span>
                  <span class="value">
                    <span class="age-badge">{{ patient.age ? patient.age + ' Tahun' : '-' }}</span>
                  </span>
                </div>
              </div>
            </div>

            <div class="info-card">
              <div class="card-header">
                <font-awesome-icon :icon="['fas', 'address-card']" class="card-icon" />
                <h3>Kontak & Asuransi</h3>
              </div>
              <div class="card-content">
                <div class="info-row">
                  <span class="label">No. BPJS</span>
                  <span class="value">
                    <span>{{ patient.bpjs_number || '-' }}</span>
                    <button v-if="patient.bpjs_number && patient.bpjs_number !== '-'" @click="copyToClipboard(patient.bpjs_number)" class="copy-button">
                      <font-awesome-icon :icon="['far', 'copy']" />
                    </button>
                  </span>
                </div>
                <div class="info-row">
                  <span class="label">No. Telepon</span>
                  <span class="value">{{ patient.phone_number || '-' }}</span>
                </div>
                <div class="info-row full-width">
                  <span class="label">Alamat</span>
                  <span class="value address-text">{{ patient.address || '-' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="profile-actions">
          <button class="action-button delete-patient" @click="deletePatient">
            <font-awesome-icon :icon="['fas', 'trash']" />
            Hapus Data Pasien
          </button>
          <button class="action-button edit-patient" @click="editPatient">
            <font-awesome-icon :icon="['fas', 'edit']" />
            Ubah Data
          </button>
        </div>
      </div>

      <div class="attendance-container">
        <div class="profile-header"> <h2>Rekap Kunjungan Pasien {{ selectedYear }}</h2>
        </div>
        <div v-if="isLoadingExams" class="loading-container">
          <div class="spinner"></div>
          <p>Memuat data...</p>
        </div>
        <div v-else class="attendance-table-container">
          <table class="attendance-table">
            <thead>
              <tr>
                <th>Bulan</th>
                <th v-for="month in months" :key="month">{{ month }}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Status Kunjungan</td>
                <td v-for="month in months" :key="month" :class="{ 'visited': hasVisitInMonth(month) }">
                  <span v-if="hasVisitInMonth(month)" class="visit-icon">
                    <font-awesome-icon :icon="['fas', 'check-circle']" />
                  </span>
                  <span v-else class="no-visit-icon">
                    <font-awesome-icon :icon="['fas', 'times-circle']" />
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="page-container">
        <div class="profile-header"> <h2>Data Pemeriksaan Pasien</h2>
        </div>
        <div class="toolbar">
          <div class="left-section">
            <div class="search-container">
              <font-awesome-icon :icon="['fas', 'search']" class="search-icon" />
              <input type="text" placeholder="Search..." class="search-input" v-model="searchQuery" />
            </div>
          </div>
          <div class="right-section">
            <button class="add-data-button" @click="isModalOpen = true">
              <font-awesome-icon :icon="['fas', 'plus']" />
              Tambah Data Pemeriksaan
            </button>
          </div>
        </div>
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th rowspan="2">No</th>
                <th rowspan="2">Tanggal Pemeriksaan</th>
                <th colspan="4">Hasil Pemeriksaan Gula Darah</th>
                <th rowspan="2">Aksi</th>
              </tr>
              <tr>
                <th>Sewaktu (mg/dL)</th>
                <th>Puasa (mg/dL)</th>
                <th>2 Jam Postprandial (mg/dL)</th>
                <th>HbA1c (%)</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="isLoadingExams">
                <td colspan="7" class="loading-row">
                  <div class="loading-container">
                    <div class="spinner"></div>
                    <p>Memuat data...</p>
                  </div>
                </td>
              </tr>
              <tr v-else-if="paginatedExams.length === 0">
                <td colspan="7" class="no-data">
                  <p>Tidak ada data pemeriksaan.</p>
                </td>
              </tr>
              <tr v-else v-for="(exam, index) in paginatedExams" :key="exam.id">
                <td>{{ firstItemIndex + index + 1 }}</td>
                <td>{{ formatDate(exam.examination_date) }}</td>
                <td>{{ exam.examination_results.gdsp || '-' }}</td>
                <td>{{ exam.examination_results.gdp || '-' }}</td>
                <td>{{ exam.examination_results.gd2jpp || '-' }}</td>
                <td>{{ exam.examination_results.hba1c || '-' }}</td>
                <td class="action-cell">
                  <div class="action-buttons-container">
                    <button class="action-button edit" @click="openEditExamModal(exam)">
                      <font-awesome-icon :icon="['fas', 'edit']" />
                      <span class="tooltip">Ubah Data</span>
                    </button>
                    <button class="action-button delete" @click="deleteExam(exam.id)">
                      <font-awesome-icon :icon="['fas', 'trash']" />
                      <span class="tooltip">Hapus Data</span>
                    </button>
                  </div>
                </td>
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
                    <select id="rowsPerPage" v-model="pageSize" @change="resetPagination" class="dropdown-select">
                      <option value="10">10</option>
                      <option value="25">25</option>
                      <option value="100">100</option>
                    </select>
                  </div>
                  <span v-if="totalExamsFromAPI > 0">
                    {{ firstItemIndex + 1 }}-{{ lastItemIndex }} dari {{ totalExamsFromAPI }} item
                  </span>
                  <span v-else>
                    0 item
                  </span>
                </p>
              </div>
              <nav class="isolate inline-flex -space-x-px rounded-md shadow-xs" aria-label="Pagination" v-if="totalPagesFromAPI > 0">
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
                  :disabled="currentPage === totalPagesFromAPI"
                >
                  <font-awesome-icon :icon="['fas', 'chevron-right']" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>

    <AddExaminationDataDM
      :visible="isModalOpen"
      :patient-id="patientId"
      :selected-year="selectedYear"
      @close="closeModal"
      @submit="handleAddExamSubmit" 
    />

    <EditPatientDetail
      :visible="isEditModalOpen"
      :patientData="patient" 
      @close="closeEditModal"
      @submit="handleEditPatientSubmit" 
    />

    <EditExaminationModal
      :visible="isEditExamModalOpen"
      :patient-id="patientId"
      :exam-data="selectedExam"
      @close="closeEditExamModal"
      @submit="handleEditExamSubmit"
    />
  </div>
</template>

<script>
import Swal from 'sweetalert2';
import MySwal from "../../utils/swal-custom.js";
import axios from 'axios';
import AddExaminationDataDM from "../../components/modals/AddExaminationDataDM.vue";
import EditPatientDetail from '../../components/modals/EditPatientDetail.vue';
import EditExaminationModal from '../../components/modals/EditExaminationModal.vue';

export default {
  name: "DetailPasienDM",
  components: {
    AddExaminationDataDM,
    EditPatientDetail,
    EditExaminationModal,
  },
  data() {
    return {
      patientId: this.$route.params.id,
      patient: {},
      exams: [], 
      totalExamsFromAPI: 0, 
      totalPagesFromAPI: 0, 
      selectedYear: this.$route.query.year || new Date().getFullYear().toString(),
      searchQuery: "",
      currentPage: 1,
      pageSize: 10, 
      months: [
        "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
        "Jul", "Agu", "Sep", "Okt", "Nov", "Des"
      ],
      isModalOpen: false,
      isEditModalOpen: false,
      isLoading: false,
      isLoadingExams: false,
      selectedExam: null,
      isEditExamModalOpen: false,
    };
  },
  computed: {
    firstItemIndex() {
      return (this.currentPage - 1) * parseInt(this.pageSize);
    },
    lastItemIndex() {
      const itemsOnCurrentPage = this.exams.length;
      return this.firstItemIndex + itemsOnCurrentPage;
    },
    paginatedExams() {
      return this.exams;
    },
    paginationItems() {
      const result = [];
      const totalPages = this.totalPagesFromAPI;
      const currentPage = this.currentPage;
      
      if (totalPages <= 0) return [];

      if (totalPages <= 7) {
        for (let i = 1; i <= totalPages; i++) {
          result.push(i);
        }
        return result;
      }
      
      result.push(1);
      
      if (currentPage <= 4) {
        for (let i = 2; i <= 5; i++) {
          if (i < totalPages) result.push(i);
        }
        if (totalPages > 5 && currentPage < totalPages - 2)  result.push('ellipsis');
      } else if (currentPage >= totalPages - 3) {
        result.push('ellipsis');
        for (let i = totalPages - 4; i < totalPages; i++) {
          if (i > 1) result.push(i);
        }
      } else {
        result.push('ellipsis');
        result.push(currentPage - 1);
        result.push(currentPage);
        result.push(currentPage + 1);
        result.push('ellipsis');
      }
      
      if (!result.includes(totalPages)) {
        result.push(totalPages);
      }
      const uniqueResult = [];
      let lastPushed = -1;
      for (const item of result) {
          if (item === 'ellipsis') {
              if (lastPushed !== 'ellipsis') { 
                  uniqueResult.push(item);
                  lastPushed = item;
              }
          } else if (item !== lastPushed) {
              uniqueResult.push(item);
              lastPushed = item;
          }
      }
      return uniqueResult;
    },
  },
  methods: {
    formatDate(dateString) {
      if (!dateString) {
        return '-';
      }
      const months = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
      ];
      const date = new Date(dateString);
      const day = date.getDate();
      const monthName = months[date.getMonth()];
      const year = date.getFullYear();
      return `${day} ${monthName} ${year}`;
    },
    async fetchPatientDetails() {
      this.isLoading = true;
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          MySwal.fire('Error', 'Token tidak ditemukan. Silakan login kembali.', 'error');
          this.$router.push({ name: 'Login' }); 
          return;
        }
        const response = await axios.get(`http://localhost:8000/api/puskesmas/patients/${this.patientId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const apiPatient = response.data.patient;
        this.patient = {
          id: apiPatient.id,
          name: apiPatient.name,
          nik: apiPatient.nik || '-',
          bpjs_number: apiPatient.bpjs_number || '-',
          birth_date: apiPatient.birth_date || '-',
          age: apiPatient.age || '-',
          gender: apiPatient.gender === 'female' ? 'Perempuan' : (apiPatient.gender === 'male' ? 'Laki-Laki' : '-'),
          address: apiPatient.address || '-',
          phone_number: apiPatient.phone_number || '-',
        };
      } catch (error) {
        console.error("Error fetching patient details:", error);
        MySwal.fire('Error', 'Terjadi kesalahan saat memuat detail pasien.', 'error');
      } finally {
        this.isLoading = false;
      }
    },
    async deletePatient() {
        const confirmation = await Swal.fire({
            title: 'Apakah Anda yakin?',
            text: 'Anda akan menghapus data pasien ini! Semua data pemeriksaan pasien juga akan terhapus.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Ya, hapus!',
            cancelButtonText: 'Batal',
        });

        if (!confirmation.isConfirmed) {
            return;
        }

        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("Token tidak ditemukan");

            await axios.delete(`http://localhost:8000/api/puskesmas/patients/${this.patientId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            MySwal.fire('Berhasil', 'Data pasien berhasil dihapus.', 'success');
            this.$router.push('/user/diabetes-mellitus');
        } catch (error) {
            console.error("Error deleting patient:", error);
            MySwal.fire('Gagal', error.response?.data?.message || 'Terjadi kesalahan saat menghapus data pasien.', 'error');
        }
    },
    async fetchExaminations() {
      this.isLoadingExams = true;
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          MySwal.fire('Error', 'Token tidak ditemukan. Silakan login kembali.', 'error');
          this.$router.push({ name: 'Login' }); 
          return;
        }
        const response = await axios.get("http://localhost:8000/api/puskesmas/dm-examinations", {
          params: {
            patient_id: this.patientId,
            year: this.selectedYear,
            search: this.searchQuery, 
            per_page: this.pageSize,
            page: this.currentPage,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data && response.data.data && response.data.meta) {
          const { data, meta } = response.data;
          this.exams = Array.isArray(data) ? data : (typeof data === 'object' && data !== null ? Object.values(data) : []);
          this.totalExamsFromAPI = parseInt(meta.total) || 0;
          this.currentPage = parseInt(meta.current_page) || 1;
          this.totalPagesFromAPI = parseInt(meta.last_page) || 0;
          this.pageSize = parseInt(meta.per_page) || 10; 
        } else {
          console.error("Struktur respons API tidak sesuai untuk examinations:", response.data);
          this.exams = [];
          this.totalExamsFromAPI = 0;
          this.totalPagesFromAPI = 0;
          MySwal.fire('Error', 'Gagal memuat data pemeriksaan: format data tidak sesuai.', 'error');

        }
      } catch (error) {
        console.error("Error fetching examinations:", error);
        if (error.response && error.response.status === 401) {
            MySwal.fire('Sesi Berakhir', 'Silakan login kembali.', 'warning')
                .then(() => this.$router.push({ name: 'Login' })); 
        } else {
            MySwal.fire('Error', 'Terjadi kesalahan saat memuat data pemeriksaan.', 'error');
        }
        this.exams = [];
        this.totalExamsFromAPI = 0;
        this.totalPagesFromAPI = 0;
      } finally {
        this.isLoadingExams = false;
      }
    },
    async deleteExam(id) {
        const confirmation = await MySwal.fire({
            title: 'Apakah Anda yakin?',
            text: 'Anda akan menghapus data pemeriksaan ini.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Ya, hapus!',
            cancelButtonText: 'Batal',
            showLoaderOnConfirm: true,
        });

        if (!confirmation.isConfirmed) {
            return;
        }
        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("Token tidak ditemukan");

            await axios.delete(`http://localhost:8000/api/puskesmas/dm-examinations/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            await MySwal.fire('Berhasil', 'Data pemeriksaan berhasil dihapus.', 'success');
            if (this.paginatedExams.length === 1 && this.currentPage > 1) {
                this.currentPage--;
            }
            this.fetchExaminations(); 
        } catch (error) {
            console.error("Error deleting examination:", error);
            MySwal.fire('Gagal', error.response?.data?.message || 'Terjadi kesalahan.', 'error');
        }
    },
    openEditExamModal(exam) {
      this.selectedExam = { ...exam }; 
      this.isEditExamModalOpen = true;
    },
    closeEditExamModal() {
      this.isEditExamModalOpen = false;
      this.selectedExam = null;
    },
    handleEditExamSubmit() {
      this.fetchExaminations();
    },
    handleAddExamSubmit() {
        this.fetchExaminations();
        this.closeModal();
    },
    handleEditPatientSubmit(updatedPatient) {
        this.patient = { ...this.patient, ...updatedPatient }; 
        this.fetchPatientDetails(); 
        this.closeEditModal();
    },
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.fetchExaminations();
      }
    },
    nextPage() {
      if (this.currentPage < this.totalPagesFromAPI) {
        this.currentPage++;
        this.fetchExaminations();
      }
    },
    goToPage(page) {
      if (page >= 1 && page <= this.totalPagesFromAPI && page !== this.currentPage) {
        this.currentPage = page;
        this.fetchExaminations();
      }
    },
    resetPagination() {
      this.currentPage = 1;
      this.fetchExaminations();
    },
    editPatient() {
      this.isEditModalOpen = true;
    },
    closeModal() {
      this.isModalOpen = false;
    },
    closeEditModal() {
      this.isEditModalOpen = false;
    },
    hasVisitInMonth(month) {
      const monthIndex = this.months.indexOf(month);
      if (monthIndex === -1) return false;

      return this.exams.some((exam) => {
        const examDate = new Date(exam.examination_date);
        return examDate.getMonth() === monthIndex && examDate.getFullYear() === parseInt(this.selectedYear);
      });
    },
    async copyToClipboard(text) {
      try {
        await navigator.clipboard.writeText(text);
        MySwal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Tersalin!',
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        });
      } catch (err) {
        console.error('Failed to copy: ', err);
        MySwal.fire({
          toast: true,
          position: 'top-end',
          icon: 'error',
          title: 'Gagal menyalin',
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        });
      }
    },
  },
  watch: {
    selectedYear(newYear, oldYear) {
      if (newYear !== oldYear) {
        this.currentPage = 1;
        this.$router.push({ query: { ...this.$route.query, year: newYear } }).catch(err => {
            if (err.name !== 'NavigationDuplicated') console.error(err);
        });
        this.fetchExaminations();
      }
    },
    searchQuery() {
      this.currentPage = 1;
      this.fetchExaminations();
    },
    pageSize() {
      this.currentPage = 1;
      this.fetchExaminations();
    },
    '$route.params.id'(newId, oldId) {
        if (newId !== oldId) {
            this.patientId = newId;
            this.currentPage = 1;
            this.fetchPatientDetails();
            this.fetchExaminations();
        }
    },
    '$route.query.year'(newYear, oldYear) {
        const yearToUse = newYear || new Date().getFullYear().toString();
        if (yearToUse !== this.selectedYear) {
            this.selectedYear = yearToUse;
        }
    }
  },
  mounted() {
    const yearFromQuery = this.$route.query.year;
    if (yearFromQuery && yearFromQuery !== this.selectedYear) {
        this.selectedYear = yearFromQuery;
    } else if (!yearFromQuery && this.selectedYear !== (new Date().getFullYear()).toString()) {
         this.$router.replace({ query: { ...this.$route.query, year: this.selectedYear } }).catch(err => {
            if (err.name !== 'NavigationDuplicated') console.error(err);
        });
    }
    this.fetchPatientDetails();
    this.fetchExaminations();
  },
};
</script>

<style scoped>
.patient-details {
display: flex;
background-color: #f7f8f9;
min-height: 100vh;
font-family: var(--font-family-primary);
color: var(--text-secondary);
}
.main-content {
flex: 1;
overflow-x: auto;
padding: 0 16px;
padding: var(--spacing-lg);
}
.breadcrumb {
display: flex;
align-items: center;
gap: var(--spacing-sm);
margin-bottom: var(--spacing-lg);
font-size: 14px;
color: var(--text-tertiary);
}
.breadcrumb a {
color: var(--primary-500);
text-decoration: none;
transition: color 0.3s ease;
}
.breadcrumb a:hover {
color: var(--primary-700);
text-decoration: underline;
}
.action-button.back {
display: flex;
align-items: center;
gap: 8px;
padding: 8px 16px;
border: 1px solid var(--primary-300);
border-radius: 8px;
cursor: pointer;
font-size: 14px;
font-weight: 500;
background: var(--secondary-100);
color: var(--primary-500);
transition: all 0.3s ease;
margin-bottom: 16px;
}
.action-button.back:hover {
background: var(--secondary-300);
transform: translateX(-2px);
}
.profile-section {
background: #ffffff;
border-radius: 12px;
padding: 24px;
box-shadow: 0px 6px 20px rgba(0, 0, 0, 0.08);
position: relative;
margin-bottom: 24px;
}
.profile-header {
margin-bottom: 16px;
border-bottom: 1px solid #e2e8f0;
padding-bottom: 8px;
display: flex;
align-items: center;
}
.profile-header h2 {
font-size: 1.65rem;
font-weight: 600;
color: var(--primary-600, #334155);
margin: 0;
display: flex;
align-items: center;
gap: var(--spacing-sm);
}
.profile-info-container {
background: var(--bg-white);
border-radius: 12px;
padding-top: var(--spacing-sm);
}
.patient-cards {
display: grid;
grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
gap: 20px;
margin-top: 16px;
}
.info-card {
background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
border: 1px solid #e2e8f0;
border-radius: 16px;
padding: 0;
transition: all 0.3s ease;
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
overflow: hidden;
}
.info-card:hover {
transform: translateY(-2px);
box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
border-color: var(--primary-200);
}
.primary-card {
border-left: 4px solid var(--primary-500);
}
.card-header {
background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
padding: 16px 20px;
border-bottom: 1px solid #e2e8f0;
display: flex;
align-items: center;
gap: 12px;
}
.card-header h3 {
margin: 0;
font-size: 1rem;
font-weight: 600;
color: #334155;
}
.card-icon {
color: var(--primary-500);
font-size: 1.2rem;
}
.card-content {
padding: 20px;
}
.info-row {
display: flex;
align-items: flex-start;
padding: 12px 0;
border-bottom: 1px solid #f1f5f9;
gap: 16px;
}
.info-row:last-child {
border-bottom: none;
padding-bottom: 0;
}
.info-row.full-width {
flex-direction: column;
gap: 8px;
}
.info-row .label {
font-weight: 500;
color: #64748b;
font-size: 0.875rem;
min-width: 110px;
flex-shrink: 0;
}
.info-row .value {
font-weight: 600;
color: #1e293b;
font-size: 0.95rem;
text-align: left;
display: flex;
align-items: center;
justify-content: space-between;
flex-grow: 1;
word-break: break-word;
}
.info-row .value > span:only-child {
justify-self: flex-start;
}
.full-width .value {
text-align: left;
}
.address-text {
line-height: 1.5;
font-weight: 700 !important;
color: #475569 !important;
}
.gender-badge {
padding: 4px 12px;
border-radius: 20px;
font-size: 0.8rem;
font-weight: 600;
text-transform: uppercase;
letter-spacing: 0.5px;
}
.gender-badge.male {
background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
color: #1d4ed8;
}
.gender-badge.female {
background: linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%);
color: #be185d;
}
.age-badge {
background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
color: #065f46;
padding: 4px 12px;
border-radius: 20px;
font-size: 0.8rem;
font-weight: 600;
}
.copy-button {
background: none;
border: none;
color: var(--primary-400, #60a5fa);
cursor: pointer;
padding: 4px;
margin-left: 8px;
border-radius: 4px;
display: inline-flex;
align-items: center;
justify-content: center;
transition: background-color 0.2s ease, color 0.2s ease;
}
.copy-button:hover {
color: var(--primary-600, #2563eb);
background-color: var(--secondary-100, #eff6ff);
}
.profile-actions {
display: flex;
justify-content: flex-end;
gap: 16px;
margin-top: 24px;
padding-top: 20px;
border-top: 1px solid #e2e8f0;
}
.action-button.edit-patient {
display: flex;
align-items: center;
gap: 8px;
padding: 10px 20px;
background: var(--primary-500);
color: white;
border: none;
border-radius: 10px;
cursor: pointer;
font-size: 14px;
font-weight: 600;
transition: background-color 0.3s ease, transform 0.3s ease;
}
.action-button.edit-patient:hover {
background: var(--primary-700);
transform: scale(1.02);
}
.action-button.delete-patient {
display: flex;
align-items: center;
gap: 8px;
padding: 10px 20px;
background: white;
color: #e53935;
border: 1px solid #e53935;
border-radius: 10px;
cursor: pointer;
font-size: 14px;
font-weight: 600;
transition: background-color 0.3s ease, color 0.3s ease, transform 0.3s ease;
}
.action-button.delete-patient:hover {
background: #ffebee;
color: #c62828;
transform: scale(1.02);
}
.attendance-container {
background: #ffffff;
border-radius: 12px;
padding: 24px;
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
margin-bottom: 24px;
}
.attendance-table-container {
overflow-x: auto;
}
.attendance-table {
width: 100%;
border-collapse: separate;
border-spacing: 0;
font-size: 14px;
color: #333;
border-radius: 8px;
overflow: hidden;
}
.attendance-table th,
.attendance-table td {
text-align: center;
padding: 12px;
border: 1px solid #eaeaea;
}
.attendance-table th {
background-color: #f5f7fa;
font-weight: 600;
}
.attendance-table th:first-child,
.attendance-table td:first-child {
text-align: left;
font-weight: 600;
background-color: #f5f7fa;
min-width: 140px;
}
.visit-icon {
color: #4CAF50;
font-size: 18px;
}
.no-visit-icon {
color: #F44336;
font-size: 18px;
}
.visited {
background-color: #E8F5E9;
}
.page-container {
width: 100%;
max-width: 1400px;
background: #ffffff;
border-radius: 10px;
padding: 26px;
box-shadow: 0px 4px 16px rgba(0, 0, 0, 0.1);
overflow-x: auto;
margin-bottom: 24px;
}
.toolbar {
display: flex;
justify-content: space-between;
align-items: center;
margin-bottom: 20px;
flex-wrap: wrap;
}
.left-section {
display: flex;
align-items: center;
flex-wrap: wrap;
}
.right-section {
display: flex;
align-items: center;
flex-wrap: wrap;
}
.dropdown-select {
width: 100%;
height: 38px;
padding: 0 8px;
border: 1px solid #e5e7eb;
border-radius: 6px;
font-family: "Inter", sans-serif;
font-size: 14px;
color: #374151;
background: #ffffff;
cursor: pointer;
appearance: none;
-webkit-appearance: none;
-moz-appearance: none;
outline: none;
transition: border-color 0.3s ease;
background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%239CA3AF'%3E%3Cpath fill-rule='evenodd' d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' clip-rule='evenodd'/%3E%3C/svg%3E");
background-repeat: no-repeat;
background-position: right 0.5rem center;
background-size: 1.25em 1.25em;
padding-right: 2rem;
}
.dropdown-select:hover {
border-color: var(--primary-300);
}
.add-data-button {
margin-left: 16px;
display: flex;
align-items: center;
gap: 8px;
padding: 10px 20px;
background: var(--primary-500);
color: #ffffff;
font-family: "Inter", sans-serif;
font-size: 14px;
font-weight: 600;
transition: background-color 0.3s ease, transform 0.3s ease;
border: none;
border-radius: 10px;
cursor: pointer;
}
.add-data-button:hover {
background: var(--primary-700);
transform: scale(1.02);
}
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
.table-container {
overflow-x: auto;
margin-bottom: 20px;
box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
border-radius: 10px;
}
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
.data-table .action-cell {
padding: 12px 16px;
}
.action-buttons-container {
display: flex;
align-items: center;
justify-content: center;
gap: 12px;
}
.action-button.edit,
.action-button.delete {
position: relative;
display: inline-flex;
align-items: center;
justify-content: center;
width: 36px;
height: 36px;
padding: 8px;
border-radius: 8px;
cursor: pointer;
transition: background-color 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease;
border: 1px solid transparent;
background: transparent;
}
.action-button.edit {
color: var(--primary-500, #3b82f6);
border-color: #dbeafe;
background-color: #eff6ff;
}
.action-button.edit:hover {
background-color: #dbeafe;
color: var(--primary-700, #1d4ed8);
transform: translateY(-2px);
box-shadow: 0 4px 8px rgba(59, 130, 246, 0.2);
}
.action-button.delete {
color: #ef4444;
border-color: #fee2e2;
background-color: #fef2f2;
}
.action-button.delete:hover {
background-color: #fee2e2;
color: #b91c1c;
transform: translateY(-2px);
box-shadow: 0 4px 8px rgba(239, 68, 68, 0.2);
}
.action-button .tooltip {
visibility: hidden;
width: max-content;
background-color: #334155;
color: #fff;
text-align: center;
border-radius: 6px;
padding: 6px 10px;
position: absolute;
z-index: 10;
bottom: 125%;
left: 50%;
transform: translateX(-50%);
opacity: 0;
transition: opacity 0.3s ease, visibility 0.3s ease;
font-size: 12px;
font-weight: 500;
pointer-events: none;
}
.action-button .tooltip::after {
content: "";
position: absolute;
top: 100%;
left: 50%;
margin-left: -5px;
border-width: 5px;
border-style: solid;
border-color: #334155 transparent transparent transparent;
}
.action-button:hover .tooltip {
visibility: visible;
opacity: 1;
}
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
.loading-container {
display: flex;
flex-direction: column;
align-items: center;
justify-content: center;
min-height: 150px;
padding: 20px;
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
.loading-container p {
color: #5f5f5f;
font-weight: 500;
}
.no-data {
text-align: center;
color: #9aa0a8;
font-size: 16px;
font-weight: 500;
padding: 40px 0;
}
.flex { display: flex; }
.items-center { align-items: center; }
.justify-between { justify-content: space-between; }
.gap-2 { gap: 0.5rem; }
.bg-white { background-color: #ffffff; }
.px-4 { padding-left: 1rem; padding-right: 1rem; }
.py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }
.text-sm { font-size: 0.875rem; }
.text-gray-700 { color: #374151; }
.isolate { isolation: isolate; }
.-space-x-px > :not([hidden]) ~ :not([hidden]) {
--tw-space-x-reverse: 0;
margin-right: calc(-1px * var(--tw-space-x-reverse));
margin-left: calc(-1px * calc(1 - var(--tw-space-x-reverse)));
}
.rounded-md { border-radius: 0.375rem; }
.shadow-xs {
box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}
@media (max-width: 1024px) {
.patient-cards {
grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
}
}
@media (max-width: 768px) {
.profile-header h2 {
font-size: 1.4rem;
}
.patient-cards {
grid-template-columns: 1fr;
gap: 16px;
}
.info-row {
flex-direction: column;
align-items: flex-start;
gap: 6px;
}
.info-row .value {
text-align: left;
width: 100%;
}
.card-header {
padding: 14px 16px;
}
.card-content {
padding: 16px;
}
.profile-actions {
flex-direction: column;
}
}
@media (min-width: 640px) {
.sm\:px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
.hidden.sm\:flex { display: flex; }
.sm\:flex-1 { flex: 1 1 0%; }
.sm\:items-center { align-items: center; }
.sm\:justify-between { justify-content: space-between; }
}
</style>