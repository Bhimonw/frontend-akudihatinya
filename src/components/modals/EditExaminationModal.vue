<template>
    <div v-if="visible" class="modal-overlay">
      <div class="modal-container">
        <!-- Header Modal -->
        <div class="modal-header">
          <h2>EDIT DATA PEMERIKSAAN</h2>
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
              <font-awesome-icon :icon="['fas', 'save']" />
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </div>
  </template>
  
  <script>
  import Swal from "sweetalert2";
  import axios from "axios";
  
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
      examData: {
        type: Object,
        required: true,
      },
    },
    data() {
      return {
        formData: {
          date: "",
          hba1c: null,
          gdp: null,
          gd2jpp: null,
          gdsp: null,
        },
        isSubmitting: false,
      };
    },
    watch: {
        examData: {
            immediate: true,
            handler(newData) {
            if (newData) {
                this.formData = {
                date: newData.examination_date || "",
                hba1c: newData.examination_results?.hba1c || null,
                gdp: newData.examination_results?.gdp || null,
                gd2jpp: newData.examination_results?.gd2jpp || null,
                gdsp: newData.examination_results?.gdsp || null,
                };
            }
            },
        },
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

                const token = localStorage.getItem("token");
                if (!token) {
                throw new Error("Token tidak ditemukan");
                }

                // Format payload sesuai dengan API
                const payload = {
                patient_id: parseInt(this.patientId), // Pastikan patient_id adalah integer
                examination_date: this.formData.date,
                examinations: {
                    hba1c: this.formData.hba1c || null, // Kirim null jika kosong
                    gdp: this.formData.gdp || null,
                    gd2jpp: this.formData.gd2jpp || null,
                    gdsp: this.formData.gdsp || null,
                },
                };

                console.log("Payload being sent:", payload); // Debugging: Log the payload

                // Kirim data ke API
                await axios.put(
                `http://localhost:8000/api/puskesmas/dm-examinations/${this.examData.id}`,
                payload,
                {
                    headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                    },
                }
                );

                // Tampilkan notifikasi sukses
                Swal.fire({
                icon: "success",
                title: "Berhasil",
                text: "Data pemeriksaan berhasil diperbarui.",
                confirmButtonText: "Tutup",
                });

                // Emit event untuk memberi tahu parent component
                this.$emit("submit");

                // Reset form dan tutup modal
                this.resetForm();
                this.$emit("close");
            } catch (error) {
                console.error("Error updating examination:", error);

                // Tampilkan notifikasi gagal
                Swal.fire({
                icon: "error",
                title: "Gagal",
                text:
                    error.response?.data?.message ||
                    error.message ||
                    "Terjadi kesalahan saat memperbarui data pemeriksaan.",
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