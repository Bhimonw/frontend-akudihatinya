<template>
    <div v-if="visible" class="modal-overlay">
      <div class="modal-container">
        <div class="modal-header">
          <h3>Edit Data Pasien</h3>
          <button class="close-button" @click="close">
            <font-awesome-icon :icon="['fas', 'times']" />
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="submitForm" class="form-container">
            <div class="form-group">
              <label for="name">Nama Lengkap</label>
              <input 
                type="text" 
                id="name" 
                v-model="form.name" 
                class="form-input" 
                required
              />
            </div>
  
            <div class="form-group">
              <label for="gender">Jenis Kelamin</label>
              <select id="gender" v-model="form.gender" class="form-input" required>
                <option value="male">Laki-Laki</option>
                <option value="female">Perempuan</option>
              </select>
            </div>
  
            <div class="form-group">
              <label for="nik">NIK</label>
              <input 
                type="text" 
                id="nik" 
                v-model="form.nik" 
                class="form-input"
                placeholder="Nomor Induk Kependudukan"
              />
            </div>
  
            <div class="form-group">
              <label for="bpjs_number">Nomor BPJS</label>
              <input 
                type="text" 
                id="bpjs_number" 
                v-model="form.bpjs_number" 
                class="form-input"
                placeholder="Nomor BPJS"
              />
            </div>
  
            <div class="form-group">
              <label for="birth_date">Tanggal Lahir</label>
              <input 
                type="date" 
                id="birth_date" 
                v-model="form.birth_date" 
                class="form-input" 
                required
                @change="calculateAge"
              />
            </div>

            <div class="form-group">
              <label for="age">Umur</label>
              <input 
                type="number" 
                id="age" 
                v-model="form.age" 
                class="form-input" 
                placeholder="Umur (tahun)"
              />
            </div>
  
            <div class="form-group">
              <label for="address">Alamat</label>
              <textarea 
                id="address" 
                v-model="form.address" 
                class="form-input textarea" 
                rows="3"
                placeholder="Alamat lengkap"
              ></textarea>
            </div>
  
            <div class="form-actions">
              <button type="button" class="cancel-button" @click="close">Batal</button>
              <button type="submit" class="submit-button" :disabled="isSubmitting">
                <span v-if="isSubmitting">
                  <font-awesome-icon :icon="['fas', 'spinner']" spin />
                  Menyimpan...
                </span>
                <span v-else>Simpan Perubahan</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  import Swal from 'sweetalert2';
  
  export default {
    name: 'EditPatientDetailDM',
    props: {
      visible: {
        type: Boolean,
        default: false
      },
      patientData: {
        type: Object,
        required: true
      }
    },
    data() {
      return {
        form: {
          name: '',
          gender: '',
          nik: '',
          bpjs_number: '',
          birth_date: '',
          address: '',
          age: null
        },
        isSubmitting: false
      };
    },
    watch: {
      visible(newVal) {
        if (newVal && this.patientData) {
          // Initialize form with patient data
          this.form = {
            name: this.patientData.name || '',
            gender: this.patientData.gender === 'Perempuan' ? 'female' : 'male',
            nik: this.patientData.nik !== '-' ? this.patientData.nik : '',
            bpjs_number: this.patientData.bpjs_number !== '-' ? this.patientData.bpjs_number : '',
            birth_date: this.patientData.birth_date !== '-' ? this.patientData.birth_date : '',
            age: this.patientData.address !== '-' ? this.patientData.age : null,
            address: this.patientData.address !== '-' ? this.patientData.address : ''
          };
        }
      }
    },
    methods: {
        calculateAge() {
            if (this.form.birth_date) {
            const today = new Date();
            const birthDate = new Date(this.form.birth_date);
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDifference = today.getMonth() - birthDate.getMonth();

            // Jika bulan belum tercapai atau hari belum tercapai, kurangi umur
            if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }

            this.form.age = age;
            } else {
            this.form.age = null; // Reset umur jika tanggal lahir kosong
            }
        },
      close() {
        this.$emit('close');
      },
      async submitForm() {
        try {
            // Tampilkan konfirmasi
            const confirmation = await Swal.fire({
            title: 'Apakah Anda yakin?',
            text: 'Anda akan menyimpan perubahan pada data pasien ini.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Ya, simpan!',
            cancelButtonText: 'Batal',
            });

            // Jika pengguna membatalkan, hentikan proses
            if (!confirmation.isConfirmed) {
            return;
            }

            this.isSubmitting = true;

            const token = localStorage.getItem("token");
            if (!token) {
            throw new Error("Token tidak ditemukan");
            }

            const patientId = this.$route?.params?.id || this.patientData.id;

            const response = await axios.put(
            `http://localhost:8000/api/puskesmas/patients/${patientId}`,
            this.form,
            {
                headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
                },
            }
            );

            // Emit success event with updated data
            this.$emit('submit', response.data.patient);
            this.$emit('close');

            // Show success notification
            Swal.fire({
            icon: 'success',
            title: 'Berhasil',
            text: 'Data pasien berhasil diperbarui',
            confirmButtonText: 'Tutup',
            });
        } catch (error) {
            console.error("Error updating patient:", error);

            // Show error notification
            Swal.fire({
            icon: 'error',
            title: 'Gagal',
            text: error.response?.data?.message || 'Terjadi kesalahan saat memperbarui data pasien',
            confirmButtonText: 'Tutup',
            });
        } finally {
            this.isSubmitting = false;
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
    z-index: 1000;
  }
  
  .modal-container {
    width: 100%;
    max-width: 600px;
    background-color: #ffffff;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    overflow: hidden;
    animation: modalFadeIn 0.3s ease;
  }
  
  @keyframes modalFadeIn {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 24px;
    border-bottom: 1px solid #eaeaea;
  }
  
  .modal-header h3 {
    font-size: 1.25rem;
    font-weight: 600;
    color: #333;
    margin: 0;
  }
  
  .close-button {
    background: transparent;
    border: none;
    font-size: 18px;
    color: #666;
    cursor: pointer;
    transition: color 0.3s ease;
  }
  
  .close-button:hover {
    color: #e53935;
  }
  
  .modal-body {
    padding: 24px;
    max-height: 70vh;
    overflow-y: auto;
  }
  
  .form-container {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
  
  .form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  /* Make address field span both columns */
  .form-group:nth-last-child(2) {
    grid-column: span 2;
  }
  
  /* Make buttons section span both columns */
  .form-actions {
    grid-column: span 2;
    display: flex;
    justify-content: flex-end;
    gap: 16px;
    margin-top: 16px;
  }
  
  label {
    font-weight: 500;
    color: #333;
    font-size: 14px;
  }
  
  .form-input {
    height: 42px;
    padding: 8px 12px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-size: 14px;
    transition: border-color 0.3s ease;
  }
  
  .form-input:focus {
    border-color: var(--primary-500);
    outline: none;
  }
  
  .textarea {
    height: auto;
    resize: vertical;
    min-height: 80px;
  }
  
  .cancel-button {
    padding: 10px 20px;
    background: white;
    color: #666;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-weight: 500;
    font-size: 14px;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }
  
  .cancel-button:hover {
    background-color: #f5f5f5;
  }
  
  .submit-button {
    padding: 10px 20px;
    background: var(--primary-500);
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 500;
    font-size: 14px;
    cursor: pointer;
    transition: background-color 0.3s ease;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .submit-button:hover {
    background: var(--primary-700);
  }
  
  .submit-button:disabled {
    background: #9aa0a8;
    cursor: not-allowed;
  }
  
  @media (max-width: 768px) {
    .form-container {
      grid-template-columns: 1fr;
    }
    
    /* Reset full-width styles for smaller screens */
    .form-group:nth-last-child(2) {
      grid-column: 1;
    }
    
    .form-actions {
      grid-column: 1;
    }
    
    .modal-container {
      width: 90%;
      max-height: 90vh;
    }
  }
  </style>