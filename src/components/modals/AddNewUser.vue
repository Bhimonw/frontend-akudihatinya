<template>
  <div class="modal-backdrop" @click.self="closeModal">
    <div class="modal-container">
      <div class="modal-header">
        <h2>
          <font-awesome-icon :icon="['fas', 'user-plus']" class="icon-margin" />
          Tambah User Baru
        </h2>
        <button class="close-button" @click="closeModal" aria-label="Close">
          <font-awesome-icon :icon="['fas', 'times']" />
        </button>
      </div>

      <div class="modal-body">
        <div class="new-user-form">
          <form @submit.prevent="submitForm">
            <div class="form-section">
              <div class="section-header">
                <font-awesome-icon :icon="['fas', 'user-shield']" class="section-icon" />
                <h3>Informasi Akun</h3>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="username">Username <span class="required">*</span></label>
                  <div class="input-wrapper">
                    <font-awesome-icon :icon="['fas', 'at']" class="input-icon" />
                    <input
                      type="text"
                      id="username"
                      v-model="formData.username"
                      class="form-input"
                      :class="{ 'input-error': errors.username }"
                      placeholder="Masukkan username"
                      required
                    />
                  </div>
                  <transition name="fade">
                    <p v-if="errors.username" class="error-message">
                      <font-awesome-icon :icon="['fas', 'exclamation-circle']" />
                      {{ errors.username }}
                    </p>
                  </transition>
                </div>

                <div class="form-group">
                  <label for="password">Password <span class="required">*</span></label>
                  <div class="input-wrapper password-input-container-custom">
                    <font-awesome-icon :icon="['fas', 'key']" class="input-icon" />
                    <input
                      :type="showPassword ? 'text' : 'password'"
                      id="password"
                      v-model="formData.password"
                      class="form-input"
                      :class="{ 'input-error': errors.password }"
                      placeholder="Masukkan password"
                      required
                    />
                    <button
                      type="button"
                      class="password-toggle-custom"
                      @click="togglePasswordVisibility"
                    >
                      <font-awesome-icon :icon="['fas', showPassword ? 'eye-slash' : 'eye']" />
                    </button>
                  </div>
                  <transition name="fade">
                    <p v-if="errors.password" class="error-message">
                      <font-awesome-icon :icon="['fas', 'exclamation-circle']" />
                      {{ errors.password }}
                    </p>
                  </transition>
                </div>
              </div>
            </div>

            <div class="form-section">
              <div class="section-header">
                <font-awesome-icon :icon="['fas', 'id-card']" class="section-icon" />
                <h3>Detail User/Instansi</h3>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="name">{{ nameLabel }} <span class="required">*</span></label>
                  <div class="input-wrapper">
                     <font-awesome-icon :icon="formData.role === 'puskesmas' ? ['fas', 'hospital'] : ['fas', 'user']" class="input-icon" />
                    <input
                      type="text"
                      id="name"
                      v-model="formData.name"
                      class="form-input"
                      :class="{ 'input-error': errors.name }"
                      :placeholder="namePlaceholder"
                      required
                    />
                  </div>
                  <transition name="fade">
                    <p v-if="errors.name" class="error-message">
                      <font-awesome-icon :icon="['fas', 'exclamation-circle']" />
                      {{ errors.name }}
                    </p>
                  </transition>
                </div>

                <div class="form-group">
                  <label for="role">Role <span class="required">*</span></label>
                  <div class="input-wrapper">
                    <font-awesome-icon :icon="['fas', 'user-tag']" class="input-icon" />
                    <select
                      id="role"
                      v-model="formData.role"
                      class="form-select"
                      :class="{ 'input-error': errors.role }"
                      required
                    >
                      <option value="" disabled>Pilih role user</option>
                      <option value="admin">Admin</option>
                      <option value="puskesmas">Puskesmas</option>
                    </select>
                  </div>
                   <transition name="fade">
                    <p v-if="errors.role" class="error-message">
                      <font-awesome-icon :icon="['fas', 'exclamation-circle']" />
                      {{ errors.role }}
                    </p>
                  </transition>
                </div>
              </div>

              <div class="form-group full-width">
                <label for="profilePicture">Foto Profil <span class="optional-text">(Opsional)</span></label>
                <div class="input-wrapper file-input-wrapper">
                  <input
                    type="file"
                    id="profilePicture"
                    @change="handleFileUpload"
                    class="form-input file-input-custom"
                    accept="image/png, image/jpeg, image/jpg"
                  />
                </div>
                 <div v-if="previewUrl" class="image-preview-container-custom">
                    <img :src="previewUrl" alt="Preview Foto Profil" class="image-preview-custom" />
                    <button type="button" @click="removeImage" class="remove-image-button-custom" title="Hapus gambar">
                        <font-awesome-icon :icon="['fas', 'times']" />
                    </button>
                </div>
                <transition name="fade">
                  <p v-if="errors.profilePicture" class="error-message">
                    <font-awesome-icon :icon="['fas', 'exclamation-circle']" />
                    {{ errors.profilePicture }}
                  </p>
                </transition>
              </div>
            </div>

            <div class="form-actions">
              <button type="button" class="btn-cancel" @click="closeModal">
                <font-awesome-icon :icon="['fas', 'times']" /> Batal
              </button>
              <button
                type="submit"
                class="btn-save"
                :disabled="isSubmitting"
              >
                <span v-if="isSubmitting">
                  <font-awesome-icon :icon="['fas', 'spinner']" spin /> Menyimpan...
                </span>
                <span v-else>
                  <font-awesome-icon :icon="['fas', 'plus']" /> Tambah User
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "AddNewUserModal",
  props: {
    isSubmitting: { // Prop untuk disable tombol submit saat proses API call
        type: Boolean,
        default: false
    }
  },
  data() {
    return {
      formData: {
        username: "",
        password: "",
        name: "",
        role: "",
        profilePicture: null, // Akan diisi dengan File object jika ada
      },
      errors: {
        username: "",
        password: "",
        name: "",
        role: "",
        profilePicture: "",
      },
      showPassword: false,
      previewUrl: null,
    };
  },
  computed: {
    nameLabel() {
      if (this.formData.role === 'puskesmas') {
        return 'Nama Puskesmas';
      }
      return 'Nama Lengkap User';
    },
    namePlaceholder() {
      if (this.formData.role === 'puskesmas') {
        return 'Contoh: Puskesmas Martapura Timur';
      }
      return 'Masukkan nama lengkap user';
    }
  },
  methods: {
    togglePasswordVisibility() {
      this.showPassword = !this.showPassword;
    },
    closeModal() {
      this.$emit('close');
      this.resetForm(); // Selalu reset form saat ditutup karena ini hanya untuk add
    },
    resetForm() {
        this.formData = {
            username: "",
            password: "",
            name: "",
            role: "",
            profilePicture: null,
        };
        this.errors = {
            username: "",
            password: "",
            name: "",
            role: "",
            profilePicture: "",
        };
        this.previewUrl = null;
        const fileInput = document.getElementById('profilePicture');
        if (fileInput) {
            fileInput.value = "";
        }
        this.showPassword = false;
    },
    handleFileUpload(event) {
      const file = event.target.files[0];
      if (file) {
        if (file.size > 2 * 1024 * 1024) { // Max 2MB
            this.errors.profilePicture = "Ukuran file maksimal 2MB.";
            this.formData.profilePicture = null;
            this.previewUrl = null;
            event.target.value = ""; 
            return;
        }
        if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
            this.errors.profilePicture = "Format file harus PNG, JPG, atau JPEG.";
            this.formData.profilePicture = null;
            this.previewUrl = null;
            event.target.value = ""; 
            return;
        }
        this.errors.profilePicture = "";
        this.formData.profilePicture = file;
        this.previewUrl = URL.createObjectURL(file);
      } else {
        this.formData.profilePicture = null;
        this.previewUrl = null;
      }
    },
    removeImage() {
        this.formData.profilePicture = null;
        this.previewUrl = null;
        const fileInput = document.getElementById('profilePicture');
        if (fileInput) {
            fileInput.value = "";
        }
    },
    validateForm() {
      let isValid = true;
      this.errors = { username: "", password: "", name: "", role: "", profilePicture: "" };

      if (!this.formData.username) {
        this.errors.username = "Username tidak boleh kosong.";
        isValid = false;
      } else if (this.formData.username.length < 4) {
        this.errors.username = "Username minimal 4 karakter.";
        isValid = false;
      } else if (/\s/.test(this.formData.username)) {
        this.errors.username = "Username tidak boleh mengandung spasi.";
        isValid = false;
      }

      if (!this.formData.password) { // Password selalu required untuk add
        this.errors.password = "Password tidak boleh kosong.";
        isValid = false;
      } else if (this.formData.password.length < 6) {
        this.errors.password = "Password minimal 6 karakter.";
        isValid = false;
      }

      if (!this.formData.name) {
        this.errors.name = this.formData.role === 'puskesmas' ? "Nama Puskesmas tidak boleh kosong." : "Nama Lengkap tidak boleh kosong.";
        isValid = false;
      }

      if (!this.formData.role) {
        this.errors.role = "Role harus dipilih.";
        isValid = false;
      }
      return isValid;
    },
    submitForm() {
      if (this.validateForm()) {
        // Emit data yang relevan (termasuk profilePicture File object atau null)
        this.$emit('submit', { ...this.formData });
      }
    }
  },
  mounted() {
    this.resetForm(); // Selalu reset form saat komponen di-mount
  }
};
</script>

