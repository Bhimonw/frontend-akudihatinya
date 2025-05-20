<!-- components/modals/AddNewPatient.vue -->
<template>
  <div class="modal-backdrop">
    <div class="modal-container">
      <div class="modal-header">
        <h2><font-awesome-icon :icon="['fas', 'user-plus']" class="icon-margin" /> Tambah Data Pasien</h2>
        <button class="close-button" @click="closeModal" aria-label="Close">
          <font-awesome-icon :icon="['fas', 'times']" />
        </button>
      </div>
      
      <div class="modal-body">
        <div class="new-patient-form">
          <form @submit.prevent="submitForm">
            <!-- Form sections with cards -->
            <div class="form-section">
              <div class="section-header">
                <font-awesome-icon :icon="['fas', 'id-card']" class="section-icon" />
                <h3>Informasi Dasar</h3>
              </div>
              
              <div class="form-row">
                <!-- Nama Pasien -->
                <div class="form-group">
                  <label for="name">Nama Pasien <span class="required">*</span></label>
                  <div class="input-wrapper">
                    <font-awesome-icon :icon="['fas', 'user']" class="input-icon" />
                    <input
                      type="text"
                      id="name"
                      v-model="form.name"
                      @input="clearError('name')"
                      class="form-input"
                      :class="{ 'input-error': errors.name }"
                      placeholder="Masukkan nama lengkap"
                    />
                  </div>
                  <transition name="fade">
                    <p v-if="errors.name" class="error-message">
                      <font-awesome-icon :icon="['fas', 'exclamation-circle']" /> 
                      Nama pasien wajib diisi
                    </p>
                  </transition>
                </div>

                <!-- NIK -->
                <div class="form-group">
                  <label for="nik">NIK</label>
                  <div class="input-wrapper">
                    <font-awesome-icon :icon="['fas', 'id-card']" class="input-icon" />
                    <input
                      type="text"
                      id="nik"
                      v-model="form.nik"
                      class="form-input"
                      placeholder="16 digit NIK"
                      maxlength="16"
                    />
                  </div>
                  <small class="helper-text">Kosongkan jika tidak ada</small>
                </div>
              </div>

              <div class="form-row">
                <!-- Nomor BPJS -->
                <div class="form-group">
                  <label for="bpjs">Nomor BPJS</label>
                  <div class="input-wrapper">
                    <font-awesome-icon :icon="['fas', 'hospital']" class="input-icon" />
                    <input
                      type="text"
                      id="bpjs"
                      v-model="form.bpjs"
                      class="form-input"
                      placeholder="Nomor BPJS (jika ada)"
                    />
                  </div>
                  <small class="helper-text">Kosongkan jika tidak ada</small>
                </div>

                <!-- Jenis Kelamin -->
                <div class="form-group">
                  <label for="gender">Jenis Kelamin <span class="required">*</span></label>
                  <div class="input-wrapper">
                    <font-awesome-icon :icon="['fas', 'venus-mars']" class="input-icon" />
                    <select
                      id="gender"
                      v-model="form.gender"
                      @input="clearError('gender')"
                      class="form-select"
                      :class="{ 'input-error': errors.gender }"
                    >
                      <option value="" disabled selected>Pilih Jenis Kelamin</option>
                      <option value="male">Laki-laki</option>
                      <option value="female">Perempuan</option>
                    </select>
                  </div>
                  <transition name="fade">
                    <p v-if="errors.gender" class="error-message">
                      <font-awesome-icon :icon="['fas', 'exclamation-circle']" />
                      Jenis kelamin wajib dipilih
                    </p>
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
                <!-- Tanggal Lahir -->
                <div class="form-group">
                  <label for="dob">Tanggal Lahir</label>
                  <div class="input-wrapper">
                    <font-awesome-icon :icon="['fas', 'calendar']" class="input-icon" />
                    <input
                      type="date"
                      id="dob"
                      v-model="form.dob"
                      @change="calculateAge"
                      class="form-input date-input"
                      :max="maxDate"
                    />
                  </div>
                  <small class="helper-text">Format: DD/MM/YYYY</small>
                </div>

                <!-- Umur -->
                <div class="form-group">
                  <label for="age">Umur <span class="required">*</span></label>
                  <div class="input-wrapper">
                    <font-awesome-icon :icon="['fas', 'birthday-cake']" class="input-icon" />
                    <input
                      type="number"
                      id="age"
                      v-model="form.age"
                      @input="clearError('age')"
                      class="form-input"
                      :class="{ 'input-error': errors.age }"
                      :disabled="isAgeDisabled"
                      placeholder="Usia pasien"
                      min="0"
                      max="150"
                    />
                    <span v-if="isAgeDisabled" class="badge-auto">Auto</span>
                  </div>
                  <transition name="fade">
                    <p v-if="errors.age" class="error-message">
                      <font-awesome-icon :icon="['fas', 'exclamation-circle']" />
                      Umur wajib diisi
                    </p>
                  </transition>
                </div>
              </div>
            </div>

            <div class="form-section">
              <div class="section-header">
                <font-awesome-icon :icon="['fas', 'map-marker-alt']" class="section-icon" />
                <h3>Alamat</h3>
              </div>
              
              <!-- Alamat -->
              <div class="form-group full-width">
                <label for="address">Alamat Lengkap <span class="required">*</span></label>
                <div class="input-wrapper textarea-wrapper">
                  <font-awesome-icon :icon="['fas', 'home']" class="input-icon textarea-icon" />
                  <textarea
                    id="address"
                    v-model="form.address"
                    @input="clearError('address')"
                    class="form-textarea"
                    :class="{ 'input-error': errors.address }"
                    placeholder="Masukkan alamat lengkap pasien"
                    rows="3"
                  ></textarea>
                </div>
                <transition name="fade">
                  <p v-if="errors.address" class="error-message">
                    <font-awesome-icon :icon="['fas', 'exclamation-circle']" />
                    Alamat wajib diisi
                  </p>
                </transition>
              </div>
            </div>

            <!-- Tombol Aksi -->
            <div class="form-actions">
              <button type="button" class="btn-cancel" @click="closeModal">
                <font-awesome-icon :icon="['fas', 'times']" /> Batal
              </button>
              <button 
                type="submit" 
                class="btn-save"
                :disabled="isSubmitting"
              >
                <span v-if="isSubmitting">
                  <font-awesome-icon :icon="['fas', 'spinner']" spin /> Menyimpan...
                </span>
                <span v-else>
                  <font-awesome-icon :icon="['fas', 'save']" /> Simpan
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template> 

