<template>
  <div class="modal-backdrop" @click.self="closeModal">
    <div class="modal-container">
      <div class="modal-header">
        <h2>
          <font-awesome-icon :icon="['fas', 'user-edit']" class="icon-margin" />
          Edit User
        </h2>
        <button class="close-button" @click="closeModal" aria-label="Close">
          <font-awesome-icon :icon="['fas', 'times']" />
        </button>
      </div>

      <div class="modal-body">
        <div v-if="isLoading" class="loading-state-container">
            <div class="spinner"></div>
            <p>Memuat data user...</p>
        </div>
        <div v-else class="edit-user-form">
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
                    <input type="text" id="username" v-model="editedFormData.username" class="form-input" :class="{ 'input-error': errors.username }" placeholder="Masukkan username" required />
                  </div>
                  <transition name="fade">
                    <p v-if="errors.username" class="error-message"><font-awesome-icon :icon="['fas', 'exclamation-circle']" /> {{ errors.username }}</p>
                  </transition>
                </div>
                <div class="form-group">
                  <label for="role">Role <span class="required">*</span></label>
                  <div class="input-wrapper">
                    <font-awesome-icon :icon="['fas', 'user-tag']" class="input-icon" />
                    <select id="role" v-model="editedFormData.role" class="form-select" :class="{ 'input-error': errors.role }" required>
                      <option value="" disabled>Pilih role user</option>
                      <option value="admin">Admin</option>
                      <option value="puskesmas">Puskesmas</option>
                    </select>
                  </div>
                  <transition name="fade">
                    <p v-if="errors.role" class="error-message"><font-awesome-icon :icon="['fas', 'exclamation-circle']" /> {{ errors.role }}</p>
                  </transition>
                </div>
              </div>
              <div class="form-group full-width">
                <div v-if="!isChangingPassword">
                    <button type="button" class="btn-change-password-action" @click="startChangingPassword">
                        <font-awesome-icon :icon="['fas', 'key']" /> Ganti Password
                    </button>
                </div>
                <div v-else>
                    <label for="password">Password Baru <span class="required">*</span></label>
                    <div class="input-wrapper password-input-container-custom">
                        <font-awesome-icon :icon="['fas', 'key']" class="input-icon" />
                        <input :type="showPassword ? 'text' : 'password'" id="password" v-model="editedFormData.password" class="form-input" :class="{ 'input-error': errors.password }" placeholder="Masukkan password baru" required />
                        <button type="button" class="password-toggle-custom" @click="togglePasswordVisibility">
                            <font-awesome-icon :icon="['fas', showPassword ? 'eye-slash' : 'eye']" />
                        </button>
                    </div>
                    <transition name="fade"><p v-if="errors.password" class="error-message"><font-awesome-icon :icon="['fas', 'exclamation-circle']" /> {{ errors.password }}</p></transition>
                    <label for="password_confirmation" class="mt-3">Konfirmasi Password Baru <span class="required">*</span></label>
                    <div class="input-wrapper password-input-container-custom">
                        <font-awesome-icon :icon="['fas', 'key']" class="input-icon" />
                        <input :type="showConfirmPassword ? 'text' : 'password'" id="password_confirmation" v-model="editedFormData.password_confirmation" class="form-input" :class="{ 'input-error': errors.password_confirmation }" placeholder="Konfirmasi password baru" required />
                        <button type="button" class="password-toggle-custom" @click="toggleConfirmPasswordVisibility">
                            <font-awesome-icon :icon="['fas', showConfirmPassword ? 'eye-slash' : 'eye']" />
                        </button>
                    </div>
                    <transition name="fade"><p v-if="errors.password_confirmation" class="error-message"><font-awesome-icon :icon="['fas', 'exclamation-circle']" /> {{ errors.password_confirmation }}</p></transition>
                    <div class="d-flex justify-content-end mt-3">
                        <button type="button" class="btn-cancel-password-change" @click="cancelChangingPassword">Batal Ganti Password</button>
                    </div>
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
                      <font-awesome-icon :icon="editedFormData.role === 'puskesmas' ? ['fas', 'hospital'] : ['fas', 'user']" class="input-icon" />
                    <input type="text" id="name" v-model="editedFormData.name" class="form-input" :class="{ 'input-error': errors.name }" :placeholder="namePlaceholder" required />
                  </div>
                  <transition name="fade">
                    <p v-if="errors.name" class="error-message"><font-awesome-icon :icon="['fas', 'exclamation-circle']" /> {{ errors.name }}</p>
                  </transition>
                </div>
              </div>
              <div class="form-group full-width">
                <label for="profilePicture">Foto Profil (Biarkan kosong jika tidak ingin diubah)</label>
                <div class="input-wrapper file-input-wrapper">
                  <input type="file" id="profilePicture" @change="handleFileUpload" class="form-input file-input-custom" accept="image/png, image/jpeg, image/jpg" />
                </div>
                <div v-if="previewUrl" class="image-preview-container-custom">
                    <img :src="previewUrl" alt="Preview Foto Profil" class="image-preview-custom" />
                    <button type="button" @click="removeImage" class="remove-image-button-custom" title="Hapus gambar"><font-awesome-icon :icon="['fas', 'times']" /></button>
                </div>
                <div v-else-if="currentProfilePictureUrl" class="image-preview-container-custom">
                    <img :src="currentProfilePictureUrl" alt="Foto Profil Saat Ini" class="image-preview-custom" />
                    <button type="button" @click="removeCurrentPicture" class="remove-image-button-custom" title="Hapus gambar saat ini"><font-awesome-icon :icon="['fas', 'times']" /></button>
                    <small class="current-photo-label">Foto Saat Ini</small>
                </div>
                <transition name="fade">
                  <p v-if="errors.profilePicture" class="error-message"><font-awesome-icon :icon="['fas', 'exclamation-circle']" /> {{ errors.profilePicture }}</p>
                </transition>
              </div>
            </div>

            <div class="form-actions">
              <button type="button" class="btn-cancel" @click="closeModal" :disabled="isSubmitting">
                <font-awesome-icon :icon="['fas', 'times']" /> Batal
              </button>
              <button type="submit" class="btn-save" :disabled="isSubmitting">
                <span v-if="isSubmitting"><font-awesome-icon :icon="['fas', 'spinner']" spin /> Menyimpan...</span>
                <span v-else><font-awesome-icon :icon="['fas', 'save']" /> Simpan Perubahan</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// --- PERUBAHAN 1: Ganti impor axios dengan apiClient
