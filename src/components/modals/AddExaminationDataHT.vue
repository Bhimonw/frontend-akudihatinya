<template>
  <div class="modal-backdrop" v-if="visible">
    <div class="modal-container">
      <div class="modal-header">
        <h2><font-awesome-icon :icon="['fas', 'heart-pulse']" class="icon-margin" /> Tambah Data Pemeriksaan Hipertensi</h2>
        <button class="close-button" @click="$emit('close')" aria-label="Tutup">
          <font-awesome-icon :icon="['fas', 'times']" />
        </button>
      </div>

      <div class="modal-body">
        <form class="examination-form" @submit.prevent="handleSubmit">
          <div class="form-section">
            <div class="section-header">
              <font-awesome-icon :icon="['fas', 'calendar-alt']" class="section-icon" />
              <h3>Tanggal Pemeriksaan<span class="required">*</span></h3>
            </div>
            
            <div class="form-group">
              <div class="input-wrapper">
                <font-awesome-icon :icon="['fas', 'calendar-alt']" class="input-icon" />
                <VueDatePicker
                  id="date"
                  v-model="formData.date"
                  :min-date="minDate"
                  :max-date="maxDate"
                  :enable-time-picker="false"
                  :year-picker="false"
                  :format="formatDateForPicker"
                  locale="id"
                  :teleport="true"
                  placeholder="Pilih Tanggal"
                  auto-apply
                  required
                  :state="errors.date ? false : null"
                  ref="dateInput"
                  @update:model-value="clearError('date')"
                />
              </div>
              <transition name="fade">
                <p v-if="errors.date" class="error-message">
                  <font-awesome-icon :icon="['fas', 'exclamation-circle']" />
                  {{ errors.date }}
                </p>
              </transition>
            </div>
          </div>

          <div class="form-section">
            <div class="section-header">
              <font-awesome-icon :icon="['fas', 'stethoscope']" class="section-icon" />
              <h3>Hasil Pemeriksaan Tekanan Darah</h3>
            </div>
            
            <div class="form-group">
              <label for="systolic">Tekanan Darah Sistolik<span class="required">*</span></label>
              <div class="input-wrapper input-unit-wrapper" :class="{ 'input-error-wrapper': errors.systolic }">
                <font-awesome-icon :icon="['fas', 'arrow-up-long']" class="input-icon" :class="{ 'error-icon': errors.systolic }" />
                <input 
                  type="number" 
                  id="systolic"
                  v-model.number="formData.systolic" 
                  @input="validateSystolic" 
                  placeholder="Masukkan nilai" 
                  class="form-input unit-input"
                  :class="{ 'input-error': errors.systolic }"
                  ref="systolicInput"
                />
                <span class="unit-label">mmHg</span>
              </div>
              <transition name="fade">
                <p v-if="errors.systolic" class="error-message">
                  <font-awesome-icon :icon="['fas', 'exclamation-circle']" /> 
                  {{ errors.systolic }}
                </p>
              </transition>
            </div>

            <div class="form-group">
              <label for="diastolic">Tekanan Darah Diastolik<span class="required">*</span></label>
              <div class="input-wrapper input-unit-wrapper" :class="{ 'input-error-wrapper': errors.diastolic }">
                <font-awesome-icon :icon="['fas', 'arrow-down-long']" class="input-icon" :class="{ 'error-icon': errors.diastolic }" />
                <input 
                  type="number" 
                  id="diastolic"
                  v-model.number="formData.diastolic" 
                  @input="validateDiastolic" 
                  placeholder="Masukkan nilai" 
                  class="form-input unit-input"
                  :class="{ 'input-error': errors.diastolic }"
                  ref="diastolicInput"
                />
                <span class="unit-label">mmHg</span>
              </div>
              <transition name="fade">
                <p v-if="errors.diastolic" class="error-message">
                  <font-awesome-icon :icon="['fas', 'exclamation-circle']" /> 
                  {{ errors.diastolic }}
                </p>
              </transition>
            </div>
          </div>
          
          <div class="form-actions">
            <button class="btn-cancel" @click="$emit('close')" type="button">
              <font-awesome-icon :icon="['fas', 'times']" /> Batal
            </button>
            <button class="btn-save" @click="handleSubmit" :disabled="isSubmitting">
              <span v-if="isSubmitting">
                <font-awesome-icon :icon="['fas', 'spinner']" spin /> Menyimpan...
              </span>
              <span v-else>
                <font-awesome-icon :icon="['fas', 'save']" /> Simpan Data
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import Swal from 'sweetalert2'; // Menggunakan Swal standar
import apiClient from '../../api.js'; // Menggunakan apiClient
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';