<script>
import Swal from 'sweetalert2';

export default {
  data() {
    return {
      form: {
        name: "",
        nik: "",
        bpjs: "",
        gender: "",
        dob: "",
        age: "",
        address: ""
      },
      errors: {
        name: false,
        gender: false,
        age: false,
        address: false,
      },
      isAgeDisabled: false,
      isSubmitting: false,
      maxDate: new Date().toISOString().split('T')[0], // Today's date as max date
    };
  },
  methods: {
    validateForm() {
      let isValid = true;

      // Reset errors
      Object.keys(this.errors).forEach(key => {
        this.errors[key] = false;
      });

      // Validate required fields
      if (!this.form.name.trim()) {
        this.errors.name = true;
        isValid = false;
        this.scrollToError('name');
      }
      
      if (!this.form.gender) {
        this.errors.gender = true;
        isValid = false;
        if (isValid) this.scrollToError('gender');
      }
      
      if (!this.form.age) {
        this.errors.age = true;
        isValid = false;
        if (isValid) this.scrollToError('age');
      }
      
      if (!this.form.address.trim()) {
        this.errors.address = true;
        isValid = false;
        if (isValid) this.scrollToError('address');
      }

      // Validate NIK if provided (must be 16 digits)
      if (this.form.nik && !/^\d{16}$/.test(this.form.nik)) {
        Swal.fire({
          icon: 'warning',
          title: 'Perhatian',
          text: 'NIK harus terdiri dari 16 digit angka',
        });
        isValid = false;
      }

      return isValid;
    },
    
    scrollToError(fieldId) {
      // Scroll to first error
      setTimeout(() => {
        const errorElement = document.getElementById(fieldId);
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          errorElement.focus();
        }
      }, 100);
    },
    
    calculateAge() {
      if (this.form.dob) {
        const today = new Date();
        const birthDate = new Date(this.form.dob);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDifference = today.getMonth() - birthDate.getMonth();
        if (
          monthDifference < 0 ||
          (monthDifference === 0 && today.getDate() < birthDate.getDate())
        ) {
          age--;
        }
        this.form.age = age;
        this.isAgeDisabled = true;
        this.clearError('age'); // Clear age error if it was previously set
      } else {
        this.form.age = "";
        this.isAgeDisabled = false;
      }
    },
    
    async submitForm() {
      // Validasi form terlebih dahulu
      if (!this.validateForm()) {
        return;
      }

      // Tampilkan dialog konfirmasi dengan SweetAlert2
      const result = await Swal.fire({
        title: 'Konfirmasi',
        text: 'Apakah Anda yakin akan menyimpan data ini?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Ya, Simpan',
        cancelButtonText: 'Batal',
        confirmButtonColor: '#10B981', // Match primary color
        cancelButtonColor: '#6B7280',
      });

      // Jika pengguna membatalkan, hentikan proses
      if (!result.isConfirmed) {
        return;
      }

      try {
        this.isSubmitting = true;
        
        // Format data sesuai dengan spesifikasi API
        const formData = {
          name: this.form.name,
          nik: this.form.nik || "", // Mengizinkan kosong
          bpjs_number: this.form.bpjs || "", // Mengizinkan kosong
          gender: this.form.gender,
          birth_date: this.form.dob || null, // Mengizinkan kosong
          age: parseInt(this.form.age),
          address: this.form.address,
          has_ht: false,
          has_dm: false
        };

        // Emit event submit dengan data yang sudah diformat
        this.$emit("submit", formData);

        // Tampilkan notifikasi sukses
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Data pasien berhasil disimpan',
          confirmButtonColor: '#10B981', // Match primary color
          timer: 2000,
          timerProgressBar: true
        });

        // Tutup modal
        this.closeModal();
      } catch (error) {
        console.error("Error saving patient:", error);

        // Tampilkan notifikasi error jika terjadi kesalahan
        Swal.fire({
          icon: 'error',
          title: 'Gagal Menyimpan',
          text: 'Terjadi kesalahan saat menyimpan data. Silakan coba lagi.',
          confirmButtonColor: '#10B981', // Match primary color
        });
      } finally {
        this.isSubmitting = false;
      }
    },
    
    closeModal() {
      // Reset form to avoid data persisting if modal reopened
      this.resetForm();
      this.$emit("close");
    },

    clearError(fieldName) {
      if (this.errors[fieldName]) {
        this.errors[fieldName] = false;
      }
    },
    
    resetForm() {
      // Reset form data
      this.form = {
        name: "",
        nik: "",
        bpjs: "",
        gender: "",
        dob: "",
        age: "",
        address: ""
      };
      
      // Reset errors
      Object.keys(this.errors).forEach(key => {
        this.errors[key] = false;
      });
      
      this.isAgeDisabled = false;
      this.isSubmitting = false;
    }
  },
};
</script>

