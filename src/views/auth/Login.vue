<template>
  <div class="login-container">
    <div class="login-card">
      <!-- Left Section - Logo & Brand Image -->
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
        <div class="image-placeholder">
          <img :src="brandImage" alt="Brand Image" class="brand-image" />
        </div>
      </div>

      <!-- Right Section - Login Form -->
      <div class="right-section">
        <div class="form-container">
          <h2 class="login-title">Login</h2>

          <!-- Username Input -->
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

          <!-- Password Input -->
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

          <!-- Login Button -->
          <button
            class="login-button"
            @click="handleLogin"
            :disabled="isLoading"
            :class="{ 'button-loading': isLoading }"
          >
            <span v-if="!isLoading">LOGIN</span>
            <font-awesome-icon v-else :icon="['fas', 'circle-notch']" spin class="fa-spin" />
          </button>

          <!-- General Error Message -->
          <div v-if="errors.general || errors.details" class="general-error">
            <font-awesome-icon :icon="['fas', 'exclamation-circle']" class="error-icon" />
            <div class="general-error-content">
              <span>{{ errors.general }}</span> <!-- Pesan umum -->
              <p v-if="errors.details" class="error-details">{{ errors.details }}</p> <!-- Pesan detail -->
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Footer -->
    <div class="copyright-footer">
      <p>Copyright © {{ currentYear }} Dinas Kesehatan. Hak Cipta Dilindungi</p>
    </div>
  </div>
</template>

<script>
import brandImage from '../../assets/ptm.jpg';
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { authService } from '../../stores/auth.js'; // Import auth service
import Swal from 'sweetalert2';
import { nextTick } from 'vue';