export default {
  props: {
    visible: { type: Boolean, required: true },
    patientId: { type: [Number, String], required: true },
    selectedYear: { type: [Number, String], required: true },
  },
  components: {
    VueDatePicker
  },
  data() {
    return {
      formData: {
        date: this.getDefaultDate(), 
        systolic: null, 
        diastolic: null, 
      },
      isSubmitting: false,
      errors: {
        date: '',
        systolic: '',
        diastolic: '',
      },
    };
  },
  computed: {
    parsedSelectedYear() {
        return parseInt(this.selectedYear);
    },
    minDate() {
        return new Date(this.parsedSelectedYear, 0, 1);
    },
    maxDate() {
        const currentYear = new Date().getFullYear();
        if (this.parsedSelectedYear === currentYear) {
            return new Date();
        }
        return new Date(this.parsedSelectedYear, 11, 31);
    }
  },
  methods: {
    getDefaultDate() {
      const currentYear = new Date().getFullYear();
      return this.parsedSelectedYear === currentYear 
        ? new Date()
        : new Date(this.parsedSelectedYear, 11, 31);
    },
    formatDateForPicker(date) {
        const day = date.getDate();
        const month = date.toLocaleString('id-ID', { month: 'long' });
        const year = date.getFullYear();
        return `${day} ${month} ${year}`;
    },
    scrollToError(refName) {
      this.$nextTick(() => {
        const errorElement = this.$refs[refName];
        if (errorElement) {
          const targetEl = errorElement.$el ? errorElement.$el : errorElement;
          if (targetEl) {
              targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
              const input = targetEl.querySelector('input') || targetEl;
              if (input && typeof input.focus === 'function') {
                input.focus();
              }
          }
        }
      });
    },
    validateForm() {
      // Reset semua error
      Object.keys(this.errors).forEach(key => this.errors[key] = '');
      let isValid = true;
      let firstErrorField = null;

      // Validasi tanggal
      if (!this.formData.date) {
        this.errors.date = "Tanggal pemeriksaan wajib diisi";
        isValid = false;
        if (!firstErrorField) firstErrorField = 'dateInput';
      }

      // Validasi sistolik
      if (!this.formData.systolic && this.formData.systolic !== 0) {
        this.errors.systolic = "Tekanan darah sistolik wajib diisi";
        isValid = false;
        if (!firstErrorField) firstErrorField = 'systolicInput';
      } else {
        // Jalankan validasi range sistolik
        this.validateSystolic();
        if (this.errors.systolic) {
          isValid = false;
          if (!firstErrorField) firstErrorField = 'systolicInput';
        }
      }

      // Validasi diastolik
      if (!this.formData.diastolic && this.formData.diastolic !== 0) {
        this.errors.diastolic = "Tekanan darah diastolik wajib diisi";
        isValid = false;
        if (!firstErrorField) firstErrorField = 'diastolicInput';
      } else {
        // Jalankan validasi range diastolik
        this.validateDiastolic();
        if (this.errors.diastolic) {
          isValid = false;
          if (!firstErrorField) firstErrorField = 'diastolicInput';
        }
      }
      
      // Scroll ke error pertama jika ada
      if (!isValid && firstErrorField) {
        this.scrollToError(firstErrorField);
      }

      return isValid;
    },
    validateSystolic() {
      const val = this.formData.systolic;
      
      // Jika kosong, biarkan validasi utama yang menangani
      if (val === null || val === '' || val === undefined) { 
        return; 
      }
      
      // Validasi range
      if (val < 50 || val > 300) {
        this.errors.systolic = "Nilai sistolik harus antara 50 dan 300 mmHg";
      } else {
        // Clear error jika valid dan sudah ada isinya
        if (this.errors.systolic && this.errors.systolic.includes("antara")) {
          this.errors.systolic = "";
        }
      }
    },
    validateDiastolic() {
      const val = this.formData.diastolic;
      
      // Jika kosong, biarkan validasi utama yang menangani
      if (val === null || val === '' || val === undefined) { 
        return; 
      }
      
      // Validasi range
      if (val < 30 || val > 200) {
        this.errors.diastolic = "Nilai diastolik harus antara 30 dan 200 mmHg";
      } else {
        // Clear error jika valid dan sudah ada isinya
        if (this.errors.diastolic && this.errors.diastolic.includes("antara")) {
          this.errors.diastolic = "";
        }
      }
    },
    clearError(fieldName) {
      if (this.errors[fieldName]) {
        this.errors[fieldName] = '';
      }
    },
    async handleSubmit() {
      if (!this.validateForm()) {
        return; 
      }
      
      this.isSubmitting = true;
      try {
        const date = this.formData.date;
        const examinationDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
        
        const payload = {
          patient_id: parseInt(this.patientId),
          examination_date: examinationDate,
          systolic: this.formData.systolic,
          diastolic: this.formData.diastolic,
        };

        await apiClient.post("/puskesmas/ht-examinations", payload);

        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Data pemeriksaan hipertensi berhasil ditambahkan.",
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false,
        });

        this.$emit("submit");
        this.$emit("close");
      } catch (error) {
        console.error("Error adding HT examination:", error);
        Swal.fire({
          icon: "error",
          title: "Gagal Menyimpan",
          text: error.response?.data?.message || "Terjadi kesalahan pada server. Silakan coba lagi.",
          confirmButtonColor: '#d33',
        });
      } finally {
        this.isSubmitting = false;
      }
    },
    resetForm() {
      this.formData = {
        date: this.getDefaultDate(),
        systolic: null,
        diastolic: null,
      };
      this.errors = { date: '', systolic: '', diastolic: '' };
    },
  },
  watch: {
    visible(newValue) {
      if (newValue) {
        this.resetForm();
      }
    },
    selectedYear() {
      this.resetForm();
    }
  }
};
</script>

