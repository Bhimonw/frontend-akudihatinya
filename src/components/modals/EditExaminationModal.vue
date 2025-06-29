<template>
  <div class="modal-backdrop" v-if="visible">
    <div class="modal-container">
      <div class="modal-header">
        <h2><font-awesome-icon :icon="['fas', 'edit']" class="icon-margin" /> Edit Data Pemeriksaan</h2>
        <button class="close-button" @click="$emit('close')" aria-label="Tutup">
          <font-awesome-icon :icon="['fas', 'times']" />
        </button>
      </div>
      <div class="modal-body">
        <div v-if="isLoading" class="loading-state-container">
          <div class="spinner"></div>
          <p>Memuat data pemeriksaan...</p>
        </div>
        
        <form v-else class="examination-form" @submit.prevent="handleSubmit">
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
                  @update:model-value="errors.date = ''"
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
              <font-awesome-icon :icon="['fas', 'vial']" class="section-icon" />
              <h3>Hasil Pemeriksaan Gula Darah</h3>
            </div>
            <div class="form-group">
              <label for="gdsp">Gula Darah Sewaktu</label>
              <div class="input-wrapper input-unit-wrapper" :class="{ 'input-error-wrapper': errors.gdsp }">
                <font-awesome-icon :icon="['fas', 'heartbeat']" class="input-icon" :class="{ 'error-icon': errors.gdsp }" />
                <input type="number" id="gdsp" v-model.number="formData.gdsp" @input="validateGdsp" @change="validateGdsp" placeholder="Masukkan nilai" class="form-input unit-input" :class="{ 'input-error': errors.gdsp }" ref="gdspInput" />
                <span class="unit-label">mg/dL</span>
              </div>
              <transition name="fade">
                <p v-if="errors.gdsp" class="error-message">
                  <font-awesome-icon :icon="['fas', 'exclamation-circle']" /> {{ errors.gdsp }}
                </p>
              </transition>
            </div>
            <div class="form-group">
              <label for="gdp">Gula Darah Puasa</label>
              <div class="input-wrapper input-unit-wrapper" :class="{ 'input-error-wrapper': errors.gdp }">
                <font-awesome-icon :icon="['fas', 'tint']" class="input-icon" :class="{ 'error-icon': errors.gdp }" />
                <input type="number" id="gdp" v-model.number="formData.gdp" @input="validateGdp" @change="validateGdp" placeholder="Masukkan nilai" class="form-input unit-input" :class="{ 'input-error': errors.gdp }" ref="gdpInput" />
                <span class="unit-label">mg/dL</span>
              </div>
              <transition name="fade">
                <p v-if="errors.gdp" class="error-message">
                  <font-awesome-icon :icon="['fas', 'exclamation-circle']" /> {{ errors.gdp }}
                </p>
              </transition>
            </div>
            <div class="form-group">
              <label for="gd2jpp">Gula Darah 2 Jam PP</label>
              <div class="input-wrapper input-unit-wrapper" v-if="formData.gdp !== null && formData.gdp !== ''" :class="{ 'input-error-wrapper': errors.gd2jpp }">
                <font-awesome-icon :icon="['fas', 'clock']" class="input-icon" :class="{ 'error-icon': errors.gd2jpp }" />
                <input type="number" id="gd2jpp" v-model.number="formData.gd2jpp" @input="validateGd2jpp" @change="validateGd2jpp" placeholder="Masukkan nilai" class="form-input unit-input" :class="{ 'input-error': errors.gd2jpp }" ref="gd2jppInput" />
                <span class="unit-label">mg/dL</span>
              </div>
              <div class="input-wrapper input-unit-wrapper disabled" v-else>
                <font-awesome-icon :icon="['fas', 'clock']" class="input-icon" />
                <input type="number" disabled class="form-input unit-input disabled" placeholder="Tidak tersedia" />
                <span class="unit-label disabled">mg/dL</span>
              </div>
              <transition name="fade">
                <p v-if="errors.gd2jpp" class="error-message">
                  <font-awesome-icon :icon="['fas', 'exclamation-circle']" /> {{ errors.gd2jpp }}
                </p>
              </transition>
              <small v-if="formData.gdp === null || formData.gdp === ''" class="helper-text">
                <font-awesome-icon :icon="['fas', 'info-circle']" /> Silakan isi GDP terlebih dahulu
              </small>
            </div>
            <div class="form-group">
              <label for="hba1c">HbA1c</label>
              <div class="input-wrapper input-unit-wrapper hba1c-wrapper" :class="{ 'input-error-wrapper': errors.hba1c }">
                <font-awesome-icon :icon="['fas', 'percent']" class="input-icon" :class="{ 'error-icon': errors.hba1c }" />
                <div class="hba1c-inputs">
                  <input type="number" id="hba1c-int" min="3" max="15" step="1" v-model.number="hba1cInt" @input="validateHba1c" @change="validateHba1c" placeholder="0" class="form-input hba1c-input" :class="{ 'input-error': errors.hba1c }" ref="hba1cIntInput" />
                  <span class="dot" :class="{ 'error-dot': errors.hba1c }">.</span>
                  <input type="number" id="hba1c-dec" min="0" max="9" step="1" v-model.number="hba1cDec" @input="validateHba1c" @change="validateHba1c" placeholder="0" class="form-input hba1c-input" :class="{ 'input-error': errors.hba1c }" ref="hba1cDecInput" />
                </div>
                <span class="unit-label">%</span>
              </div>
              <transition name="fade">
                <p v-if="errors.hba1c" class="error-message">
                  <font-awesome-icon :icon="['fas', 'exclamation-circle']" /> {{ errors.hba1c }}
                </p>
              </transition>
            </div>
          </div>

          <div class="form-actions">
            <button class="btn-cancel" @click="$emit('close')" type="button">
              <font-awesome-icon :icon="['fas', 'times']" /> Batal
            </button>
            <button class="btn-save" type="submit" :disabled="isSubmitting">
              <span v-if="isSubmitting"><font-awesome-icon :icon="['fas', 'spinner']" spin /> Menyimpan...</span>
              <span v-else><font-awesome-icon :icon="['fas', 'save']" /> Simpan Perubahan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import Swal from 'sweetalert2';
