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
                  <td>{{ index + 1 }}</td>
                  <td>{{ patient.name }}</td>
                  <td>{{ patient.nik }}</td>
                  <td>{{ patient.bpjs }}</td>
                  <td>{{ patient.gender }}</td>
                  <td>{{ patient.dob }}</td>
                  <td>{{ patient.age }}</td>
                  <td>{{ patient.address }}</td>
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
      formData: {
        id: null,
        name: "",
        nik: "",
        bpjs: "",
        gender: "",
        dob: "",
        age: "",
        address: "",
      },
      isLoading: false, // State untuk loading
    };
  },
  computed: {
    filteredPatients() {
      if (!this.searchPatientQuery) {
        return this.patients;
      }
      const searchTerm = this.searchPatientQuery.toLowerCase();
      return this.patients.filter((patient) => {
        return (
          patient.name.toLowerCase().includes(searchTerm) ||
          patient.nik.includes(searchTerm) ||
          (patient.bpjs && patient.bpjs.includes(searchTerm))
        );
      });
    },
  },
  methods: {
    async fetchPatients() {
      this.isLoading = true; // Aktifkan loading
      try {
        const token = localStorage.getItem("token"); // Ambil token dari localStorage
        if (!token) {
          console.error("Token tidak ditemukan");
          return;
        }
        const response = await axios.get("http://localhost:8000/api/puskesmas/patients", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        // Validasi struktur respons API
        if (!response.data || !response.data.data) {
          console.error("Invalid API response structure:", response.data);
          alert("Terjadi kesalahan: Struktur respons API tidak sesuai.");
          return;
        }
        // Proses respons API
        this.patients = response.data.data.map((patient) => ({
          id: patient.id,
          name: patient.name,
          nik: patient.nik,
          bpjs: patient.bpjs_number,
          gender: patient.gender === "male" ? "Laki-laki" : "Perempuan",
          dob: patient.birth_date,
          age: patient.age,
          address: patient.address,
        }));
      } catch (error) {
        console.error("Error fetching patients:", error);
        alert("Gagal memuat data pasien. Silakan coba lagi.");
      } finally {
        this.isLoading = false; // Nonaktifkan loading
      }
    },
    closeModal() {
      this.$emit("close");
      this.resetForm();
    },
    async selectPatient(patient) {
      const confirmed = confirm("Apakah Anda yakin akan menambahkan data ini?");
      if (!confirmed) {
        return;
      }

      try {
        // Validate selectedYear
        if (!this.selectedYear) {
          console.error("Selected year is missing or invalid.");
          alert("Tahun pemeriksaan tidak valid. Silakan pilih tahun yang sesuai.");
          return;
        }

        // Convert selectedYear to a number
        const yearAsNumber = parseInt(this.selectedYear, 10);
        if (isNaN(yearAsNumber)) {
          console.error("Invalid year format:", this.selectedYear);
          alert("Format tahun tidak valid. Harap periksa input.");
          return;
        }

        // Construct the payload with year as a number
        const payload = {
          year: yearAsNumber, // Ensure year is a number
          examination_type: "dm",
        };

        console.log("Payload being sent:", payload); // Debugging: Log the payload

        const token = localStorage.getItem("token");
        if (!token) {
          console.error("Token tidak ditemukan");
          alert("Session expired. Please log in again.");
          return;
        }

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

        if (!response.data || !response.data.message) {
          console.error("Invalid API response structure:", response.data);
          alert("Terjadi kesalahan: Struktur respons API tidak sesuai.");
          return;
        }

        alert("Data berhasil ditambahkan!");
        this.$emit("submit", patient);
        this.closeModal();
      } catch (error) {
        console.error("Error adding examination year:", error.response?.data || error.message);
        alert("Gagal menambahkan tahun pemeriksaan. Silakan coba lagi.");
      }
    },
    submitNewPatient() {
      const newPatient = {
        ...this.formData,
        id: Date.now(),
      };
      this.$emit("submit", newPatient);
      this.closeModal();
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
    show: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          this.fetchPatients();
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
</style>