<template>
    <div v-if="visible" class="modal-overlay">
      <div class="modal-content">
        <h2>TAMBAH DATA PESERTA</h2>
        <form @submit.prevent="handleSubmit">
          <!-- Nama Lengkap -->
          <div class="form-group">
            <label for="name">Nama Lengkap:</label>
            <input type="text" id="name" v-model="formData.name" required />
          </div>
  
          <!-- NIK -->
          <div class="form-group">
            <label for="nik">NIK:</label>
            <input type="text" id="nik" v-model="formData.nik" required />
          </div>
  
          <!-- Nomor BPJS -->
          <div class="form-group">
            <label for="bpjs">Nomor BPJS:</label>
            <input type="text" id="bpjs" v-model="formData.bpjs" required />
          </div>
  
          <!-- Jenis Kelamin -->
          <div class="form-group">
            <label>Jenis Kelamin:</label>
            <div class="gender-options">
              <label>
                <input type="radio" name="gender" value="Laki-laki" v-model="formData.gender" /> Laki-laki
              </label>
              <label>
                <input type="radio" name="gender" value="Perempuan" v-model="formData.gender" /> Perempuan
              </label>
            </div>
          </div>
  
          <!-- Tanggal Lahir -->
          <div class="form-group">
            <label for="birthdate">Tanggal Lahir:</label>
            <input type="date" id="birthdate" v-model="formData.birthdate" required />
          </div>
  
          <!-- Umur -->
          <div class="form-group">
            <label for="age">Umur:</label>
            <input type="number" id="age" v-model="formData.age" required />
          </div>
  
          <!-- Tombol Aksi -->
          <div class="action-buttons">
            <button type="submit" class="submit-button">Simpan</button>
            <button type="button" class="cancel-button" @click="closeModal">Batal</button>
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
          name: "",
          nik: "",
          bpjs: "",
          gender: "",
          birthdate: "",
          age: "",
        },
      };
    },
    methods: {
      handleSubmit() {
        this.$emit("submit", this.formData); // Emit data ke komponen induk
        this.formData = { name: "", nik: "", bpjs: "", gender: "", birthdate: "", age: "" }; // Reset form
      },
      closeModal() {
        this.$emit("close"); // Emit event untuk menutup modal
      },
    },
  };
  </script>
  
  <style scoped>
  /* Modal Overlay */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 999;
  }
  
  /* Modal Content */
  .modal-content {
    position: relative;
    width: 756px;
    height: 527px;
    background: #ffffff;
    border-radius: 25px;
    padding: 40px;
    box-sizing: border-box;
  }
  
  /* Form Group */
  .form-group {
    margin-bottom: 24px;
  }
  
  /* Label */
  .form-group label {
    font-family: 'Inter', sans-serif;
    font-weight: 400;
    font-size: 16px;
    line-height: 24px;
    color: #05080c;
    margin-bottom: 8px;
    display: block;
  }
  
  /* Input Fields */
  .form-group input {
    width: 100%;
    height: 42px;
    padding: 10px;
    border: 1px solid #9aa0a8;
    border-radius: 10px;
    font-family: 'Inter', sans-serif;
    font-size: 16px;
    color: #05080c;
    box-sizing: border-box;
  }
  
  /* Action Buttons */
  .action-buttons {
    display: flex;
    justify-content: flex-end;
    gap: 16px;
  }
  
  .submit-button {
    background: #3a72dc;
    color: #ffffff;
    border: none;
    border-radius: 10px;
    padding: 10px 20px;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }
  
  .submit-button:hover {
    background: #2a5dbd;
  }
  
  .cancel-button {
    background: rgba(254, 226, 226, 0.18);
    border: 1px solid #ef4444;
    border-radius: 10px;
    color: #ef4444;
    padding: 10px 20px;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }
  
  .cancel-button:hover {
    background: rgba(254, 226, 226, 0.3);
  }
  </style>