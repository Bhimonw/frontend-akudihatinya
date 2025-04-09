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
            <label for="type">Jenis Pemeriksaan :</label>
            <select id="type" v-model="formData.type" required>
              <option value="">Pilih Jenis Pemeriksaan</option>
              <option value="fasting">Gula Darah Puasa</option>
              <option value="postprandial">Gula Darah 2 Jam PP</option>
              <option value="hba1c">HbA1c</option>
            </select>
          </div>
          <div class="form-group">
            <label for="fastingGlucose">Gula Darah Puasa :</label>
            <input
              type="number"
              id="fastingGlucose"
              v-model="formData.fastingGlucose"
              placeholder="Mg/dL"
            />
          </div>
          <div class="form-group">
            <label for="postPrandialGlucose">Gula Darah 2 Jam PP :</label>
            <input
              type="number"
              id="postPrandialGlucose"
              v-model="formData.postPrandialGlucose"
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
            <button class="action-button submit" type="submit">
              <font-awesome-icon :icon="['fas', 'plus']" />
              Tambah Data
            </button>
          </div>
        </form>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      visible: {
        type: Boolean,
        required: true,
      },
    },
    data() {
      return {
        formData: {
          date: "",
          type: "",
          fastingGlucose: null,
          postPrandialGlucose: null,
          hba1c: null,
        },
      };
    },
    methods: {
      handleSubmit() {
        // Emit data ke komponen induk
        this.$emit("submit", this.formData);
        // Reset form setelah pengiriman
        this.resetForm();
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