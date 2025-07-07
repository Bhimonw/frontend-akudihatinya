<template>
  <div v-if="visible" class="modal-backdrop">
    <div class="modal-container">
      <div class="modal-header">
        <h2><font-awesome-icon :icon="['fas', 'user-edit']" class="icon-margin" /> Edit Data Pasien</h2>
        <button class="close-button" @click="closeModal" aria-label="Close">
          <font-awesome-icon :icon="['fas', 'times']" />
        </button>
      </div>
      
      <div class="modal-body">
        <div class="new-patient-form">
          <form @submit.prevent="submitForm">
            <div class="form-section">
              <div class="section-header">
                <font-awesome-icon :icon="['fas', 'id-card']" class="section-icon" />
                <h3>Informasi Dasar</h3>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label for="name">Nama Pasien <span class="required">*</span></label>
                  <div class="input-wrapper">
                    <font-awesome-icon :icon="['fas', 'user']" class="input-icon" />
                    <input type="text" id="name" v-model="form.name" @input="clearError('name')" class="form-input" :class="{ 'input-error': errors.name }" placeholder="Masukkan nama lengkap" />
                  </div>
                  <transition name="fade">
                    <p v-if="errors.name" class="error-message"><font-awesome-icon :icon="['fas', 'exclamation-circle']" /> Nama pasien wajib diisi</p>
                  </transition>
                </div>
                <div class="form-group">
                  <label for="nik">NIK</label>
                  <div class="input-wrapper">
                    <font-awesome-icon :icon="['fas', 'id-card']" class="input-icon" />
                    <input type="text" id="nik" v-model="form.nik" class="form-input" placeholder="16 digit NIK" maxlength="16" />
                  </div>
                  <small class="helper-text">Kosongkan jika tidak ada</small>
                  <transition name="fade">
                    <p v-if="errors.phone_number" class="error-message"><font-awesome-icon :icon="['fas', 'exclamation-circle']" /> Nomor telepon harus 10-15 digit angka</p>
                  </transition>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label for="phone_number">Nomor Telepon</label>
                  <div class="input-wrapper">
                    <font-awesome-icon :icon="['fas', 'phone']" class="input-icon" />
                    <input type="text" id="phone_number" v-model="form.phone_number" @input="handlePhoneInput" class="form-input" :class="{ 'input-error': errors.phone_number }" placeholder="Contoh: 081234567890" maxlength="15" />
                  </div>
                  <small class="helper-text">Kosongkan jika tidak ada</small>
                </div>
                <div class="form-group">
                  <label for="bpjs_number">Nomor BPJS</label>
                  <div class="input-wrapper">
                    <font-awesome-icon :icon="['fas', 'hospital']" class="input-icon" />
                    <input type="text" id="bpjs_number" v-model="form.bpjs_number" class="form-input" placeholder="13 digit nomor BPJS" maxlength="13" />
                  </div>
                   <small class="helper-text">Kosongkan jika tidak ada</small>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label for="gender">Jenis Kelamin <span class="required">*</span></label>
                  <div class="input-wrapper">
                    <font-awesome-icon :icon="['fas', 'venus-mars']" class="input-icon" />
                    <select id="gender" v-model="form.gender" @change="clearError('gender')" class="form-select" :class="{ 'input-error': errors.gender }">
                      <option value="" disabled>Pilih Jenis Kelamin</option>
                      <option value="male">Laki-laki</option>
                      <option value="female">Perempuan</option>
                    </select>
                  </div>
                  <transition name="fade">
                    <p v-if="errors.gender" class="error-message"><font-awesome-icon :icon="['fas', 'exclamation-circle']" /> Jenis kelamin wajib dipilih</p>
                  </transition>
                </div>
              </div>
            </div>

            <div class="form-section">
              <div class="section-header">
                <font-awesome-icon :icon="['fas', 'calendar-alt']" class="section-icon" />
                <h3>Informasi Usia</h3>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label for="birth_date">Tanggal Lahir</label>
                   <div class="input-wrapper">
                    <font-awesome-icon :icon="['fas', 'calendar']" class="input-icon" />
                    <input type="date" id="birth_date" v-model="form.birth_date" @change="calculateAge" class="form-input date-input" :max="maxDate" />
                  </div>
                  <small class="helper-text">Kosongkan untuk mengisi umur manual</small>
                </div>
                <div class="form-group">
                  <label for="age">Umur <span class="required">*</span></label>
                  <div class="input-wrapper">
                    <font-awesome-icon :icon="['fas', 'birthday-cake']" class="input-icon" />
                    <input type="number" id="age" v-model.number="form.age" @input="clearError('age')" class="form-input" :class="{ 'input-error': errors.age }" :disabled="isAgeDisabled" placeholder="Usia pasien" min="0" max="150" />
                    <span v-if="isAgeDisabled && form.birth_date" class="badge-auto">Auto</span>
                  </div>
                  <transition name="fade">
                    <p v-if="errors.age" class="error-message"><font-awesome-icon :icon="['fas', 'exclamation-circle']" /> Umur wajib diisi</p>
                  </transition>
                </div>
              </div>
            </div>

            <div class="form-section">
              <div class="section-header">
                <font-awesome-icon :icon="['fas', 'map-marker-alt']" class="section-icon" />
                <h3>Alamat</h3>
              </div>
              <div class="form-group full-width">
                <label for="address">Alamat Lengkap <span class="required">*</span></label>
                <div class="input-wrapper textarea-wrapper">
                  <font-awesome-icon :icon="['fas', 'home']" class="input-icon textarea-icon" />
                  <textarea id="address" v-model="form.address" @input="clearError('address')" class="form-textarea" :class="{ 'input-error': errors.address }" placeholder="Masukkan alamat lengkap pasien" rows="3"></textarea>
                </div>
                <transition name="fade">
                  <p v-if="errors.address" class="error-message"><font-awesome-icon :icon="['fas', 'exclamation-circle']" /> Alamat wajib diisi</p>
                </transition>
              </div>
            </div>

            <div class="form-actions">
              <button type="button" class="btn-cancel" @click="closeModal" :disabled="isSubmitting">
                <font-awesome-icon :icon="['fas', 'times']" /> Batal
              </button>
              <button type="submit" class="btn-save" :disabled="isSubmitting">
                <span v-if="isSubmitting"><font-awesome-icon :icon="['fas', 'spinner']" spin /> Menyimpan...</span>
                <span v-else><font-awesome-icon :icon="['fas', 'save']" /> Simpan Perubahan</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// --- PERUBAHAN 1: Ganti impor axios dengan apiClient
