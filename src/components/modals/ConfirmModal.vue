<template>
    <div class="modal-overlay" @click.self="cancel">
      <div class="modal-container">
        <!-- Header Modal -->
        <div class="modal-header">
          <h2 class="modal-title">{{ title }}</h2>
          <button class="close-button" @click="cancel">
            <font-awesome-icon :icon="['fas', 'times']" />
          </button>
        </div>
  
        <!-- Body Modal -->
        <div class="modal-body">
          <div class="warning-icon">
            <font-awesome-icon :icon="['fas', 'exclamation-triangle']" />
          </div>
          <p class="confirm-message">{{ message }}</p>
        </div>
  
        <!-- Footer Modal -->
        <div class="modal-footer">
          <button class="cancel-button" @click="cancel">Batal</button>
          <button class="confirm-button" @click="confirm">Ya, Hapus</button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: "ConfirmModal",
    props: {
      title: {
        type: String,
        default: "Konfirmasi"
      },
      message: {
        type: String,
        default: "Apakah Anda yakin ingin melanjutkan?"
      }
    },
    methods: {
      confirm() {
        this.$emit('confirm');
      },
      cancel() {
        this.$emit('cancel');
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
    max-width: 400px;
    width: 100%;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    animation: modalAppear 0.3s ease-out forwards;
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
    font-size: 18px;
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
    text-align: center;
  }
  
  .warning-icon {
    font-size: 48px;
    color: #f59e0b;
    margin-bottom: 16px;
  }
  
  .confirm-message {
    font-family: "Inter", sans-serif;
    font-size: 16px;
    color: #4b5563;
    margin: 0;
    line-height: 1.5;
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
  .confirm-button {
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
  
  .confirm-button {
    background-color: #ef4444;
    color: #ffffff;
    border: none;
  }
  
  .confirm-button:hover {
    background-color: #dc2626;
  }
  
  @media (max-width: 640px) {
    .modal-container {
      width: calc(100% - 32px);
      margin: 0 16px;
    }
  }
  </style>