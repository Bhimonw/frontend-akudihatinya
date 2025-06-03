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
                <flatpickr
                  id="date"
                  v-model="formData.date"
                  :config="flatpickrConfig"
                  required
                  placeholder="Pilih Tanggal"
                  class="form-input date-input"
                />
              </div>
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
            <button class="btn-save" type="submit" :disabled="isSubmitting">
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
import Swal from "sweetalert2";
import axios from "axios";
import Flatpickr from "vue-flatpickr-component";
import "flatpickr/dist/flatpickr.css";
// Import lokalisasi bahasa Indonesia
import { Indonesian } from "flatpickr/dist/l10n/id.js";

export default {
  props: {
    visible: {
      type: Boolean,
      required: true,
    },
    patientId: {
      type: [Number, String],
      required: true,
    },
    selectedYear: { // Added selectedYear prop
      type: [Number, String],
      required: true,
    },
  },
  components: {
    Flatpickr
  },
  data() {
    const currentYear = new Date().getFullYear();
    const selectedYear = parseInt(this.selectedYear);
    
    let defaultDate;
    if (selectedYear === currentYear) {
      defaultDate = new Date();
    } else {
      defaultDate = new Date(selectedYear, 11, 31); // December 31st of selectedYear
    }
    
    return {
      formData: {
        date: defaultDate, 
        systolic: null, 
        diastolic: null, 
      },
      isSubmitting: false,
      errors: {}, // For validation errors
      flatpickrConfig: {
        dateFormat: "d F Y",
        defaultDate: defaultDate,
        disableMobile: true,
        locale: Indonesian,
        minDate: new Date(selectedYear, 0, 1), 
        maxDate: new Date(selectedYear, 11, 31), 
        onMonthChange: function(selectedDates, dateStr, instance) {
          const currentInstanceYear = instance.currentYear;
          if (currentInstanceYear !== selectedYear) {
            instance.currentYear = selectedYear;
            // If month is also out of new year's context, reset to a default month or current if possible
            // This might need more sophisticated logic if just resetting year isn't enough
             instance.currentMonth = defaultDate.getMonth(); 
             instance.redraw();
          }
        },
        // Menonaktifkan pemilihan tahun dalam UI kalender (opsional, bisa dihapus jika ingin user bisa ganti tahun di picker)
        // Jika ingin mengunci tahun sepenuhnya di picker:
        // enableYearChange: false, // Uncomment this to disable year change input in Flatpickr UI
        onOpen: function(selectedDates, dateStr, instance) {
            // Force the year to be the selected year if enableYearChange is false
            // Or to ensure year dropdown doesn't allow changing
            if (instance.currentYear !== selectedYear) {
                instance.set('year', selectedYear); // More direct way to set year
                instance.currentYear = selectedYear; // Ensure internal state is updated
                instance.redraw();
            }
            // Ensure year input in header is not shown (if flatpickr version allows)
            // This is often handled by `noCalendar: true` for year input, but here we want the calendar
            // The :deep CSS handles hiding the year input better visually
        },
        onChange: (selectedDates, dateStr, instance) => {
          if (selectedDates.length > 0) {
            const date = selectedDates[0];
            if (date.getFullYear() !== selectedYear) {
              date.setFullYear(selectedYear);
              instance.setDate(date, true); // `true` to trigger change event
            }
          }
        }
      },
    };
  },
  computed: {
    hasError() {
      return Object.values(this.errors).some((e) => e);
    },
  },
  methods: {
    validateForm() {
      this.validateSystolic();
      this.validateDiastolic();

      const hasError = Object.values(this.errors).some(error => error);

      if (hasError) {
        const firstErrorKey = Object.keys(this.errors).find(key => this.errors[key]);
        
        if (firstErrorKey) {
          let inputRef;
          switch(firstErrorKey) {
            case 'systolic':
              inputRef = this.$refs.systolicInput;
              break;
            case 'diastolic':
              inputRef = this.$refs.diastolicInput;
              break;
          }

          if (inputRef && inputRef.focus) {
            inputRef.focus();
          }
        }
        return false; 
      }
      return true; 
    },
    validateSystolic() {
      const val = this.formData.systolic;
      if (val === null || val === undefined || val === '') {
        // If required, show error. If optional and empty, clear error.
        // For HT, systolic/diastolic are usually entered together or not at all.
        // Let's make them individually optional for filling, but handleSubmit will check if at least one is filled.
        this.errors.systolic = ""; // Clear error if empty, handleSubmit will catch if no data
        return;
      }
      if (val < 50 || val > 300) {
        this.errors.systolic = "Nilai Sistolik harus antara 50 dan 300.";
      } else {
        this.errors.systolic = "";
      }
    },
    validateDiastolic() {
      const val = this.formData.diastolic;
      if (val === null || val === undefined || val === '') {
        this.errors.diastolic = ""; // Clear error if empty
        return;
      }
      if (val < 30 || val > 200) {
        this.errors.diastolic = "Nilai Diastolik harus antara 30 dan 200.";
      } else {
        this.errors.diastolic = "";
      }
    },
    async handleSubmit() {
      try {
        if (!this.validateForm()) {
          return;
        }
        this.isSubmitting = true;

        // Validasi: Minimal satu nilai pemeriksaan (systolic atau diastolic) harus diisi.
        // Dan jika salah satu diisi, yang lain juga harus diisi.
        const systolicFilled = this.formData.systolic !== null && this.formData.systolic !== '';
        const diastolicFilled = this.formData.diastolic !== null && this.formData.diastolic !== '';

        if (!systolicFilled && !diastolicFilled) {
          throw new Error("Minimal satu nilai tekanan darah (sistolik atau diastolik) harus diisi.");
        }
        if (systolicFilled && !diastolicFilled) {
            this.errors.diastolic = "Diastolik harus diisi jika Sistolik diisi.";
            this.$refs.diastolicInput?.focus();
            throw new Error(this.errors.diastolic);
        }
        if (!systolicFilled && diastolicFilled) {
            this.errors.systolic = "Sistolik harus diisi jika Diastolik diisi.";
             this.$refs.systolicInput?.focus();
            throw new Error(this.errors.systolic);
        }


        if (!this.formData.date) {
          throw new Error("Tanggal pemeriksaan harus diisi.");
        }

        let dateToUse;
        if (this.formData.date instanceof Date) {
          dateToUse = this.formData.date;
        } else {
            // Attempt to parse from "d F Y" format if it's a string
            // This case should ideally not happen if Flatpickr v-model works correctly
            try {
                const parts = this.formData.date.split(' ');
                if (parts.length === 3) {
                    const day = parseInt(parts[0]);
                    const monthName = parts[1];
                    const year = parseInt(parts[2]);
                    const monthIndex = Indonesian.months.longhand.indexOf(monthName);
                    if (monthIndex !== -1) {
                        dateToUse = new Date(year, monthIndex, day);
                    } else {
                        throw new Error("Format bulan tidak valid");
                    }
                } else {
                     throw new Error("Format tanggal tidak dikenali dari string.");
                }
            } catch (e) {
                 // Fallback: try parsing as ISO or other common formats
                dateToUse = new Date(this.formData.date);
                if (isNaN(dateToUse.getTime())) {
                     throw new Error("Format tanggal tidak valid. Harap pilih dari kalender.");
                }
            }
        }
        
        // Ensure year is from selectedYear, month and day from dateToUse
        const year = parseInt(this.selectedYear);
        const month = (dateToUse.getMonth() + 1).toString().padStart(2, '0');
        const day = dateToUse.getDate().toString().padStart(2, '0');
        const examinationDate = `${year}-${month}-${day}`;

        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Token tidak ditemukan");
        }
        
        const payload = {
          patient_id: parseInt(this.patientId),
          examination_date: examinationDate,
          systolic: this.formData.systolic, // API expects these at root
          diastolic: this.formData.diastolic,
        };

        console.log("Payload being sent for HT:", payload);
        
        const response = await axios.post(
          "http://localhost:8000/api/puskesmas/ht-examinations",
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        console.log("API Response:", response.data);

        Swal.fire({
          icon: "success",
          title: "Berhasil",
          text: "Data pemeriksaan hipertensi berhasil ditambahkan.",
          confirmButtonText: "Tutup",
        });

        this.$emit("submit", response.data.examination); 
        this.resetForm();
        this.$emit("close");
      } catch (error) {
        console.error("Error adding HT examination:", error);
        Swal.fire({
          icon: "error",
          title: "Gagal Menyimpan Data",
          text:
            error.response?.data?.message ||
            error.message ||
            "Terjadi kesalahan saat menambahkan data pemeriksaan hipertensi.",
          confirmButtonText: "Tutup",
        });
      } finally {
        this.isSubmitting = false;
      }
    },
    resetForm() {
      const currentYear = new Date().getFullYear();
      const selectedYear = parseInt(this.selectedYear);
      let defaultDate;
      if (selectedYear === currentYear) {
        defaultDate = new Date();
      } else {
        defaultDate = new Date(selectedYear, 11, 31);
      }
      
      this.formData = {
        date: defaultDate,
        systolic: null,
        diastolic: null,
      };
      this.errors = {};

      // Re-initialize flatpickr config if needed, especially if min/maxDate depends on something that changes
      // For this case, defaultDate is the main thing updated.
       this.flatpickrConfig = {
        ...this.flatpickrConfig, // Preserve other settings
        defaultDate: defaultDate,
        minDate: new Date(selectedYear, 0, 1),
        maxDate: new Date(selectedYear, 11, 31),
         onMonthChange: function(selectedDates, dateStr, instance) {
          const currentInstanceYear = instance.currentYear;
          if (currentInstanceYear !== selectedYear) {
            instance.currentYear = selectedYear;
             instance.currentMonth = defaultDate.getMonth(); 
             instance.redraw();
          }
        },
        onChange: (selectedDates, dateStr, instance) => {
          if (selectedDates.length > 0) {
            const date = selectedDates[0];
            if (date.getFullYear() !== selectedYear) {
              date.setFullYear(selectedYear);
              instance.setDate(date, true);
            }
          }
        }
      };
    },
  },
  watch: {
    visible(newValue) {
      if (newValue) { // When modal becomes visible, ensure form is reset and date picker is current for the year
        this.resetForm(); // This will set the default date based on current selectedYear
      } else {
        this.resetForm(); // Also reset when closing
      }
    },
    selectedYear(newYear, oldYear) {
      if (newYear !== oldYear) {
        this.resetForm(); // This will update flatpickrConfig's minDate, maxDate, defaultDate
      }
    }
  }
};
</script>

