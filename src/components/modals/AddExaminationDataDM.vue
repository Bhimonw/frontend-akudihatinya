
<template>
  <div class="modal-backdrop" v-if="visible">
    <div class="modal-container">
      <!-- Header Modal dengan styling dari AddNewPatient -->
      <div class="modal-header">
        <h2><font-awesome-icon :icon="['fas', 'stethoscope']" class="icon-margin" /> Tambah Data Pemeriksaan</h2>
        <button class="close-button" @click="$emit('close')" aria-label="Tutup">
          <font-awesome-icon :icon="['fas', 'times']" />
        </button>
      </div>

      <!-- Form Modal dengan layout sebaris -->
      <div class="modal-body">
        <form class="examination-form" @submit.prevent="handleSubmit">
          <!-- Tanggal Pemeriksaan -->
          <div class="form-section">
            <div class="section-header">
              <font-awesome-icon :icon="['fas', 'calendar-alt']" class="section-icon" />
              <h3>Tanggal Pemeriksaan</h3>
            </div>
            
            <div class="form-group">
              <label for="date">
                Tanggal Pemeriksaan <span class="required">*</span>
              </label>
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

          <!-- Bagian: Hasil Pemeriksaan Gula Darah (Termasuk HbA1c) -->
          <div class="form-section">
            <div class="section-header">
              <font-awesome-icon :icon="['fas', 'vial']" class="section-icon" />
              <h3>Hasil Pemeriksaan Gula Darah</h3>
            </div>
            
            <!-- GDS -->
            <div class="form-group">
              <label for="gdsp">Gula Darah Sewaktu</label>
              <div class="input-wrapper input-unit-wrapper">
                <font-awesome-icon :icon="['fas', 'heartbeat']" class="input-icon" />
                <input 
                  type="number" 
                  id="gdsp"
                  v-model.number="formData.gdsp" 
                  @input="validateGdsp" 
                  placeholder="Masukkan nilai" 
                  class="form-input unit-input"
                  :class="{ 'input-error': errors.gdsp }"
                />
                <span class="unit-label">mg/dL</span>
              </div>
              <transition name="fade">
                <p v-if="errors.gdsp" class="error-message">
                  <font-awesome-icon :icon="['fas', 'exclamation-circle']" /> 
                  {{ errors.gdsp }}
                </p>
              </transition>
            </div>

            <!-- GDP -->
            <div class="form-group">
              <label for="gdp">Gula Darah Puasa</label>
              <div class="input-wrapper input-unit-wrapper">
                <font-awesome-icon :icon="['fas', 'tint']" class="input-icon" />
                <input 
                  type="number" 
                  id="gdp"
                  v-model.number="formData.gdp" 
                  @input="validateGdp" 
                  placeholder="Masukkan nilai" 
                  class="form-input unit-input"
                  :class="{ 'input-error': errors.gdp }"
                />
                <span class="unit-label">mg/dL</span>
              </div>
              <transition name="fade">
                <p v-if="errors.gdp" class="error-message">
                  <font-awesome-icon :icon="['fas', 'exclamation-circle']" /> 
                  {{ errors.gdp }}
                </p>
              </transition>
            </div>
            
            <!-- GD2JPP -->
            <div class="form-group">
              <label for="gd2jpp">Gula Darah 2 Jam PP</label>
              <div class="input-wrapper input-unit-wrapper" v-if="formData.gdp !== null && formData.gdp !== ''">
                <font-awesome-icon :icon="['fas', 'clock']" class="input-icon" />
                <input 
                  type="number" 
                  id="gd2jpp"
                  v-model.number="formData.gd2jpp" 
                  @input="validateGd2jpp" 
                  placeholder="Masukkan nilai" 
                  class="form-input unit-input"
                  :class="{ 'input-error': errors.gd2jpp }"
                />
                <span class="unit-label">mg/dL</span>
              </div>
              <div class="input-wrapper input-unit-wrapper disabled" v-else>
                <font-awesome-icon :icon="['fas', 'clock']" class="input-icon" />
                <input 
                  type="number" 
                  disabled 
                  class="form-input unit-input disabled" 
                  placeholder="Tidak tersedia" 
                />
                <span class="unit-label disabled">mg/dL</span>
              </div>
              <transition name="fade">
                <p v-if="errors.gd2jpp" class="error-message">
                  <font-awesome-icon :icon="['fas', 'exclamation-circle']" /> 
                  {{ errors.gd2jpp }}
                </p>
              </transition>
              <small v-if="formData.gdp === null || formData.gdp === ''" class="helper-text">
                <font-awesome-icon :icon="['fas', 'info-circle']" />
                Silakan isi GDP terlebih dahulu
              </small>
            </div>
            
            <!-- Hba1c (Dimasukkan dalam section Gula Darah) -->
            <div class="form-group">
              <label for="hba1c">HbA1c</label>
              <div class="input-wrapper input-unit-wrapper hba1c-wrapper">
                <font-awesome-icon :icon="['fas', 'percent']" class="input-icon" />
                <div class="hba1c-inputs">
                  <input
                    type="number"
                    id="hba1c-int"
                    min="3"
                    max="15"
                    step="1"
                    v-model.number="hba1cInt"
                    @input="validateHba1c"
                    placeholder="0"
                    class="form-input hba1c-input"
                    :class="{ 'input-error': errors.hba1c }"
                  />
                  <span class="dot">.</span>
                  <input
                    type="number"
                    id="hba1c-dec"
                    min="0"
                    max="9"
                    step="1"
                    v-model.number="hba1cDec"
                    @input="validateHba1c"
                    placeholder="0"
                    class="form-input hba1c-input"
                    :class="{ 'input-error': errors.hba1c }"
                  />
                </div>
                <span class="unit-label">%</span>
              </div>
              <transition name="fade">
                <p v-if="errors.hba1c" class="error-message">
                  <font-awesome-icon :icon="['fas', 'exclamation-circle']" /> 
                  {{ errors.hba1c }}
                </p>
              </transition>
            </div>
          </div>
          
          <!-- Tombol Aksi -->
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
// Script tidak diubah untuk mempertahankan logic yang ada
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
    selectedYear: {
      type: [Number, String],
      required: true,
    },
  },
  components: {
    Flatpickr
  },
  data() {
    // Mendapatkan tahun saat ini untuk perbandingan
    const currentYear = new Date().getFullYear();
    const selectedYear = parseInt(this.selectedYear);
    
    // Tentukan defaultDate berdasarkan selectedYear
    let defaultDate;
    if (selectedYear === currentYear) {
      // Jika tahun yang dipilih sama dengan tahun saat ini, gunakan tanggal hari ini
      defaultDate = new Date();
    } else {
      // Jika tahun yang dipilih berbeda dari tahun saat ini, gunakan 31 Desember tahun tersebut
      defaultDate = new Date(selectedYear, 11, 31); // 11 adalah indeks untuk bulan Desember (0-11)
    }
    
    return {
      formData: {
        date: defaultDate, // Gunakan objek Date langsung
        hba1c: null,
        gdp: null,
        gd2jpp: null,
        gdsp: null,
      },
      hba1cInt: null,
      hba1cDec: null,
      isSubmitting: false,
      errors: {},
      flatpickrConfig: {
        // Format tampilan: tanggal [spasi] nama bulan [spasi] tahun
        dateFormat: "d F Y",
        defaultDate: defaultDate,
        disableMobile: true,
        // Menggunakan localization bahasa Indonesia
        locale: Indonesian,
        // Konfigurasi tambahan untuk menyembunyikan selector tahun
        minDate: new Date(selectedYear, 0, 1), // 1 Januari tahun yang dipilih
        maxDate: new Date(selectedYear, 11, 31), // 31 Desember tahun yang dipilih
        // Menonaktifkan navigasi bulan yang melewati tahun yang dipilih
        onMonthChange: function(selectedDates, dateStr, instance) {
          const currentDate = instance.currentYear * 12 + instance.currentMonth;
          if (currentDate < selectedYear * 12 || currentDate >= (selectedYear + 1) * 12) {
            // Reset ke bulan dalam tahun yang dipilih jika navigasi keluar dari tahun tersebut
            instance.currentYear = selectedYear;
          }
        },
        // Menonaktifkan pemilihan tahun dalam UI kalender
        enableYearChange: false,
        // Override untuk memastikan tahun selalu sesuai dengan selectedYear
        onReady: function(selectedDates, dateStr, instance) {
          // Force the year to be the selected year
          instance.currentYear = selectedYear;
          instance.redraw();
        },
        onChange: function(selectedDates, dateStr, instance) {
          // Jika user memilih tanggal, pastikan tahunnya tetap sesuai props
          if (selectedDates.length > 0) {
            const date = selectedDates[0];
            if (date.getFullYear() !== selectedYear) {
              date.setFullYear(selectedYear);
              instance.setDate(date, true);
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
    validateGdsp() {
      const val = this.formData.gdsp;
      if (val === null || val === undefined || val === '') {
        // Input kosong, hilangkan error
        this.errors.gdsp = "";
        return;
      }
      
      // Cek range
      if (val < 20 || val > 600) {
        this.errors.gdsp = "Nilai GDS harus antara 20 dan 600.";
      } else {
        this.errors.gdsp = "";
      }
    },
    validateGdp() {
      const val = this.formData.gdp;
      if (val === null || val === undefined || val === '') {
        // Input kosong, hilangkan error
        this.errors.gdp = "";
        return;
      }
      
      // Cek range
      if (val < 20 || val > 600) {
        this.errors.gdp = "Nilai GDP harus antara 20 dan 600.";
      } else {
        this.errors.gdp = "";
      }
    },
    validateGd2jpp() {
      const val = this.formData.gd2jpp;
      if (val === null || val === undefined || val === '') {
        // Input kosong, hilangkan error
        this.errors.gd2jpp = "";
        return;
      }
      
      // Cek range
      if (val < 20 || val > 600) {
        this.errors.gd2jpp = "Nilai GD2JPP harus antara 20 dan 600.";
      } else {
        this.errors.gd2jpp = "";
      }
    },
    validateHba1c() {
      // Ambil nilai bulat dan desimal
      let int = this.hba1cInt;
      let dec = this.hba1cDec;

      // Jika keduanya kosong, anggap null (tidak diisi)
      if ((int === null || int === undefined || int === '') && 
          (dec === null || dec === undefined || dec === '')) {
        this.formData.hba1c = null;
        this.errors.hba1c = "";
        return;
      }

      // Handle case ketika salah satu field kosong
      if (int === null || int === undefined || int === '') {
        int = 0;
      }
      if (dec === null || dec === undefined || dec === '') {
        dec = 0;
      }

      // Convert ke tipe numerik untuk kalkulasi
      int = parseFloat(int);
      dec = parseFloat(dec);

      // Validasi angka yang dimasukkan
      if (isNaN(int) || isNaN(dec)) {
        this.errors.hba1c = "Masukkan angka yang valid.";
        return;
      }

      // Hitung total nilai
      const total = int + (dec / 10);

      // Validasi range
      if (total < 3.0 || total > 15.0) {
        this.errors.hba1c = "Nilai HbA1c harus antara 3.0 dan 15.0.";
      } else {
        this.formData.hba1c = total;
        this.errors.hba1c = "";
      }
    },
    async handleSubmit() {
      try {
        this.isSubmitting = true;

        // Validasi input minimal satu nilai pemeriksaan
        if (
          !this.formData.hba1c &&
          !this.formData.gdp &&
          !this.formData.gd2jpp &&
          !this.formData.gdsp
        ) {
          throw new Error("Minimal satu nilai pemeriksaan harus diisi.");
        }

        // Pastikan tanggal ada dan valid
        if (!this.formData.date) {
          throw new Error("Tanggal pemeriksaan harus diisi.");
        }

        // Format tanggal untuk API
        let dateToUse;
        if (this.formData.date instanceof Date) {
          // Jika sudah berupa objek Date
          dateToUse = this.formData.date;
        } else {
          // Jika berupa string, coba parse
          try {
            // Coba parse format "DD Bulan YYYY"
            const dateParts = this.formData.date.split(' ');
            if (dateParts.length < 3) {
              throw new Error("Format tanggal tidak valid");
            }
            
            const day = parseInt(dateParts[0]);
            const monthName = dateParts[1].toLowerCase();
            const monthNames = [
              'januari', 'februari', 'maret', 'april', 'mei', 'juni',
              'juli', 'agustus', 'september', 'oktober', 'november', 'desember'
            ];
            const month = monthNames.indexOf(monthName);
            if (month === -1) {
              throw new Error("Format tanggal tidak valid");
            }
            
            dateToUse = new Date(parseInt(this.selectedYear), month, day);
          } catch (parseError) {
            throw new Error("Format tanggal tidak valid");
          }
        }
        
        // Format tanggal untuk API (YYYY-MM-DD)
        const year = parseInt(this.selectedYear);
        const month = (dateToUse.getMonth() + 1).toString().padStart(2, '0');
        const day = dateToUse.getDate().toString().padStart(2, '0');
        const examinationDate = `${year}-${month}-${day}`;

        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Token tidak ditemukan");
        }

        // Format payload sesuai dengan API
        const payload = {
          patient_id: parseInt(this.patientId),
          examination_date: examinationDate,
          examinations: {
            hba1c: this.formData.hba1c || null,
            gdp: this.formData.gdp || null,
            gd2jpp: this.formData.gd2jpp || null,
            gdsp: this.formData.gdsp || null,
          },
        };

        console.log("Payload being sent:", payload);

        // Kirim data ke API
        const response = await axios.post(
          "http://localhost:8000/api/puskesmas/dm-examinations",
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        console.log("API Response:", response.data);

        // Tampilkan notifikasi sukses
        Swal.fire({
          icon: "success",
          title: "Berhasil",
          text: "Data pemeriksaan berhasil ditambahkan.",
          confirmButtonText: "Tutup",
        });

        // Emit event untuk memberi tahu parent component
        this.$emit("submit");

        // Reset form dan tutup modal
        this.resetForm();
        this.$emit("close");
      } catch (error) {
        console.error("Error adding examination:", error);

        // Tampilkan notifikasi gagal
        Swal.fire({
          icon: "error",
          title: "Gagal",
          text:
            error.response?.data?.message ||
            error.message ||
            "Terjadi kesalahan saat menambahkan data pemeriksaan.",
          confirmButtonText: "Tutup",
        });
      } finally {
        this.isSubmitting = false;
      }
    },
    resetForm() {
      // Persiapkan default date lagi
      const currentYear = new Date().getFullYear();
      const selectedYear = parseInt(this.selectedYear);
      
      let defaultDate;
      if (selectedYear === currentYear) {
        defaultDate = new Date();
      } else {
        defaultDate = new Date(selectedYear, 11, 31);
      }
      
      this.formData = {
        date: defaultDate, // Reset ke default date untuk menghindari masalah validasi
        hba1c: null,
        gdp: null,
        gd2jpp: null,
        gdsp: null,
      };
      this.hba1cInt = null;
      this.hba1cDec = null;
      this.errors = {};
    },
  },
  watch: {
    // Reset form saat modal ditutup
    visible(newValue) {
      if (!newValue) {
        this.resetForm();
      }
    },
    // Reset form saat tahun berubah
    selectedYear(newValue) {
      this.resetForm();
    }
  }
};
</script>

<style scoped>
/* Variables for consistent colors - Menggunakan skema warna hijau dari AddNewPatient */
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
  max-width: 580px; /* Lebih sempit untuk layout sebaris */
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
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--neutral-200);
  background-color: var(--primary-50);
}

.modal-header h2 {
  margin: 0;
  font-size: 18px;
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
  font-size: 18px;
  color: var(--neutral-500);
  cursor: pointer;
  width: 30px;
  height: 30px;
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
  padding: 16px 20px;
  flex-grow: 1;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--neutral-400) var(--neutral-100);
}

.modal-body::-webkit-scrollbar {
  width: 6px;
}

.modal-body::-webkit-scrollbar-track {
  background: var(--neutral-100);
  border-radius: 10px;
}

.modal-body::-webkit-scrollbar-thumb {
  background-color: var(--neutral-400);
  border-radius: 10px;
}

/* Form Sections - Simplified spacing for sebaris layout */
.form-section {
  background-color: white;
  border-radius: 10px;
  border: 1px solid var(--neutral-200);
  padding: 16px;
  margin-bottom: 20px;
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
  padding-bottom: 10px;
  border-bottom: 1px solid var(--neutral-200);
}

.section-icon {
  font-size: 16px;
  color: var(--primary-500);
  margin-right: 10px;
}

.section-header h3 {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: var(--neutral-700);
}

.examination-form {
  width: 100%;
}

/* Form Groups - Improved spacing for sebaris layout */
.form-group {
  margin-bottom: 16px;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 6px;
  color: var(--neutral-700);
  display: block;
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

/* Input with Unit Styling */
.input-unit-wrapper {
  border: 1px solid var(--neutral-300);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.input-unit-wrapper:hover {
  border-color: var(--primary-300);
}

.input-unit-wrapper:focus-within {
  border-color: var(--primary-500);
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
}

.input-unit-wrapper.disabled {
  background-color: var(--neutral-100);
  opacity: 0.7;
  cursor: not-allowed;
}

.unit-input {
  border: none !important;
  box-shadow: none !important;
  flex: 1;
  border-radius: 0;
}

.unit-label {
  padding: 0 12px;
  color: var(--neutral-500);
  font-size: 14px;
  background-color: var(--neutral-50);
  height: 100%;
  display: flex;
  align-items: center;
  border-left: 1px solid var(--neutral-300);
  min-width: 60px;
  justify-content: center;
  font-weight: 500;
}

.unit-label.disabled {
  color: var(--neutral-400);
}

/* Input Styling - Enhanced with icons and focus states */
.form-input {
  width: 100%;
  padding: 10px 10px 10px 36px;
  border: 1px solid var(--neutral-300);
  border-radius: 8px;
  font-size: 14px;
  color: var(--neutral-800);
  background-color: white;
  transition: all 0.3s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.form-input:hover {
  border-color: var(--primary-300);
}

.form-input:focus {
  border-color: var(--primary-500);
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
  outline: none;
}

.form-input:focus + .input-icon {
  color: var(--primary-500);
}

.form-input.disabled {
  background-color: var(--neutral-100);
  color: var(--neutral-500);
  cursor: not-allowed;
}

.input-error {
  border-color: var(--danger-500) !important;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
}

.date-input {
  padding-right: 10px; /* Allow space for date picker icon */
}

/* HbA1c Input styling */
.hba1c-wrapper {
  display: flex;
  align-items: center;
}

.hba1c-inputs {
  display: flex;
  align-items: center;
  flex: 1;
  padding-left: 36px;
}

.hba1c-input {
  width: 60px;
  text-align: center;
  padding: 10px 6px !important;
  border-radius: 0 !important;
  border: none !important;
  box-shadow: none !important;
}

.dot {
  font-weight: bold;
  font-size: 18px;
  margin: 0 2px;
  color: var(--neutral-700);
}

/* Helper text */
.helper-text {
  margin-top: 4px;
  font-size: 12px;
  color: var(--neutral-500);
  display: flex;
  align-items: center;
  gap: 6px;
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
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 16px;
  border-top: 1px solid var(--neutral-200);
}

/* Cancel Button */
.btn-cancel {
  padding: 10px 16px;
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
  padding: 10px 16px;
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

/* Style untuk Flatpickr */
:deep(.flatpickr-calendar) {
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--neutral-300);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

:deep(.flatpickr-month) {
  background-color: var(--primary-500);
  color: white;
  padding: 12px 0 8px;
}

:deep(.flatpickr-current-month) {
  padding-top: 0;
}

:deep(.flatpickr-monthDropdown-months) {
  font-weight: 600;
  color: white;
}

:deep(.flatpickr-prev-month), 
:deep(.flatpickr-next-month) {
  top: 6px;
  padding: 6px;
}

:deep(.flatpickr-prev-month svg), 
:deep(.flatpickr-next-month svg) {
  fill: rgba(255, 255, 255, 0.8);
}

:deep(.flatpickr-prev-month:hover svg), 
:deep(.flatpickr-next-month:hover svg) {
  fill: white;
}

:deep(.flatpickr-day) {
  border-radius: 8px;
  margin: 2px;
  line-height: 34px;
  height: 34px;
}

:deep(.flatpickr-day.selected) {
  background: var(--primary-500);
  border-color: var(--primary-500);
}

:deep(.flatpickr-day.selected:hover) {
  background: var(--primary-600);
  border-color: var(--primary-600);
}

:deep(.flatpickr-day:hover) {
  background: var(--primary-100);
  border-color: var(--primary-100);
  color: var(--primary-700);
}

:deep(.flatpickr-day.today) {
  border-color: var(--primary-500);
  color: var(--primary-500);
  font-weight: 600;
}

:deep(.flatpickr-weekday) {
  color: var(--primary-700);
  font-weight: 600;
}

:deep(.flatpickr-current-month .numInputWrapper) {
  display: none !important;
}

:deep(.flatpickr-current-month .cur-month) {
  padding: 0 !important;
}

/* Customize SweetAlert */
:deep(.swal2-popup) {
  border-radius: 12px;
  padding: 24px;
}

:deep(.swal2-title) {
  color: var(--neutral-800);
  font-size: 18px;
}

:deep(.swal2-content) {
  color: var(--neutral-600);
  font-size: 14px;
}

:deep(.swal2-confirm) {
  background-color: var(--primary-500) !important;
  border-radius: 8px;
  font-size: 14px;
  padding: 10px 20px;
}

:deep(.swal2-confirm:focus) {
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2) !important;
}

:deep(.swal2-icon.swal2-success) {
  border-color: var(--primary-500) !important;
}

:deep(.swal2-icon.swal2-success [class^=swal2-success-line]) {
  background-color: var(--primary-500) !important;
}

:deep(.swal2-icon.swal2-error) {
  border-color: var(--danger-500) !important;
}

:deep(.swal2-icon.swal2-error [class^=swal2-x-mark-line]) {
  background-color: var(--danger-500) !important;
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
@media (max-width: 576px) {
  .modal-container {
    width: 95%;
    max-height: 95vh;
  }
  
  .modal-header h2 {
    font-size: 16px;
  }
  
  .section-header h3 {
    font-size: 15px;
  }
  
  .form-actions {
    flex-direction: column-reverse;
  }
  
  .btn-cancel, .btn-save {
    width: 100%;
    justify-content: center;
  }
  
  .input-wrapper {
    width: 100%;
  }
  
  .form-input {
    padding-left: 32px;
  }
  
  .input-icon {
    left: 10px;
    font-size: 14px;
  }
  
  .hba1c-inputs {
    padding-left: 32px;
  }
}
</style>