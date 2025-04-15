<template>
    <div class="patient-details">
      <!-- Main Content -->
      <div class="main-content">
        <!-- Tombol Kembali -->
        <button class="action-button back" @click="$router.go(-1)">
          <font-awesome-icon :icon="['fas', 'arrow-left']" />
          Kembali
        </button>
        <!-- Breadcrumb -->
        <div class="breadcrumb">
          <span><router-link to="/user/hipertensi">Hipertensi</router-link></span>
          <span> / </span>
          <span>Detail Pasien</span>
        </div>
        <!-- Profile Section - Enhanced Styling -->
        <div class="profile-section">
          <div class="profile-header">
            <h2>Detail Pasien</h2>
          </div>
  
          <div v-if="isLoading" class="loading-container">
          <div class="spinner"></div>
          <p>Memuat data...</p>
          </div>
  
          <div v-else class="profile-info-container">
              <div class="profile-info">
              <!-- Kolom Utama (3 Kolom/Grid) -->
              <div class="info-item">
                <span class="label">Nama Lengkap :</span>
                <span class="value">{{ patient.name }}</span>
              </div>
              <div class="info-item">
                <span class="label">Jenis Kelamin :</span>
                <span class="value">{{ patient.gender || '-' }}</span>
              </div>
              <div class="info-item">
                <span class="label">NIK :</span>
                <span class="value">{{ patient.nik || '-' }}</span>
              </div>
              <div class="info-item">
                <span class="label">Nomor BPJS :</span>
                <span class="value">{{ patient.bpjs_number || '-' }}</span>
              </div>
              <div class="info-item">
                <span class="label">Tanggal Lahir :</span>
                <span class="value">{{ patient.birth_date || '-' }}</span>
              </div>
              <div class="info-item">
                <span class="label">Umur :</span>
                <span class="value">{{ patient.age || '-' }}</span>
              </div>
            </div>
  
            <!-- Alamat (Full Width) -->
            <div class="address-info">
              <span class="label">Alamat :</span>
              <span class="value">{{ patient.address || '-' }}</span>
            </div>
          </div>
          <!-- Tombol Ubah dan Hapus -->
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
        <!-- NEW: Monthly Attendance Container -->
        <div class="attendance-container">
          <h3>Rekap Kunjungan Pasien {{ selectedYear }}</h3>
          <div class="attendance-table-container">
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
        <!-- Data Pemeriksaan Pasien Container -->
        <div class="page-container">
        <!-- Title moved inside the container with the same styling as profile-header -->
        <div class="profile-header">
            <h2>Data Pemeriksaan Pasien</h2>
        </div>
        <!-- Toolbar -->
        <div class="toolbar">
            <!-- Bagian Kiri -->
            <div class="left-section">
            <!-- Search Bar -->
            <div class="search-container">
                <font-awesome-icon :icon="['fas', 'search']" class="search-icon" />
                <input type="text" placeholder="Search..." class="search-input" v-model="searchQuery" />
            </div>
            </div>
            <!-- Bagian Kanan -->
            <div class="right-section">
            <!-- Tombol Tambah Data Peserta -->
            <button class="add-data-button" @click="isModalOpen = true">
                <font-awesome-icon :icon="['fas', 'plus']" />
                Tambah Data Pemeriksaan
            </button>
            </div>
        </div>
        <!-- Tabel Data Pemeriksaan -->
        <div class="table-container">
            <table class="data-table">
            <thead>
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
            <tbody>
                <!-- Indikator Loading -->
                <tr v-if="isLoadingExams">
                <td colspan="5" class="loading-row">
                    <div class="loading-container">
                    <div class="spinner"></div>
                    <p>Memuat data...</p>
                    </div>
                </td>
                </tr>
                <!-- Pesan "Tidak Ada Data" -->
                <tr v-else-if="filteredExams.length === 0">
                <td colspan="5" class="no-data">
                    <p>Tidak ada data pemeriksaan.</p>
                </td>
                </tr>
                <!-- Data Pemeriksaan -->
                <tr v-else v-for="(exam, index) in paginatedExams" :key="exam.id">
                <td>{{ (currentPage - 1) * pageSize + index + 1 }}</td>
                <td>{{ exam.examination_date }}</td>
                <td>{{ exam.systolic || '-' }}</td>
                <td>{{ exam.diastolic || '-' }}</td>
                <td>
                    <button class="action-button edit" @click="openEditExamModal(exam)">
                    <font-awesome-icon :icon="['fas', 'edit']" />
                    </button>
                    <button class="action-button delete" @click="deleteExam(exam.id)">
                    <font-awesome-icon :icon="['fas', 'trash']" />
                    </button>
                </td>
                </tr>
            </tbody>
            </table>
        </div>
        </div>
      </div>
      <!-- Modal Tambah Data -->
      <ModalTambahData
        :visible="isModalOpen"
        :patient-id="patientId"
        @close="closeModal"
        @submit="handleModalSubmit"
      />
  
      <EditPatientDetail
        :visible="isEditModalOpen"
        :patientData="patient"
        @close="closeEditModal"
        @submit="handleEditModalSubmit"
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
  import axios from 'axios';
  import ModalTambahData from "../../components/modals/AddExaminationDataHT.vue";
  import EditPatientDetail from '../../components/modals/EditPatientDetail.vue';
  import EditExaminationModal from '../../components/modals/EditExaminationDataHT.vue';
  
  export default {
    name: "DetailPasienHT",
    components: {
      ModalTambahData,
      EditPatientDetail,
      EditExaminationModal
    },
    data() {
      return {
        patientId: this.$route.params.id,
        patient: {},
        exams: [],
        selectedYear: this.$route.query.year || new Date().getFullYear(), // Ambil tahun dari query atau default ke tahun sekarang
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
        filteredExams() {
        console.log("Filtering exams, current exams:", this.exams.length);
        return this.exams.filter((exam) => {
        const matchesSearch = exam.examination_date.toLowerCase().includes(this.searchQuery.toLowerCase());
        const matchesYear = !this.selectedYear || exam.year === parseInt(this.selectedYear);
        console.log(`Exam ${exam.id}: matchesSearch=${matchesSearch}, matchesYear=${matchesYear}`);
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
      async fetchPatientDetails() {
        this.isLoading = true;
        try {
          const token = localStorage.getItem("token");
          if (!token) {
            console.error("Token tidak ditemukan");
            return;
          }
          const response = await axios.get(`http://localhost:8000/api/puskesmas/patients/${this.patientId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          console.log("API Response:", response.data);
          const apiPatient = response.data.patient; // Ambil data dari respons API
  
          // Mapping properti agar sesuai dengan template
          this.patient = {
            name: apiPatient.name,
            nik: apiPatient.nik || '-',
            bpjs_number: apiPatient.bpjs_number || '-', // Sesuaikan dengan nama properti di API dan template
            birth_date: apiPatient.birth_date || '-',   // Sesuaikan dengan nama properti di API dan template
            age: apiPatient.age || '-',
            gender: apiPatient.gender === 'female' ? 'Perempuan' : 'Laki-Laki',
            address: apiPatient.address || '-',
          };
        } catch (error) {
          console.error("Error fetching patient details:", error);
          alert("Terjadi kesalahan saat memuat detail pasien.");
        } finally {
          this.isLoading = false;
        }
      },
      async deletePatient() {
        try {
          // Tampilkan konfirmasi menggunakan SweetAlert
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
  
          // Jika pengguna membatalkan, hentikan proses
          if (!confirmation.isConfirmed) {
            return;
          }
  
          // Panggil API untuk menghapus data pasien
          const token = localStorage.getItem("token");
          if (!token) {
            throw new Error("Token tidak ditemukan");
          }
  
          const response = await axios.delete(`http://localhost:8000/api/puskesmas/patients/${this.patientId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
  
          // Tampilkan notifikasi sukses menggunakan SweetAlert
          Swal.fire({
            icon: 'success',
            title: 'Berhasil',
            text: 'Data pasien berhasil dihapus.',
            confirmButtonText: 'Tutup',
          });
  
          // Redirect ke halaman utama (misalnya, halaman daftar pasien)
          this.$router.push('/user/hipertensi');
        } catch (error) {
          console.error("Error deleting patient:", error);
  
          // Tampilkan notifikasi gagal menggunakan SweetAlert
          Swal.fire({
            icon: 'error',
            title: 'Gagal',
            text: error.response?.data?.message || 'Terjadi kesalahan saat menghapus data pasien.',
            confirmButtonText: 'Tutup',
          });
        }
      },
      async fetchExaminations() {
        this.isLoadingExams = true;
        try {
            const token = localStorage.getItem("token");
            if (!token) {
            console.error("Token tidak ditemukan");
            return;
            }
            const response = await axios.get("http://localhost:8000/api/puskesmas/ht-examinations", {
            params: {
                patient_id: this.patientId,
                year: this.selectedYear,
                per_page: this.pageSize,
                page: this.currentPage,
            },
            headers: {
                Authorization: `Bearer ${token}`,
            },
            });

            console.log("API Response:", response.data);

            // Pastikan data adalah array dan tidak kosong
            if (response.data && Array.isArray(response.data.data)) {
            this.exams = response.data.data;
            
            // Menangani meta yang memiliki struktur array dengan benar
            const meta = response.data.meta;
            
            // Konversi nilai array ke nilai tunggal jika diperlukan
            this.totalExams = Array.isArray(meta.total) ? meta.total[0] : meta.total;
            this.currentPage = Array.isArray(meta.current_page) ? meta.current_page[0] : meta.current_page;
            this.totalPages = Array.isArray(meta.last_page) ? meta.last_page[0] : meta.last_page;
            } else {
            this.exams = [];
            console.error("Data dari API bukan array:", response.data);
            }

            console.log("Processed exams data:", this.exams);
        } catch (error) {
            console.error("Error fetching examinations:", error);
            alert("Terjadi kesalahan saat memuat data pemeriksaan.");
        } finally {
            this.isLoadingExams = false;
        }
        },
      async deleteExam(id) {
        try {
          // Tampilkan konfirmasi menggunakan SweetAlert
          const confirmation = await Swal.fire({
            title: 'Apakah Anda yakin?',
            text: 'Anda akan menghapus data pemeriksaan ini.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Ya, hapus!',
            cancelButtonText: 'Batal',
          });
  
          // Jika pengguna membatalkan, hentikan proses
          if (!confirmation.isConfirmed) {
            return;
          }
  
          const token = localStorage.getItem("token");
          if (!token) {
            throw new Error("Token tidak ditemukan");
          }
  
          // Panggil API untuk menghapus data pemeriksaan
          await axios.delete(`http://localhost:8000/api/puskesmas/ht-examinations/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
  
          // Tampilkan notifikasi sukses
          Swal.fire({
            icon: 'success',
            title: 'Berhasil',
            text: 'Data pemeriksaan berhasil dihapus.',
            confirmButtonText: 'Tutup',
          });
  
          // Muat ulang data pemeriksaan setelah penghapusan
          this.fetchExaminations();
        } catch (error) {
          console.error("Error deleting examination:", error);
  
          // Tampilkan notifikasi gagal
          Swal.fire({
            icon: 'error',
            title: 'Gagal',
            text:
              error.response?.data?.message ||
              error.message ||
              'Terjadi kesalahan saat menghapus data pemeriksaan.',
            confirmButtonText: 'Tutup',
          });
        }
      },
      openEditModal(exam) {
        // Kirim data pemeriksaan ke modal edit
        this.selectedExam = exam;
        this.isEditModalOpen = true; // Buka modal edit
      },
  
      closeEditModal() {
        this.isEditModalOpen = false; // Tutup modal edit
      },
      openEditExamModal(exam) {
        this.selectedExam = exam; // Simpan data pemeriksaan yang dipilih
        this.isEditExamModalOpen = true; // Buka modal edit
      },
      closeEditExamModal() {
        this.isEditExamModalOpen = false; // Tutup modal edit
      },
      handleEditExamSubmit() {
        this.fetchExaminations(); // Muat ulang data setelah pembaruan
      },
      async handleEditModalSubmit() {
        this.fetchExaminations();
      },
      prevPage() {
        if (this.currentPage > 1) {
          this.currentPage--;
          this.fetchExaminations();
        }
      },
      nextPage() {
        if (this.currentPage < this.totalPages) {
          this.currentPage++;
          this.fetchExaminations();
        }
      },
      goToPage(page) {
        this.currentPage = page;
        this.fetchExaminations();
      },
      resetPagination() {
        this.currentPage = 1;
        this.fetchExaminations();
      },
      editPatient() {
        this.isEditModalOpen = true;
      },
      editExam(id) {
        console.log("Edit exam with ID:", id);
      },
      closeModal() {
        this.isModalOpen = false;
      },
      closeEditModal() {
        this.isEditModalOpen = false;
      },
      handleModalSubmit(data) {
        console.log("New examination data:", data);
        this.isModalOpen = false;
        // Simpan data ke state exams atau lakukan aksi lainnya
      },
      handleEditModalSubmit(updatedPatient) {
      // Update the patient data in your component
        this.patient = {
          name: updatedPatient.name,
          nik: updatedPatient.nik || '-',
          bpjs_number: updatedPatient.bpjs_number || '-',
          birth_date: updatedPatient.birth_date || '-',
          age: updatedPatient.age || '-',
          gender: updatedPatient.gender === 'female' ? 'Perempuan' : 'Laki-Laki',
          address: updatedPatient.address || '-',
        };
        
        // Optionally, show a success message
        console.log("Patient data updated successfully");
      },
      hasVisitInMonth(month) {
        const monthIndex = this.months.indexOf(month); // Mendapatkan indeks bulan (0-11)
        if (monthIndex === -1) return false;
  
        // Periksa apakah ada data pemeriksaan di bulan dan tahun yang sesuai
        return this.exams.some((exam) => {
          const examDate = new Date(exam.examination_date);
          return examDate.getMonth() === monthIndex && examDate.getFullYear() === parseInt(this.selectedYear);
        });
      },
    },
    watch: {
      selectedYear() {
        this.currentPage = 1; // Reset halaman saat tahun berubah
        this.fetchExaminations();
      },
      $route() {
        this.patientId = this.$route.params.id;
        this.selectedYear = this.$route.query.year || new Date().getFullYear();
        this.fetchPatientDetails();
        this.fetchExaminations();
      },
      searchQuery() {
        this.currentPage = 1; // Reset halaman saat pencarian berubah
        this.fetchExaminations();
      },
      pageSize() {
        this.currentPage = 1; // Reset halaman saat jumlah baris per halaman berubah
        this.fetchExaminations();
      },
      "$route.query.year": function(newYear) {
        if (newYear) {
          this.selectedYear = newYear; // Update tahun terpilih
          this.fetchExaminations(); // Muat ulang data pemeriksaan
        }
      }
    },
    mounted() {
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
  }
  
  .main-content {
    flex: 1;
    overflow-x: auto;
    padding: 0 16px;
  }
  
  .breadcrumb {
    margin-bottom: 20px;
    font-size: 14px;
    padding: 12px 0;
  }
  
  .breadcrumb a {
    color: var(--primary-500);
    text-decoration: none;
  }
  
  .breadcrumb a:hover {
    text-decoration: underline;
  }
  
  .action-button.back {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    border: 1px solid var(--primary-300);
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    background: var(--secondary-100);
    color: var(--primary-500);
    transition: background-color 0.3s ease, transform 0.3s ease;
    margin-bottom: 16px;
  }
  
  .action-button.back:hover {
    background: var(--secondary-300);
  }
  
  /* Enhanced Profile Section */
  .profile-section {
    background: #ffffff;
    border-radius: 10px;
    padding: 24px;
    box-shadow: 0px 4px 16px rgba(0, 0, 0, 0.1);
    position: relative;
    margin-bottom: 24px;
  }
  
  .profile-header {
    margin-bottom: 20px;
    border-bottom: 1px solid #f0f0f0;
    padding-bottom: 12px;
  }
  
  .profile-header h2 {
    font-size: 1.5rem;
    font-weight: 600;
    color: #333;
    margin: 0;
  }
  
  /* Profile Info dengan Grid 3 Kolom */
  .profile-info {
    display: grid;
    grid-template-columns: repeat(3, 1fr); /* Tetap 3 kolom */
    gap: 20px; /* Jarak antar item */
    margin-bottom: 24px;
  }
  
  .info-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  
  .label {
    font-weight: 500;
    color: #666;
    font-size: 0.9rem;
  }
  
  .value {
    font-weight: 600;
    color: #333;
    font-size: 1rem;
    padding: 4px 0;
  }
  
  /* Address Info (Full Width) */
  .address-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-bottom: 24px;
  }
  
  .address-info .label {
    font-weight: 500;
    color: #666;
    font-size: 0.9rem;
  }
  
  .address-info .value {
    font-weight: 600;
    color: #333;
    font-size: 1rem;
    word-wrap: break-word; /* Memastikan teks panjang tidak keluar dari card */
  }
  /* Profile Action Buttons */
  .profile-actions {
    display: flex;
    justify-content: flex-end;
    gap: 16px;
    margin-top: 16px;
  }
  
  .action-button.edit-patient {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    background: var(--primary-500);
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: background-color 0.3s ease;
  }
  
  .action-button.edit-patient:hover {
    background: var(--primary-700);
    transform: scale(1.05);
  }
  
  .action-button.delete-patient {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    background: white;
    color: #e53935;
    border: 1px solid #e53935;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: background-color 0.3s ease, color 0.3s ease;
  }
  
  .action-button.delete-patient:hover {
    background: #ffebee;
    color: #c62828;
    transform: scale(1.05);
  }
  
  /* NEW: Monthly Attendance Container */
  .attendance-container {
    background: #ffffff;
    border-radius: 10px;
    padding: 24px;
    box-shadow: 0px 4px 16px rgba(0, 0, 0, 0.1);
    margin-bottom: 24px;
  }
  
  .attendance-container h3 {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 16px;
    color: #333;
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
  
  /* Page Container */
  .page-container {
    width: 100%;
    max-width: 1400px; /* Lebar maksimal saat layar besar */
    background: #ffffff;
    border-radius: 10px;
    padding: 26px;
    box-shadow: 0px 4px 16px rgba(0, 0, 0, 0.1);
    overflow-x: auto; /* Aktifkan scroll horizontal jika konten melebihi lebar */
    margin-bottom: 24px;
  }
  
  /* Toolbar */
  .toolbar {
    display: flex;
    justify-content: space-between; /* Pisahkan bagian kiri dan kanan */
    align-items: center; /* Sentralkan elemen secara vertikal */
    margin-bottom: 20px;
    flex-wrap: wrap;
  }
  
  /* Bagian Kiri */
  .left-section {
    display: flex;
    align-items: center; /* Sentralkan elemen secara vertikal */
    flex-wrap: wrap;
  }
  
  /* Bagian Kanan */
  .right-section {
    display: flex;
    align-items: center; /* Sentralkan elemen secara vertikal */
    flex-wrap: wrap;
  }
  
  /* Dropdown Tahun */
  .dropdown-container-year {
    position: relative;
    width: 147px; /* Lebar dropdown tahun */
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
    appearance: none; /* Hilangkan tampilan default dropdown */
    -webkit-appearance: none; /* Untuk browser Webkit */
    -moz-appearance: none; /* Untuk browser Mozilla */
    outline: none; /* Hilangkan outline saat fokus */
  }
  
  /* Dropdown Icon (Chevron Down) */
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
  
  /* Tombol Tambah Data Peserta */
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
    font-weight: 500;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }
  
  .add-data-button:hover {
    background: var(--primary-700);
  }
  
  /* Tombol Print Laporan */
  .print-report-button {
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
  
  .print-report-button:hover {
    background: var(--primary-700);
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
    pointer-events: none; /* Pastikan ikon tidak bisa diklik */
  }
  
  .search-input {
    width: 251px;
    height: 42px;
    padding: 10px 40px 10px 40px; /* Padding untuk memberi ruang ikon search */
    border: 1px solid #cdcfD4;
    border-radius: 10px;
    font-family: "Inter", sans-serif;
    font-size: 14px;
    color: #4f5867;
    outline: none;
  }
  
  .search-input:hover {
    border-color: var(--primary-500); /* Warna border saat hover */
  }
  
  @media (max-width: 992px) {
    .profile-info {
      grid-template-columns: repeat(2, 1fr);
    }
    
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
    .print-report-button {
      width: 100%;
      text-align: center;
      justify-content: center;
    }
  }
  
  /* Media Query untuk Layar Kecil */
  @media (max-width: 768px) {
    .profile-info {
      grid-template-columns: 1fr;
    }
    
    .profile-actions {
      flex-direction: column;
    }
    
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
    .print-report-button {
      width: 100%;
      text-align: center;
      justify-content: center;
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
  
  /* Header */
  .data-table th {
    text-align: center; /* Rata tengah untuk judul kolom */
    font-weight: 600;
    color: #5f5f5f;
    background: #f3f3f3; /* Latar belakang abu-abu muda */
  }
  
  /* Data Cell */
  .data-table td {
    text-align: center; /* Rata tengah untuk data */
    padding: 20px; /* Tinggi baris menjadi 60px */
  }
  
  .data-table tr {
    height: 60px; /* Tinggi baris tetap 60px */
  }
  
  /* Action Buttons */
  .action-buttons {
    display: flex;
    gap: 8px;
  }
  
  .action-button.detail {
    padding: 8px 16px; /* Padding lebih besar untuk tombol tunggal */
    border: 1px solid var(--primary-300);
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    background: var(--secondary-100); /* Warna biru untuk tombol detail */
    color: var(--primary-500);
    transition: background-color 0.3s ease, transform 0.3s ease;
  }
  .action-button.detail:hover {
    background: var(--secondary-300); /* Warna lebih gelap saat hover */
  }
  
  .action-button.edit,
  .action-button.delete {
    padding: 8px;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }
  
  .action-button.edit {
    color: var(--primary-500);
  }
  
  .action-button.delete {
    color: #e53935;
  }
  
  .action-button.edit:hover {
    background-color: rgba(0, 123, 255, 0.1);
  }
  
  .action-button.delete:hover {
    background-color: rgba(229, 57, 53, 0.1);
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
  
  /* Column Width Adjustments */
  .data-table th:nth-child(1),
  .data-table td:nth-child(1) {
    width: 5%;
  }
  
  .data-table th:nth-child(2),
  .data-table td:nth-child(2) {
    width: 15%;
  }
  
  .data-table th:nth-child(3),
  .data-table td:nth-child(3) {
    width: 15%;
  }
  
  .data-table th:nth-child(4),
  .data-table td:nth-child(4) {
    width: 15%;
  }
  
  .data-table th:nth-child(5),
  .data-table td:nth-child(5) {
    width: 15%;
  }
  
  
  .data-table th:nth-child(6),
  .data-table td:nth-child(6) {
    width: 15%;
  }
  
  .data-table th:nth-child(7),
  .data-table td:nth-child(7) {
    width: 10%;
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
    color: var(--primary-500); /* Warna biru saat hover */
  }
  
  /* Halaman Aktif */
  .pagination-button.active {
    color: var(--primary-500); /* Teks biru untuk halaman aktif */
    font-weight: 600; /* Teks lebih tebal */
  }
  
  /* Tombol Previous dan Next */
  .pagination-button.prev,
  .pagination-button.next {
    background-color: var(--primary-500); /* Background biru */
    color: #ffffff; /* Teks putih */
    width: auto; /* Lebar otomatis */
    padding: 10px 16px; /* Padding tambahan untuk ikon */
    font-size: 16px; /* Ukuran ikon lebih besar */
  }
  
  .pagination-button.prev:hover,
  .pagination-button.next:hover {
    background-color: var(--primary-700); /* Background lebih gelap saat hover */
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
    border-color: var(--primary-500); /* Warna border saat hover */
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
  
  
  /* Styling untuk Indikator Loading */
  .loading-row {
    text-align: center;
  }
  
  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100px; /* Sesuaikan tinggi */
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
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
  
  /* Styling untuk Pesan "Tidak Ada Data" */
  .no-data {
    text-align: center;
    color: #9aa0a8;
    font-size: 16px;
    font-weight: 500;
  }
  </style>