export default {
  name: 'Login',
  data() {
    return {
      brandImage,
    };
  },
  setup() {
    const router = useRouter();  
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
    const authCheckInProgress = ref(false);

    // Cek jika user sudah login saat komponen ini dimuat
    onMounted(async () => {
      // Guard untuk mencegah panggilan duplikat
      if (authCheckInProgress.value) return;
      authCheckInProgress.value = true;

      try {
        // Cek jika user sudah login (berdasarkan localStorage)
        if (localStorage.getItem('isLoggedIn') === 'true') {
          // Verifikasi session dengan server (hanya sekali)
          const isAuthenticated = await authStore.checkAuth();
          
          if (isAuthenticated) {
            // Redirect ke dashboard sesuai peran
            const userRole = authStore.user?.role || localStorage.getItem('userRole');
            router.replace(userRole === 'admin' ? '/admin/dashboard' : '/user/dashboard');
          } else {
            // Jika session tidak valid, hapus data auth
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('userRole');
            localStorage.removeItem('user');
            localStorage.removeItem('isAdmin');
          }
        }
      } catch (error) {
        console.error('Error checking authentication status:', error);
      } finally {
        authCheckInProgress.value = false;
      }
    });

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
      resetErrors();
      
      try {
        // Call the login method from auth service
        await authService.login(credentials.value.username, credentials.value.password);

        // Show success notification
        Swal.fire({
          title: 'Berhasil!',
          text: 'Anda telah berhasil login.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
          didClose: () => {
            // Lakukan redirect setelah notifikasi hilang
            if (isAdmin) {
              console.log('Redirecting to /admin/dashboard');
              router.replace('/admin/dashboard');
            } else {
              console.log('Redirecting to /user/dashboard');
              router.replace('/user/dashboard');
            }
          }
        });

        // Redirect based on user role
        const isAdmin = authService.isAdmin();
        if (isAdmin) {
          router.push('/admin/dashboard'); // Admin dashboard
        } else {
          router.push('/user/dashboard'); // User dashboard
        }

      } catch (error) {
        console.error('Login error:', error);
        
        // Handle login errors
        resetErrors();

        try {
          const errorData = JSON.parse(error.message);
          if (errorData.message) {
            errors.value.general = errorData.message;
          }
          if (errorData.errors) {
            errors.value.details = errorData.errors;
          }
        } catch (parseError) {
          errors.value.general = 'Terjadi kesalahan saat login. Silakan coba lagi.';
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
/* Gunakan style yang sama dengan LoginPageTemplate.vue */
/* Root Variables (matching DiabetesMellitus style) */
:root {
  --primary-100: #e6f2f2;
  --primary-300: #66b2b2;
  --primary-500: #097678;
  --primary-700: #054a47;
  --secondary-100: #e6f7f7;
  --secondary-300: #b3e6e6;
}
/* Root Styles */
.login-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #097678 0%, #054a47 100%);
  padding: 20px;
  position: relative;
  overflow: hidden;
  font-family: "Inter", sans-serif;
}
.login-container::before {
  content: '';
  position: absolute;
  top: -50px;
  left: -50px;
  right: -50px;
  bottom: -50px;
  background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><circle cx="50" cy="50" r="1" fill="rgba(255,255,255,0.1)"/></svg>') repeat;
  animation: backgroundFade 20s infinite linear;
  z-index: 0;
}
@keyframes backgroundFade {
  0% { transform: translateY(0); }
  100% { transform: translateY(100px); }
}
.login-card {
  background: white;
  border-radius: 10px;
  box-shadow: 0px 4px 16px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 900px;
  display: flex;
  position: relative;
  z-index: 1;
  opacity: 1;
  transform: translateY(20px);
  transition: all 0.6s ease;
  overflow: hidden;
  margin-bottom: 30px;
}
.login-card.visible {
  opacity: 1;
  transform: translateY(0);
}
.login-card.success {
  transform: scale(1.05);
  opacity: 0;
  transition: all 0.5s ease;
}
.login-card.shake {
  animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}
@keyframes shake {
  10%, 90% { transform: translateX(-1px); }
  20%, 80% { transform: translateX(2px); }
  30%, 50%, 70% { transform: translateX(-4px); }
  40%, 60% { transform: translateX(4px); }
}
/* Left Section */
.left-section {
  flex: 1;
  padding: 30px;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #eaeaea;
  position: relative;
}
/* Right Section */
.right-section {
  flex: 1;
  padding: 30px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
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
  animation: fadeIn 1s ease;
}
.app-text {
  margin-left: 12px;
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
.logo-container {
  width: 45px;
  height: 45px;
  border: 2px solid #cdcfd4;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f9f9f9;
  flex-shrink: 0;
}
.logo-circle {
  width: 90%;
  height: 90%;
  border-radius: 50%;
  background: var(--primary-500);
}
.app-title {
  font-family: "Inter", sans-serif;
  font-size: 18px;
  font-weight: 700;
  color: #333333;
  margin: 0 0 4px;
}
.app-description {
  font-family: "Inter", sans-serif;
  font-size: 11px;
  color: #4f5867;
  margin: 0;
  max-width: 280px;
}
/* Placeholder Image */
.image-placeholder {
  width: 250px;
  height: 250px;
  margin: 0px auto;
  border-radius: 10px;
  overflow: hidden; /* Pastikan gambar tetap dalam batas placeholder */
}

.brand-image {
  width: 100%;
  height: 100%;
  object-fit: cover; /* Gambar akan menyesuaikan ukuran tanpa distorsi */
}
/* Login Form Section */
.login-title {
  font-family: "Inter", sans-serif;
  font-size: 22px;
  font-weight: 600;
  color: var(--primary-500);
  margin-bottom: 25px;
  text-align: center;
  animation: slideUp 0.8s ease;
}
@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
.form-group {
  margin-bottom: 20px;
  position: relative;
  animation: slideUp 0.8s ease;
  animation-fill-mode: backwards;
}
.form-group:nth-child(2) {
  animation-delay: 0.1s;
}
.form-group:nth-child(3) {
  animation-delay: 0.2s;
}
.input-with-icon {
  position: relative;
  display: flex;
  align-items: center;
  background-color: #f3f4f6;
  border-radius: 10px;
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid #cdcfd4;
}
.input-with-icon.input-active {
  box-shadow: 0 0 0 2px rgba(9, 118, 120, 0.3);
  background-color: #f8f9fa;
  border-color: var(--primary-500);
}
.input-with-icon.input-error {
  border: 1px solid #ff6b6b;
}
.icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
}
.input-icon {
  color: var(--primary-500);
  font-size: 14px;
}
.form-input {
  flex: 1;
  padding: 12px 16px;
  border: none;
  font-family: "Inter", sans-serif;
  font-size: 14px;
  background-color: transparent;
  transition: all 0.3s;
  width: 100%;
  color: #4f5867;
}
.form-input:focus {
  outline: none;
}
.toggle-password {
  padding: 0 15px;
  color: #9aa0a8;
  cursor: pointer;
  height: 100%;
  display: flex;
  align-items: center;
}
.icon-hovered {
  color: var(--primary-500);
}
.error-text {
  color: #ff6b6b;
  font-size: 12px;
  margin-top: 5px;
  margin-bottom: 0;
  animation: fadeIn 0.3s;
}
.error-details {
  color: #ff6b6b;
  font-size: 12px;
  margin-top: 4px;
}
.login-button {
  background-color: var(--primary-500);
  color: white;
  border: none;
  border-radius: 10px;
  padding: 12px;
  font-family: "Inter", sans-serif;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 10px;
  height: 48px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
  animation: slideUp 0.8s ease;
  animation-delay: 0.3s;
  animation-fill-mode: backwards;
  width: 100%;
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
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}
.login-button:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}
.login-button:disabled {
  background-color: #9aa0a8;
  cursor: not-allowed;
}
.button-loading {
  opacity: 0.8;
}
/* General Error Container */
.general-error {
  background: #fff5f5; /* Latar belakang merah muda pucat */
  border: 1px solid #ffe3e3; /* Border merah muda */
  border-radius: 8px; /* Sudut melengkung */
  padding: 12px 16px; /* Padding untuk konten */
  margin-top: 15px; /* Jarak dari elemen sebelumnya */
  display: flex;
  align-items: flex-start;
  gap: 10px; /* Jarak antara ikon dan teks */
  animation: fadeIn 0.3s ease-in-out; /* Efek fade-in */
}

/* Ikon Error */
.error-icon {
  color: #e03131; /* Warna merah untuk ikon */
  font-size: 20px; /* Ukuran ikon */
  flex-shrink: 0;
}

/* Konten Error */
.general-error-content {
  display: flex;
  flex-direction: column;
  gap: 4px; /* Jarak antara teks umum dan detail */
}

/* Pesan Error Umum */
.general-error span {
  color: #e03131; /* Warna merah untuk teks */
  font-size: 14px; /* Ukuran teks */
  font-weight: 500; /* Sedikit tebal */
  margin: 0;
}

/* Pesan Error Detail */
.error-details {
  color: #ff6b6b; /* Warna merah muda untuk detail */
  font-size: 12px; /* Ukuran teks lebih kecil */
  margin: 0;
}
/* Copyright Footer - Outside container */
.copyright-footer {
  width: 100%; /* Lebar footer mengikuti konten */
  max-width: 900px; /* Sama dengan max-width login-card */
  text-align: right; /* Teks footer rata kanan */
  padding: 5px 15px 10px;
  z-index: 1;
  position: relative;
  animation: fadeIn 1s ease;
  animation-delay: 0.5s;
  animation-fill-mode: backwards;
  margin-top: -15px; /* Sesuaikan jarak dari card */
}
.copyright-footer p {
  font-family: "Inter", sans-serif;
  font-size: 11px;
  color: #eaeaea;
  margin: 0;
}
/* Responsive styles */
@media (max-width: 768px) {
  .login-card {
    flex-direction: column;
    max-width: 450px;
  }
  .left-section {
    border-right: none;
    border-bottom: 1px solid #eaeaea;
    padding: 20px;
  }
  .app-info {
    margin-bottom: 0;
  }
  .image-placeholder {
    display: none;
  }
  .right-section {
    padding: 30px 20px;
  }
  .form-container {
    max-width: 100%;
  }
  .copyright-footer {
    max-width: 100%;
    text-align: center;
    padding: 10px;
  }
}
@media (max-width: 576px) {
  .login-card {
    padding: 0;
  }
  .left-section, .right-section {
    padding: 15px;
  }
  .app-title {
    font-size: 16px;
  }
  .app-description {
    font-size: 10px;
  }
  .login-title {
    font-size: 18px;
    margin-bottom: 20px;
  }
  .form-input {
    padding: 10px;
    font-size: 13px;
  }
  .login-button {
    font-size: 14px;
    height: 44px;
  }
}
</style>