
<template>
    <div class="profile-container">
      <div class="profile-header">
        <h1 class="page-title">Profil Pengguna</h1>
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
              <h2>Informasi Pribadi</h2>
              <div class="detail-grid">
                <div class="detail-item">
                  <label>Nama Lengkap</label>
                  <div class="input-container">
                    <input 
                      type="text" 
                      v-model="userData.name" 
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
                  <label>Email</label>
                  <div class="input-container">
                    <input 
                      type="email" 
                      v-model="userData.email" 
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
                      :value="userData.role" 
                      disabled 
                      class="profile-input disabled"
                    />
                  </div>
                </div>
              </div>
            </div>
  
            <!-- Puskesmas Details Section -->
            <div class="detail-section">
              <h2>Informasi Puskesmas</h2>
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
                  <label>Alamat Puskesmas</label>
                  <div class="input-container">
                    <input 
                      type="text" 
                      v-model="userData.alamat_puskesmas" 
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
              </div>
            </div>
  
            <!-- Action Buttons -->
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
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, onMounted } from 'vue';
  import axios from 'axios';
  import Swal from 'sweetalert2';
  import profileImage from '../../assets/profile.jpg'; // Import default profile image
  
  export default {
    name: 'ProfilePage',
    setup() {
      const userData = ref({
        name: '',
        username: '',
        email: '',
        role: '',
        nama_puskesmas: '',
        alamat_puskesmas: ''
      });
      const isEditing = ref(false);
      const fileInput = ref(null);
      const profilePicture = ref(profileImage);
      const isLoading = ref(true);
  
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
            name: user.name || '',
            username: user.username || '',
            email: user.email || '',
            role: user.role || '',
            nama_puskesmas: user.nama_puskesmas || '',
            alamat_puskesmas: user.alamat_puskesmas || ''
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
  
      // Start editing profile
      const startEditing = () => {
        isEditing.value = true;
      };
  
      // Cancel editing
      const cancelEditing = () => {
        isEditing.value = false;
        fetchUserData(); // Reload original data
      };
  
      // Save profile changes
      const saveProfile = async () => {
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            throw new Error('Token tidak ditemukan');
          }
  
          const response = await axios.put('http://localhost:8000/api/users/profile', 
            {
              name: userData.value.name,
              username: userData.value.username,
              email: userData.value.email,
              nama_puskesmas: userData.value.nama_puskesmas,
              alamat_puskesmas: userData.value.alamat_puskesmas
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
        isEditing,
        profilePicture,
        fileInput,
        startEditing,
        cancelEditing,
        saveProfile,
        openImageUpload,
        handleImageUpload
      };
    }
  };
  </script>
  
  <style scoped>
  .profile-container {
    background-color: #f7f8f9;
    min-height: 100vh;
    padding: 20px;
  }
  
  .profile-header {
    margin-bottom: 20px;
  }
  
  .page-title {
    font-family: 'Inter', sans-serif;
    font-weight: 600;
    font-size: 26px;
    color: #232859;
  }
  
  .profile-content {
    display: flex;
    justify-content: center;
  }
  
  .profile-card {
    background: #ffffff;
    border-radius: 10px;
    box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.05);
    width: 100%;
    max-width: 1000px;
    display: flex;
    padding: 30px;
  }
  
  .profile-picture-section {
    flex: 0 0 300px;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding-right: 30px;
    border-right: 1px solid #eaeaea;
  }
  
  .profile-picture-container {
    position: relative;
    width: 200px;
    height: 200px;
  }
  
  .profile-picture {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
  }
  
  .edit-picture-button {
    position: absolute;
    bottom: 10px;
    right: 10px;
    background-color: var(--primary-500, #10b981);
    color: white;
    border: none;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }
  
  .edit-picture-button:hover {
    background-color: var(--primary-700, #047857);
  }
  
  .profile-details {
    flex: 1;
    padding-left: 30px;
  }
  
  .detail-section {
    margin-bottom: 30px;
  }
  
  .detail-section h2 {
    font-family: 'Inter', sans-serif;
    font-weight: 600;
    font-size: 18px;
    color: #333333;
    margin-bottom: 20px;
    border-bottom: 1px solid #eaeaea;
    padding-bottom: 10px;
  }
  
  .detail-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }
  
  .detail-item {
    display: flex;
    flex-direction: column;
  }
  
  .detail-item label {
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    color: #6e6e6e;
    margin-bottom: 8px;
  }
  
  .input-container {
    position: relative;
  }
  
  .profile-input {
    width: 100%;
    padding: 10px;
    border: 1px solid #eaeaea;
    border-radius: 8px;
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    color: #333333;
    transition: border-color 0.3s ease;
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
  }
  
  .edit-icon {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    color: #9aa0a8;
    cursor: pointer;
    transition: color 0.3s ease;
  }
  
  .edit-icon:hover {
    color: var(--primary-500, #10b981);
  }
  
  .profile-actions {
    display: flex;
    justify-content: flex-end;
    gap: 15px;
    margin-top: 20px;
  }
  
  .btn-cancel,
  .btn-save {
    padding: 10px 20px;
    border-radius: 8px;
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .btn-cancel {
    background-color: #f3f4f6;
    color: #333333;
    border: 1px solid #eaeaea;
  }
  
  .btn-cancel:hover {
    background-color: #e5e7eb;
  }
  
  .btn-save {
    background-color: var(--primary-500, #10b981);
    color: white;
    border: none;
  }
  
  .btn-save:hover {
    background-color: var(--primary-700, #047857);
  }
  
  @media (max-width: 768px) {
  .profile-card {
    flex-direction: column;
    align-items: center;
  }

  .profile-picture-section {
    border-right: none;
    border-bottom: 1px solid #eaeaea;
    padding-right: 0;
    padding-bottom: 20px;
    margin-bottom: 20px;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>