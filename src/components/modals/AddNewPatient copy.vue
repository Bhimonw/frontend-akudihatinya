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
        <div class="new-patient-form">
          <form @submit.prevent="submitNewPatient">
            <div class="form-row">
              <div class="form-group">
                <label for="name">Nama Pasien</label>
                <input
                  type="text"
                  id="name"
                  v-model="formData.name"
                  :class="{ 'error-border': errors.name }"
                />
                <span v-if="errors.name" class="error-message">{{ errors.name }}</span>
              </div>
              <div class="form-group">
                <label for="nik">NIK</label>
                <input
                  type="text"
                  id="nik"
                  v-model="formData.nik"
                  :class="{ 'error-border': errors.nik }"
                />
                <span v-if="errors.nik" class="error-message">{{ errors.nik }}</span>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="bpjs">Nomor BPJS</label>
                <input
                  type="text"
                  id="bpjs"
                  v-model="formData.bpjs"
                  :class="{ 'error-border': errors.bpjs }"
                />
                <span v-if="errors.bpjs" class="error-message">{{ errors.bpjs }}</span>
              </div>
              <div class="form-group">
                <label for="gender">Jenis Kelamin</label>
                <select
                  id="gender"
                  v-model="formData.gender"
                  :class="{ 'error-border': errors.gender }"
                >
                  <option value="">Pilih Jenis Kelamin</option>
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
                <span v-if="errors.gender" class="error-message">{{ errors.gender }}</span>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="dob">Tanggal Lahir</label>
                <input
                  type="date"
                  id="dob"
                  v-model="formData.dob"
                  :class="{ 'error-border': errors.dob }"
                />
                <span v-if="errors.dob" class="error-message">{{ errors.dob }}</span>
              </div>
              <div class="form-group">
                <label for="age">Umur</label>
                <input
                  type="number"
                  id="age"
                  v-model="formData.age"
                  min="0"
                  :class="{ 'error-border': errors.age }"
                />
                <span v-if="errors.age" class="error-message">{{ errors.age }}</span>
              </div>
            </div>

            <div class="form-group full-width">
              <label for="address">Alamat</label>
              <textarea
                id="address"
                v-model="formData.address"
                rows="3"
                :class="{ 'error-border': errors.address }"
              ></textarea>
              <span v-if="errors.address" class="error-message">{{ errors.address }}</span>
            </div>

            <div class="button-container">
              <button type="button" class="cancel-button" @click="closeModal">
                Batal
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
  data() {
    return {
      formData: {
        id: null,
        name: '',
        nik: '',
        bpjs: '',
        gender: '',
        dob: '',
        age: '',
        address: ''
      },
      errors: {
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
  methods: {
    resetErrors() {
      // Reset semua pesan error
      this.errors = {
        name: '',
        nik: '',
        bpjs: '',
        gender: '',
        dob: '',
        age: '',
        address: ''
      };
    },
    validateForm() {
      // Reset errors terlebih dahulu
      this.resetErrors();
      
      let isValid = true;

      // Validasi masing-masing field yang required
      if (!this.formData.name.trim()) {
        this.errors.name = 'Nama pasien tidak boleh kosong';
        isValid = false;
      }
      
      if (!this.formData.nik.trim()) {
        this.errors.nik = 'NIK harus diisi';
        isValid = false;
      }
      
      if (!this.formData.gender) {
        this.errors.gender = 'Jenis kelamin tidak boleh kosong';
        isValid = false;
      }
      
      if (!this.formData.dob) {
        this.errors.dob = 'Tanggal lahir harus diisi';
        isValid = false;
      }
      
      if (!this.formData.age) {
        this.errors.age = 'Umur tidak boleh kosong';
        isValid = false;
      }
      
      if (!this.formData.address.trim()) {
        this.errors.address = 'Alamat tidak boleh kosong';
        isValid = false;
      }

      return isValid;
    },
    submitNewPatient() {
      if (!this.validateForm()) {
        return; // Hentikan proses jika form tidak valid
      }
      const newPatient = {
        ...this.formData,
        id: Date.now()
      };
      this.$emit('submit', newPatient);
      this.closeModal();
    },
    closeModal() {
      // Reset form dan error messages saat menutup modal
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
      this.resetErrors();
      this.$emit('close');
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

.error-border {
  border-color: #ff0000 !important;
}

.error-message {
  font-size: 12px;
  color: #ff0000;
  margin-top: 4px;
  display: block;
}

.button-container {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
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
}

/* Tambahkan atau pastikan style ini ada dalam bagian <style> di komponen Anda */

.error-border {
  border-color: red !important;
}

.error-message {
  font-size: 12px;
  color: red;
  margin-top: 4px;
  display: block; /* Pastikan ini diatur agar pesan muncul */
}

/* Tampilannya akan lebih baik dengan transisi */
input, select, textarea {
  transition: border-color 0.3s ease;
}
</style>