<template>
  <div class="profile-container">
    <!-- Header dengan tombol kembali dan judul -->
    <div class="profile-nav-header">
      <div class="title-container">
        <button class="back-button" @click="$router.go(-1)">
          <font-awesome-icon :icon="['fas', 'arrow-left']" />
        </button>
        <h1 class="page-title">Profil Pengguna</h1>
      </div>
    </div>

    <div class="profile-content">
      <div class="profile-card">
        <!-- Profile Picture Section -->
        <div class="profile-picture-section">
          <div class="profile-picture-container">
            <img 
              :src="profilePicture" 
              alt="Foto Profil" 
              class="profile-picture"
            />
            <button class="edit-picture-button" @click="openImageUpload">
              <font-awesome-icon :icon="['fas', 'camera']" />
            </button>
            <input 
              type="file" 
              ref="fileInput" 
              @change="handleImageUpload" 
              accept="image/*" 
              style="display: none;"
            />
          </div>
        </div>

        <!-- Profile Details Section -->
        <div class="profile-details">
          <div class="detail-section">
            <h2>Nama Puskesmas</h2>
            <div class="detail-grid">
              <div class="detail-item">
                <label>Nama Puskesmas</label>
                <div class="input-container">
                  <input 
                    type="text" 
                    v-model="userData.nama_puskesmas" 
                    :disabled="!isEditing"
                    class="profile-input"
                  />
                  <font-awesome-icon 
                    v-if="!isEditing" 
                    :icon="['fas', 'pen']" 
                    class="edit-icon" 
                    @click="startEditing"
                  />
                </div>
              </div>
              <div class="detail-item">
                <label>Username</label>
                <div class="input-container">
                  <input 
                    type="text" 
                    v-model="userData.username" 
                    :disabled="!isEditing"
                    class="profile-input"
                  />
                  <font-awesome-icon 
                    v-if="!isEditing" 
                    :icon="['fas', 'pen']" 
                    class="edit-icon" 
                    @click="startEditing"
                  />
                </div>
              </div>
              <div class="detail-item">
                <label>Peran</label>
                <div class="input-container">
                  <input 
                    type="text" 
                    :value="capitalizedRole" 
                    disabled 
                    class="profile-input disabled"
                  />
                </div>
              </div>
            </div>
          </div>
  
            <!-- Password Section -->
            <div class="detail-section">
              <h2>Pengaturan Password</h2>
              <div class="detail-grid">
                <div class="detail-item" v-if="isChangingPassword">
                  <label>Password Saat Ini</label>
                  <div class="input-container password-container">
                    <input 
                      :type="showCurrentPassword ? 'text' : 'password'" 
                      v-model="passwordData.current_password" 
                      class="profile-input"
                      placeholder="Masukkan password saat ini"
                    />
                    <font-awesome-icon 
                      :icon="['fas', showCurrentPassword ? 'eye-slash' : 'eye']" 
                      class="password-toggle" 
                      @click="toggleCurrentPasswordVisibility"
                    />
                  </div>
                </div>
                <div class="detail-item" v-if="isChangingPassword">
                  <label>Password Baru</label>
                  <div class="input-container password-container">
                    <input 
                      :type="showNewPassword ? 'text' : 'password'" 
                      v-model="passwordData.password" 
                      class="profile-input"
                      placeholder="Masukkan password baru"
                    />
                    <font-awesome-icon 
                      :icon="['fas', showNewPassword ? 'eye-slash' : 'eye']" 
                      class="password-toggle" 
                      @click="toggleNewPasswordVisibility"
                    />
                  </div>
                  <div class="password-strength" v-if="passwordData.password">
                    <div class="strength-meter">
                      <div 
                        class="strength-indicator" 
                        :style="{ width: passwordStrength.percentage + '%', backgroundColor: passwordStrength.color }"
                      ></div>
                    </div>
                    <span class="strength-text" :style="{ color: passwordStrength.color }">
                      {{ passwordStrength.text }}
                    </span>
                  </div>
                </div>
                <div class="detail-item" v-if="isChangingPassword">
                  <label>Konfirmasi Password Baru</label>
                  <div class="input-container password-container">
                    <input 
                      :type="showConfirmPassword ? 'text' : 'password'" 
                      v-model="passwordData.password_confirmation" 
                      class="profile-input"
                      placeholder="Konfirmasi password baru"
                    />
                    <font-awesome-icon 
                      :icon="['fas', showConfirmPassword ? 'eye-slash' : 'eye']" 
                      class="password-toggle" 
                      @click="toggleConfirmPasswordVisibility"
                    />
                  </div>
                  <div class="password-match" v-if="passwordData.password && passwordData.password_confirmation">
                    <span :class="passwordsMatch ? 'match-success' : 'match-error'">
                      <font-awesome-icon :icon="['fas', passwordsMatch ? 'check-circle' : 'times-circle']" />
                      {{ passwordsMatch ? 'Password cocok' : 'Password tidak cocok' }}
                    </span>
                  </div>
                </div>
                <div class="detail-item" v-if="!isChangingPassword">
                  <div class="password-action">
                    <button class="btn-change-password" @click="startChangingPassword">
                      <font-awesome-icon :icon="['fas', 'key']" />
                      Ganti Password
                    </button>
                  </div>
                </div>
              </div>
            </div>
  
            <!-- Action Buttons for Profile -->
            <div class="profile-actions" v-if="isEditing">
              <button 
                class="btn-cancel" 
                @click="cancelEditing"
              >
                Batal
              </button>
              <button 
                class="btn-save" 
                @click="saveProfile"
              >
                Simpan Perubahan
              </button>
            </div>

            <!-- Action Buttons for Password -->
            <div class="profile-actions" v-if="isChangingPassword">
              <button 
                class="btn-cancel" 
                @click="cancelChangingPassword"
              >
                Batal
              </button>
              <button 
                class="btn-save" 
                @click="changePassword"
                :disabled="!canChangePassword"
              >
                Simpan Password Baru
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, onMounted, computed } from 'vue';
  import axios from 'axios';
  import Swal from 'sweetalert2';
  import profileImage from '../../assets/profile.jpg'; // Import default profile image
  
  export default {
    name: 'ProfilePage',
    setup() {
      const userData = ref({
        username: '',
        role: '',
        nama_puskesmas: ''
      });
      const passwordData = ref({
        current_password: '',
        password: '',
        password_confirmation: ''
      });
      const isEditing = ref(false);
      const isChangingPassword = ref(false);
      const fileInput = ref(null);
      const profilePicture = ref(profileImage);
      const isLoading = ref(true);
      const showCurrentPassword = ref(false);
      const showNewPassword = ref(false);
      const showConfirmPassword = ref(false);
  
      // Capitalize first letter of role
      const capitalizedRole = computed(() => {
        if (!userData.value.role) return '';
        return userData.value.role.charAt(0).toUpperCase() + userData.value.role.slice(1);
      });
  
      // Fetch user data from API
      const fetchUserData = async () => {
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            throw new Error('Token tidak ditemukan');
          }
  
          const response = await axios.get('http://localhost:8000/api/users/me', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
  
          const user = response.data.user;
          userData.value = {
            username: user.username || '',
            role: user.role || '',
            nama_puskesmas: user.puskesmas?.name || user.name || ''
          };
        } catch (error) {
          console.error('Gagal mengambil data pengguna:', error);
          Swal.fire({
            icon: 'error',
            title: 'Gagal',
            text: 'Tidak dapat mengambil data pengguna'
          });
        }
      };
  
      // Password strength calculation
      const passwordStrength = computed(() => {
        const password = passwordData.value.password;
        if (!password) return { percentage: 0, color: '#e0e0e0', text: '' };
        
        let strength = 0;
        let feedback = '';
        
        // Length check
        if (password.length >= 8) strength += 33;
        
        // Character variety checks
        if (/[a-z]/.test(password)) strength += 33; // Has lowercase
        if (/[0-9]/.test(password)) strength += 34; // Has number
        
        // Determine color and text based on strength
        let color = '#e53935'; // Red - weak
        if (strength >= 67) {
          color = '#43a047'; // Green - strong
          feedback = 'Kuat';
        } else if (strength >= 33) {
          color = '#ffb300'; // Amber - medium
          feedback = 'Sedang';
        } else {
          feedback = 'Lemah';
        }
        
        return {
          percentage: strength,
          color: color,
          text: feedback
        };
      });
  
      // Check if passwords match
      const passwordsMatch = computed(() => {
        return passwordData.value.password === passwordData.value.password_confirmation && 
               passwordData.value.password !== '';
      });
  
      // Check if can change password
      const canChangePassword = computed(() => {
        return passwordData.value.current_password !== '' && 
               passwordData.value.password !== '' && 
               passwordData.value.password.length >= 8 &&
               /[a-z]/.test(passwordData.value.password) && // Has lowercase
               /[0-9]/.test(passwordData.value.password) && // Has number
               passwordsMatch.value;
      });
  
      // Toggle password visibility
      const toggleCurrentPasswordVisibility = () => {
        showCurrentPassword.value = !showCurrentPassword.value;
      };
  
      const toggleNewPasswordVisibility = () => {
        showNewPassword.value = !showNewPassword.value;
      };
  
      const toggleConfirmPasswordVisibility = () => {
        showConfirmPassword.value = !showConfirmPassword.value;
      };
  
      // Start editing profile
      const startEditing = () => {
        isEditing.value = true;
      };
  
      // Cancel editing
      const cancelEditing = () => {
        isEditing.value = false;
        fetchUserData(); // Reload original data
      };
  
      // Start changing password
      const startChangingPassword = () => {
        isChangingPassword.value = true;
      };
  
      // Cancel changing password
      const cancelChangingPassword = () => {
        isChangingPassword.value = false;
        passwordData.value = {
          current_password: '',
          password: '',
          password_confirmation: ''
        };
      };
  
      // Save profile changes
      const saveProfile = async () => {
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            throw new Error('Token tidak ditemukan');
          }
  
          // Prepare data for update
          const updateData = {
            username: userData.value.username,
            nama_puskesmas: userData.value.nama_puskesmas
          };
          
          const response = await axios.put('http://localhost:8000/api/users/profile', 
            updateData,
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );
  
          Swal.fire({
            icon: 'success',
            title: 'Berhasil',
            text: 'Profil berhasil diperbarui'
          });
  
          isEditing.value = false;
        } catch (error) {
          console.error('Gagal memperbarui profil:', error);
          Swal.fire({
            icon: 'error',
            title: 'Gagal',
            text: 'Tidak dapat memperbarui profil'
          });
        }
      };
  
      // Change password
      const changePassword = async () => {
        try {
          // Validate password
          if (passwordData.value.password.length < 8) {
            Swal.fire({
              icon: 'error',
              title: 'Validasi Gagal',
              text: 'Password harus minimal 8 karakter'
            });
            return;
          }
          
          // Validate password has letters and numbers
          if (!(/[a-z]/.test(passwordData.value.password) && /[0-9]/.test(passwordData.value.password))) {
            Swal.fire({
              icon: 'error',
              title: 'Validasi Gagal',
              text: 'Password harus mengandung huruf dan angka'
            });
            return;
          }
          
          if (passwordData.value.password !== passwordData.value.password_confirmation) {
            Swal.fire({
              icon: 'error',
              title: 'Validasi Gagal',
              text: 'Password dan konfirmasi password tidak cocok'
            });
            return;
          }
          
          const token = localStorage.getItem('token');
          if (!token) {
            throw new Error('Token tidak ditemukan');
          }
  
          const response = await axios.post('http://localhost:8000/api/change-password', 
            {
              current_password: passwordData.value.current_password,
              password: passwordData.value.password,
              password_confirmation: passwordData.value.password_confirmation
            },
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );
  
          Swal.fire({
            icon: 'success',
            title: 'Berhasil',
            text: 'Password berhasil diperbarui'
          });
  
          isChangingPassword.value = false;
          passwordData.value = {
            current_password: '',
            password: '',
            password_confirmation: ''
          };
        } catch (error) {
          console.error('Gagal memperbarui password:', error);
          let errorMessage = 'Tidak dapat memperbarui password';
          
          // Check for specific error responses
          if (error.response && error.response.data && error.response.data.message) {
            errorMessage = error.response.data.message;
          }
          
          Swal.fire({
            icon: 'error',
            title: 'Gagal',
            text: errorMessage
          });
        }
      };
  
      // Open image upload dialog
      const openImageUpload = () => {
        fileInput.value.click();
      };
  
      // Handle image upload
      const handleImageUpload = async (event) => {
        const file = event.target.files[0];
        if (file) {
          try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('profile_picture', file);
  
            const response = await axios.post('http://localhost:8000/api/users/profile-picture', 
              formData, 
              {
                headers: {
                  'Content-Type': 'multipart/form-data',
                  Authorization: `Bearer ${token}`
                }
              }
            );
  
            // Update profile picture
            profilePicture.value = URL.createObjectURL(file);
  
            Swal.fire({
              icon: 'success',
              title: 'Berhasil',
              text: 'Foto profil berhasil diperbarui'
            });
          } catch (error) {
            console.error('Gagal mengunggah foto profil:', error);
            Swal.fire({
              icon: 'error',
              title: 'Gagal',
              text: 'Tidak dapat mengunggah foto profil'
            });
          }
        }
      };
  
      // Fetch user data when component is mounted
      onMounted(fetchUserData);
  
      return {
        userData,
        passwordData,
        isEditing,
        isChangingPassword,
        profilePicture,
        fileInput,
        showCurrentPassword,
        showNewPassword,
        showConfirmPassword,
        passwordStrength,
        passwordsMatch,
        canChangePassword,
        capitalizedRole,
        startEditing,
        cancelEditing,
        saveProfile,
        startChangingPassword,
        cancelChangingPassword,
        changePassword,
        openImageUpload,
        handleImageUpload,
        toggleCurrentPasswordVisibility,
        toggleNewPasswordVisibility,
        toggleConfirmPasswordVisibility
      };
    }
  };
  </script>
  
  <style scoped>
  .profile-container {
    background-color: #f7f8f9;
    min-height: 100vh;
    padding: 30px;
  }
  
  .profile-content {
    display: flex;
    justify-content: center;
  }
  
  .profile-nav-header {
    margin-bottom: 30px;
    padding-bottom: 15px;
    border-bottom: 1px solid #eaeaea;
  }

  .title-container {
    display: flex;
    align-items: center;
    gap: 15px;
  }

  .page-title {
    font-family: 'Inter', sans-serif;
    font-weight: 500;
    font-size: 26px;
    line-height: 31px;
    color: #232859;
    margin: 0;
  }

  .back-button {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: none;
    background-color: var(--primary-500, #097678);
    color: white;
    font-size: 16px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(9, 118, 120, 0.3);
  }

  .back-button:hover {
    background-color: var(--primary-700, #054a47);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(9, 118, 120, 0.4);
  }

  .profile-card {
    background: #ffffff;
    border-radius: 16px;
    box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.08);
    width: 100%;
    max-width: 1000px;
    display: flex;
    padding: 40px;
    transition: all 0.3s ease;
  }
  
  .profile-picture-section {
    flex: 0 0 300px;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-right: 40px;
    border-right: 1px solid #eaeaea;
  }
  
  .profile-picture-container {
    position: relative;
    width: 220px;
    height: 220px;
    margin-bottom: 20px;
  }
  
  .profile-picture {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    border: 4px solid #ffffff;
    transition: all 0.3s ease;
  }
  
  .user-role {
    background-color: var(--primary-500, #10b981);
    color: white;
    padding: 8px 20px;
    border-radius: 20px;
    font-weight: 600;
    font-size: 14px;
    margin-top: 10px;
    box-shadow: 0 2px 10px rgba(16, 185, 129, 0.2);
  }
  
  .edit-picture-button {
    position: absolute;
    bottom: 10px;
    right: 10px;
    background-color: var(--primary-500, #10b981);
    color: white;
    border: none;
    width: 45px;
    height: 45px;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }
  
  .edit-picture-button:hover {
    background-color: var(--primary-700, #047857);
    transform: scale(1.05);
  }
  
  .profile-details {
    flex: 1;
    padding-left: 40px;
  }
  
  .detail-section {
    margin-bottom: 35px;
    animation: fadeIn 0.5s ease;
  }
  
  .detail-section h2 {
    font-family: 'Inter', sans-serif;
    font-weight: 600;
    font-size: 20px;
    color: #333333;
    margin-bottom: 25px;
    border-bottom: 2px solid #eaeaea;
    padding-bottom: 12px;
    position: relative;
  }
  
  .detail-section h2::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 60px;
    height: 2px;
    background-color: var(--primary-500, #10b981);
  }
  
  .password-section h2::after {
    background-color: #ffb300;
  }
  
  .detail-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 25px;
  }
  
  .detail-item {
    display: flex;
    flex-direction: column;
  }
  
  .detail-item label {
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    color: #6e6e6e;
    margin-bottom: 10px;
    font-weight: 500;
  }
  
  .input-container {
    position: relative;
  }
  
  .profile-input {
    width: 100%;
    padding: 12px 15px;
    border: 1px solid #e0e0e0;
    border-radius: 10px;
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    color: #333333;
    transition: all 0.3s ease;
    background-color: #ffffff;
  }
  
  .profile-input:disabled {
    background-color: #f9f9f9;
    cursor: not-allowed;
  }
  
  .profile-input.disabled {
    color: #9aa0a8;
  }
  
  .profile-input:focus {
    outline: none;
    border-color: var(--primary-500, #10b981);
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
  }
  
  .edit-icon {
    position: absolute;
    right: 15px;
    top: 50%;
    transform: translateY(-50%);
    color: #9aa0a8;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .edit-icon:hover {
    color: var(--primary-500, #10b981);
    transform: translateY(-50%) scale(1.1);
  }
  
  .password-toggle {
    position: absolute;
    right: 15px;
    top: 50%;
    transform: translateY(-50%);
    color: #9aa0a8;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .password-toggle:hover {
    color: var(--primary-500, #10b981);
    transform: translateY(-50%) scale(1.1);
  }
  
  .password-strength {
    margin-top: 10px;
  }
  
  .strength-meter {
    height: 5px;
    background-color: #e0e0e0;
    border-radius: 3px;
    margin-bottom: 6px;
    overflow: hidden;
  }
  
  .strength-indicator {
    height: 100%;
    border-radius: 3px;
    transition: width 0.3s ease, background-color 0.3s ease;
  }
  
  .strength-text {
    font-size: 12px;
    font-weight: 600;
    display: flex;
    align-items: center;
  }
  
  .password-match {
    margin-top: 10px;
  }
  
  .match-success {
    color: #43a047;
    font-size: 12px;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 5px;
  }
  
  .match-error {
    color: #e53935;
    font-size: 12px;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 5px;
  }
  
  .password-action {
    margin-top: 10px;
  }
  
  .btn-change-password {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 20px;
    background-color: #f3f4f6;
    color: #333333;
    border: 1px solid #eaeaea;
    border-radius: 10px;
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  }
  
  .btn-change-password:hover {
    background-color: #e5e7eb;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  
  .profile-actions {
    display: flex;
    justify-content: flex-end;
    gap: 15px;
    margin-top: 30px;
  }
  
  .btn-cancel,
  .btn-save {
    padding: 12px 25px;
    border-radius: 10px;
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  }
  
  .btn-cancel {
    background-color: #f3f4f6;
    color: #333333;
    border: 1px solid #eaeaea;
  }
  
  .btn-cancel:hover {
    background-color: #e5e7eb;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  .btn-save {
    background-color: var(--primary-500, #10b981);
    color: white;
    border: none;
  }
  
  .btn-save:hover {
    background-color: var(--primary-700, #047857);
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(16, 185, 129, 0.3);
  }
  
  .btn-save:disabled {
    background-color: #c5c5c5;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @media (max-width: 900px) {
    .profile-card {
      flex-direction: column;
      padding: 30px;
    }
  
    .profile-picture-section {
      border-right: none;
      border-bottom: 1px solid #eaeaea;
      padding-right: 0;
      padding-bottom: 30px;
      margin-bottom: 30px;
      width: 100%;
    }
  
    .profile-details {
      padding-left: 0;
    }
  }
  
  @media (max-width: 768px) {
    .detail-grid {
      grid-template-columns: 1fr;
    }
  
    .profile-container {
      padding: 20px;
    }
  }
  
  @media (max-width: 480px) {
    .profile-card {
      padding: 20px;
    }
  
    .profile-picture-container {
      width: 180px;
      height: 180px;
    }
  
    .btn-cancel, .btn-save {
      padding: 10px 15px;
      font-size: 13px;
    }
  }
  </style>