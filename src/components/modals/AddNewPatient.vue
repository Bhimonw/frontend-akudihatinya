<!-- components/modals/AddNewPatient.vue -->
<template>
  <div class="modal-backdrop">
    <div class="modal-container">
      <div class="modal-header">
        <h2>Tambah Data Pasien</h2>
        <button class="close-button" @click="closeModal">
          <font-awesome-icon :icon="['fas', 'times']" />
        </button>
      </div>
      <div class="modal-body">
        <div class="new-patient-form">
          <form @submit.prevent="submitForm">
            <!-- Nama Pasien -->
            <div class="form-row">
              <div class="form-group">
                <label for="name">Nama Pasien <span class="required">*</span></label>
                <input
                  type="text"
                  id="name"
                  v-model="form.name"
                  class="form-input"
                  :class="{ 'input-error': errors.name }"
                />
                <p v-if="errors.name" class="error-message">
                  Nama pasien tidak boleh kosong
                </p>
              </div>

              <!-- NIK -->
              <div class="form-group">
                <label for="nik">NIK</label>
                <input
                  type="text"
                  id="nik"
                  v-model="form.nik"
                  class="form-input"
                />
              </div>
            </div>

            <div class="form-row">
              <!-- Nomor BPJS -->
              <div class="form-group">
                <label for="bpjs">Nomor BPJS</label>
                <input
                  type="text"
                  id="bpjs"
                  v-model="form.bpjs"
                  class="form-input"
                />
              </div>

              <!-- Jenis Kelamin -->
              <div class="form-group">
                <label for="gender">Jenis Kelamin <span class="required">*</span></label>
                <select
                  id="gender"
                  v-model="form.gender"
                  class="form-select"
                  :class="{ 'input-error': errors.gender }"
                >
                  <option value="" disabled selected>Pilih Jenis Kelamin</option>
                  <option value="male">Laki-laki</option>
                  <option value="female">Perempuan</option>
                </select>
                <p v-if="errors.gender" class="error-message">
                  Jenis kelamin tidak boleh kosong
                </p>
              </div>
            </div>

            <div class="form-row">
              <!-- Tanggal Lahir -->
              <div class="form-group">
                <label for="dob">Tanggal Lahir</label>
                <div class="date-input-container">
                  <input
                    type="date"
                    id="dob"
                    v-model="form.dob"
                    class="form-input"
                  />
                </div>
              </div>

              <!-- Umur -->
              <div class="form-group">
                <label for="age">Umur <span class="required">*</span></label>
                <input
                  type="number"
                  id="age"
                  v-model="form.age"
                  class="form-input"
                  :class="{ 'input-error': errors.age }"
                />
                <p v-if="errors.age" class="error-message">
                  Umur tidak boleh kosong
                </p>
              </div>
            </div>

            <!-- Alamat -->
            <div class="form-group full-width">
              <label for="address">Alamat <span class="required">*</span></label>
              <textarea
                id="address"
                v-model="form.address"
                class="form-textarea"
                :class="{ 'input-error': errors.address }"
              ></textarea>
              <p v-if="errors.address" class="error-message">
                Alamat tidak boleh kosong
              </p>
            </div>

            <!-- Tombol Aksi -->
            <div class="form-actions">
              <button type="button" class="btn-cancel" @click="closeModal">
                Batal
              </button>
              <button type="submit" class="btn-save">
                Simpan
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
      }
      
      if (!this.form.gender) {
        this.errors.gender = true;
        isValid = false;
      }
      
      if (!this.form.age) {
        this.errors.age = true;
        isValid = false;
      }
      
      if (!this.form.address.trim()) {
        this.errors.address = true;
        isValid = false;
      }

      return isValid;
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
        confirmButtonText: 'Ya',
        cancelButtonText: 'Batal',
      });

      // Jika pengguna membatalkan, hentikan proses
      if (!result.isConfirmed) {
        return;
      }

      try {
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
          text: 'Data berhasil disimpan!',
        });

        // Tutup modal
        this.closeModal();
      } catch (error) {
        console.error("Error saving patient:", error);

        // Tampilkan notifikasi error jika terjadi kesalahan
        Swal.fire({
          icon: 'error',
          title: 'Kesalahan',
          text: 'Gagal menyimpan data. Silakan coba lagi.',
        });
      }
    },
    
    closeModal() {
      this.$emit("close");
    },
  },
};
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-container {
  width: 90%;
  max-width: 900px;
  max-height: 90vh;
  background-color: #ffffff;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eaeaea;
  flex-shrink: 0;
}

.modal-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333333;
  margin: 0;
}

.close-button {
  background: transparent;
  border: none;
  font-size: 20px;
  color: #9aa0a8;
  cursor: pointer;
  padding: 5px;
  transition: color 0.3s ease;
}

.close-button:hover {
  color: #333333;
}

.modal-body {
  padding: 20px;
  flex-grow: 1;
  overflow-y: auto;
}

.new-patient-form {
  width: 100%;
}

.form-row {
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
}

.form-group {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
  width: 100%;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 6px;
  color: #4f5867;
}

.required {
  color: #ef4444;
  margin-left: 2px;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #eaeaea;
  border-radius: 8px;
  font-size: 14px;
  color: #333333;
  transition: border-color 0.3s ease;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  border-color: var(--primary-500);
  outline: none;
}

.input-error {
  border-color: #ef4444 !important;
}

.form-textarea {
  min-height: 100px;
  resize: vertical;
}

.error-message {
  margin-top: 4px;
  font-size: 12px;
  color: #ef4444;
}

.date-input-container {
  position: relative;
}

.calendar-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #9aa0a8;
  pointer-events: none;
}

.form-actions {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn-cancel {
  padding: 10px 20px;
  background-color: #ffffff;
  border: 1px solid #eaeaea;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #4f5867;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.btn-cancel:hover {
  background-color: #f3f4f6;
}

.btn-save {
  padding: 10px 20px;
  background-color: var(--primary-500);
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #ffffff;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.btn-save:hover {
  background-color: var(--primary-700);
}

@media (max-width: 768px) {
  .modal-container {
    width: 95%;
    max-height: 95vh;
  }

  .form-row {
    flex-direction: column;
    gap: 15px;
  }
}
</style>