<style scoped>
/* Variables for consistent colors */
:root {
  --primary-50: #ECFDF5;
  --primary-100: #D1FAE5;
  --primary-200: #A7F3D0;
  --primary-300: #6EE7B7;
  --primary-400: #34D399;
  --primary-500: #10B981; /* Main primary color */
  --primary-600: #059669;
  --primary-700: #047857;
  --primary-800: #065F46;
  --primary-900: #064E3B;
  
  --neutral-50: #F9FAFB;
  --neutral-100: #F3F4F6;
  --neutral-200: #E5E7EB;
  --neutral-300: #D1D5DB;
  --neutral-400: #9CA3AF;
  --neutral-500: #6B7280;
  --neutral-600: #4B5563;
  --neutral-700: #374151;
  --neutral-800: #1F2937;
  --neutral-900: #111827;
  
  --danger-50: #FEF2F2;
  --danger-500: #EF4444;
  --danger-700: #B91C1C;
  
  --warning-500: #F59E0B;
  
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

/* Modal Backdrop - Improved with animation */
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

/* Modal Container - Updated with smoother corners and shadow */
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

/* Modal Header - Updated with more emphasis and better spacing */
.modal-header {
  padding: 18px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--neutral-200);
  background-color: var(--primary-50);
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--primary-700);
  display: flex;
  align-items: center;
}

.icon-margin {
  margin-right: 10px;
  color: var(--primary-500);
}

.close-button {
  background: transparent;
  border: none;
  font-size: 20px;
  color: var(--neutral-500);
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
  background-color: var(--neutral-200);
  color: var(--neutral-800);
}

