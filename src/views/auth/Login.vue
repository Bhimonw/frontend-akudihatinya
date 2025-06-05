<template>
  <div class="login-container">
    <div class="login-card">
      <div class="left-section">
        <div class="app-info">
          <div class="logo-container">
            <div class="logo-circle"></div>
          </div>
          <div class="app-text">
            <h1 class="app-title">akudihatinya</h1>
            <p class="app-description">Aplikasi Kesehatan untuk Diabetes Mellitus dan Hipertensi Terlayani</p>
          </div>
        </div>

        <div class="illustration-container">
          <svg width="280" height="280" viewBox="0 0 280 280" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="140" cy="140" r="120" fill="#E5F4F1" opacity="0.5"/>
            <g transform="translate(140, 140)">
              <rect x="-40" y="-10" width="80" height="20" rx="4" fill="#10B981"/>
              <rect x="-10" y="-40" width="20" height="80" rx="4" fill="#10B981"/>
            </g>
            <path d="M100 120C100 105 110 95 120 95C125 95 130 97 135 102C140 97 145 95 150 95C160 95 170 105 170 120C170 135 135 160 135 160S100 135 100 120Z" fill="#EF4444" opacity="0.8"/>
            <path d="M180 140C180 140 175 145 175 150C175 160 185 165 195 165C205 165 215 160 215 150C215 145 210 140 210 140" stroke="#6B7280" stroke-width="3" stroke-linecap="round"/>
            <circle cx="195" cy="150" r="8" fill="#6B7280"/>
            <path d="M175 150C175 150 175 170 175 180C175 195 160 210 140 210C120 210 105 195 105 180C105 170 105 150 105 150" stroke="#6B7280" stroke-width="3" stroke-linecap="round" fill="none"/>
            <g transform="translate(60, 180)">
              <rect x="0" y="0" width="30" height="12" rx="6" fill="#3B82F6" opacity="0.7"/>
              <rect x="15" y="0" width="15" height="12" rx="0" fill="#93C5FD"/>
            </g>
            <g transform="translate(200, 90)">
              <rect x="0" y="20" width="8" height="20" rx="2" fill="#10B981" opacity="0.6"/>
              <rect x="12" y="10" width="8" height="30" rx="2" fill="#10B981" opacity="0.7"/>
              <rect x="24" y="5" width="8" height="35" rx="2" fill="#10B981" opacity="0.8"/>
              <rect x="36" y="15" width="8" height="25" rx="2" fill="#10B981" opacity="0.9"/>
            </g>
            <circle cx="80" cy="80" r="5" fill="#10B981" opacity="0.3"/>
            <circle cx="200" cy="60" r="4" fill="#3B82F6" opacity="0.3"/>
            <circle cx="220" cy="180" r="6" fill="#EF4444" opacity="0.2"/>
            <circle cx="60" cy="140" r="4" fill="#10B981" opacity="0.4"/>
          </svg>
        </div>

        <div class="decorative-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>

      <div class="right-section">
        <div class="form-container">
          <h2 class="login-title">Selamat Datang</h2>
          <p class="login-subtitle">Silakan masuk ke akun Anda</p>

          <div class="form-group">
            <div
              class="input-with-icon"
              :class="{ 'input-active': isUsernameActive, 'input-error': errors.username }"
            >
              <div class="icon-container">
                <font-awesome-icon :icon="['fas', 'user']" class="input-icon" />
              </div>
              <input
                type="text"
                v-model="credentials.username"
                placeholder="Username"
                class="form-input"
                @focus="isUsernameActive = true"
                @blur="isUsernameActive = false"
                @keyup.enter="handleLogin"
              />
            </div>
            <p v-if="errors.username" class="error-text">{{ errors.username }}</p>
          </div>

          <div class="form-group">
            <div
              class="input-with-icon"
              :class="{ 'input-active': isPasswordActive, 'input-error': errors.password }"
            >
              <div class="icon-container">
                <font-awesome-icon :icon="['fas', 'lock']" class="input-icon" />
              </div>
              <input
                :type="showPassword ? 'text' : 'password'"
                v-model="credentials.password"
                placeholder="Password"
                class="form-input"
                @focus="isPasswordActive = true"
                @blur="isPasswordActive = false"
                @keyup.enter="handleLogin"
              />
              <div
                class="toggle-password"
                @click="showPassword = !showPassword"
                @mouseover="toggleHover = true"
                @mouseleave="toggleHover = false"
              >
                <font-awesome-icon
                  :icon="['fas', showPassword ? 'eye-slash' : 'eye']"
                  :class="{ 'icon-hovered': toggleHover }"
                />
              </div>
            </div>
            <p v-if="errors.password" class="error-text">{{ errors.password }}</p>
          </div>

          <button
            class="login-button"
            @click="handleLogin"
            :disabled="isLoading"
            :class="{ 'button-loading': isLoading }"
          >
            <span v-if="!isLoading">MASUK</span>
            <font-awesome-icon v-else :icon="['fas', 'circle-notch']" spin class="fa-spin" />
          </button>

          <div v-if="errors.general" class="general-error">
            <font-awesome-icon :icon="['fas', 'exclamation-circle']" class="error-icon" />
            <div class="general-error-content">
              <span>{{ errors.general }}</span>
              <p v-if="errors.details" class="error-details">{{ errors.details }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="copyright-footer">
      <p>Copyright © {{ currentYear }} Dinas Kesehatan. Hak Cipta Dilindungi</p>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/authStore.js'; // Pastikan path ini benar
import Swal from 'sweetalert2';

export default {
  name: 'Login',
  setup() {
    const router = useRouter();
    const authStore = useAuthStore();
    const credentials = ref({
      username: '',
      password: '',
    });
    const isUsernameActive = ref(false);
    const isPasswordActive = ref(false);
    const showPassword = ref(false);
    const toggleHover = ref(false);
    const isLoading = ref(false);
    const errors = ref({
      username: '',
      password: '',
      general: '',
      details: '',
    });
    const currentYear = new Date().getFullYear();

    const resetErrors = () => {
      errors.value = {
        username: '',
        password: '',
        general: '',
        details: '',
      };
    };

    const validateForm = () => {
      resetErrors();
      let isValid = true;
      if (!credentials.value.username.trim()) {
        errors.value.username = 'Username tidak boleh kosong';
        isValid = false;
      }
      if (!credentials.value.password) {
        errors.value.password = 'Password tidak boleh kosong';
        isValid = false;
      }
      return isValid;
    };

    const handleLogin = async () => {
      if (!validateForm() || isLoading.value) return;

      isLoading.value = true;

      try {
        await authStore.login(credentials.value.username, credentials.value.password);
        
        Swal.fire({
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          icon: 'success',
          title: 'Login berhasil!',
          didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer);
            toast.addEventListener('mouseleave', Swal.resumeTimer);
          }
        });

        const isAdmin = authStore.isAdmin;
        router.push(isAdmin ? '/admin/dashboard' : '/user/dashboard');

      } catch (error) {
        resetErrors();
        // Prioritas 1: Cek error.response.data (standar Axios error)
        if (error?.response?.data) {
          const apiError = error.response.data;
          console.log('API Error Response:', apiError);
          
          // Jika response sesuai format yang diharapkan
          if (apiError.success === false && apiError.errors) {
            errors.value.general = apiError.errors; // "Username atau password salah"
            if (apiError.message) {
              errors.value.details = apiError.message; // "Login gagal"  
            }
          }
          // Fallback jika struktur berbeda tapi ada message
          else if (apiError.message) {
            errors.value.general = apiError.message;
          }
          // Jika apiError adalah string
          else if (typeof apiError === 'string') {
            errors.value.general = apiError;
          }
          else {
            errors.value.general = 'Terjadi kesalahan pada server.';
          }
        }
        
        // Prioritas 2: Jika error object langsung berisi data response API
        // (kemungkinan authStore throw langsung response data)
        else if (error?.success === false && error?.errors) {
          console.log('Direct API Error Object:', error);
          errors.value.general = error.errors; // "Username atau password salah"
          if (error.message) {
            errors.value.details = error.message; // "Login gagal"
          }
        }
        
        // Prioritas 3: Network error (tidak ada response dari server)
        else if (error?.request) {
          console.log('Network Error:', error.request);
          errors.value.general = 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.';
        }
        
        // Prioritas 4: Error dengan message property
        else if (error?.message) {
          console.log('Generic Error:', error.message);
          
          // Cek apakah ini network timeout atau connection error
          if (error.message.includes('timeout') || error.message.includes('Network Error')) {
            errors.value.general = 'Koneksi timeout. Silakan coba lagi.';
          } else {
            errors.value.general = 'Terjadi kesalahan. Silakan coba lagi.';
          }
        }
        
        // Prioritas 5: Fallback untuk error tidak dikenal
        else {
          console.log('Unknown Error Type:', error);
          errors.value.general = 'Terjadi kesalahan yang tidak diketahui. Silakan coba lagi.';
        }
        
      } finally {
        isLoading.value = false;
      }
    };

    return {
      credentials,
      isUsernameActive,
      isPasswordActive,
      showPassword,
      toggleHover,
      isLoading,
      errors,
      currentYear,
      handleLogin,
    };
  },
};
</script>