import apiClient from '../../api.js';
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';

export default {
  props: {
    visible: { type: Boolean, required: true },
    patientId: { type: [Number, String], required: true },
    examData: { type: Object, required: true },
  },
  components: {
    VueDatePicker
  },
  data() {
    return {
      isLoading: false, // <-- DITAMBAHKAN
      isSubmitting: false,
      formData: {
        date: null,
        hba1c: null,
        gdp: null,
        gd2jpp: null,
        gdsp: null,
      },
      hba1cInt: null,
      hba1cDec: null,
      errors: {
        date: '', gdsp: '', gdp: '', gd2jpp: '', hba1c: '',
      },
    };
  },
  watch: {
    visible(newValue) {
      if (newValue && this.examData) {
        // DIUBAH: Panggil method fetch daripada populateForm langsung
        this.fetchExaminationData();
      } else if (!newValue) {
        // Reset form saat modal ditutup
        this.resetForm();
      }
    },
  },
  methods: {
    // =======================================================
    // START: Method baru untuk fetch dan loading state
    // =======================================================
    async fetchExaminationData() {
      this.isLoading = true;
      try {
        // Simulasi delay jaringan untuk UX yang lebih baik
        await new Promise(resolve => setTimeout(resolve, 400));
        
        // Memanggil logika untuk mengisi form
        this.populateForm(this.examData);

      } catch (error) {
        console.error("Error preparing examination data:", error);
        Swal.fire('Error!', 'Gagal menyiapkan data untuk diedit.', 'error');
        this.$emit('close'); // Tutup modal jika terjadi error
      } finally {
        this.isLoading = false;
      }
    },
    // =======================================================
    // END: Method baru
    // =======================================================
    populateForm(data) {
      this.formData.date = data.examination_date ? new Date(data.examination_date) : null;
      this.formData.gdsp = data.examination_results?.gdsp || null;
      this.formData.gdp = data.examination_results?.gdp || null;
      this.formData.gd2jpp = data.examination_results?.gd2jpp || null;
      this.formData.hba1c = data.examination_results?.hba1c || null;

      if (this.formData.hba1c !== null) {
        const hba1cString = this.formData.hba1c.toString();
        const parts = hba1cString.split('.');
        this.hba1cInt = parseInt(parts[0], 10) || null;
        this.hba1cDec = parts[1] ? parseInt(parts[1], 10) : null;
      } else {
        this.hba1cInt = null;
        this.hba1cDec = null;
      }
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
              if (typeof errorElement.focus === 'function') {
                  errorElement.focus();
              } else if (targetEl.querySelector('input')) {
                  targetEl.querySelector('input').focus();
              } else if (typeof targetEl.focus === 'function') {
                  targetEl.focus();
              }
          }
        }
      });
    },
    validateForm() {
      Object.keys(this.errors).forEach(key => this.errors[key] = '');
      let isValid = true;
      let firstErrorField = null;

      if (!this.formData.date) {
        this.errors.date = "Tanggal pemeriksaan wajib diisi.";
        isValid = false;
        if (!firstErrorField) firstErrorField = 'dateInput';
      }

      this.validateGdsp(); this.validateGdp(); this.validateGd2jpp(); this.validateHba1c();

      if (this.errors.gdsp) { isValid = false; if (!firstErrorField) firstErrorField = 'gdspInput'; }
      if (this.errors.gdp) { isValid = false; if (!firstErrorField) firstErrorField = 'gdpInput'; }
      if (this.errors.gd2jpp) { isValid = false; if (!firstErrorField) firstErrorField = 'gd2jppInput'; }
      if (this.errors.hba1c) { isValid = false; if (!firstErrorField) firstErrorField = 'hba1cIntInput'; }
      
      if (!isValid && firstErrorField) {
        this.scrollToError(firstErrorField);
        return false;
      }

      const hasValue = this.formData.hba1c !== null ||
                                (this.formData.gdp !== null && this.formData.gdp !== '') ||
                                (this.formData.gd2jpp !== null && this.formData.gd2jpp !== '') ||
                                (this.formData.gdsp !== null && this.formData.gdsp !== '');
      
      if (!hasValue) {
        Swal.fire({
          icon: 'warning',
          title: 'Data Tidak Lengkap',
          text: 'Harap isi minimal salah satu hasil pemeriksaan (GDS, GDP, GD2JPP, atau HbA1c).',
          confirmButtonColor: '#3085d6',
        });
        isValid = false;
      }
      return isValid;
    },
    validateGdsp() {
      const val = this.formData.gdsp;
      if (val === null || val === '') { this.errors.gdsp = ""; return; }
      if (val < 40 || val > 650) { this.errors.gdsp = "Nilai GDS harus antara 40 dan 650."; } 
      else { this.errors.gdsp = ""; }
    },
    validateGdp() {
      const val = this.formData.gdp;
      if (val === null || val === '') { this.errors.gdp = ""; this.formData.gd2jpp = null; this.errors.gd2jpp = ""; return; }
      if (val < 40 || val > 650) { this.errors.gdp = "Nilai GDP harus antara 40 dan 650."; } 
      else { this.errors.gdp = ""; }
    },
    validateGd2jpp() {
      if (this.formData.gdp === null || this.formData.gdp === '') { this.errors.gd2jpp = ""; return; }
      const val = this.formData.gd2jpp;
      if (val === null || val === '') { this.errors.gd2jpp = ""; return; }
      if (val < 40 || val > 650) { this.errors.gd2jpp = "Nilai GD2JPP harus antara 40 dan 650."; } 
      else { this.errors.gd2jpp = ""; }
    },
    validateHba1c() {
      let int = this.hba1cInt; let dec = this.hba1cDec;
      if ((int === null || int === '') && (dec === null || dec === '')) { this.formData.hba1c = null; this.errors.hba1c = ""; return; }
      int = (int === null || int === '') ? 0 : parseFloat(int); dec = (dec === null || dec === '') ? 0 : parseFloat(dec);
      if (isNaN(int) || isNaN(dec)) { this.errors.hba1c = "Masukkan angka yang valid."; this.formData.hba1c = null; return; }
      const total = parseFloat((int + (dec / 10)).toFixed(1));
      if (total < 3.0 || total > 15.0) { this.errors.hba1c = "Nilai HbA1c harus antara 3.0 dan 15.0."; this.formData.hba1c = null; } 
      else { this.formData.hba1c = total; this.errors.hba1c = ""; }
    },
    async handleSubmit() {
      if (!this.validateForm()) return;
      this.isSubmitting = true;

      try {
        const date = this.formData.date;
        const examinationDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
        
        const payload = {
          patient_id: parseInt(this.patientId),
          examination_date: examinationDate,
          examinations: {
            hba1c: this.formData.hba1c,
            gdp: (this.formData.gdp === '') ? null : this.formData.gdp,
            gd2jpp: (this.formData.gd2jpp === '') ? null : this.formData.gd2jpp,
            gdsp: (this.formData.gdsp === '') ? null : this.formData.gdsp,
          },
        };
        
        await apiClient.put(`/puskesmas/dm-examinations/${this.examData.id}`, payload);

        await Swal.fire({
          icon: "success", 
          title: "Berhasil!", 
          text: "Data pemeriksaan telah berhasil diperbarui.",
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false,
        });

        this.$emit("submit");
        this.$emit("close");

      } catch (error) {
        console.error("Error updating examination:", error);
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
        date: null, hba1c: null, gdp: null, gd2jpp: null, gdsp: null,
      };
      this.hba1cInt = null;
      this.hba1cDec = null;
      this.errors = { date: '', gdsp: '', gdp: '', gd2jpp: '', hba1c: '' };
      this.isLoading = false; // Pastikan isLoading direset
      this.isSubmitting = false;
    },
  },
};
</script>

