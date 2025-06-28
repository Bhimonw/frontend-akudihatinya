<template>
  <div class="patient-details">
    <div class="main-content">
      <button class="action-button back" @click="$router.go(-1)">
        <font-awesome-icon :icon="['fas', 'arrow-left']" />
        Kembali
      </button>
      <div class="breadcrumb">
        <span><router-link :to="breadcrumbLink">{{ breadcrumbText }}</router-link></span>
        <span> / </span>
        <span>Detail Pasien</span>
      </div>
      <div class="profile-section">
        <div class="profile-header">
          <h2>Informasi Pasien</h2>
        </div>

        <div v-if="isLoading" class="patient-cards">
          <div class="info-card skeleton-card" v-for="n in 3" :key="'skel-card-' + n">
            <div class="card-header">
              <div class="skeleton-icon"></div>
              <div class="skeleton-text skeleton-title"></div>
            </div>
            <div class="card-content">
              <div class="skeleton-row" v-for="i in 3" :key="'skel-row-' + i">
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
                    <button v-if="patient.nik && patient.nik !== '-'" @click="copyToClipboard(patient.nik)" class="copy-button" title="Salin NIK">
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
                <font-awesome-icon :icon="['fas', 'calendar-user']" class="card-icon" />
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
                    <button v-if="patient.bpjs_number && patient.bpjs_number !== '-'" @click="copyToClipboard(patient.bpjs_number)" class="copy-button" title="Salin No. BPJS">
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
        <div class="profile-header">
          <h2>Rekap Kunjungan Pasien {{ selectedDiseaseType === 'DM' ? 'Diabetes Mellitus' : (selectedDiseaseType === 'HT' ? 'Hipertensi' : '') }} {{ selectedYear }}</h2>
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
        <div class="profile-header">
          <h2>Data Pemeriksaan Pasien</h2>
        </div>
        <div class="toolbar">
          <div class="left-section">
            <div class="dropdown-container-filter" style="margin-right: 16px;">
              <label for="diseaseTypeFilter" class="filter-label">Jenis Penyakit:</label>
              <select id="diseaseTypeFilter" v-model="selectedDiseaseType" @change="onDiseaseTypeChange" class="dropdown-select filter-select">
                <option v-for="disease in availableDiseaseTypes" :key="disease.value" :value="disease.value">
                  {{ disease.text }}
                </option>
                <option v-if="availableDiseaseTypes.length === 0" value="">Tidak ada data penyakit</option>
              </select>
            </div>

            <div class="dropdown-container-filter" style="margin-right: 16px;">
              <label for="yearFilter" class="filter-label">Tahun:</label>
              <select id="yearFilter" v-model="selectedYear" @change="onYearChange" class="dropdown-select filter-select" :disabled="!selectedDiseaseType || diseaseYears.length === 0">
                <option v-for="year in diseaseYears" :key="year" :value="year">
                  {{ year }}
                </option>
                  <option v-if="selectedDiseaseType && diseaseYears.length === 0" value="">Tidak ada data tahun</option>
                  <option v-if="!selectedDiseaseType" value="">Pilih Jenis Penyakit Dahulu</option>
              </select>
            </div>
            
            <div class="search-container">
              <font-awesome-icon :icon="['fas', 'search']" class="search-icon" />
              <input type="text" placeholder="Search..." class="search-input" v-model="searchQuery" />
            </div>
          </div>
          <div class="right-section">
            <button class="add-data-button" @click="isModalOpen = true" :disabled="!selectedDiseaseType || !selectedYear">
              <font-awesome-icon :icon="['fas', 'plus']" />
              Tambah Data Pemeriksaan
            </button>
          </div>
        </div>
        <div class="table-container">
          <table class="data-table">
            <thead v-if="selectedDiseaseType === 'DM'">
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
            <thead v-if="selectedDiseaseType === 'HT'">
              <tr>
                <th rowspan="2">No</th>
                <th rowspan="2">Tanggal Pemeriksaan</th>
                <th colspan="2">Hasil Pemeriksaan Hipertensi</th>
                <th rowspan="2">Aksi</th>
              </tr>
              <tr>
                <th>Systolic (mmHg)</th>
                <th>Diastolic (mmHg)</th>
              </tr>
            </thead>
            <tbody v-if="selectedDiseaseType">
              <tr v-if="isLoadingExams">
                <td :colspan="selectedDiseaseType === 'DM' ? 7 : 5" class="loading-row">
                  <div class="loading-container">
                    <div class="spinner"></div>
                    <p>Memuat data...</p>
                  </div>
                </td>
              </tr>
              <tr v-else-if="filteredExams.length === 0">
                <td :colspan="selectedDiseaseType === 'DM' ? 7 : 5" class="no-data">
                  <p>Tidak ada data pemeriksaan untuk {{ selectedDiseaseType === 'DM' ? 'Diabetes Mellitus' : 'Hipertensi' }} pada tahun {{selectedYear}}.</p>
                </td>
              </tr>
              <tr v-else v-for="(exam, index) in filteredExams" :key="exam.id">
                <td>{{ index + 1 }}</td>
                <td>{{ formatDate(exam.examination_date) }}</td>
                <template v-if="selectedDiseaseType === 'DM'">
                  <td>{{ exam.examination_results.gdsp || '-' }}</td>
                  <td>{{ exam.examination_results.gdp || '-' }}</td>
                  <td>{{ exam.examination_results.gd2jpp || '-' }}</td>
                  <td>{{ exam.examination_results.hba1c || '-' }}</td>
                </template>
                <template v-if="selectedDiseaseType === 'HT'">
                  <td>{{ exam.systolic || '-' }}</td>
                  <td>{{ exam.diastolic || '-' }}</td>
                </template>
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
              <tbody v-else>
                <tr>
                    <td colspan="7" class="no-data">
                        <p>Silakan pilih jenis penyakit dan tahun untuk menampilkan data.</p>
                    </td>
                </tr>
              </tbody>
          </table>
        </div>
        </div>
    </div>

    <AddExaminationDataDM
        v-if="selectedDiseaseType === 'DM'"
        :visible="isModalOpen"
        :patient-id="patientId"
        :selected-year="selectedYear" 
        @close="closeModal"
        @submit="handleAddExamSubmit"     
    />
    <AddExaminationDataHT
        v-if="selectedDiseaseType === 'HT'"
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
        v-if="selectedDiseaseType === 'DM'"
        :visible="isEditExamModalOpen"
        :patient-id="patientId"
        :exam-data="selectedExam"
        @close="closeEditExamModal"
        @submit="handleEditExamSubmit"
    />
      <EditExaminationDataHT
        v-if="selectedDiseaseType === 'HT'"
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
import axios from 'axios';
import AddExaminationDataDM from "../../components/modals/AddExaminationDataDM.vue";
import AddExaminationDataHT from "../../components/modals/AddExaminationDataHT.vue";
import EditPatientDetail from '../../components/modals/EditPatientDetail.vue';
import EditExaminationModal from '../../components/modals/EditExaminationModal.vue';
import EditExaminationDataHT from '../../components/modals/EditExaminationDataHT.vue';

