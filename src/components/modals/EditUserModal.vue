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
                    <input
                      type="text"
                      id="username"
                      v-model="editedFormData.username"
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
                  <label for="role">Role <span class="required">*</span></label>
                  <div class="input-wrapper">
                    <font-awesome-icon :icon="['fas', 'user-tag']" class="input-icon" />
                    <select
                      id="role"
                      v-model="editedFormData.role"
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
                  <label for="password">Password (Biarkan kosong jika tidak ingin diubah)</label>
                  <div class="input-wrapper password-input-container-custom">
                      <font-awesome-icon :icon="['fas', 'key']" class="input-icon" />
                      <input
                          :type="showPassword ? 'text' : 'password'"
                          id="password"
                          v-model="editedFormData.password"
                          class="form-input"
                          :class="{ 'input-error': errors.password }"
                          placeholder="Password baru"
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
                    <input
                      type="text"
                      id="name"
                      v-model="editedFormData.name"
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
              </div>

              <div class="form-group full-width">
                <label for="profilePicture">Foto Profil (Biarkan kosong jika tidak ingin diubah)</label>
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
                <div v-else-if="currentProfilePictureUrl" class="image-preview-container-custom">
                    <img :src="currentProfilePictureUrl" alt="Foto Profil Saat Ini" class="image-preview-custom" />
                    <button type="button" @click="removeCurrentPicture" class="remove-image-button-custom" title="Hapus gambar saat ini">
                        <font-awesome-icon :icon="['fas', 'times']" />
                    </button>
                    <small class="current-photo-label">Foto Saat Ini</small>
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
              <button type="button" class="btn-cancel" @click="closeModal" :disabled="isSubmitting">
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
                  <font-awesome-icon :icon="['fas', 'save']" /> Simpan Perubahan
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
import axios from "axios";
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
    visible: { // For controlling modal visibility
        type: Boolean,
        default: false
    },
    userId: { // The ID of the user to edit
        type: [Number, String],
        required: true
    }
  },
  emits: ['close', 'user-updated', 'user-update-failed'],
  data() {
    return {
      originalUserData: null, // To store original data for comparison
      editedFormData: {
        username: "",
        password: "", // Only set if user changes it
        name: "",
        role: "",
        profilePicture: null, // File object for new picture
      },
      currentProfilePictureUrl: null, // URL of currently existing profile picture
      errors: {
        username: "",
        password: "",
        name: "",
        role: "",
        profilePicture: "",
      },
      showPassword: false,
      previewUrl: null, // For new profile picture preview
      isSubmitting: false,
      isLoading: false, // For loading user data into the form
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
    userId: {
      immediate: true, // Fetch data immediately when component is mounted with a userId
      handler(newId) {
        if (newId) {
          this.fetchUserData();
        }
      }
    },
    visible(newValue) {
        if (!newValue) { // When modal is hidden
            this.resetForm();
        }
    }
  },
  methods: {
    togglePasswordVisibility() {
      this.showPassword = !this.showPassword;
    },
    closeModal() {
      this.$emit('close');
      // No need to call resetForm here, it's handled by watch(visible)
    },
    resetForm() {
        this.originalUserData = null;
        this.editedFormData = {
            username: "",
            password: "",
            name: "",
            role: "",
            profilePicture: null,
        };
        this.currentProfilePictureUrl = null;
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
        this.isSubmitting = false;
        this.isLoading = false;
    },
    async fetchUserData() {
        this.isLoading = true;
        this.resetForm(); // Reset form before fetching new data

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                Swal.fire({
                    title: "Sesi Berakhir!",
                    text: "Sesi Anda telah berakhir. Silakan login kembali.",
                    icon: "warning",
                });
                this.closeModal();
                return;
            }

            const response = await axios.get(`http://localhost:8000/api/admin/users/${this.userId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            this.originalUserData = response.data.user; // Store original data
            this.editedFormData = {
                username: this.originalUserData.username,
                name: this.originalUserData.name,
                role: this.originalUserData.role,
                password: "", // Password is never pre-filled for security
                profilePicture: null,
            };
            this.currentProfilePictureUrl = this.originalUserData.profile_picture;

        } catch (error) {
            console.error("Error fetching user data for edit:", error.response || error);
            let errorMessage = "Gagal memuat data user untuk diedit.";
            if (error.response && error.response.data && error.response.data.message) {
                errorMessage = error.response.data.message;
            }
            Swal.fire('Error!', errorMessage, 'error');
            this.closeModal();
        } finally {
            this.isLoading = false;
        }
    },
    handleFileUpload(event) {
      const file = event.target.files[0];
      if (file) {
        if (file.size > 2 * 1024 * 1024) { // Max 2MB
            this.errors.profilePicture = "Ukuran file maksimal 2MB.";
            this.editedFormData.profilePicture = null;
            this.previewUrl = null;
            event.target.value = ""; // Clear the file input to allow re-selection
            return;
        }
        const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
        if (!allowedTypes.includes(file.type)) {
            this.errors.profilePicture = "Format file harus PNG, JPG, atau JPEG.";
            this.editedFormData.profilePicture = null;
            this.previewUrl = null;
            event.target.value = ""; // Clear the file input
            return;
        }
        this.errors.profilePicture = ""; // Clear previous error
        this.editedFormData.profilePicture = file;
        this.previewUrl = URL.createObjectURL(file);
        this.currentProfilePictureUrl = null; // Clear current picture if new one is selected
      } else {
        this.editedFormData.profilePicture = null;
        this.previewUrl = null;
        // If file input is cleared without new selection, revert to currentProfilePictureUrl if it existed
        if (this.originalUserData && this.originalUserData.profile_picture) {
            this.currentProfilePictureUrl = this.originalUserData.profile_picture;
        }
      }
    },
    removeImage() { // For removing selected new image preview
        this.editedFormData.profilePicture = null;
        this.previewUrl = null;
        const fileInput = document.getElementById('profilePicture');
        if (fileInput) {
            fileInput.value = "";
        }
        // If original picture exists, show it again
        if (this.originalUserData && this.originalUserData.profile_picture) {
            this.currentProfilePictureUrl = this.originalUserData.profile_picture;
        }
    },
    removeCurrentPicture() { // For explicitly removing the current profile picture from database
        this.currentProfilePictureUrl = null;
        this.editedFormData.profilePicture = 'REMOVE_EXISTING'; // Special flag to indicate removal
        this.previewUrl = null;
        const fileInput = document.getElementById('profilePicture');
        if (fileInput) {
            fileInput.value = "";
        }
    },
    validateForm() {
      let isValid = true;
      this.errors = { username: "", password: "", name: "", role: "", profilePicture: "" };

      if (!this.editedFormData.username) {
        this.errors.username = "Username tidak boleh kosong.";
        isValid = false;
      } else if (this.editedFormData.username.length < 4) {
        this.errors.username = "Username minimal 4 karakter.";
        isValid = false;
      } else if (/\s/.test(this.editedFormData.username)) {
        this.errors.username = "Username tidak boleh mengandung spasi.";
        isValid = false;
      }

      // Password validation only if it's being changed
      if (this.editedFormData.password && this.editedFormData.password.length < 6) {
        this.errors.password = "Password minimal 6 karakter.";
        isValid = false;
      }

      if (!this.editedFormData.name) {
        this.errors.name = this.editedFormData.role === 'puskesmas' ? "Nama Puskesmas tidak boleh kosong." : "Nama Lengkap tidak boleh kosong.";
        isValid = false;
      }

      if (!this.editedFormData.role) {
        this.errors.role = "Role harus dipilih.";
        isValid = false;
      }
      return isValid;
    },
    async submitForm() {
      if (this.isSubmitting) {
        console.warn("Form submission already in progress, ignoring double click.");
        return;
      }

      if (!this.validateForm()) {
        return;
      }

      // Show SweetAlert confirmation
      const result = await Swal.fire({
        title: 'Konfirmasi Perubahan User',
        text: `Apakah Anda yakin ingin menyimpan perubahan untuk user "${this.editedFormData.username}"?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#047d78',
        cancelButtonColor: '#ef4444',
        confirmButtonText: 'Ya, Simpan!',
        cancelButtonText: 'Batal',
        showLoaderOnConfirm: true,
        preConfirm: async () => {
          try {
            const token = localStorage.getItem("token");
            if (!token) {
                return Swal.showValidationMessage("Token tidak ditemukan. Silakan login kembali.");
            }

            const apiPayload = new FormData();
            apiPayload.append("username", this.editedFormData.username);
            apiPayload.append("name", this.editedFormData.name);
            apiPayload.append("role", this.editedFormData.role);

            // Only append password if it's not empty
            if (this.editedFormData.password) {
                apiPayload.append("password", this.editedFormData.password);
            }

            // Handle profile picture
            if (this.editedFormData.profilePicture instanceof File) {
                apiPayload.append("profile_picture", this.editedFormData.profilePicture);
            } else if (this.editedFormData.profilePicture === 'REMOVE_EXISTING') {
                apiPayload.append("profile_picture", ''); // Send empty string to remove
            } else {
                // If no new picture selected and not explicitly removed, don't send anything
                // API should handle existing picture remaining if this field is absent
            }

            // Crucially for PATCH/PUT with FormData, specify _method=PUT or _method=PATCH
            apiPayload.append("_method", "PUT"); // Or "PATCH" depending on your API route definition

            this.isSubmitting = true;

            const response = await axios.post( // Use POST for _method spoofing
                `http://localhost:8000/api/admin/users/${this.userId}`,
                apiPayload,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            return response.data;
          } catch (error) {
              this.handleSubmissionError(error);
              return Swal.showValidationMessage(
                error.response?.data?.message || error.message || "Terjadi kesalahan saat menyimpan perubahan."
              );
          } finally {
              this.isSubmitting = false;
          }
        }
      });

      if (result.isConfirmed && result.value) {
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: result.value.message || "Perubahan user berhasil disimpan!",
          confirmButtonColor: '#047d78'
        });
        this.$emit('user-updated', result.value.user); // Emit updated user data if API returns it
        this.closeModal();
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        // User clicked cancel
      }
    },
    handleSubmissionError(error) {
      console.error("Gagal menyimpan perubahan user:", error.response ? error.response.data : error.message);
      let errorMessage = "Gagal menyimpan perubahan user.";
      if (error.response && error.response.data) {
          if (error.response.data.message) {
              errorMessage = error.response.data.message;
          } else if (error.response.data.errors) {
              const errors = error.response.data.errors;
              const firstErrorKey = Object.keys(errors)[0];
              if (firstErrorKey && errors[firstErrorKey].length > 0) {
                  errorMessage = errors[firstErrorKey][0];
              } else {
                  errorMessage = `Terjadi kesalahan validasi. (${error.response.status})`;
              }
          } else {
              errorMessage = `Terjadi kesalahan server. (${error.response.status})`;
          }
      } else if (error.request) {
          errorMessage = "Tidak ada respons dari server. Periksa koneksi Anda.";
      } else {
          errorMessage = error.message || "Terjadi kesalahan tidak diketahui.";
      }
      this.$emit('user-update-failed', errorMessage);
    }
  },
  mounted() {
    // Initial fetch handled by watcher
  }
};
</script>

<style scoped>
/* Common CSS Variables, ensure they are defined or imported globally */
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

/* Loading State */
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
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
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