<style scoped>
:deep(.dp__main) {
  --dp-border-radius: 10px;
  --dp-input-padding: 12px 12px 12px 42px;
  --dp-font-size: 0.9375rem;
  --dp-border-color: var(--neutral-300);
  --dp-border-color-hover: var(--neutral-400);
  --dp-primary-color: var(--primary-500);
  --dp-primary-text-color: #ffffff;
  --dp-secondary-color: var(--neutral-100);
  --dp-text-color: var(--neutral-800);
  --dp-icon-color: var(--neutral-500);
  --dp-danger-color: var(--danger-500);
}

/* Style untuk error state pada DatePicker */
:deep(.dp__input_invalid) {
  border-color: var(--danger-500) !important;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15) !important;
}
:deep(.dp__input_invalid:focus) {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.25) !important;
}

:deep(.dp__input) {
  font-family: inherit;
}

/* PERBAIKAN: Menghilangkan outline hitam bawaan browser saat fokus */
:deep(.dp__input:focus) {
  border-color: var(--primary-500);
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.25);
  outline: none; /* <--- DITAMBAHKAN */
}
.input-unit-wrapper:focus-within {
  border-color: var(--primary-500);
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.25);
}
.unit-input:focus {
  outline: none; /* <--- DITAMBAHKAN */
}
.btn-cancel:focus, .btn-save:focus {
  outline: none; /* <--- DITAMBAHKAN */
}

