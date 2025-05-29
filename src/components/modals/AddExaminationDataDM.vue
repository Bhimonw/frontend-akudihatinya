
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

          <!-- Bagian: Hasil Pemeriksaan Gula Darah (Termasuk HbA1c) -->
          <div class="form-section">
            <div class="section-header">
              <font-awesome-icon :icon="['fas', 'vial']" class="section-icon" />
              <h3>Hasil Pemeriksaan Gula Darah</h3>
            </div>
            
            <!-- GDS -->
            <div class="form-group">
              <label for="gdsp">Gula Darah Sewaktu</label>
              <div class="input-wrapper input-unit-wrapper" :class="{ 'input-error-wrapper': errors.gdsp }">
                <font-awesome-icon :icon="['fas', 'heartbeat']" class="input-icon" :class="{ 'error-icon': errors.gdsp }" />
                <input 
                  type="number" 
                  id="gdsp"
                  v-model.number="formData.gdsp" 
                  @input="validateGdsp" 
                  placeholder="Masukkan nilai" 
                  class="form-input unit-input"
                  :class="{ 'input-error': errors.gdsp }"
                  ref="gdspInput"
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
              <div class="input-wrapper input-unit-wrapper" :class="{ 'input-error-wrapper': errors.gdp }">
                <font-awesome-icon :icon="['fas', 'tint']" class="input-icon" :class="{ 'error-icon': errors.gdp }" />
                <input 
                  type="number" 
                  id="gdp"
                  v-model.number="formData.gdp" 
                  @input="validateGdp" 
                  placeholder="Masukkan nilai" 
                  class="form-input unit-input"
                  :class="{ 'input-error': errors.gdp }"
                  ref="gdpInput"
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
              <div class="input-wrapper input-unit-wrapper" v-if="formData.gdp !== null && formData.gdp !== ''" :class="{ 'input-error-wrapper': errors.gd2jpp }">
                <font-awesome-icon :icon="['fas', 'clock']" class="input-icon" :class="{ 'error-icon': errors.gd2jpp }" />
                <input 
                  type="number" 
                  id="gd2jpp"
                  v-model.number="formData.gd2jpp" 
                  @input="validateGd2jpp" 
                  placeholder="Masukkan nilai" 
                  class="form-input unit-input"
                  :class="{ 'input-error': errors.gd2jpp }"
                  ref="gd2jppInput"
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
              <div class="input-wrapper input-unit-wrapper hba1c-wrapper" :class="{ 'input-error-wrapper': errors.hba1c }">
                <font-awesome-icon :icon="['fas', 'percent']" class="input-icon" :class="{ 'error-icon': errors.hba1c }" />
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
                    ref="hba1cIntInput"
                  />
                  <span class="dot" :class="{ 'error-dot': errors.hba1c }">.</span>
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
                    ref="hba1cDecInput"
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
    validateForm() {
      // Jalankan semua validasi manual
      this.validateGdsp();
      this.validateGdp();
      this.validateGd2jpp();
      this.validateHba1c();

      // Cek apakah ada error
      const hasError = Object.values(this.errors).some(error => error);

      if (hasError) {
        // Temukan field pertama yang error
        const firstErrorKey = Object.keys(this.errors).find(key => this.errors[key]);
        
        // Arahkan fokus ke field tersebut
        if (firstErrorKey) {
          let inputRef;
          switch(firstErrorKey) {
            case 'gdsp':
              inputRef = this.$refs.gdspInput;
              break;
            case 'gdp':
              inputRef = this.$refs.gdpInput;
              break;
            case 'gd2jpp':
              inputRef = this.$refs.gd2jppInput;
              break;
            case 'hba1c':
              inputRef = this.$refs.hba1cIntInput || this.$refs.hba1cDecInput;
              break;
          }

          if (inputRef && inputRef.focus) {
            inputRef.focus();
          }
        }

        return false; // Form tidak boleh disubmit
      }

      return true; // Semua valid
    },
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
        if (!this.validateForm()) {
          // Jika ada error, hentikan proses
          return;
        }
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
 border-bottom: 1px solid var(--neutral-200);
 background-color: var(--primary-50); /* Lighter background for a cleaner look */
}