<style scoped>
/* ======================================================= */
/* START: CSS untuk Loading State */
/* ======================================================= */
.loading-state-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 250px; /* Sesuaikan tinggi agar spinner di tengah */
  gap: 16px;
  color: var(--primary-500);
  font-weight: 600;
  font-size: 1rem;
}

.spinner {
  border: 5px solid #f3f3f3; /* Light grey */
  border-top: 5px solid var(--primary-500); /* Warna utama */
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
/* ======================================================= */
/* END: CSS untuk Loading State */
/* ======================================================= */

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

:deep(.dp__input:focus) {
  border-color: var(--primary-500);
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.25);
  outline: none;
}
.input-unit-wrapper:focus-within {
  border-color: var(--primary-500);
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.25);
}
.unit-input:focus,
.hba1c-input:focus {
  outline: none;
}
.btn-cancel:focus, .btn-save:focus {
  outline: none;
}

.modal-backdrop {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background-color: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(3px);
  display: flex; justify-content: center; align-items: center;
  z-index: 1000; animation: fadeIn 0.25s ease-out;
}
.modal-container {
  width: 90%; max-width: 600px; max-height: 90vh;
  background-color: #ffffff; border-radius: 16px;
  box-shadow: 0 12px 30px -8px rgba(0, 0, 0, 0.15), 0 8px 15px -10px rgba(0, 0, 0, 0.1);
  overflow: hidden; display: flex; flex-direction: column;
  animation: slideIn 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
.modal-header {
  padding: 20px 24px; display: flex; justify-content: space-between; align-items: center;
  border-bottom: 1px solid var(--neutral-200); background-color: var(--primary-50);
}
.modal-header h2 {
  margin: 0; font-size: 1.15rem; font-weight: 600; color: var(--neutral-800);
  display: flex; align-items: center;
}
.icon-margin { margin-right: 12px; color: var(--primary-500); font-size: 1.2em; }
.close-button {
  background: transparent; border: none; font-size: 20px; color: var(--neutral-500);
  cursor: pointer; width: 36px; height: 36px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center; transition: all 0.2s ease;
}
.close-button:hover { background-color: var(--neutral-200); color: var(--neutral-900); }
.modal-body { padding: 20px 24px; flex-grow: 1; overflow-y: auto; }
.form-section {
  background-color: white; border-radius: 12px; border: 1px solid var(--neutral-200);
  padding: 20px; margin-bottom: 24px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}
.section-header {
  display: flex; align-items: center; margin-bottom: 18px; padding-bottom: 12px;
  border-bottom: 1px solid var(--neutral-200);
}
.section-icon { font-size: 1.1rem; color: var(--primary-500); margin-right: 12px; }
.section-header h3 { margin: 0; font-size: 1rem; font-weight: 600; color: var(--neutral-700); }
.form-group { margin-bottom: 20px; }
.form-group:last-child { margin-bottom: 0; }
.form-group label {
  font-size: 0.875rem; font-weight: 500; margin-bottom: 8px;
  color: var(--neutral-700); display: block;
}
.required { color: var(--danger-500); margin-left: 3px; font-weight: 600; }
.input-wrapper { position: relative; display: flex; align-items: center; }
.input-icon {
  position: absolute; left: 14px; color: var(--neutral-400); font-size: 1rem;
  pointer-events: none; transition: color 0.2s ease; z-index: 2;
}
.input-unit-wrapper {
  display: flex; border: 1px solid var(--neutral-300); border-radius: 10px;
  overflow: hidden; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
  transition: all 0.2s ease;
  background-color: white;
}
.input-wrapper:focus-within .input-icon { color: var(--primary-500); }
.input-unit-wrapper.disabled {
  background-color: var(--neutral-100); cursor: not-allowed; border-color: var(--neutral-200);
}
.input-unit-wrapper.disabled .input-icon,
.input-unit-wrapper.disabled .unit-label { color: var(--neutral-400); }
.input-unit-wrapper.disabled .unit-input { background-color: var(--neutral-100); color: var(--neutral-500); }

.unit-input {
  border: none !important; box-shadow: none !important; flex: 1; border-radius: 0; 
  min-width: 0;
  background-color: transparent;
  padding: 12px 12px 12px 42px;
  color: var(--neutral-800);
  font-size: 0.9375rem;
}
.unit-label {
  padding: 0 14px; color: var(--neutral-600); font-size: 0.875rem;
  background-color: var(--neutral-100);
  align-self: stretch;
  display: flex; align-items: center;
  border-left: 1px solid var(--neutral-300);
  min-width: 65px; justify-content: center; font-weight: 500;
}
.form-input.input-error { border-color: var(--danger-500) !important; }
.input-error-wrapper { 
  border-color: var(--danger-500) !important;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15) !important;
}
.input-error-wrapper:focus-within {
  border-color: var(--danger-500) !important;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.25) !important;
}
.input-error-wrapper .input-icon { color: var(--danger-500) !important; }
.hba1c-wrapper { background-color: white; }
.hba1c-inputs {
  display: flex; align-items: center; flex-grow: 1;
  padding-left: 42px;
}
.hba1c-input {
  width: auto; min-width: 50px; flex: 1; text-align: center;
  padding: 12px 8px !important; border-radius: 0 !important; border: none !important;
  box-shadow: none !important; font-size: 0.9375rem;
  background-color: transparent;
  color: var(--neutral-800);
}
.dot {
  font-weight: bold; font-size: 1.2rem; margin: 0 4px;
  color: var(--neutral-600); align-self: center; padding-bottom: 2px;
}
.helper-text {
  margin-top: 6px; font-size: 0.8125rem; color: var(--neutral-600);
  display: flex; align-items: center; gap: 6px;
}
.error-icon { color: var(--danger-500) !important; }
.error-dot { color: var(--danger-500) !important; }
.error-message {
  margin-top: 6px; font-size: 0.8125rem; color: var(--danger-700);
  font-weight: 500; display: flex; align-items: center; gap: 6px;
}
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s, transform 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(-5px); }
.form-actions {
  margin-top: 28px; display: flex; justify-content: flex-end; gap: 12px;
  padding-top: 20px; border-top: 1px solid var(--neutral-200);
}
.btn-cancel, .btn-save {
  padding: 10px 20px; border-radius: 8px; font-size: 0.9rem; font-weight: 600;
  cursor: pointer; transition: all 0.2s ease;
  display: flex; align-items: center; gap: 8px; justify-content: center;
}
.btn-cancel { background-color: white; border: 1px solid var(--neutral-300); color: var(--neutral-700); }
.btn-save { background-color: var(--primary-500); border: 1px solid var(--primary-500); color: white; min-width: 130px; }
.btn-save:disabled {
  background-color: var(--neutral-300); border-color: var(--neutral-300);
  color: var(--neutral-500); cursor: not-allowed; box-shadow: none;
}
.btn-cancel:focus {
  box-shadow: 0 0 0 3px rgba(107, 114, 128, 0.25);
}
.btn-save:focus {
  background-color: var(--primary-600);
  border-color: var(--primary-700);
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.3);
}
input[type="number"] { -moz-appearance: textfield; }
input[type="number"]::-webkit-inner-spin-button, input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none; margin: 0;
}
@media (max-width: 640px) {
  .modal-container { width: 95%; max-height: 95vh; }
  .modal-header, .modal-body { padding: 16px 20px; }
  .form-actions { flex-direction: column-reverse; gap: 10px; }
  .btn-cancel, .btn-save { width: 100%; }
}
</style>