/* Modal Body - Improved scrolling and padding */
.modal-body {
  padding: 24px;
  flex-grow: 1;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--neutral-400) var(--neutral-100);
}

.modal-body::-webkit-scrollbar {
  width: 8px;
}

.modal-body::-webkit-scrollbar-track {
  background: var(--neutral-100);
  border-radius: 10px;
}

.modal-body::-webkit-scrollbar-thumb {
  background-color: var(--neutral-400);
  border-radius: 10px;
}

/* Form Sections - New card-based sections */
.form-section {
  background-color: white;
  border-radius: 10px;
  border: 1px solid var(--neutral-200);
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.3s ease;
}

.form-section:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--neutral-200);
}

.section-icon {
  font-size: 18px;
  color: var(--primary-500);
  margin-right: 12px;
}

.section-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--neutral-700);
}

.new-patient-form {
  width: 100%;
}

/* Form Row - Better responsive layout */
.form-row {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

/* Form Groups - Improved spacing and organization */
.form-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0; /* Ensure text truncation works */
}

.form-group.full-width {
  width: 100%;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
  color: var(--neutral-700);
  display: flex;
  align-items: center;
}

.required {
  color: var(--danger-500);
  margin-left: 4px;
}

/* Input Wrappers with Icons */
.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 12px;
  color: var(--neutral-500);
  font-size: 16px;
  pointer-events: none;
  transition: color 0.3s ease;
}

.textarea-wrapper {
  align-items: flex-start;
}

.textarea-icon {
  top: 12px;
}

/* Input Styling - Enhanced with icons and focus states */
.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 12px 12px 12px 40px;
  border: 1px solid var(--neutral-300);
  border-radius: 8px;
  font-size: 14px;
  color: var(--neutral-800);
  background-color: white;
  transition: all 0.3s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.form-input:hover,
.form-select:hover,
.form-textarea:hover {
  border-color: var(--primary-300);
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  border-color: var(--primary-500);
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
  outline: none;
}

.form-input:focus + .input-icon,
.form-select:focus + .input-icon,
.form-textarea:focus + .input-icon {
  color: var(--primary-500);
}

.date-input {
  padding-right: 12px; /* Allow space for date picker icon */
}

.input-error {
  border-color: var(--danger-500) !important;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
}

.form-textarea {
  min-height: 100px;
  resize: vertical;
  line-height: 1.5;
}

/* Auto-calculated badge */
.badge-auto {
  position: absolute;
  right: 12px;
  background-color: var(--primary-100);
  color: var(--primary-700);
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

/* Helper text */
.helper-text {
  margin-top: 4px;
  font-size: 12px;
  color: var(--neutral-500);
}

/* Error Message - Improved with icon and animation */
.error-message {
  margin-top: 4px;
  font-size: 12px;
  color: var(--danger-500);
  display: flex;
  align-items: center;
  gap: 6px;
}

/* Fade transition for error messages */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}

/* Form Actions - Better button styling and position */
.form-actions {
  margin-top: 32px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 20px;
  border-top: 1px solid var(--neutral-200);
}

/* Cancel Button */
.btn-cancel {
  padding: 12px 20px;
  background-color: white;
  border: 1px solid var(--neutral-300);
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: var(--neutral-700);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-cancel:hover {
  background-color: var(--neutral-100);
  border-color: var(--neutral-400);
}

/* Save Button */
.btn-save {
  padding: 12px 20px;
  background-color: var(--primary-500);
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
  background-color: var(--primary-600);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.btn-save:active {
  background-color: var(--primary-700);
  transform: translateY(1px);
}

.btn-save:disabled {
  background-color: var(--neutral-400);
  cursor: not-allowed;
  opacity: 0.7;
}

/* Responsive Design Improvements */
@media (max-width: 768px) {
  .modal-container {
    width: 95%;
    max-height: 95vh;
  }

  .form-row {
    flex-direction: column;
    gap: 16px;
  }
  
  .modal-header h2 {
    font-size: 18px;
  }
  
  .section-header h3 {
    font-size: 16px;
  }
  
  .form-actions {
    flex-direction: column-reverse;
  }
  
  .btn-cancel, .btn-save {
    width: 100%;
    justify-content: center;
  }
}
</style>