<style scoped>
/* CSS Variables (diambil dari AddNewPatient.vue) */
.modal-backdrop {
  --primary-50: #ECFDF5;
  --primary-100: #D1FAE5;
  --primary-500: #10B981;
  --primary-600: #059669;
  --primary-700: #047857;
  --neutral-50: #F9FAFB;
  --neutral-100: #F3F4F6;
  --neutral-200: #E5E7EB;
  --neutral-300: #D1D5DB;
  --neutral-400: #9CA3AF;
  --neutral-500: #6B7280;
  --neutral-700: #374151;
  --neutral-800: #1F2937;
  --danger-500: #EF4444;
  --danger-700: #B91C1C;
  font-family: 'Inter', sans-serif;
}

/* Modal Backdrop */
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

/* Modal Container */
.modal-container {
  width: 90%;
  max-width: 700px;
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

/* Modal Header */
.modal-header {
  padding: 18px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--neutral-200);
  background-color: var(--primary-50);
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
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
  font-size: 20px;
  color: var(--neutral-500);
  cursor: pointer;
  width: 36px;
  height: 36px;
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

/* Modal Body */
.modal-body {
  padding: 24px;
  flex-grow: 1;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--neutral-400) var(--neutral-100);
}

.modal-body::-webkit-scrollbar {
  width: 8px;
}
.modal-body::-webkit-scrollbar-track {
  background: var(--neutral-100);
  border-radius: 10px;
}
.modal-body::-webkit-scrollbar-thumb {
  background-color: var(--neutral-400);
  border-radius: 10px;
}

