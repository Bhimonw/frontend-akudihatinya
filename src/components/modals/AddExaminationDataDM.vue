<template>
  <div class="modal-overlay" v-if="visible">
    <div class="modal-container">
      <!-- Header Modal -->
      <div class="modal-header">
        <h2>TAMBAH DATA</h2>
        <button class="close-button" @click="$emit('close')">
          <font-awesome-icon :icon="['fas', 'times']" />
        </button>
      </div>
      <!-- Form Modal -->
      <form class="modal-form" @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="date">Tanggal Pemeriksaan:</label>
          <!-- Flatpickr dengan konfigurasi yang diperbarui -->
          <flatpickr
            v-model="formData.date"
            :config="flatpickrConfig"
            required
            placeholder="Pilih Tanggal"
          />
        </div>
        <div class="form-group">
          <label for="gdsp">Gula Darah Sewaktu :</label>
          <input
            type="number"
            id="gdsp"
            v-model="formData.gdsp"
            placeholder="Mg/dL"
          />
        </div>
        <div class="form-group">
          <label for="gdp">Gula Darah Puasa :</label>
          <input
            type="number"
            id="gdp"
            v-model="formData.gdp"
            placeholder="Mg/dL"
          />
        </div>
        <div class="form-group">
          <label for="gd2jpp">Gula Darah 2 Jam PP :</label>
          <input
            type="number"
            id="gd2jpp"
            v-model="formData.gd2jpp"
            placeholder="Mg/dL"
          />
        </div>
        <div class="form-group">
          <label for="hba1c">HbA1c :</label>
          <input
            type="number"
            id="hba1c"
            v-model="formData.hba1c"
            placeholder="%"
          />
        </div>
        <!-- Tombol Aksi -->
        <div class="action-buttons">
          <button class="action-button cancel" @click="$emit('close')">
            <font-awesome-icon :icon="['fas', 'trash']" />
            Batal
          </button>
          <button class="action-button submit" type="submit" :disabled="isSubmitting">
            <span v-if="isSubmitting">
              <font-awesome-icon :icon="['fas', 'spinner']" spin />
              Menyimpan...
            </span>
            <span v-else>
              <font-awesome-icon :icon="['fas', 'plus']" />
              Tambah Data
            </span>
          </button>
        </div>
      </form>
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
        date: "",
        hba1c: null,
        gdp: null,
        gd2jpp: null,
        gdsp: null,
      },
      isSubmitting: false,
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
  methods: {
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

        // Memastikan format tanggal benar dengan tahun dari props
        let day, month;
        
        if (this.formData.date instanceof Date) {
          // Jika date adalah objek Date
          day = this.formData.date.getDate().toString().padStart(2, '0');
          month = (this.formData.date.getMonth() + 1).toString().padStart(2, '0');
        } else {
          // Jika date adalah string dengan format "DD Bulan YYYY" (misal: "17 Januari 2023")
          // Kita perlu mengekstrak tanggal dan mengkonversi nama bulan ke angka
          
          // Pisahkan tanggal, nama bulan, dan tahun
          const dateParts = this.formData.date.split(' ');
          
          // Format yang diharapkan: [tanggal, nama bulan, tahun]
          if (dateParts.length < 3) {
            throw new Error("Format tanggal tidak valid");
          }
          
          day = dateParts[0].padStart(2, '0');
          
          // Konversi nama bulan ke angka bulan (1-12)
          const monthName = dateParts[1].toLowerCase();
          const monthNames = [
            'januari', 'februari', 'maret', 'april', 'mei', 'juni',
            'juli', 'agustus', 'september', 'oktober', 'november', 'desember'
          ];
          const monthIndex = monthNames.indexOf(monthName);
          if (monthIndex !== -1) {
            month = (monthIndex + 1).toString().padStart(2, '0');
          } else {
            // Fallback jika nama bulan tidak ditemukan
            throw new Error("Format tanggal tidak valid");
          }
          
          // Kita tetap menggunakan tahun dari props, bukan dari string tanggal
          // const year = dateParts[2];
        }
        
        // Gunakan tahun dari props selectedYear
        const examinationDate = `${this.selectedYear}-${month}-${day}`;

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
      this.formData = {
        date: "",
        hba1c: null,
        gdp: null,
        gd2jpp: null,
        gdsp: null,
      };
    },
  },
  watch: {
    // Reset form saat modal ditutup
    visible(newValue) {
      if (!newValue) {
        this.resetForm();
      }
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
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.modal-container {
  background: #ffffff;
  border-radius: 10px;
  padding: 24px;
  box-shadow: 0px 4px 16px rgba(0, 0, 0, 0.1);
  width: 400px;
  max-width: 80%;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.modal-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.close-button {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 20px;
  color: #e53935;
}

.modal-form {
  display: flex;
  flex-direction: column;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  font-weight: 500;
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 4px;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 10px;
  border: 1px solid #cdcfD4;
  border-radius: 10px;
  font-family: "Inter", sans-serif;
  font-size: 14px;
  color: #4f5867;
  outline: none;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 24px;
}

.action-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.3s ease;
}

.action-button.cancel {
  background: white;
  border: 1px solid #e53935;
  color: #e53935;
}

.action-button.cancel:hover {
  background: #ffebee;
  color: #c62828;
}

.action-button.submit {
  background: var(--primary-500);
  color: white;
}

.action-button.submit:hover {
  background: var(--primary-700);
}

/* Style untuk Flatpickr */
:deep(.flatpickr-current-month .numInputWrapper) {
  display: none !important;
}

:deep(.flatpickr-current-month .cur-month) {
  padding: 0 !important;
}

/* Tambahan style untuk input flatpickr agar tampilan lebih menarik */
:deep(.flatpickr-input) {
  height: 42px;
  font-size: 14px;
  font-weight: 500;
  color: #4f5867;
  cursor: pointer;
}

/* Kapitalisasi nama bulan untuk tampilan lebih baik */
:deep(.flatpickr-monthDropdown-months) {
  text-transform: capitalize;
}

:deep(.flatpickr-day) {
  border-radius: 4px !important;
}

:deep(.flatpickr-day.selected) {
  background: var(--primary-500) !important;
  border-color: var(--primary-500) !important;
}

:deep(.flatpickr-day.selected:hover) {
  background: var(--primary-700) !important;
  border-color: var(--primary-700) !important;
}
</style>