.modal-header h2 {
 margin: 0;
 font-size: 1.15rem; /* Slightly larger */
 font-weight: 600;
 color: var(--neutral-800); /* Darker for better contrast on light bg */
 display: flex;
 align-items: center;
}

.icon-margin {
 margin-right: 12px; /* Increased margin */
 color: var(--primary-500);
 font-size: 1.2em; /* Slightly larger icon */
}

.close-button {
 background: transparent;
 border: none;
 font-size: 20px; /* Larger close icon */
 color: var(--neutral-500);
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
 background-color: var(--neutral-200);
 color: var(--neutral-900);
}

/* Modal Body - Improved padding and scrollbar aesthetics */
.modal-body {
 padding: 20px 24px; /* Consistent padding with header */
 flex-grow: 1;
 overflow-y: auto;
 scrollbar-width: thin;
 scrollbar-color: var(--neutral-300) var(--neutral-100); /* Softer scrollbar */
}

.modal-body::-webkit-scrollbar {
 width: 8px; /* Slightly wider scrollbar */
}

.modal-body::-webkit-scrollbar-track {
 background: var(--neutral-100);
 border-radius: 10px;
}

.modal-body::-webkit-scrollbar-thumb {
 background-color: var(--neutral-300);
 border-radius: 10px;
 border: 2px solid var(--neutral-100); /* Creates a "floating" thumb effect */
}

.modal-body::-webkit-scrollbar-thumb:hover {
 background-color: var(--neutral-400);
}

/* Form Sections - Cleaner look, more spacing */
.form-section {
 background-color: white;
 border-radius: 12px; /* Consistent with modal container */
 border: 1px solid var(--neutral-200);
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
 border-bottom: 1px solid var(--neutral-200);
}

.section-icon {
 font-size: 1.1rem; /* Slightly larger */
 color: var(--primary-500);
 margin-right: 12px; /* Increased margin */
}

.section-header h3 {
 margin: 0;
 font-size: 1rem; /* Standardized size */
 font-weight: 600; /* Semi-bold for clarity */
 color: var(--neutral-700);
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
 color: var(--neutral-700);
 display: block;
}

.required {
 color: var(--danger-500);
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
 color: var(--neutral-400); /* Lighter default icon color */
 font-size: 1rem; /* 16px */
 pointer-events: none;
 transition: color 0.2s ease;
}

/* Input with Unit Styling */
.input-unit-wrapper {
  display: flex; /* Added to ensure children align well */
 border: 1px solid var(--neutral-300);
 border-radius: 10px; /* Slightly more rounded */
 overflow: hidden; /* Crucial for child border-radius */
 box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03); /* Softer shadow */
 transition: all 0.2s ease;
}

.input-unit-wrapper:hover {
 border-color: var(--neutral-400); /* Softer hover */
}

.input-unit-wrapper:focus-within {
 border-color: var(--primary-500);
 box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.25); /* Slightly more prominent focus shadow */
}
.input-unit-wrapper:focus-within .input-icon {
  color: var(--primary-500); /* Change icon color on focus-within */
}


.input-unit-wrapper.disabled {
 background-color: var(--neutral-100);
 opacity: 0.8; /* Slightly more visible when disabled */
 cursor: not-allowed;
  border-color: var(--neutral-200);
}
.input-unit-wrapper.disabled .input-icon,
.input-unit-wrapper.disabled .unit-label {
  color: var(--neutral-400);
}
.input-unit-wrapper.disabled .unit-input { /* Target child input when wrapper is disabled */
  background-color: var(--neutral-100); /* Ensure input bg matches */
  color: var(--neutral-500);
}