import apiClient from '../../api.js';
import Swal from 'sweetalert2';
import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faUserEdit, faAt, faKey, faHospital, faUser, faUserTag, faEye, faEyeSlash,
  faExclamationCircle, faTimes, faSpinner, faIdCard, faUserShield, faSave
} from '@fortawesome/free-solid-svg-icons';

library.add(
  faUserEdit, faAt, faKey, faHospital, faUser, faUserTag, faEye, faEyeSlash,
  faExclamationCircle, faTimes, faSpinner, faIdCard, faUserShield, faSave
);

export default {
  name: "EditUserModal",
  props: {
    visible: {
        type: Boolean,
        default: false
    },
    userId: {
        type: [Number, String],
        required: true
    }
  },
  // --- PERUBAHAN 2: Sederhanakan emits
  emits: ['close', 'user-updated'],
  data() {
    return {
      originalUserData: null,
      editedFormData: {
        username: "",
        password: "",
        password_confirmation: "",
        name: "",
        role: "",
        profilePicture: null, // null, File, atau string 'REMOVE_EXISTING'
      },
      currentProfilePictureUrl: null,
      errors: {
        username: "", password: "", password_confirmation: "", name: "", role: "", profilePicture: "",
      },
      showPassword: false,
      showConfirmPassword: false,
      previewUrl: null,
      isSubmitting: false,
      isLoading: false,
      isChangingPassword: false,
    };
  },
  computed: {
    nameLabel() {
      return this.editedFormData.role === 'puskesmas' ? 'Nama Puskesmas' : 'Nama Lengkap User';
    },
    namePlaceholder() {
      return this.editedFormData.role === 'puskesmas' ? 'Contoh: Puskesmas Martapura Timur' : 'Masukkan nama lengkap user';
    }
  },
  watch: {
    visible: {
      handler(newValue) {
        if (newValue && this.userId) {
          this.fetchUserData();
        } else if (!newValue) {
          this.resetForm();
        }
      },
      immediate: true,
    }
  },
  methods: {
    // --- PERUBAHAN 3: Gunakan apiClient untuk fetch data ---
    async fetchUserData() {
      if (!this.userId) return;
      this.isLoading = true;

      try {
        const fetchPromise = apiClient.get(`/admin/users/${this.userId}`);
        const [response] = await Promise.all([
            fetchPromise,
            new Promise(resolve => setTimeout(resolve, 300))
        ]);

        this.originalUserData = response.data.user;
        this.editedFormData = {
            username: this.originalUserData.username,
            name: this.originalUserData.name,
            role: this.originalUserData.role,
            password: "",
            password_confirmation: "",
            profilePicture: null,
        };
        this.currentProfilePictureUrl = this.originalUserData.profile_picture;
      } catch (error) {
        console.error("Error fetching user data for edit:", error);
        let errorMessage = "Gagal memuat data user.";
        if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
        }
        Swal.fire('Error!', errorMessage, 'error');
        this.closeModal();
      } finally {
        this.isLoading = false;
      }
    },

    // --- PERUBAHAN 4: Gunakan apiClient untuk submit form ---
    async submitForm() {
      if (!this.validateForm()) return;

      const result = await Swal.fire({
        title: 'Konfirmasi Perubahan',
        html: `Anda yakin ingin menyimpan perubahan untuk user "<b>${this.editedFormData.username}</b>"?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Ya, Simpan!',
        cancelButtonText: 'Batal',
        confirmButtonColor: '#10B981',
        cancelButtonColor: '#6B7280',
      });

      if (!result.isConfirmed) return;

      this.isSubmitting = true;

      const apiPayload = new FormData();
      apiPayload.append("username", this.editedFormData.username);
      apiPayload.append("name", this.editedFormData.name);
      apiPayload.append("role", this.editedFormData.role);
      
      if (this.isChangingPassword && this.editedFormData.password) {
        apiPayload.append("password", this.editedFormData.password);
        apiPayload.append("password_confirmation", this.editedFormData.password_confirmation);
      }

      if (this.editedFormData.profilePicture instanceof File) {
        apiPayload.append("profile_picture", this.editedFormData.profilePicture);
      } else if (this.editedFormData.profilePicture === 'REMOVE_EXISTING') {
        apiPayload.append("profile_picture", ''); // Kirim string kosong untuk dihapus
      }
      
      apiPayload.append("_method", "PUT"); // Penting untuk update dengan FormData

      try {
        const response = await apiClient.post(`/admin/users/${this.userId}`, apiPayload);

        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: response.data.message || "Perubahan user berhasil disimpan!",
          timer: 2000,
          showConfirmButton: false,
          timerProgressBar: true
        });
        
        this.$emit('user-updated', response.data.user);
        this.closeModal();

      } catch (error) {
        let errorMessage = "Gagal menyimpan perubahan.";
        if (error.response) {
            console.error("API Error:", error.response.data);
            if (error.response.data?.message) {
                errorMessage = error.response.data.message;
            }
            if (error.response.status === 422 && error.response.data?.errors) {
                const errorsArray = Object.values(error.response.data.errors).flat();
                errorMessage = errorsArray.join('\n');
            }
        } else {
            console.error("Network/Request Error:", error.message);
            errorMessage = "Tidak dapat terhubung ke server.";
        }
        Swal.fire('Gagal!', errorMessage, 'error');
      } finally {
        this.isSubmitting = false;
      }
    },

    // --- PERUBAHAN 5: Hapus metode handleSubmissionError yang tidak lagi digunakan ---

    // Metode lain tidak berubah (toggle password, reset form, file handling, validasi, dll)
    closeModal() {
      this.$emit('close');
    },
    resetForm() {
        this.originalUserData = null;
        this.editedFormData = {
            username: "", password: "", password_confirmation: "",
            name: "", role: "", profilePicture: null,
        };
        this.currentProfilePictureUrl = null;
        this.errors = {};
        this.previewUrl = null;
        const fileInput = document.getElementById('profilePicture');
        if (fileInput) fileInput.value = "";
        this.showPassword = false;
        this.showConfirmPassword = false;
        this.isSubmitting = false;
        this.isLoading = false;
        this.isChangingPassword = false;
    },
    startChangingPassword() {
        this.isChangingPassword = true;
    },
    cancelChangingPassword() {
        this.isChangingPassword = false;
        this.editedFormData.password = "";
        this.editedFormData.password_confirmation = "";
        this.errors.password = "";
        this.errors.password_confirmation = "";
    },
    togglePasswordVisibility() {
      this.showPassword = !this.showPassword;
    },
    toggleConfirmPasswordVisibility() {
      this.showConfirmPassword = !this.showConfirmPassword;
    },
    handleFileUpload(event) {
      const file = event.target.files[0];
      if (!file) {
        this.editedFormData.profilePicture = null;
        this.previewUrl = null;
        if(this.originalUserData) this.currentProfilePictureUrl = this.originalUserData.profile_picture;
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        this.errors.profilePicture = "Ukuran file maksimal 2MB.";
        return;
      }
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        this.errors.profilePicture = "Format file harus PNG, JPG, atau JPEG.";
        return;
      }
      this.errors.profilePicture = "";
      this.editedFormData.profilePicture = file;
      this.previewUrl = URL.createObjectURL(file);
      this.currentProfilePictureUrl = null; // Sembunyikan gambar lama
    },
    removeImage() {
        this.editedFormData.profilePicture = null;
        this.previewUrl = null;
        const fileInput = document.getElementById('profilePicture');
        if (fileInput) fileInput.value = "";
        if (this.originalUserData) this.currentProfilePictureUrl = this.originalUserData.profile_picture;
    },
    removeCurrentPicture() {
        this.currentProfilePictureUrl = null;
        // Tandai untuk penghapusan di backend
        this.editedFormData.profilePicture = 'REMOVE_EXISTING'; 
    },
    validateForm() {
      let isValid = true;
      this.errors = { username: "", password: "", password_confirmation: "", name: "", role: "", profilePicture: "" };

      if (!this.editedFormData.username.trim()) {
        this.errors.username = "Username tidak boleh kosong.";
        isValid = false;
      } else if (this.editedFormData.username.length < 4) {
        this.errors.username = "Username minimal 4 karakter.";
        isValid = false;
      } else if (/\s/.test(this.editedFormData.username)) {
        this.errors.username = "Username tidak boleh mengandung spasi.";
        isValid = false;
      }

      if (!this.editedFormData.name.trim()) {
        this.errors.name = this.editedFormData.role === 'puskesmas' ? "Nama Puskesmas tidak boleh kosong." : "Nama Lengkap tidak boleh kosong.";
        isValid = false;
      }

      if (!this.editedFormData.role) {
        this.errors.role = "Role harus dipilih.";
        isValid = false;
      }

      if (this.isChangingPassword) {
        if (!this.editedFormData.password) {
            this.errors.password = "Password baru tidak boleh kosong.";
            isValid = false;
        } else if (this.editedFormData.password.length < 6) {
            this.errors.password = "Password baru minimal 6 karakter.";
            isValid = false;
        }

        if (this.editedFormData.password !== this.editedFormData.password_confirmation) {
            this.errors.password_confirmation = "Konfirmasi password tidak cocok.";
            isValid = false;
        }
      }
      return isValid;
    },
  },
};
</script>

<style scoped>
/* BAGIAN STYLE TIDAK ADA PERUBAHAN */
:root {
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
  --danger-50: #FEF2F2;
  --danger-500: #EF4444;
  --danger-700: #B91C1C;
  --font-sans: 'Inter', sans-serif;
}
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
.loading-state-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  gap: 16px;
  color: var(--primary-500);
  font-weight: 600;
}
.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid var(--primary-500);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
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
.edit-user-form {
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
    flex-shrink: 0;
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
.current-photo-label {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: rgba(0, 0, 0, 0.5);
    color: white;
    font-size: 10px;
    text-align: center;
    padding: 2px 0;
    border-bottom-left-radius: 6px;
    border-bottom-right-radius: 6px;
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
.btn-change-password-action {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 15px;
    background-color: var(--neutral-100);
    border: 1px solid var(--neutral-300);
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    color: var(--neutral-700);
    cursor: pointer;
    transition: all 0.2s ease;
}
.btn-change-password-action:hover {
    background-color: var(--neutral-200);
    border-color: var(--neutral-400);
}
.btn-cancel-password-change {
    padding: 8px 15px;
    background-color: var(--danger-50);
    color: var(--danger-700);
    border: 1px solid var(--danger-300, #FCA5A5);
    border-radius: 8px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
}
.btn-cancel-password-change:hover {
    background-color: var(--danger-100, #FEE2E2);
    border-color: var(--danger-500);
}
.mt-3 {
    margin-top: 1rem;
}
.d-flex {
    display: flex;
}
.justify-content-end {
    justify-content: flex-end;
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