/* Form Sections */
.form-section {
  background-color: white;
  border-radius: 10px;
  border: 1px solid var(--neutral-200);
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--neutral-200);
}

.section-icon {
  font-size: 18px;
  color: var(--primary-500);
  margin-right: 12px;
}

.section-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--neutral-700);
}

.new-user-form {
  width: 100%;
}

.form-row {
  display: flex;
  gap: 20px;
  margin-bottom: 0;
}
.form-row:last-child .form-group {
    margin-bottom: 0;
}

.form-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  margin-bottom: 20px;
}
.form-group:last-child {
    margin-bottom: 0;
}

.form-group.full-width {
  flex-basis: 100%;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
  color: var(--neutral-700);
  display: flex;
  align-items: center;
}
.form-label .optional-text {
    font-size: 0.8em;
    color: var(--neutral-500);
    font-weight: 400;
    margin-left: 4px;
}

.required {
  color: var(--danger-500);
  margin-left: 4px;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 12px;
  color: var(--neutral-500);
  font-size: 15px;
  pointer-events: none;
}

.form-input,
.form-select {
  width: 100%;
  padding: 12px 12px 12px 40px;
  border: 1px solid var(--neutral-300);
  border-radius: 8px;
  font-size: 14px;
  color: var(--neutral-800);
  background-color: white;
  transition: all 0.3s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  box-sizing: border-box;
}
.file-input-custom {
  padding: 8px 12px;
}