.unit-input {
 border: none !important;
 box-shadow: none !important;
 flex: 1;
  /* Remove individual border-radius if it's inside a wrapper that has overflow:hidden and its own border-radius */
 border-radius: 0; 
  min-width: 0; /* Allow shrinking */
  background-color: white; /* Ensure it's white by default */
}

.unit-label {
 padding: 0 14px; /* Slightly more padding */
 color: var(--neutral-600); /* Darker for better readability */
 font-size: 0.875rem; /* 14px */
 background-color: var(--neutral-100); /* Slightly different from disabled bg for contrast */
 height: auto; /* Let it size with input */
  align-self: stretch; /* Make it fill height */
 display: flex;
 align-items: center;
 border-left: 1px solid var(--neutral-300);
 min-width: 65px; /* Slightly wider */
 justify-content: center;
 font-weight: 500;
}

/* Input Styling - Enhanced with icons and focus states */
.form-input {
 width: 100%;
 padding: 12px 12px 12px 42px; /* Increased padding, adjusted for icon */
 border: 1px solid var(--neutral-300);
 border-radius: 10px; /* Consistent rounding */
 font-size: 0.9375rem; /* 15px, slightly larger for readability */
 color: var(--neutral-800);
 background-color: white;
 transition: all 0.2s ease;
 box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}

.form-input::placeholder {
  color: var(--neutral-400);
  font-size: 0.9rem;
}

.form-input:hover {
 border-color: var(--neutral-400);
}

.form-input:focus {
 border-color: var(--primary-500);
 box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.25);
 outline: none;
}

/* Selector for icon color change when input is focused (if icon is sibling) or wrapper is focused */
.form-input:focus + .input-icon, 
.input-wrapper:focus-within .input-icon {
 color: var(--primary-500);
}

.form-input.disabled {
 background-color: var(--neutral-100);
 color: var(--neutral-500);
 cursor: not-allowed;
  border-color: var(--neutral-200);
}

.input-error { /* This class applies directly to the input field */
 border-color: var(--danger-500) !important;
  /* The box-shadow might be better on the wrapper if using .input-error-wrapper */
}
.input-error:focus {
  border-color: var(--danger-500) !important; 
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.25) !important; 
}

/* Add this class to the .input-unit-wrapper or .input-wrapper if its child input has an error */
.input-error-wrapper { 
  border-color: var(--danger-500) !important;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15) !important;
}
.input-error-wrapper:focus-within { /* Maintain error indication on focus */
  border-color: var(--danger-500) !important;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.25) !important;
}
.input-error-wrapper .input-icon { /* Optionally change icon color in error state */
  color: var(--danger-500) !important;
}


.date-input {
 padding-right: 12px; /* Allow space for date picker icon */
}

/* HbA1c Input styling - Improved clarity */
.hba1c-wrapper { /* This is an .input-unit-wrapper, specific styling below applies to its children */
 display: flex;
 align-items: center;
  /* .input-error-wrapper class should be applied here if errors.hba1c is true */
}

.hba1c-inputs {
 display: flex;
 align-items: center;
 flex-grow: 1; /* Allow it to take available space */
 padding-left: 42px; /* Consistent with .form-input padding (icon width + space) */
}

.hba1c-input {
 width: auto; /* Allow flexible width */
  min-width: 50px; /* Minimum width */
  flex: 1; /* Distribute space */
 text-align: center;
 padding: 12px 8px !important; /* Match .form-input padding, reduced horizontal for less space */
 border-radius: 0 !important;
 border: none !important;
 box-shadow: none !important;
  font-size: 0.9375rem; /* Consistent font size */
  background-color: transparent; /* Ensure no double background from wrapper */
  color: var(--neutral-800);
}
.hba1c-input::placeholder {
  color: var(--neutral-400);
  font-size: 0.9rem;
}
/* If .hba1c-wrapper has .input-error-wrapper, the individual inputs don't need specific error styles unless desired */
.input-error-wrapper .hba1c-input {
  /* color: var(--danger-700); /* Optionally make text red too */
}