<style scoped>
/* Root Styles */
.login-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, var(--primary-500) 0%, var(--primary-700) 100%);
  padding: 20px;
  position: relative;
  overflow: hidden;
  font-family: "Inter", sans-serif;
}

.login-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  z-index: 0;
}

.login-card {
  background: white;
  border-radius: 16px;
  box-shadow: var(--card-shadow);
  width: 100%;
  max-width: 900px;
  display: flex;
  position: relative;
  z-index: 1;
  overflow: hidden;
  margin-bottom: 30px;
  animation: cardAppear 0.8s ease-out;
}

@keyframes cardAppear {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Left Section */
.left-section {
  flex: 1;
  padding: 40px;
  display: flex;
  flex-direction: column;
  background: var(--background-light);
  position: relative;
  overflow: hidden;
}

.left-section::after {
  content: '';
  position: absolute;
  bottom: -50px;
  right: -50px;
  width: 200px;
  height: 200px;
  background: var(--primary-100);
  border-radius: 50%;
  z-index: 0;
  opacity: 0.6;
}

/* Right Section */
.right-section {
  flex: 1;
  padding: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: white;
}

.form-container {
  width: 100%;
  max-width: 320px;
}

/* App Info Section */
.app-info {
  display: flex;
  align-items: center;
  margin-bottom: 40px;
  position: relative;
  z-index: 1;
}

.app-text {
  margin-left: 12px;
}

.logo-container {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  flex-shrink: 0;
}

.logo-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--primary-500);
}