.form-input:hover,
.form-select:hover {
  border-color: var(--primary-300, #6EE7B7);
}

.form-input:focus,
.form-select:focus {
  border-color: var(--primary-500);
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
  outline: none;
}

.form-input:focus ~ .input-icon,
.form-select:focus ~ .input-icon,
.input-wrapper:focus-within .input-icon {
  color: var(--primary-500);
}

.input-error {
  border-color: var(--danger-500) !important;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
}

.error-message {
  margin-top: 6px;
  font-size: 12px;
  color: var(--danger-500);
  display: flex;
  align-items: center;
  gap: 6px;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}

.password-input-container-custom {
  position: relative;
}
.password-toggle-custom {
  position: absolute;
  right: 1px;
  top: 1px;
  bottom: 1px;
  width: 40px;
  background: transparent;
  border: none;
  border-left: 1px solid var(--neutral-300);
  color: var(--neutral-500);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-top-right-radius: 7px;
  border-bottom-right-radius: 7px;
  padding: 0;
}
.password-toggle-custom:hover {
  color: var(--primary-500);
}
.form-input:focus + .password-toggle-custom {
   border-left-color: var(--primary-500);
}

.image-preview-container-custom {
    margin-top: 10px;
    position: relative;
    width: 100px;
    height: 100px;
    border: 1px dashed var(--neutral-300);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--neutral-50, #F9FAFB);
}
.image-preview-custom {
    max-width: 100%;
    max-height: 100%;
    object-fit: cover;
    border-radius: 6px;
}
.remove-image-button-custom {
    position: absolute;
    top: -8px;
    right: -8px;
    background-color: var(--danger-500);
    color: white;
    border: 2px solid white;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    font-size: 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 1px 2px rgba(0,0,0,0.2);
}
.remove-image-button-custom:hover {
    background-color: var(--danger-700, #B91C1C);
}

.form-actions {
  margin-top: 32px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 20px;
  border-top: 1px solid var(--neutral-200);
}

.btn-cancel, .btn-save {
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 110px;
  justify-content: center;
}

.btn-cancel {
  background-color: white;
  border: 1px solid var(--neutral-300);
  color: var(--neutral-700);
}
.btn-cancel:hover {
  background-color: var(--neutral-100);
  border-color: var(--neutral-400);
}

.btn-save {
  background-color: var(--primary-500);
  border: none;
  color: white;
}
.btn-save:hover {
  background-color: var(--primary-600);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}
.btn-save:disabled {
  background-color: var(--neutral-400);
  cursor: not-allowed;
  opacity: 0.7;
}

@media (max-width: 768px) {
  .modal-container {
    width: 95%;
    max-height: 95vh;
  }
  .form-row {
    flex-direction: column;
    gap: 0;
  }
  .form-group {
    margin-bottom: 20px;
  }
  .form-group:last-child {
      margin-bottom: 0;
  }
  .form-actions {
    flex-direction: column-reverse;
  }
  .btn-cancel, .btn-save {
    width: 100%;
  }
}
</style>