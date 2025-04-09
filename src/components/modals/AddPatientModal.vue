<template>
  <div class="modal-overlay" @click="closeModal">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h2>Tambah Data Pasien</h2>
        <button class="close-button" @click="closeModal">
          <font-awesome-icon :icon="['fas', 'times']" />
        </button>
      </div>
      
      <div class="modal-body">
        <!-- Patient Selection View -->
        <div v-if="!showNewPatientForm" class="patient-selection">
          <!-- Toolbar for patient selection -->
          <div class="patient-toolbar">
            <div class="search-container">
              <font-awesome-icon :icon="['fas', 'search']" class="search-icon" />
              <input 
                type="text" 
                placeholder="Cari pasien..." 
                class="search-input" 
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
                <tr v-for="(patient, index) in filteredPatients" :key="patient.id">
                  <td>{{ index + 1 }}</td>
                  <td>{{ patient.name }}</td>
                  <td>{{ patient.nik }}</td>
                  <td>{{ patient.bpjs }}</td>
                  <td>{{ patient.gender }}</td>
                  <td>{{ patient.dob }}</td>
                  <td>{{ patient.age }}</td>
                  <td>{{ patient.address }}</td>
                  <td>
                    <button 
                      class="action-button select" 
                      @click="selectPatient(patient)"
                    >
                      Tambahkan
                    </button>
                  </td>
                </tr>
                <tr v-if="filteredPatients.length === 0">
                  <td colspan="9" class="no-data-message">
                    Tidak ada data pasien yang sesuai dengan pencarian
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div class="modal-footer">
            <button class="cancel-button" @click="closeModal">Batal</button>
          </div>
        </div>
        
        <!-- New Patient Form -->
        <div v-else class="new-patient-form">
          <form @submit.prevent="submitNewPatient">
            <!-- Form fields would go here in a real implementation -->
            <div class="form-row">
              <div class="form-group">
                <label for="name">Nama Pasien</label>
                <input type="text" id="name" v-model="formData.name" required>
              </div>
              <div class="form-group">
                <label for="nik">NIK</label>
                <input type="text" id="nik" v-model="formData.nik" required>
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="bpjs">Nomor BPJS</label>
                <input type="text" id="bpjs" v-model="formData.bpjs">
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
                <input type="date" id="dob" v-model="formData.dob" required>
              </div>
              <div class="form-group">
                <label for="age">Umur</label>
                <input type="number" id="age" v-model="formData.age" min="0" required>
              </div>
            </div>
            
            <div class="form-group full-width">
              <label for="address">Alamat</label>
              <textarea id="address" v-model="formData.address" rows="3" required></textarea>
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
export default {
  name: 'AddPatientModal',
  props: {
    existingPatients: {
      type: Array,
      default: () => {
        // Default dummy data if no patients are provided
        return [
          {
            id: 1,
            name: 'Budi Santoso',
            nik: '3171234567890001',
            bpjs: '00112233445566',
            gender: 'Laki-laki',
            dob: '1985-06-12',
            age: 38,
            address: 'Jl. Merdeka No. 123, Jakarta'
          },
          {
            id: 2,
            name: 'Siti Rahayu',
            nik: '3171234567890002',
            bpjs: '00112233445577',
            gender: 'Perempuan',
            dob: '1990-03-25',
            age: 33,
            address: 'Jl. Sudirman No. 45, Jakarta'
          },
          {
            id: 3,
            name: 'Ahmad Fadli',
            nik: '3171234567890003',
            bpjs: '00112233445588',
            gender: 'Laki-laki',
            dob: '1976-11-08',
            age: 47,
            address: 'Jl. Gatot Subroto No. 67, Jakarta'
          }
        ];
      }
    }
  },
  data() {
    return {
      showNewPatientForm: false,
      searchPatientQuery: '',
      formData: {
        id: null,
        name: '',
        nik: '',
        bpjs: '',
        gender: '',
        dob: '',
        age: '',
        address: ''
      }
    };
  },
  computed: {
    filteredPatients() {
      if (!this.searchPatientQuery) {
        return this.existingPatients;
      }
      
      const searchTerm = this.searchPatientQuery.toLowerCase();
      return this.existingPatients.filter(patient => {
        return patient.name.toLowerCase().includes(searchTerm) ||
               patient.nik.includes(searchTerm) ||
               (patient.bpjs && patient.bpjs.includes(searchTerm));
      });
    }
  },
  methods: {
    closeModal() {
      this.$emit('close');
    },
    selectPatient(patient) {
      this.$emit('submit', patient);
      this.closeModal();
    },
    submitNewPatient() {
      // Create new patient with an ID
      const newPatient = {
        ...this.formData,
        id: Date.now()
      };
      
      this.$emit('submit', newPatient);
      this.closeModal();
    },
    resetForm() {
      this.formData = {
        id: null,
        name: '',
        nik: '',
        bpjs: '',
        gender: '',
        dob: '',
        age: '',
        address: ''
      };
      this.showNewPatientForm = false;
      this.searchPatientQuery = '';
    }
  }
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
}

.close-button:hover {
  color: #333333;
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
}

.data-table {
  width: 100%;
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
</style>