import apiClient from '../../api.js'; // Menggunakan apiClient
import Swal from 'sweetalert2';

export default {
  name: 'EditPatientDetail',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    patientData: {
      type: Object,
      required: true
    }
  },
  emits: ['close', 'submit'], // Tambahkan 'submit' ke emits
  data() {
    return {
      form: {
        name: "",
        nik: "",
        phone_number: "",
        bpjs_number: "",
        gender: "",
        birth_date: "",
        age: null,
        address: ""
      },
      errors: {
        name: false,
        gender: false,
        age: false,
        address: false,
        phone_number: false,
      },
      isAgeDisabled: false,
      isSubmitting: false,
      maxDate: new Date().toISOString().split('T')[0],
    };
  },
  watch: {
    // Watcher tetap sama, tidak ada perubahan
    visible(newVal) {
      if (newVal) {
        this.initializeFormFromProps();
      } else {
        this.resetForm();
      }
    },
    patientData: {
      handler(newData) {
        if (this.visible && newData) {
          this.initializeFormFromProps();
        }
      },
      deep: true
    },
  },
  methods: {
    // Metode lain (initialize, calculateAge, validate, dll) tetap sama
    initializeFormFromProps() {
      if (this.patientData && Object.keys(this.patientData).length > 0) {
        this.form = {
          name: this.patientData.name || '',
          // Normalisasi nilai gender dari 'Laki-Laki'/'Perempuan' ke 'male'/'female'
          gender: this.patientData.gender === 'Perempuan' ? 'female' : (this.patientData.gender === 'Laki-Laki' || this.patientData.gender === 'male' ? 'male' : ''),
          nik: (this.patientData.nik && this.patientData.nik !== '-') ? this.patientData.nik : '',
          phone_number: (this.patientData.phone_number && this.patientData.phone_number !== '-') ? this.patientData.phone_number : '',
          bpjs_number: (this.patientData.bpjs_number && this.patientData.bpjs_number !== '-') ? this.patientData.bpjs_number : '',
          birth_date: (this.patientData.birth_date && this.patientData.birth_date !== '-') ? this.patientData.birth_date : '',
          age: this.parseAge(this.patientData.age),
          address: (this.patientData.address && this.patientData.address !== '-') ? this.patientData.address : ''
        };
        this.calculateAge(); // Hitung ulang umur & status disable
        Object.keys(this.errors).forEach(key => { this.errors[key] = false; });
      } else {
        this.resetForm();
      }
    },
    parseAge(ageValue) {
      if (ageValue === null || ageValue === undefined || ageValue === '-') return null;
      const parsed = parseInt(ageValue);
      return isNaN(parsed) ? null : parsed;
    },
    closeModal() {
      this.$emit('close');
    },
    calculateAge() {
      if (this.form.birth_date) {
        const birthDateObj = new Date(this.form.birth_date);
        if (isNaN(birthDateObj.getTime())) {
            this.isAgeDisabled = false;
            return;
        }
        const today = new Date();
        let age = today.getFullYear() - birthDateObj.getFullYear();
        const monthDifference = today.getMonth() - birthDateObj.getMonth();
        if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDateObj.getDate())) {
          age--;
        }
        this.form.age = age >= 0 ? age : null;
        this.isAgeDisabled = true;
        this.clearError('age');
      } else {
        this.isAgeDisabled = false;
      }
    },
    validateForm() {
        let isValid = true;
        Object.keys(this.errors).forEach(key => { this.errors[key] = false; });

        if (!this.form.name.trim()) { this.errors.name = true; isValid = false; }
        if (!this.form.gender) { this.errors.gender = true; isValid = false; }
        const ageNum = this.form.age !== null && this.form.age !== '' ? parseInt(this.form.age) : null;
        if (ageNum === null || isNaN(ageNum) || ageNum < 0 || ageNum > 150) { this.errors.age = true; isValid = false; }
        if (!this.form.address.trim()) { this.errors.address = true; isValid = false; }
        
        if (this.form.nik && !/^\d{16}$/.test(this.form.nik)) {
            Swal.fire('Perhatian', 'NIK harus terdiri dari 16 digit angka jika diisi.', 'warning');
            isValid = false;
        }
        if (this.form.phone_number && (!/^\d{10,15}$/.test(this.form.phone_number))) {
            Swal.fire('Perhatian', 'Nomor telepon harus terdiri dari 10-15 digit angka jika diisi.', 'warning');
            isValid = false;
        }
         if (this.form.bpjs_number && !/^\d{13}$/.test(this.form.bpjs_number)) {
            Swal.fire('Perhatian', 'Nomor BPJS harus terdiri dari 13 digit angka jika diisi.', 'warning');
            isValid = false;
        }
        return isValid;
    },
    clearError(fieldName) {
      if (this.errors[fieldName]) {
        this.errors[fieldName] = false;
      }
    },
    handlePhoneInput(event) {
      // Hanya izinkan angka
      const value = event.target.value.replace(/\D/g, '');
      this.form.phone_number = value;
      
      // Clear error jika panjang sudah valid
      if (value.length >= 10) {
        this.clearError('phone_number');
      }
    },
    resetForm() {
      this.form = { name: "", nik: "", phone_number: "", bpjs_number: "", gender: "", birth_date: "", age: null, address: "" };
      Object.keys(this.errors).forEach(key => { this.errors[key] = false; });
      this.isAgeDisabled = false;
      this.isSubmitting = false;
    },
    
    // --- PERUBAHAN 2: Metode submitForm diubah untuk menggunakan apiClient ---
    async submitForm() {
      if (!this.validateForm()) {
        // Tampilkan notifikasi jika validasi gagal, fokus ke field pertama yang error
        const firstError = Object.keys(this.errors).find(key => this.errors[key]);
        if(firstError) {
            const element = document.getElementById(firstError);
            if(element) element.focus();
        }
        return;
      }
      
      const result = await Swal.fire({
        title: 'Konfirmasi Perubahan',
        text: 'Anda yakin ingin menyimpan perubahan pada data pasien ini?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Ya, Simpan',
        cancelButtonText: 'Batal',
        confirmButtonColor: '#10B981',
        cancelButtonColor: '#6B7280',
      });

      if (!result.isConfirmed) return;

      this.isSubmitting = true;

      const patientId = this.patientData.id;
      if (!patientId) {
        Swal.fire('Error', 'ID Pasien tidak valid.', 'error');
        this.isSubmitting = false;
        return;
      }

      // Payload disiapkan dari form state
      const payload = {
        name: this.form.name,
        nik: this.form.nik || null,
        phone_number: this.form.phone_number || null,
        bpjs_number: this.form.bpjs_number || null,
        address: this.form.address,
        gender: this.form.gender,
        birth_date: this.form.birth_date || null,
        age: this.form.age ? parseInt(this.form.age) : null,
      };

      try {
        // --- PERUBAHAN 3: Menggunakan apiClient.put dengan URL relatif dan tanpa header manual ---
        const response = await apiClient.put(
          `/puskesmas/patients/${patientId}`,
          payload
        );

        Swal.fire({
            icon: 'success',
            title: 'Berhasil!',
            text: 'Data pasien berhasil diperbarui.',
            timer: 2000,
            showConfirmButton: false,
            timerProgressBar: true
        });

        this.$emit('submit', response.data.patient);
        this.closeModal();

      } catch (error) {
        // --- PERUBAHAN 4: Standarisasi penanganan error ---
        let errorMessage = 'Terjadi kesalahan saat memperbarui data.';
        if (error.response) {
            console.error("API Error:", error.response.data);
            if (error.response.data && error.response.data.message) {
                errorMessage = error.response.data.message;
            } else if (error.response.status === 422 && error.response.data.errors) {
                const errorsArray = Object.values(error.response.data.errors).flat();
                errorMessage = errorsArray.join('\n');
            }
        } else {
            console.error("Network/Request Error:", error.message);
            errorMessage = "Tidak dapat terhubung ke server. Periksa koneksi Anda.";
        }
        Swal.fire('Gagal Menyimpan', errorMessage, 'error');
      } finally {
        this.isSubmitting = false;
      }
    }
  }
};
</script>