.dot {
 font-weight: bold;
 font-size: 1.2rem; /* Slightly larger dot */
 margin: 0 4px; /* More space around dot */
 color: var(--neutral-600); /* Darker dot for clarity */
  align-self: center; /* Vertically center the dot */
  padding-bottom: 2px; /* Fine-tune vertical alignment if needed */
}
.input-error-wrapper .dot { /* Optionally color the dot red in error state */
  /* color: var(--danger-500); */
}

/* Helper text */
.helper-text {
 margin-top: 6px; /* More space */
 font-size: 0.8125rem; /* 13px */
 color: var(--neutral-600); /* Slightly darker for readability */
 display: flex;
 align-items: center;
 gap: 6px;
}
.helper-text .fas { /* Assuming Font Awesome is used via class */
  font-size: 0.9em; /* Adjust icon size within helper text */
}


/* Error Message - Improved with icon and animation */
.error-icon {
  color: var(--danger-500) !important;
}

.error-dot {
  color: var(--danger-500) !important;
}

.input-error-wrapper {
  border-color: var(--danger-500) !important;
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.15) !important;
  transition: all 0.2s ease;
}

.input-error {
  border-color: var(--danger-500) !important;
  background-color: rgba(254, 242, 242, 0.2) !important;
}

.error-message {
 margin-top: 6px; /* More space */
 font-size: 0.8125rem; /* 13px */
 color: var(--danger-700); /* Darker red for better contrast */
 font-weight: 500; /* Slightly bolder for emphasis */
 display: flex;
 align-items: center;
 gap: 6px;
 opacity: 1;
 transition: opacity 0.3s ease, transform 0.3s ease;
}
.error-message .fas {
  font-size: 0.9em;
}

/* Fade transition for error messages (UNCHANGED) */
.fade-enter-active, .fade-leave-active {
 transition: opacity 0.3s, transform 0.3s;
}
.fade-enter-from, .fade-leave-to {
 opacity: 0;
 transform: translateY(-5px);
}

/* Form Actions - Clearer separation and button styling */
.form-actions {
 margin-top: 28px; /* More space before actions */
 display: flex;
 justify-content: flex-end;
 gap: 12px; /* More space between buttons */
 padding-top: 20px; /* Increased padding */
 border-top: 1px solid var(--neutral-200);
}

/* Cancel Button */
.btn-cancel {
 padding: 10px 20px; /* Increased padding */
 background-color: white;
 border: 1px solid var(--neutral-300);
 border-radius: 8px;
 font-size: 0.9rem; /* 14.4px */
 font-weight: 600; /* Bolder */
 color: var(--neutral-700);
 cursor: pointer;
 transition: all 0.2s ease;
 display: flex;
 align-items: center;
 gap: 8px;
}

.btn-cancel:hover {
 background-color: var(--neutral-100);
 border-color: var(--neutral-400);
  color: var(--neutral-800);
}
.btn-cancel:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(107, 114, 128, 0.25); /* Neutral focus ring */
}


/* Save Button */
.btn-save {
 padding: 10px 20px; /* Increased padding */
 background-color: var(--primary-500);
 border: 1px solid var(--primary-500); /* Added border for consistency */
 border-radius: 8px;
 font-size: 0.9rem; /* 14.4px */
 font-weight: 600; /* Bolder */
 color: white;
 cursor: pointer;
 transition: all 0.2s ease;
 display: flex;
 align-items: center;
 gap: 8px;
 min-width: 130px; /* Slightly wider */
 justify-content: center;
}