/* Styles lain disalin dari AddExaminationDataDM.vue atau yang sudah ada untuk konsistensi */
.modal-backdrop { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.55); backdrop-filter: blur(3px); display: flex; justify-content: center; align-items: center; z-index: 1000; animation: fadeIn 0.25s ease-out; }
.modal-container { width: 90%; max-width: 600px; max-height: 90vh; background-color: #ffffff; border-radius: 16px; box-shadow: 0 12px 30px -8px rgba(0, 0, 0, 0.15), 0 8px 15px -10px rgba(0, 0, 0, 0.1); overflow: hidden; display: flex; flex-direction: column; animation: slideIn 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94); }
.modal-header { padding: 20px 24px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--neutral-200); background-color: var(--primary-50); }
.modal-header h2 { margin: 0; font-size: 1.15rem; font-weight: 600; color: var(--neutral-800); display: flex; align-items: center; }
.icon-margin { margin-right: 12px; color: var(--primary-500); font-size: 1.2em; }
.close-button { background: transparent; border: none; font-size: 20px; color: var(--neutral-500); cursor: pointer; width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease; }
.close-button:hover { background-color: var(--neutral-200); color: var(--neutral-900); }
.modal-body { padding: 20px 24px; flex-grow: 1; overflow-y: auto; }
.form-section { background-color: white; border-radius: 12px; border: 1px solid var(--neutral-200); padding: 20px; margin-bottom: 24px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06); }
.section-header { display: flex; align-items: center; margin-bottom: 18px; padding-bottom: 12px; border-bottom: 1px solid var(--neutral-200); }
.section-icon { font-size: 1.1rem; color: var(--primary-500); margin-right: 12px; }
.section-header h3 { margin: 0; font-size: 1rem; font-weight: 600; color: var(--neutral-700); }
.form-group { margin-bottom: 20px; }
.form-group:last-child { margin-bottom: 0; }
.form-group label { font-size: 0.875rem; font-weight: 500; margin-bottom: 8px; color: var(--neutral-700); display: block; }
.required { color: var(--danger-500); margin-left: 3px; font-weight: 600; }
.input-wrapper { position: relative; display: flex; align-items: center; }
.input-icon { position: absolute; left: 14px; color: var(--neutral-400); font-size: 1rem; pointer-events: none; transition: color 0.2s ease; z-index: 2; }
.input-unit-wrapper { display: flex; border: 1px solid var(--neutral-300); border-radius: 10px; overflow: hidden; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03); transition: all 0.2s ease; background-color: white; }
.input-wrapper:focus-within .input-icon { color: var(--primary-500); }
.unit-input { border: none !important; box-shadow: none !important; flex: 1; min-width: 0; background-color: transparent; padding: 12px 12px 12px 42px; color: var(--neutral-800); font-size: 0.9375rem; }
.unit-label { padding: 0 14px; color: var(--neutral-600); font-size: 0.875rem; background-color: var(--neutral-100); align-self: stretch; display: flex; align-items: center; border-left: 1px solid var(--neutral-300); min-width: 65px; justify-content: center; font-weight: 500; }
.input-error-wrapper { border-color: var(--danger-500) !important; box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15) !important; }
.input-error-wrapper:focus-within { border-color: var(--danger-500) !important; box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.25) !important; }
.input-error-wrapper .input-icon { color: var(--danger-500) !important; }
.error-icon { color: var(--danger-500) !important; }
.error-message { margin-top: 6px; font-size: 0.8125rem; color: var(--danger-700); font-weight: 500; display: flex; align-items: center; gap: 6px; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s, transform 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(-5px); }
.form-actions { margin-top: 28px; display: flex; justify-content: flex-end; gap: 12px; padding-top: 20px; border-top: 1px solid var(--neutral-200); }
.btn-cancel, .btn-save { padding: 10px 20px; border-radius: 8px; font-size: 0.9rem; font-weight: 600; cursor: pointer; transition: all 0.2s ease; display: flex; align-items: center; gap: 8px; justify-content: center; }
.btn-cancel { background-color: white; border: 1px solid var(--neutral-300); color: var(--neutral-700); }
.btn-save { background-color: var(--primary-500); border: 1px solid var(--primary-500); color: white; min-width: 130px; }
.btn-save:disabled { background-color: var(--neutral-300); border-color: var(--neutral-300); color: var(--neutral-500); cursor: not-allowed; box-shadow: none; }
.btn-cancel:focus { box-shadow: 0 0 0 3px rgba(107, 114, 128, 0.25); }
.btn-save:focus { background-color: var(--primary-600); border-color: var(--primary-700); box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.3); }
input[type="number"] { -moz-appearance: textfield; }
input[type="number"]::-webkit-inner-spin-button, input[type="number"]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideIn { from { transform: translateY(15px) scale(0.98); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }
@media (max-width: 640px) { .modal-container { width: 95%; max-height: 95vh; } .modal-header, .modal-body { padding: 16px 20px; } .form-actions { flex-direction: column-reverse; gap: 10px; } .btn-cancel, .btn-save { width: 100%; } }
/* Fallback untuk variabel jika tidak didefinisikan */
:root { --neutral-100: #f3f4f6; --neutral-200: #e5e7eb; --neutral-300: #d1d5db; --neutral-400: #9ca3af; --neutral-500: #6b7280; --neutral-600: #4b5563; --neutral-700: #374151; --neutral-800: #1f2937; --neutral-900: #111827; --primary-50: #f0fdfa; --primary-500: #10b981; --primary-600: #059669; --primary-700: #047857; --danger-500: #ef4444; --danger-700: #b91c1c; }
</style>