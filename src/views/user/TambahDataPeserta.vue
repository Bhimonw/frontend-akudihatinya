<template>
    <div class="tambah-data-peserta">
      <h1>Tambah Data Peserta</h1>
      <form @submit.prevent="submitForm">
        <div class="form-group">
          <label for="name">Nama Pasien:</label>
          <input type="text" id="name" v-model="formData.name" required />
        </div>
        <div class="form-group">
          <label for="nik">NIK:</label>
          <input type="text" id="nik" v-model="formData.nik" required />
        </div>
        <div class="form-group">
          <label for="bpjs">Nomor BPJS:</label>
          <input type="text" id="bpjs" v-model="formData.bpjs" required />
        </div>
        <div class="form-group">
          <label for="gender">Jenis Kelamin:</label>
          <select id="gender" v-model="formData.gender" required>
            <option value="Laki-laki">Laki-laki</option>
            <option value="Perempuan">Perempuan</option>
          </select>
        </div>
        <div class="form-group">
          <label for="birthdate">Tanggal Lahir:</label>
          <input type="date" id="birthdate" v-model="formData.birthdate" required />
        </div>
        <button type="submit" class="submit-button">Simpan</button>
      </form>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        formData: {
          name: "",
          nik: "",
          bpjs: "",
          gender: "",
          birthdate: "",
        },
      };
    },
    methods: {
      submitForm() {
        console.log("Data yang disimpan:", this.formData);
        alert("Data berhasil disimpan!");
        this.$router.push({ name: "DiabetesMellitus" }); // Kembali ke halaman utama
      },
    },
  };
  </script>
  
  <style scoped>
  .tambah-data-peserta {
    padding: 20px;
  }
  
  .form-group {
    margin-bottom: 16px;
  }
  
  label {
    display: block;
    margin-bottom: 8px;
    font-weight: bold;
  }
  
  input,
  select {
    width: 100%;
    padding: 8px;
    border: 1px solid #d7d7d7;
    border-radius: 6px;
  }
  
  .submit-button {
    padding: 10px 20px;
    background: #3a72dc;
    color: #ffffff;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }
  
  .submit-button:hover {
    background: #2a5dbd;
  }
  </style>