.btn-save:hover {
 background-color: var(--primary-600);
 border-color: var(--primary-600);
 box-shadow: 0 2px 8px -2px rgba(0, 0, 0, 0.1); /* Softer hover shadow */
}
.btn-save:focus {
  outline: none;
  background-color: var(--primary-600); /* Darken on focus too */
  border-color: var(--primary-700);
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.3); /* Primary focus ring */
}

.btn-save:active {
 background-color: var(--primary-700);
  border-color: var(--primary-700);
 transform: translateY(1px);
  box-shadow: none; /* Remove shadow on active */
}

.btn-save:disabled {
 background-color: var(--neutral-300); /* Lighter disabled bg */
  border-color: var(--neutral-300);
 color: var(--neutral-500); /* Darker disabled text for readability */
 cursor: not-allowed;
 opacity: 1; /* Remove opacity, rely on color changes */
  box-shadow: none;
}
.btn-save:disabled:hover {
  background-color: var(--neutral-300); /* Keep same on hover when disabled */
  border-color: var(--neutral-300);
}


/* Style untuk Flatpickr (minor adjustments for cohesion) */
:deep(.flatpickr-calendar) {
 border-radius: 12px;
 overflow: hidden;
 border: 1px solid var(--neutral-200); /* Lighter border */
 box-shadow: 0 6px 25px rgba(0, 0, 0, 0.12); /* Refined shadow */
  font-family: var(--font-sans); /* Ensure consistent font */
}

:deep(.flatpickr-month) {
 background-color: var(--primary-500);
 color: white;
 padding: 14px 0 10px; /* Adjusted padding */
  height: auto; /* Ensure it wraps content */
}

:deep(.flatpickr-current-month) {
 padding-top: 0;
  font-size: 1.1rem; /* Larger month/year text */
  font-weight: 500;
}

:deep(.flatpickr-monthDropdown-months) {
 font-weight: 500; /* Adjusted from 600 */
 color: white;
  font-size: 1.1rem; /* Match */
}

:deep(.flatpickr-prev-month), 
:deep(.flatpickr-next-month) {
 top: 10px; /* Adjusted position */
 padding: 8px; /* Larger touch area */
  width: 38px; /* Consistent size */
  height: 38px;
}

:deep(.flatpickr-prev-month svg), 
:deep(.flatpickr-next-month svg) {
 fill: rgba(255, 255, 255, 0.85); /* Slightly more opaque */
  width: 18px; /* Larger arrows */
  height: 18px;
}

:deep(.flatpickr-prev-month:hover svg), 
:deep(.flatpickr-next-month:hover svg) {
 fill: white;
}

:deep(.flatpickr-day) {
 border-radius: 8px;
 margin: 1px; /* Slightly less margin for a tighter grid */
 line-height: 38px; /* Taller days */
 height: 38px;
  font-weight: 400;
}

:deep(.flatpickr-day.selected),
:deep(.flatpickr-day.startRange),
:deep(.flatpickr-day.endRange) {
 background: var(--primary-500);
 border-color: var(--primary-500);
  color: white;
}

:deep(.flatpickr-day.selected:hover),
:deep(.flatpickr-day.startRange:hover),
:deep(.flatpickr-day.endRange:hover) {
 background: var(--primary-600);
 border-color: var(--primary-600);
  color: white;
}

:deep(.flatpickr-day:hover) {
 background: var(--primary-100);
 border-color: var(--primary-100);
 color: var(--primary-700);
}

:deep(.flatpickr-day.today) {
 border-color: var(--primary-300); /* Softer border for today */
 color: var(--primary-600);
 font-weight: 500; /* Slightly bolder for today */
}
:deep(.flatpickr-day.today:not(.selected):hover) {
  background: var(--primary-100);
  border-color: var(--primary-300);
}


:deep(.flatpickr-weekday) {
 color: var(--primary-600); /* Match 'today' color */
 font-weight: 500;
  font-size: 0.75rem; /* Smaller weekday names */
  height: 28px; /* Adjust height */
  line-height: 28px;
}

