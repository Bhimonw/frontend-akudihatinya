<template>
    <div class="modal-overlay" @click.self="closeModal">
      <div class="modal-container">
        <!-- Header Modal -->
        <div class="modal-header">
          <h2 class="modal-title">Detail Pengguna</h2>
          <button class="close-button" @click="closeModal">
            <font-awesome-icon :icon="['fas', 'times']" />
          </button>
        </div>
  
        <!-- Body Modal -->
        <div class="modal-body">
          <div class="user-profile">
            <!-- Avatar dan Nama -->
            <div class="user-avatar-container">
              <div class="user-avatar">
                <font-awesome-icon :icon="['fas', 'user']" />
              </div>
              <div class="user-name-container">
                <h3 class="user-name">{{ user.name }}</h3>
                <span class="role-badge" :class="getRoleBadgeClass(user.role)">
                  {{ user.role }}
                </span>
              </div>
            </div>
  
            <!-- Informasi Detail -->
            <div class="user-details">
              <div class="detail-section">
                <h4 class="section-title">Informasi Akun</h4>
                <div class="detail-grid">
                  <div class="detail-item">
                    <div class="detail-label">
                      <font-awesome-icon :icon="['fas', 'user']" />
                      <span>Username</span>
                    </div>
                    <div class="detail-value">{{ user.username }}</div>
                  </div>
                  
                  <div class="detail-item">
                    <div class="detail-label">
                      <font-awesome-icon :icon="['fas', 'envelope']" />
                      <span>Email</span>
                    </div>
                    <div class="detail-value">{{ user.email || '-' }}</div>
                  </div>
                  
                  <div class="detail-item">
                    <div class="detail-label">
                      <font-awesome-icon :icon="['fas', 'phone']" />
                      <span>Telepon</span>
                    </div>
                    <div class="detail-value">{{ user.phone || '-' }}</div>
                  </div>
                  
                  <div class="detail-item">
                    <div class="detail-label">
                      <font-awesome-icon :icon="['fas', 'map-marker-alt']" />
                      <span>Alamat</span>
                    </div>
                    <div class="detail-value">{{ user.address }}</div>
                  </div>
                </div>
              </div>
  
              <div class="detail-section">
                <h4 class="section-title">Informasi Tambahan</h4>
                <div class="detail-grid">
                  <div class="detail-item">
                    <div class="detail-label">
                      <font-awesome-icon :icon="['fas', 'bullseye']" />
                      <span>Sasaran</span>
                    </div>
                    <div class="detail-value">{{ user.target || '-' }}</div>
                  </div>
                  
                  <div class="detail-item">
                    <div class="detail-label">
                      <font-awesome-icon :icon="['fas', 'calendar-plus']" />
                      <span>Tanggal Dibuat</span>
                    </div>
                    <div class="detail-value">{{ formatDate(user.createdAt) }}</div>
                  </div>
                  
                  <div class="detail-item">
                    <div class="detail-label">
                      <font-awesome-icon :icon="['fas', 'clock']" />
                      <span>Login Terakhir</span>
                    </div>
                    <div class="detail-value">{{ formatDate(user.lastLogin) }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
  
        <!-- Footer Modal -->
        <div class="modal-footer">
          <button class="edit-button" @click="editUser">
            <font-awesome-icon :icon="['fas', 'edit']" />
            <span>Edit Pengguna</span>
          </button>
          <button class="close-button-secondary" @click="closeModal">Tutup</button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: "UserDetailModal",
    props: {
      user: {
        type: Object,
        required: true
      }
    },
    methods: {
      closeModal() {
        this.$emit('close');
      },
      editUser() {
        this.$emit('edit', this.user.id);
        this.closeModal();
      },
      getRoleBadgeClass(role) {
        const roleLower = role.toLowerCase();
        if (roleLower === 'admin') return 'role-admin';
        if (roleLower === 'petugas') return 'role-petugas';
        return 'role-user';
      },
      formatDate(dateString) {
        if (!dateString) return '-';
        try {
          const date = new Date(dateString);
          return new Intl.DateTimeFormat('id-ID', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }).format(date);
        } catch (error) {
          return dateString;
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
    border-radius: 12px;
    max-width: 700px;
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
  
  /* User Profile */
  .user-profile {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
  
  /* Avatar dan Nama */
  .user-avatar-container {
    display: flex;
    align-items: center;
    gap: 16px;
    padding-bottom: 20px;
    border-bottom: 1px solid #f3f4f6;
  }
  
  .user-avatar {
    width: 80px;
    height: 80px;
    background-color: #e5e7eb;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32px;
    color: #6b7280;
  }
  
  .user-name-container {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  
  .user-name {
    font-size: 24px;
    font-weight: 600;
    color: #111827;
    margin: 0;
  }
  
  /* Role Badge */
  .role-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 500;
    text-transform: capitalize;
    width: fit-content;
  }
  
  .role-badge.role-admin {
    background-color: #fee2e2;
    color: #dc2626;
  }
  
  .role-badge.role-petugas {
    background-color: #e0f2fe;
    color: #0369a1;
  }
  
  .role-badge.role-user {
    background-color: #f3f4f6;
    color: #4b5563;
  }
  
  /* User Details */
  .user-details {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
  
  .detail-section {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  
  .section-title {
    font-size: 16px;
    font-weight: 600;
    color: #374151;
    margin: 0;
    padding-bottom: 8px;
    border-bottom: 1px solid #f3f4f6;
  }
  
  .detail-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 16px;
  }
  
  .detail-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  
  .detail-label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: #6b7280;
  }
  
  .detail-value {
    font-size: 16px;
    color: #111827;
    font-weight: 500;
  }
  
  /* Modal Footer */
  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding: 20px 24px;
    border-top: 1px solid #e5e7eb;
  }
  
  .edit-button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    background-color: #10b981;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }
  
  .edit-button:hover {
    background-color: #059669;
  }
  
  .close-button-secondary {
    padding: 10px 20px;
    background-color: #f3f4f6;
    color: #4b5563;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .close-button-secondary:hover {
    background-color: #e5e7eb;
  }
  
  /* Responsive Adjustments */
  @media (max-width: 640px) {
    .modal-container {
      width: calc(100% - 32px);
      margin: 0 16px;
    }
    
    .user-avatar-container {
      flex-direction: column;
      align-items: center;
      text-align: center;
    }
    
    .detail-grid {
      grid-template-columns: 1fr;
    }
  }
  </style>