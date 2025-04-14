<template>
    <div class="modal-overlay" @click.self="closeModal">
      <div class="modal-container">
        <!-- Header Modal -->
        <div class="modal-header">
          <h2 class="modal-title">Tambah User Baru</h2>
          <button class="close-button" @click="closeModal">
            <font-awesome-icon :icon="['fas', 'times']" />
          </button>
        </div>
  
        <!-- Body Modal -->
        <div class="modal-body">
          <form @submit.prevent="submitForm" class="user-form">
            <!-- Username -->
            <div class="form-group">
              <label for="username" class="form-label">Username</label>
              <input
                type="text"
                id="username"
                v-model="formData.username"
                class="form-input"
                placeholder="Masukkan username"
                required
              />
              <p v-if="errors.username" class="error-message">{{ errors.username }}</p>
            </div>
  
            <!-- Password -->
            <div class="form-group">
              <label for="password" class="form-label">Password</label>
              <div class="password-input-container">
                <input
                  :type="showPassword ? 'text' : 'password'"
                  id="password"
                  v-model="formData.password"
                  class="form-input"
                  placeholder="Masukkan password"
                  required
                />
                <button 
                  type="button" 
                  class="password-toggle" 
                  @click="togglePasswordVisibility"
                >
                  <font-awesome-icon :icon="['fas', showPassword ? 'eye-slash' : 'eye']" />
                </button>
              </div>
              <p v-if="errors.password" class="error-message">{{ errors.password }}</p>
            </div>
  
            <!-- Nama -->
            <div class="form-group">
              <label for="name" class="form-label">Nama Lengkap</label>
              <input
                type="text"
                id="name"
                v-model="formData.name"
                class="form-input"
                placeholder="Masukkan nama lengkap"
                required
              />
              <p v-if="errors.name" class="error-message">{{ errors.name }}</p>
            </div>
  
            <!-- Role -->
            <div class="form-group">
              <label for="role" class="form-label">Role</label>
              <select
                id="role"
                v-model="formData.role"
                class="form-input"
                required
              >
                <option value="" disabled selected>Pilih role user</option>
                <option value="Admin">Admin</option>
                <option value="Dokter">Dokter</option>
                <option value="Perawat">Perawat</option>
                <option value="Apoteker">Apoteker</option>
                <option value="Resepsionis">Resepsionis</option>
              </select>
              <p v-if="errors.role" class="error-message">{{ errors.role }}</p>
            </div>
  
            <!-- Alamat -->
            <div class="form-group">
              <label for="address" class="form-label">Alamat</label>
              <textarea
                id="address"
                v-model="formData.address"
                class="form-textarea"
                placeholder="Masukkan alamat lengkap"
                rows="3"
                required
              ></textarea>
              <p v-if="errors.address" class="error-message">{{ errors.address }}</p>
            </div>
  
            <!-- Email -->
            <div class="form-group">
              <label for="email" class="form-label">Email</label>
              <input
                type="email"
                id="email"
                v-model="formData.email"
                class="form-input"
                placeholder="Masukkan email"
                required
              />
              <p v-if="errors.email" class="error-message">{{ errors.email }}</p>
            </div>
  
            <!-- No. Telepon -->
            <div class="form-group">
              <label for="phone" class="form-label">No. Telepon</label>
              <input
                type="tel"
                id="phone"
                v-model="formData.phone"
                class="form-input"
                placeholder="Masukkan nomor telepon"
                required
              />
              <p v-if="errors.phone" class="error-message">{{ errors.phone }}</p>
            </div>
          </form>
        </div>
  
        <!-- Footer Modal -->
        <div class="modal-footer">
          <button class="cancel-button" @click="closeModal">Batal</button>
          <button class="submit-button" @click="submitForm">Simpan</button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: "AddUserModal",
    props: {
      existingData: {
        type: Object,
        default: () => ({})
      }
    },
    data() {
      return {
        formData: {
          username: "",
          password: "",
          name: "",
          role: "",
          address: "",
          email: "",
          phone: ""
        },
        errors: {
          username: "",
          password: "",
          name: "",
          role: "",
          address: "",
          email: "",
          phone: ""
        },
        showPassword: false
      };
    },
    created() {
      // If editing existing data, populate the form
      if (Object.keys(this.existingData).length > 0) {
        this.formData = { ...this.existingData };
      }
    },
    methods: {
      togglePasswordVisibility() {
        this.showPassword = !this.showPassword;
      },
      closeModal() {
        this.$emit('close');
      },
      validateForm() {
        let isValid = true;
        this.errors = {
          username: "",
          password: "",
          name: "",
          role: "",
          address: "",
          email: "",
          phone: ""
        };
  
        // Username validation
        if (!this.formData.username) {
          this.errors.username = "Username tidak boleh kosong";
          isValid = false;
        } else if (this.formData.username.length < 4) {
          this.errors.username = "Username minimal 4 karakter";
          isValid = false;
        }
  
        // Password validation
        if (!this.formData.password) {
          this.errors.password = "Password tidak boleh kosong";
          isValid = false;
        } else if (this.formData.password.length < 6) {
          this.errors.password = "Password minimal 6 karakter";
          isValid = false;
        }
  
        // Name validation
        if (!this.formData.name) {
          this.errors.name = "Nama tidak boleh kosong";
          isValid = false;
        }
  
        // Role validation
        if (!this.formData.role) {
          this.errors.role = "Role harus dipilih";
          isValid = false;
        }
  
        // Address validation
        if (!this.formData.address) {
          this.errors.address = "Alamat tidak boleh kosong";
          isValid = false;
        }
  
        // Email validation
        if (!this.formData.email) {
          this.errors.email = "Email tidak boleh kosong";
          isValid = false;
        } else if (!this.validateEmail(this.formData.email)) {
          this.errors.email = "Format email tidak valid";
          isValid = false;
        }
  
        // Phone validation
        if (!this.formData.phone) {
          this.errors.phone = "Nomor telepon tidak boleh kosong";
          isValid = false;
        } else if (!this.validatePhone(this.formData.phone)) {
          this.errors.phone = "Format nomor telepon tidak valid";
          isValid = false;
        }
  
        return isValid;
      },
      validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
      },
      validatePhone(phone) {
        const re = /^[0-9\-\+]{8,15}$/;
        return re.test(phone);
      },
      submitForm() {
        if (this.validateForm()) {
          this.$emit('submit', { ...this.formData });
        }
      }
    }
  };
  </script>
  
  <style scoped>
  /* Modal Overlay (background) */
  .modal-overlay {
    position: fixed;
    z-index: 1000;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    overflow: auto;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  /* Modal Container */
  .modal-container {
    background-color: #ffffff;
    border-radius: 10px;
    max-width: 600px;
    width: 100%;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    animation: modalAppear 0.3s ease-out forwards;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
  }
  
  @keyframes modalAppear {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  /* Modal Header */
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    border-bottom: 1px solid #e5e7eb;
  }
  
  .modal-title {
    font-family: "Inter", sans-serif;
    font-size: 20px;
    font-weight: 600;
    color: #111827;
    margin: 0;
  }
  
  .close-button {
    background: transparent;
    border: none;
    font-size: 18px;
    color: #6b7280;
    cursor: pointer;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    transition: background-color 0.3s ease;
  }
  
  .close-button:hover {
    background-color: #f3f4f6;
    color: #111827;
  }
  
  /* Modal Body */
  .modal-body {
    padding: 24px;
    overflow-y: auto;
    flex-grow: 1;
  }
  
  /* User Form */
  .user-form {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }
  
  @media (max-width: 640px) {
    .user-form {
      grid-template-columns: 1fr;
    }
  }
  
  .form-group {
    margin-bottom: 16px;
  }
  
  .form-label {
    display: block;
    font-family: "Inter", sans-serif;
    font-size: 14px;
    font-weight: 500;
    color: #374151;
    margin-bottom: 6px;
  }
  
  .form-input,
  .form-textarea {
    width: 100%;
    padding: 12px;
    font-family: "Inter", sans-serif;
    font-size: 14px;
    color: #111827;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    background-color: #ffffff;
    transition: border-color 0.3s ease, box-shadow 0.3s ease;
  }
  
  .form-input:focus,
  .form-textarea:focus {
    border-color: var(--primary-500, #4f46e5);
    outline: none;
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
  }
  
  .form-input::placeholder,
  .form-textarea::placeholder {
    color: #9ca3af;
  }
  
  /* Password input container */
  .password-input-container {
    position: relative;
  }
  
  .password-toggle {
    position: absolute;
    right: 12px;
    top: 12px;
    background: transparent;
    border: none;
    color: #6b7280;
    cursor: pointer;
  }
  
  .password-toggle:hover {
  color: var(--primary-500, #4f46e5);
}

.error-message {
  color: #dc2626;
  font-size: 12px;
  margin-top: 4px;
}

/* Form textarea */
.form-textarea {
  resize: vertical;
  min-height: 80px;
}

/* Modal Footer */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #e5e7eb;
}

.cancel-button,
.submit-button {
  padding: 10px 20px;
  font-family: "Inter", sans-serif;
  font-size: 14px;
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.cancel-button {
  background-color: #f3f4f6;
  color: #4b5563;
  border: 1px solid #d1d5db;
}

.cancel-button:hover {
  background-color: #e5e7eb;
}

.submit-button {
  background-color: var(--primary-500, #4f46e5);
  color: #ffffff;
  border: none;
}

.submit-button:hover {
  background-color: var(--primary-700, #3730a3);
}

@media (max-width: 640px) {
  .modal-container {
    width: calc(100% - 32px);
    margin: 0 16px;
  }
}
</style>