<style scoped>
/* Modal Backdrop - Slightly softer blur, smoother transition */
.modal-backdrop {
 position: fixed;
 top: 0;
 left: 0;
 width: 100%;
 height: 100%;
 background-color: rgba(0, 0, 0, 0.55); /* Slightly darker for better focus on modal */
 backdrop-filter: blur(3px); /* Slightly more blur */
 display: flex;
 justify-content: center;
 align-items: center;
 z-index: 1000;
 animation: fadeIn 0.25s ease-out; /* Slightly longer animation */
}

@keyframes fadeIn {
 from { opacity: 0; }
 to { opacity: 1; }
}

/* Modal Container - Refined shadow, increased border-radius */
.modal-container {
 width: 90%;
 max-width: 600px; /* Slightly wider for comfort */
 max-height: 90vh;
 background-color: #ffffff;
 border-radius: 16px; /* Softer corners */
 box-shadow: 0 12px 30px -8px rgba(0, 0, 0, 0.15), 0 8px 15px -10px rgba(0, 0, 0, 0.1); /* Refined shadow */
 overflow: hidden;
 display: flex;
 flex-direction: column;
 animation: slideIn 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94); /* Smoother easing */
}

@keyframes slideIn {
 from { transform: translateY(15px) scale(0.98); opacity: 0; }
 to { transform: translateY(0) scale(1); opacity: 1; }
}