.app-title {
  font-family: "Inter", sans-serif;
  font-size: 20px;
  font-weight: 700;
  color: var(--text-dark);
  margin: 0 0 4px;
}

.app-description {
  font-family: "Inter", sans-serif;
  font-size: 12px;
  color: var(--text-medium);
  margin: 0;
  max-width: 280px;
}

/* Illustration Container */
.illustration-container {
  width: 280px;
  height: 280px;
  margin: 20px auto 0;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

.illustration-container svg {
  width: 100%;
  height: 100%;
}

/* Decorative Dots */
.decorative-dots {
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  z-index: 1;
}

.decorative-dots span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--primary-500);
  opacity: 0.3;
  animation: pulse 2s ease-in-out infinite;
}

.decorative-dots span:nth-child(2) {
  animation-delay: 0.3s;
}

.decorative-dots span:nth-child(3) {
  animation-delay: 0.6s;
}

@keyframes pulse {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.2); }
}

/* Login Form Section */
.login-title {
  font-family: "Inter", sans-serif;
  font-size: 24px;
  font-weight: 700;
  color: var(--text-dark);
  margin-bottom: 8px;
  text-align: center;
}

.login-subtitle {
  font-family: "Inter", sans-serif;
  font-size: 14px;
  color: var(--text-medium);
  margin-bottom: 24px;
  text-align: center;
}