<style scoped>
/* STYLE TIDAK BERUBAH */
:root {
  --primary-50: #ECFDF5;
  --primary-100: #D1FAE5;
  --primary-300: #6EE7B7;
  --primary-500: #10B981;
  --primary-600: #059669;
  --primary-700: #047857;
  --neutral-100: #F3F4F6;
  --neutral-200: #E5E7EB;
  --neutral-300: #D1D5DB;
  --neutral-400: #9CA3AF;
  --neutral-500: #6B7280;
  --neutral-700: #374151;
  --neutral-800: #1F2937;
  --danger-500: #EF4444;
}

.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-container {
  width: 90%;
  max-width: 900px;
  max-height: 90vh;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: slideIn 0.2s ease-out;
}

@keyframes slideIn {
  from { transform: translateY(10px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.modal-header {
  padding: 18px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--neutral-200, #E5E7EB);
  background-color: var(--primary-50, #ECFDF5);
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--primary-700, #047857);
  display: flex;
  align-items: center;
}

.icon-margin {
  margin-right: 10px;
  color: var(--primary-500, #10B981);
}

.close-button {
  background: transparent;
  border: none;
  font-size: 20px;
  color: var(--neutral-500, #6B7280);
  cursor: pointer;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.close-button:hover {
  background-color: var(--neutral-200, #E5E7EB);
  color: var(--neutral-800, #1F2937);
}

.modal-body {
  padding: 24px;
  flex-grow: 1;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--neutral-400, #9CA3AF) var(--neutral-100, #F3F4F6);
}

.modal-body::-webkit-scrollbar {
  width: 8px;
}
.modal-body::-webkit-scrollbar-track {
  background: var(--neutral-100, #F3F4F6);
  border-radius: 10px;
}
.modal-body::-webkit-scrollbar-thumb {
  background-color: var(--neutral-400, #9CA3AF);
  border-radius: 10px;
}

.form-section {
  background-color: white;
  border-radius: 10px;
  border: 1px solid var(--neutral-200, #E5E7EB);
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.3s ease;
}

.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--neutral-200, #E5E7EB);
}
.section-icon {
  font-size: 18px;
  color: var(--primary-500, #10B981);
  margin-right: 12px;
}
.section-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--neutral-700, #374151);
}

.form-row {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.form-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.form-group.full-width {
  flex-basis: 100%;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
  color: var(--neutral-700, #374151);
  display: flex;
  align-items: center;
}
.required {
  color: var(--danger-500, #EF4444);
  margin-left: 4px;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}
.input-icon {
  position: absolute;
  left: 12px;
  color: var(--neutral-500, #6B7280);
  font-size: 16px;
  pointer-events: none;
}
.textarea-wrapper { align-items: flex-start; }
.textarea-icon { top: 12px; }

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 12px 12px 12px 40px;
  border: 1px solid var(--neutral-300, #D1D5DB);
  border-radius: 8px;
  font-size: 14px;
  color: var(--neutral-800, #1F2937);
  background-color: white;
  transition: all 0.3s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  box-sizing: border-box;
}

.form-input:hover, .form-select:hover, .form-textarea:hover {
  border-color: var(--primary-300, #6EE7B7);
}
.form-input:focus, .form-select:focus, .form-textarea:focus {
  border-color: var(--primary-500, #10B981);
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
  outline: none;
}
.input-wrapper:focus-within .input-icon {
    color: var(--primary-500, #10B981);
}

.date-input { padding-right: 12px; }
.input-error {
  border-color: var(--danger-500, #EF4444) !important;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
}
.form-textarea {
  min-height: 100px;
  resize: vertical;
  line-height: 1.5;
  padding-top: 12px;
}

.badge-auto {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background-color: var(--primary-100, #D1FAE5);
  color: var(--primary-700, #047857);
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}
.helper-text {
  margin-top: 4px;
  font-size: 12px;
  color: var(--neutral-500, #6B7280);
}
.error-message {
  margin-top: 4px;
  font-size: 12px;
  color: var(--danger-500, #EF4444);
  display: flex;
  align-items: center;
  gap: 6px;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}

.form-actions {
  margin-top: 32px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 20px;
  border-top: 1px solid var(--neutral-200, #E5E7EB);
}
.btn-cancel {
  padding: 12px 20px;
  background-color: white;
  border: 1px solid var(--neutral-300, #D1D5DB);
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: var(--neutral-700, #374151);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}
.btn-cancel:hover {
  background-color: var(--neutral-100, #F3F4F6);
  border-color: var(--neutral-400, #9CA3AF);
}
.btn-save {
  padding: 12px 20px;
  background-color: var(--primary-500, #10B981);
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 120px;
  justify-content: center;
}
.btn-save:hover {
  background-color: var(--primary-600, #059669);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}
.btn-save:active {
  background-color: var(--primary-700, #047857);
  transform: translateY(1px);
}
.btn-save:disabled {
  background-color: var(--neutral-400, #9CA3AF);
  cursor: not-allowed;
  opacity: 0.7;
}

@media (max-width: 768px) {
  .modal-container { width: 95%; max-height: 95vh; }
  .form-row { flex-direction: column; gap: 0; }
  .form-group { margin-bottom: 16px; }
  .form-actions { flex-direction: column-reverse; }
  .btn-cancel, .btn-save { width: 100%; justify-content: center; }
}
</style>