export default {
  name: "DetailPasien",
  components: {
    AddExaminationDataDM,
    AddExaminationDataHT,
    EditPatientDetail,
    EditExaminationModal,
    EditExaminationDataHT,
  },
  data() {
    return {
      patientId: this.$route.params.id,
      patient: {
        dm_years: [],
        ht_years: [],
      },
      exams: [], // Menampung semua data pemeriksaan dari API
      
      selectedDiseaseType: null,
      availableDiseaseTypes: [],
      selectedYear: null,
      
      searchQuery: "",
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
    breadcrumbLink() {
      // Logika breadcrumb tetap sama
      return '/user/list-pasien';
    },
    breadcrumbText() {
      // Logika breadcrumb tetap sama
      return 'Daftar Pasien';
    },
    diseaseYears() {
      if (this.selectedDiseaseType === 'DM' && this.patient && this.patient.dm_years) {
        return [...new Set(this.patient.dm_years)].sort((a, b) => b - a);
      }
      if (this.selectedDiseaseType === 'HT' && this.patient && this.patient.ht_years) {
        return [...new Set(this.patient.ht_years)].sort((a, b) => b - a);
      }
      return [];
    },
    // PERBAIKAN: Mengganti `paginatedExams` menjadi `filteredExams`
    filteredExams() {
      if (!this.searchQuery) {
        return this.exams; // Jika tidak ada pencarian, kembalikan semua data
      }
      // Jika ada pencarian, filter berdasarkan tanggal
      return this.exams.filter(exam => 
        this.formatDate(exam.examination_date).toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    },
  },
  methods: {
    formatDate(dateString) {
      if (!dateString) return '-';
      const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
      const date = new Date(dateString);
      const day = date.getDate();
      const monthName = months[date.getMonth()];
      const year = date.getFullYear();
      return `${day} ${monthName} ${year}`;
    },
    async fetchPatientDetails() {
      this.isLoading = true;
      this.availableDiseaseTypes = [];
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          Swal.fire('Error', 'Token tidak ditemukan. Silakan login kembali.', 'error');
          this.$router.push({ name: 'Login' }); 
          return;
        }

        const response = await axios.get(`http://localhost:8000/api/puskesmas/patients/${this.patientId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        const apiPatient = response.data.patient;
        if (!apiPatient) {
            Swal.fire('Error', 'Data pasien tidak ditemukan.', 'error');
            this.isLoading = false;
            return;
        }

        this.patient = {
          ...apiPatient,
          name: apiPatient.name,
          nik: apiPatient.nik || '-',
          bpjs_number: apiPatient.bpjs_number || '-',
          phone_number: apiPatient.phone_number || '-',
          birth_date: apiPatient.birth_date || '-',
          age: apiPatient.age || '-',
          gender: apiPatient.gender === 'female' ? 'Perempuan' : (apiPatient.gender === 'male' ? 'Laki-Laki' : '-'),
          address: apiPatient.address || '-',
          dm_years: apiPatient.dm_years || [],
          ht_years: apiPatient.ht_years || [],
        };

        if (this.patient.has_dm) {
          this.availableDiseaseTypes.push({ value: 'DM', text: 'Diabetes Mellitus' });
        }
        if (this.patient.has_ht) {
          this.availableDiseaseTypes.push({ value: 'HT', text: 'Hipertensi' });
        }

        const queryDisease = this.$route.query.disease;
        const queryYear = this.$route.query.year;

        if (queryDisease && this.availableDiseaseTypes.find(d => d.value.toLowerCase() === queryDisease.toLowerCase())) {
            this.selectedDiseaseType = this.availableDiseaseTypes.find(d => d.value.toLowerCase() === queryDisease.toLowerCase()).value;
        } else if (this.availableDiseaseTypes.length > 0) {
            this.selectedDiseaseType = this.availableDiseaseTypes[0].value;
        }

        if (this.selectedDiseaseType) {
            const yearsForSelectedDisease = this.diseaseYears;
            if (queryYear && yearsForSelectedDisease.includes(parseInt(queryYear))) {
                this.selectedYear = parseInt(queryYear);
            } else if (yearsForSelectedDisease.length > 0) {
                this.selectedYear = yearsForSelectedDisease[0];
            } else {
                this.selectedYear = new Date().getFullYear();
            }
        } else {
            this.selectedYear = null;
        }
        
        this.updateRouterQuery();
        if(this.selectedDiseaseType && this.selectedYear) {
            this.fetchExaminations();
        }

      } catch (error) {
        console.error("Error fetching patient details:", error);
        Swal.fire('Error', 'Terjadi kesalahan saat memuat detail pasien.', 'error');
      } finally {
        this.isLoading = false;
      }
    },
    onDiseaseTypeChange() {
        const yearsForNewDisease = this.diseaseYears;
        this.selectedYear = yearsForNewDisease.length > 0 ? yearsForNewDisease[0] : new Date().getFullYear();
        
        this.updateRouterQuery();
        this.fetchExaminations();
    },
    onYearChange() {
        this.updateRouterQuery();
        this.fetchExaminations();
    },
    updateRouterQuery() {
        const query = { ...this.$route.query };
        if (this.selectedDiseaseType) query.disease = this.selectedDiseaseType.toLowerCase();
        else delete query.disease;
        
        if (this.selectedYear) query.year = this.selectedYear.toString();
        else delete query.year;

        this.$router.replace({ query }).catch(err => {
            if (err.name !== 'NavigationDuplicated') console.error(err);
        });
    },
    
    // KODE BARU DIMULAI DARI SINI
    async deletePatient() {
      const result = await Swal.fire({
        title: 'Anda yakin?',
        text: `Data pasien "${this.patient.name}" akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Ya, hapus!',
        cancelButtonText: 'Batal'
      });

      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem("token");
          if (!token) {
            Swal.fire('Error', 'Sesi Anda telah berakhir. Silakan login kembali.', 'error');
            this.$router.push({ name: 'Login' });
            return;
          }

          await axios.delete(`http://localhost:8000/api/puskesmas/patients/${this.patientId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          await Swal.fire({
            title: 'Berhasil!',
            text: 'Data pasien telah berhasil dihapus.',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          });

          // Arahkan kembali ke halaman daftar pasien
          this.$router.push('/user/list-pasien');

        } catch (error) {
          console.error("Error deleting patient:", error);
          Swal.fire(
            'Gagal!',
            'Terjadi kesalahan saat menghapus data pasien. Coba lagi nanti.',
            'error'
          );
        }
      }
    },
    // KODE BARU BERAKHIR DI SINI

    // PERBAIKAN: Method fetchExaminations tanpa paginasi
    async fetchExaminations() {
      if (!this.selectedDiseaseType || !this.selectedYear) {
        this.exams = [];
        return;
      }
      this.isLoadingExams = true;
      try {
        const token = localStorage.getItem("token");
        let apiUrl = "";
        if (this.selectedDiseaseType === 'DM') {
          apiUrl = "http://localhost:8000/api/puskesmas/dm-examinations";
        } else if (this.selectedDiseaseType === 'HT') {
          apiUrl = "http://localhost:8000/api/puskesmas/ht-examinations";
        } else {
            this.isLoadingExams = false;
            return;
        }

        const response = await axios.get(apiUrl, {
          params: {
            patient_id: this.patientId,
            year: this.selectedYear,
            // Hapus parameter `per_page` dan `page` untuk mengambil semua data
          },
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data && response.data.data) {
          this.exams = response.data.data; // Langsung simpan array data
        } else {
            this.exams = [];
        }
      } catch (error) {
        console.error("Error fetching examinations:", error);
        this.exams = [];
        Swal.fire('Error', `Terjadi kesalahan saat memuat data pemeriksaan.`, 'error');
      } finally {
        this.isLoadingExams = false;
      }
    },
    async deleteExam(id) {
        // ... (existing logic)
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
      this.fetchPatientDetails();
      this.closeEditExamModal();
    },
    handleAddExamSubmit() {
      this.fetchPatientDetails();
      this.closeModal();
    },
    handleEditPatientSubmit() {
      this.fetchPatientDetails(); 
      this.closeEditModal();
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
        // ... (existing logic)
    },
  },
  watch: {
    // Watcher untuk `searchQuery` tidak memerlukan perubahan karena computed property
    // akan otomatis dijalankan ulang.
    '$route.params.id'(newId, oldId) {
        if (newId !== oldId) {
            this.patientId = newId;
            this.fetchPatientDetails();
        }
    },
  },
  mounted() {
    this.fetchPatientDetails();
  },
};
</script>

<style scoped>
/* Semua style yang ada sebelumnya tetap sama, tidak perlu diubah */
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
.info-row .value > span:first-child {
    flex-grow: 1;
}
.full-width .value {
text-align: left;
}
.address-text {
line-height: 1.5;
font-weight: 600;
color: #475569;
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
gap: 16px;
}
.right-section {
display: flex;
align-items: center;
flex-wrap: wrap;
}
.dropdown-container-filter {
display: flex;
align-items: center;
gap: 8px;
}
.filter-label {
font-size: 14px;
color: #4A5568;
font-weight: 500;
white-space: nowrap;
}
.filter-select {
min-width: 180px;
height: 42px;
padding: 8px 12px;
}
.dropdown-select {
width: 100%;
height: 42px;
padding: 0 12px;
border: 1px solid #e5e7eb;
border-radius: 10px;
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
background-position: right 0.75rem center;
background-size: 1.25em 1.25em;
padding-right: 2.5rem;
}
.dropdown-select:disabled {
background-color: #f3f4f6;
cursor: not-allowed;
color: #9ca3af;
}
.dropdown-select:hover:not(:disabled) {
border-color: var(--primary-300);
}
.add-data-button {
display: flex;
align-items: center;
gap: 8px;
padding: 10px 20px;
background: var(--primary-500);
color: #ffffff;
font-family: "Inter", sans-serif;
font-size: 14px;
font-weight: 600;
transition: background-color 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease;
border: none;
border-radius: 10px;
cursor: pointer;
}
.add-data-button:disabled {
background-color: #d1d5db;
cursor: not-allowed;
transform: none;
box-shadow: none;
}
.add-data-button:hover:not(:disabled) {
background: var(--primary-700);
transform: scale(1.02);
box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
.search-container {
display: flex;
align-items: center;
position: relative;
}
.search-icon {
position: absolute;
left: 14px;
color: #9aa0a8;
font-size: 16px;
pointer-events: none;
}
.search-input {
width: 251px;
height: 42px;
padding: 10px 14px 10px 40px;
border: 1px solid #cdcfD4;
border-radius: 10px;
font-family: "Inter", sans-serif;
font-size: 14px;
color: #4f5867;
outline: none;
transition: border-color 0.3s ease;
}
.search-input:hover {
border-color: var(--primary-500);
}
.table-container {
overflow-x: auto;
margin-bottom: 20px;
box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.05);
border-radius: 10px;
border: 1px solid #e5e7eb;
}
.data-table {
width: 100%;
border-collapse: separate;
border-spacing: 0;
font-family: "Inter", sans-serif;
font-size: 14px;
color: #333333;
background: #ffffff;
}
.data-table thead th {
background: #f9fafb;
color: #374151;
font-weight: 600;
text-align: center;
padding: 16px;
border-bottom: 1px solid #e5e7eb;
white-space: nowrap;
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
.loading-row {
text-align: center;
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
@media (max-width: 1024px) {
    .left-section {
        flex-direction: column;
        align-items: stretch;
        width: 100%;
    }
    .toolbar {
        flex-direction: column;
        align-items: stretch;
    }
    .right-section {
        margin-top: 16px;
    }
}
@media (max-width: 768px) {
.profile-info {
grid-template-columns: 1fr;
gap: 20px;
}
.profile-actions {
flex-direction: column;
}
}
</style>