.form-group {
  margin-bottom: 20px;
  position: relative;
}

.input-with-icon {
  position: relative;
  display: flex;
  align-items: center;
  background-color: var(--background-light);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid #E5E7EB;
}

.input-with-icon.input-active {
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
  border-color: var(--primary-500);
}

.input-with-icon.input-error {
  border: 1px solid var(--error-500);
}

.icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 46px;
}

.input-icon {
  color: var(--primary-500);
  font-size: 16px;
}

.form-input {
  flex: 1;
  padding: 14px 16px 14px 0;
  border: none;
  font-family: "Inter", sans-serif;
  font-size: 14px;
  background-color: transparent;
  transition: all 0.3s;
  width: 100%;
  color: var(--text-dark);
}

.form-input::placeholder {
  color: var(--text-light);
}

.form-input:focus {
  outline: none;
}

.toggle-password {
  padding: 0 16px;
  color: var(--text-light);
  cursor: pointer;
  height: 100%;
  display: flex;
  align-items: center;
  transition: color 0.2s;
}

.icon-hovered {
  color: var(--primary-500);
}

.error-text {
  color: var(--error-500);
  font-size: 12px;
  margin-top: 6px;
  margin-bottom: 0;
}

.login-button {
  background-color: var(--primary-500);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 14px;
  font-family: "Inter", sans-serif;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 16px;
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
  width: 100%;
  letter-spacing: 0.5px;
}

.login-button:before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
  transition: 0.5s;
}

.login-button:hover:not(:disabled):before {
  left: 100%;
}

.login-button:hover:not(:disabled) {
  background-color: var(--primary-700);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
}

.login-button:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 5px rgba(16, 185, 129, 0.2);
}

.login-button:disabled {
  background-color: var(--text-light);
  cursor: not-allowed;
}

.button-loading {
  opacity: 0.8;
}

/* General Error Container */
.general-error {
  background: #FEF2F2;
  border: 1px solid #FEE2E2;
  border-radius: 12px;
  padding: 14px 16px;
  margin-top: 20px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.error-icon {
  color: var(--error-500);
  font-size: 18px;
  flex-shrink: 0;
}

.general-error-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.general-error span {
  color: var(--error-500);
  font-size: 14px;
  font-weight: 500;
  margin: 0;
}

.error-details {
  color: #F87171;
  font-size: 12px;
  margin: 0;
}

/* Copyright Footer */
.copyright-footer {
  width: 100%;
  max-width: 900px;
  text-align: center;
  padding: 10px 15px;
  z-index: 1;
  position: relative;
}

.copyright-footer p {
  font-family: "Inter", sans-serif;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
}

/* Responsive styles */
@media (max-width: 768px) {
  .login-card {
    flex-direction: column;
    max-width: 450px;
  }
  
  .left-section {
    padding: 30px;
  }
  
  .app-info {
    margin-bottom: 20px;
  }
  
  .illustration-container {
    width: 200px;
    height: 200px;
    margin: 20px auto;
  }
  
  .right-section {
    padding: 30px;
  }
  
  .form-container {
    max-width: 100%;
  }
}

@media (max-width: 576px) {
  .login-card {
    border-radius: 12px;
  }
  
  .left-section, .right-section {
    padding: 24px;
  }
  
  .app-title {
    font-size: 18px;
  }
  
  .app-description {
    font-size: 11px;
  }
  
  .login-title {
    font-size: 22px;
  }
  
  .login-subtitle {
    font-size: 13px;
  }
  
  .form-input {
    padding: 12px 14px 12px 0;
    font-size: 14px;
  }
  
  .login-button {
    font-size: 14px;
    height: 46px;
  }
  
  .illustration-container {
    width: 160px;
    height: 160px;
  }
  
  .decorative-dots {
    bottom: 20px;
  }
}
</style>