/* Hide year input in Flatpickr (UNCHANGED from original intent) */
:deep(.flatpickr-current-month .numInputWrapper) {
 display: none !important;
}
:deep(.flatpickr-current-month .cur-month) {
 padding: 0 !important;
}

/* Customize SweetAlert (minor adjustments for cohesion) */
:deep(.swal2-popup) {
 border-radius: 16px; /* Match modal */
 padding: 28px; /* More padding */
  font-family: var(--font-sans); /* Consistent font */
  box-shadow: 0 10px 30px rgba(0,0,0,0.1); /* Softer shadow */
}

:deep(.swal2-title) {
 color: var(--neutral-800);
 font-size: 1.25rem; /* Slightly larger */
  font-weight: 600;
  padding-top: 10px; /* Add some space if icon is present */
  margin-bottom: 0.8em; /* Space between title and content */
}

:deep(.swal2-html-container) { /* Target this for main text */
 color: var(--neutral-600);
 font-size: 0.95rem; /* 15.2px */
  line-height: 1.6;
  margin-top: 0; /* Reset if title provides bottom margin */
  margin-bottom: 1.2em; /* Space before actions */
}

:deep(.swal2-confirm) {
 background-color: var(--primary-500) !important;
 border-radius: 8px;
 font-size: 0.9rem; /* Match buttons */
  font-weight: 600;
 padding: 12px 24px; /* More padding */
  transition: background-color 0.2s ease;
}
:deep(.swal2-confirm:hover) {
  background-color: var(--primary-600) !important;
}

:deep(.swal2-confirm:focus) {
 box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.3) !important; /* Match button focus */
}

:deep(.swal2-icon) { /* General icon styling */
  margin-top: 1em; /* Ensure space from top of popup */
  margin-bottom: 1.5em; /* More space below icon */
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

/* Remove number input spinners (UNCHANGED) */
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
 -webkit-appearance: none;
 margin: 0;
}

input[type="number"] {
 -moz-appearance: textfield;
}

/* Responsive Design Improvements (adjustments for new padding/sizing) */
@media (max-width: 640px) { /* Adjusted breakpoint for more granular control */
 .modal-container {
  width: 95%;
  max-height: 95vh;
    border-radius: 12px; /* Slightly smaller radius on small screens */
 }
 
  .modal-header {
    padding: 16px 20px;
  }
  .modal-header h2 {
  font-size: 1.05rem; /* Adjusted size */
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
  font-size: 0.95rem; /* Adjusted size */
 }
  .section-icon {
    font-size: 1rem;
    margin-right: 10px;
  }
 
 .form-actions {
  flex-direction: column-reverse; /* Keep this for mobile */
    gap: 10px; /* Reduced gap for stacked buttons */
    margin-top: 20px;
    padding-top: 16px;
 }
 
 .btn-cancel, .btn-save {
  width: 100%;
  justify-content: center;
    padding: 12px 16px; /* Adjusted padding for full-width buttons */
    font-size: 0.875rem;
 }
 
 .input-wrapper { /* Ensure this is not overriding children's width needs */
  width: 100%;
 }
 
 .form-input {
 padding-left: 38px; /* Adjusted for icon */
    font-size: 0.9rem;
 }
  .form-input::placeholder {
    font-size: 0.85rem;
  }
 
.input-icon {
left: 12px; /* Adjusted */
font-size: 0.9rem; /* Adjusted */
}

.hba1c-inputs {
padding-left: 38px; /* Adjusted */
}
  .hba1c-input {
    font-size: 0.9rem;
    min-width: 40px; /* Adjust min-width for smaller screens if needed */
  }
  .hba1c-input::placeholder {
    font-size: 0.85rem;
  }

  .unit-label {
    padding: 0 10px;
    font-size: 0.8125rem;
    min-width: 55px;
  }
}
</style>