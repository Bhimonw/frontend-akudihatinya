<!-- ModalTambahData.vue -->
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
            <label for="date">Tanggal Pemeriksaan :</label>
            <input
              type="date"
              id="date"
              v-model="formData.date"
              required
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
              <font-awesome-icon :icon="['fas', 'plus']" />
              Tambah Data
            </button>
          </div>
        </form>
      </div>
    </div>
  </template>
  
  <script>
  import Swal from 'sweetalert2';
  import axios from 'axios';

  export default {
    props: {
      visible: {
        type: Boolean,
        required: true,
      },
      patientId: {
        type: [Number, String],
        required: true,
      }
    },
    data() {
      return {
        formData: {
          date: "", // Tanggal pemeriksaan
          hba1c: null, // Nilai HbA1c
          gdp: null, // Nilai GDP
          gd2jpp: null, // Nilai GD2JPP
          gdsp: null, // Nilai GDSP
        },
        isSubmitting: false, // Untuk menandai status loading
      };
    },
    methods: {
      async handleSubmit() {
        try {
          // Tampilkan konfirmasi menggunakan SweetAlert
          const confirmation = await Swal.fire({
            title: 'Apakah Anda yakin?',
            text: 'Data pemeriksaan akan ditambahkan ke sistem.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Ya, tambahkan!',
            cancelButtonText: 'Batal',
          });

          // Jika pengguna membatalkan, hentikan proses
          if (!confirmation.isConfirmed) {
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

          const token = localStorage.getItem("token");
          if (!token) {
            throw new Error("Token tidak ditemukan");
          }

          // Format payload sesuai dengan API
          const payload = {
            patient_id: parseInt(this.patientId), // Pastikan patient_id adalah integer
            examination_date: this.formData.date,
            examinations: {
              hba1c: this.formData.hba1c || null,
              gdp: this.formData.gdp || null,
              gd2jpp: this.formData.gd2jpp || null,
              gdsp: this.formData.gdsp || null,
            },
          };

          console.log("Payload being sent:", payload); // Debugging: Log the payload

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
          this.$emit("submit", response.data.examination);

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
      resetForm() {
        this.formData = {
          date: "",
          type: "",
          fastingGlucose: null,
          postPrandialGlucose: null,
          hba1c: null,
        };
      },
    },
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
  </style>