/* Modal Header - Enhanced padding and visual separation */
.modal-header {
 padding: 20px 24px; /* Increased padding */
 display: flex;
 justify-content: space-between;
 align-items: center;
 border-bottom: 1px solid var(--neutral-200, #e5e7eb);
 background-color: var(--primary-50, #f0fdfa); /* Lighter background for a cleaner look */
}

.modal-header h2 {
 margin: 0;
 font-size: 1.15rem; /* Slightly larger */
 font-weight: 600;
 color: var(--neutral-800, #1f2937); /* Darker for better contrast on light bg */
 display: flex;
 align-items: center;
}

.icon-margin {
 margin-right: 12px; /* Increased margin */
 color: var(--primary-500, #10b981);
 font-size: 1.2em; /* Slightly larger icon */
}

.close-button {
 background: transparent;
 border: none;
 font-size: 20px; /* Larger close icon */
 color: var(--neutral-500, #6b7280);
 cursor: pointer;
 width: 36px; /* Larger touch target */
 height: 36px;
 border-radius: 8px; /* Rounded square for a modern feel */
 display: flex;
 align-items: center;
 justify-content: center;
 transition: all 0.2s ease;
}

.close-button:hover {
 background-color: var(--neutral-200, #e5e7eb);
 color: var(--neutral-900, #111827);
}

/* Modal Body - Improved padding and scrollbar aesthetics */
.modal-body {
 padding: 20px 24px; /* Consistent padding with header */
 flex-grow: 1;
 overflow-y: auto;
 scrollbar-width: thin;
 scrollbar-color: var(--neutral-300, #d1d5db) var(--neutral-100, #f3f4f6); /* Softer scrollbar */
}

.modal-body::-webkit-scrollbar {
 width: 8px; /* Slightly wider scrollbar */
}

.modal-body::-webkit-scrollbar-track {
 background: var(--neutral-100, #f3f4f6);
 border-radius: 10px;
}

.modal-body::-webkit-scrollbar-thumb {
 background-color: var(--neutral-300, #d1d5db);
 border-radius: 10px;
 border: 2px solid var(--neutral-100, #f3f4f6); /* Creates a "floating" thumb effect */
}

.modal-body::-webkit-scrollbar-thumb:hover {
 background-color: var(--neutral-400, #9ca3af);
}

/* Form Sections - Cleaner look, more spacing */
.form-section {
 background-color: white;
 border-radius: 12px; /* Consistent with modal container */
 border: 1px solid var(--neutral-200, #e5e7eb);
 padding: 20px; /* Increased padding */
 margin-bottom: 24px; /* More space between sections */
 box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06); /* Softer shadow */
 transition: box-shadow 0.3s ease;
}

.form-section:last-child {
  margin-bottom: 16px; /* Reduced bottom margin for the last section */
}

.form-section:hover {
 box-shadow: 0 5px 12px -2px rgba(0, 0, 0, 0.08), 0 3px 7px -3px rgba(0, 0, 0, 0.07); /* Refined hover shadow */
}

.section-header {
 display: flex;
 align-items: center;
 margin-bottom: 18px; /* Increased margin */
 padding-bottom: 12px; /* Increased padding */
 border-bottom: 1px solid var(--neutral-200, #e5e7eb);
}

.section-icon {
 font-size: 1.1rem; /* Slightly larger */
 color: var(--primary-500, #10b981);
 margin-right: 12px; /* Increased margin */
}

.section-header h3 {
 margin: 0;
 font-size: 1rem; /* Standardized size */
 font-weight: 600; /* Semi-bold for clarity */
 color: var(--neutral-700, #374151);
}

.examination-form {
 width: 100%;
}

/* Form Groups - Better spacing */
.form-group {
 margin-bottom: 20px; /* Increased spacing */
}

.form-group:last-child {
 margin-bottom: 0;
}

.form-group label {
 font-size: 0.875rem; /* 14px */
 font-weight: 500;
 margin-bottom: 8px; /* More space below label */
 color: var(--neutral-700, #374151);
 display: block;
}

.required {
 color: var(--danger-500, #ef4444);
 margin-left: 3px;
 font-weight: 600;
}

/* Input Wrappers with Icons */
.input-wrapper {
 position: relative;
 display: flex;
 align-items: center;
}

.input-icon {
 position: absolute;
 left: 14px; /* Adjusted for padding */
 color: var(--neutral-400, #9ca3af); /* Lighter default icon color */
 font-size: 1rem; /* 16px */
 pointer-events: none;
 transition: color 0.2s ease;
}

/* Input with Unit Styling */
.input-unit-wrapper {
  display: flex; 
  border: 1px solid var(--neutral-300, #d1d5db);
  border-radius: 10px; 
  overflow: hidden; 
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03); 
  transition: all 0.2s ease;
}

.input-unit-wrapper:hover {
 border-color: var(--neutral-400, #9ca3af); 
}

.input-unit-wrapper:focus-within {
 border-color: var(--primary-500, #10b981);
 box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.25); 
}
.input-unit-wrapper:focus-within .input-icon {
  color: var(--primary-500, #10b981); 
}


.input-unit-wrapper.disabled {
 background-color: var(--neutral-100, #f3f4f6);
 opacity: 0.8; 
 cursor: not-allowed;
  border-color: var(--neutral-200, #e5e7eb);
}
.input-unit-wrapper.disabled .input-icon,
.input-unit-wrapper.disabled .unit-label {
  color: var(--neutral-400, #9ca3af);
}
.input-unit-wrapper.disabled .unit-input { 
  background-color: var(--neutral-100, #f3f4f6); 
  color: var(--neutral-500, #6b7280);
}


.unit-input {
 border: none !important;
 box-shadow: none !important;
 flex: 1;
 border-radius: 0; 
  min-width: 0; 
  background-color: white; 
}

.unit-label {
 padding: 0 14px; 
 color: var(--neutral-600, #4b5563); 
 font-size: 0.875rem; 
 background-color: var(--neutral-100, #f3f4f6); 
 height: auto; 
  align-self: stretch; 
 display: flex;
 align-items: center;
 border-left: 1px solid var(--neutral-300, #d1d5db);
 min-width: 65px; 
 justify-content: center;
 font-weight: 500;
}

/* Input Styling - Enhanced with icons and focus states */
.form-input {
 width: 100%;
 padding: 12px 12px 12px 42px; /* Increased padding, adjusted for icon */
 border: 1px solid var(--neutral-300, #d1d5db);
 border-radius: 10px; /* Consistent rounding */
 font-size: 0.9375rem; /* 15px, slightly larger for readability */
 color: var(--neutral-800, #1f2937);
 background-color: white;
 transition: all 0.2s ease;
 box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}

.form-input::placeholder {
  color: var(--neutral-400, #9ca3af);
  font-size: 0.9rem;
}

.form-input:hover {
 border-color: var(--neutral-400, #9ca3af);
}

.form-input:focus {
 border-color: var(--primary-500, #10b981);
 box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.25);
 outline: none;
}

.form-input:focus + .input-icon, 
.input-wrapper:focus-within .input-icon {
 color: var(--primary-500, #10b981);
}

.form-input.disabled {
 background-color: var(--neutral-100, #f3f4f6);
 color: var(--neutral-500, #6b7280);
 cursor: not-allowed;
  border-color: var(--neutral-200, #e5e7eb);
}

.input-error { 
 border-color: var(--danger-500, #ef4444) !important;
}
.input-error:focus {
  border-color: var(--danger-500, #ef4444) !important; 
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.25) !important; 
}

.input-error-wrapper { 
  border-color: var(--danger-500, #ef4444) !important;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15) !important;
}
.input-error-wrapper:focus-within { 
  border-color: var(--danger-500, #ef4444) !important;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.25) !important;
}
.input-error-wrapper .input-icon { 
  color: var(--danger-500, #ef4444) !important;
}


.date-input {
 padding-right: 12px; 
}

/* Error Message - Improved with icon and animation */
.error-icon { /* Applied to the icon itself if it's part of the error state */
  color: var(--danger-500, #ef4444) !important;
}

.error-message {
 margin-top: 6px; 
 font-size: 0.8125rem; 
 color: var(--danger-700, #b91c1c); 
 font-weight: 500; 
 display: flex;
 align-items: center;
 gap: 6px;
 opacity: 1;
 transition: opacity 0.3s ease, transform 0.3s ease;
}
.error-message .fas { /* If Font Awesome icon is used inside error message */
  font-size: 0.9em;
}

.fade-enter-active, .fade-leave-active {
 transition: opacity 0.3s, transform 0.3s;
}
.fade-enter-from, .fade-leave-to {
 opacity: 0;
 transform: translateY(-5px);
}

/* Form Actions - Clearer separation and button styling */
.form-actions {
 margin-top: 28px; 
 display: flex;
 justify-content: flex-end;
 gap: 12px; 
 padding-top: 20px; 
 border-top: 1px solid var(--neutral-200, #e5e7eb);
}

.btn-cancel {
 padding: 10px 20px; 
 background-color: white;
 border: 1px solid var(--neutral-300, #d1d5db);
 border-radius: 8px;
 font-size: 0.9rem; 
 font-weight: 600; 
 color: var(--neutral-700, #374151);
 cursor: pointer;
 transition: all 0.2s ease;
 display: flex;
 align-items: center;
 gap: 8px;
}

.btn-cancel:hover {
 background-color: var(--neutral-100, #f3f4f6);
 border-color: var(--neutral-400, #9ca3af);
  color: var(--neutral-800, #1f2937);
}
.btn-cancel:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(107, 114, 128, 0.25); 
}


.btn-save {
 padding: 10px 20px; 
 background-color: var(--primary-500, #10b981);
 border: 1px solid var(--primary-500, #10b981); 
 border-radius: 8px;
 font-size: 0.9rem; 
 font-weight: 600; 
 color: white;
 cursor: pointer;
 transition: all 0.2s ease;
 display: flex;
 align-items: center;
 gap: 8px;
 min-width: 130px; 
 justify-content: center;
}

.btn-save:hover {
 background-color: var(--primary-600, #059669);
 border-color: var(--primary-600, #059669);
 box-shadow: 0 2px 8px -2px rgba(0, 0, 0, 0.1); 
}
.btn-save:focus {
  outline: none;
  background-color: var(--primary-600, #059669); 
  border-color: var(--primary-700, #047857);
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.3); 
}

.btn-save:active {
 background-color: var(--primary-700, #047857);
  border-color: var(--primary-700, #047857);
 transform: translateY(1px);
  box-shadow: none; 
}

.btn-save:disabled {
 background-color: var(--neutral-300, #d1d5db); 
  border-color: var(--neutral-300, #d1d5db);
 color: var(--neutral-500, #6b7280); 
 cursor: not-allowed;
 opacity: 1; 
  box-shadow: none;
}
.btn-save:disabled:hover {
  background-color: var(--neutral-300, #d1d5db); 
  border-color: var(--neutral-300, #d1d5db);
}

/* Style untuk Flatpickr */
:deep(.flatpickr-calendar) {
 border-radius: 12px;
 overflow: hidden;
 border: 1px solid var(--neutral-200, #e5e7eb); 
 box-shadow: 0 6px 25px rgba(0, 0, 0, 0.12); 
 font-family: var(--font-sans, 'Inter', sans-serif); 
}

:deep(.flatpickr-month) {
 background-color: var(--primary-500, #10b981);
 color: white;
 padding: 14px 0 10px; 
 height: auto; 
}

:deep(.flatpickr-current-month) {
 padding-top: 0;
 font-size: 1.1rem; 
 font-weight: 500;
}

:deep(.flatpickr-monthDropdown-months) {
 font-weight: 500; 
 color: white;
 font-size: 1.1rem; 
}
:deep(.flatpickr-current-month .numInputWrapper) { /* Hide year input number */
  display: none !important;
}
:deep(.flatpickr-current-month .cur-month) { /* Remove padding if year input is hidden */
  padding: 0 !important;
}


:deep(.flatpickr-prev-month), 
:deep(.flatpickr-next-month) {
 top: 10px; 
 padding: 8px; 
  width: 38px; 
  height: 38px;
}

:deep(.flatpickr-prev-month svg), 
:deep(.flatpickr-next-month svg) {
 fill: rgba(255, 255, 255, 0.85); 
  width: 18px; 
  height: 18px;
}

:deep(.flatpickr-prev-month:hover svg), 
:deep(.flatpickr-next-month:hover svg) {
 fill: white;
}

:deep(.flatpickr-day) {
 border-radius: 8px;
 margin: 1px; 
 line-height: 38px; 
 height: 38px;
 font-weight: 400;
}

:deep(.flatpickr-day.selected),
:deep(.flatpickr-day.startRange),
:deep(.flatpickr-day.endRange) {
 background: var(--primary-500, #10b981);
 border-color: var(--primary-500, #10b981);
  color: white;
}

:deep(.flatpickr-day.selected:hover),
:deep(.flatpickr-day.startRange:hover),
:deep(.flatpickr-day.endRange:hover) {
 background: var(--primary-600, #059669);
 border-color: var(--primary-600, #059669);
  color: white;
}

:deep(.flatpickr-day:hover) {
 background: var(--primary-100, #d1fae5);
 border-color: var(--primary-100, #d1fae5);
 color: var(--primary-700, #047857);
}

:deep(.flatpickr-day.today) {
 border-color: var(--primary-300, #6ee7b7); 
 color: var(--primary-600, #059669);
 font-weight: 500; 
}
:deep(.flatpickr-day.today:not(.selected):hover) {
  background: var(--primary-100, #d1fae5);
  border-color: var(--primary-300, #6ee7b7);
}


:deep(.flatpickr-weekday) {
 color: var(--primary-600, #059669); 
 font-weight: 500;
  font-size: 0.75rem; 
  height: 28px; 
  line-height: 28px;
}

/* Customize SweetAlert */
:deep(.swal2-popup) {
 border-radius: 16px; 
 padding: 28px; 
 font-family: var(--font-sans, 'Inter', sans-serif); 
 box-shadow: 0 10px 30px rgba(0,0,0,0.1); 
}

:deep(.swal2-title) {
 color: var(--neutral-800, #1f2937);
 font-size: 1.25rem; 
  font-weight: 600;
  padding-top: 10px; 
  margin-bottom: 0.8em; 
}

:deep(.swal2-html-container) { 
 color: var(--neutral-600, #4b5563);
 font-size: 0.95rem; 
  line-height: 1.6;
  margin-top: 0; 
  margin-bottom: 1.2em; 
}

:deep(.swal2-confirm) {
 background-color: var(--primary-500, #10b981) !important;
 border-radius: 8px;
 font-size: 0.9rem; 
  font-weight: 600;
 padding: 12px 24px; 
  transition: background-color 0.2s ease;
}
:deep(.swal2-confirm:hover) {
  background-color: var(--primary-600, #059669) !important;
}

:deep(.swal2-confirm:focus) {
 box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.3) !important; 
}

:deep(.swal2-icon) { 
  margin-top: 1em; 
  margin-bottom: 1.5em; 
}

:deep(.swal2-icon.swal2-success) {
 border-color: var(--primary-500, #10b981) !important;
}

:deep(.swal2-icon.swal2-success [class^=swal2-success-line]) {
 background-color: var(--primary-500, #10b981) !important;
}

:deep(.swal2-icon.swal2-error) {
 border-color: var(--danger-500, #ef4444) !important;
}

:deep(.swal2-icon.swal2-error [class^=swal2-x-mark-line]) {
 background-color: var(--danger-500, #ef4444) !important;
}

/* Remove number input spinners */
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
 -webkit-appearance: none;
 margin: 0;
}

input[type="number"] {
 -moz-appearance: textfield;
}

/* Responsive Design Improvements */
@media (max-width: 640px) { 
 .modal-container {
  width: 95%;
  max-height: 95vh;
   border-radius: 12px; 
 }
 
  .modal-header {
    padding: 16px 20px;
  }
  .modal-header h2 {
  font-size: 1.05rem; 
 }
  .icon-margin {
    margin-right: 10px;
    font-size: 1.1em;
  }
  .close-button {
    width: 32px;
    height: 32px;
    font-size: 18px;
  }

  .modal-body {
    padding: 16px 20px;
  }
 
  .form-section {
    padding: 16px;
    margin-bottom: 20px;
  }
 .section-header h3 {
  font-size: 0.95rem; 
 }
  .section-icon {
    font-size: 1rem;
    margin-right: 10px;
  }
 
 .form-actions {
  flex-direction: column-reverse; 
    gap: 10px; 
    margin-top: 20px;
    padding-top: 16px;
 }
 
 .btn-cancel, .btn-save {
  width: 100%;
  justify-content: center;
    padding: 12px 16px; 
    font-size: 0.875rem;
 }
 
 .input-wrapper { 
  width: 100%;
 }
 
 .form-input {
 padding-left: 38px; 
    font-size: 0.9rem;
 }
  .form-input::placeholder {
    font-size: 0.85rem;
  }
 
.input-icon {
left: 12px; 
font-size: 0.9rem; 
}

  .unit-label {
    padding: 0 10px;
    font-size: 0.8125rem;
    min-width: 55px;
  }
}

/* Fallback for CSS Variables if not defined elsewhere */
:root {
  --neutral-100: #f3f4f6;
  --neutral-200: #e5e7eb;
  --neutral-300: #d1d5db;
  --neutral-400: #9ca3af;
  --neutral-500: #6b7280;
  --neutral-600: #4b5563;
  --neutral-700: #374151;
  --neutral-800: #1f2937;
  --neutral-900: #111827;
  --primary-50: #f0fdfa;
  --primary-100: #d1fae5;
  --primary-300: #6ee7b7;
  --primary-500: #10b981;
  --primary-600: #059669;
  --primary-700: #047857;
  --danger-500: #ef4444;
  --danger-700: #b91c1c;
  --font-sans: 'Inter', sans-serif; /* Example font */
}
</style>