<template>
  <div class="loading-page">
    <div class="loading-container">
      <div class="logo-container">
        <img src="../assets/ptm-icon.jpg" alt="Logo" class="logo" />
      </div>
      <h1 class="loading-title">Dinas Kesehatan</h1>
      <p class="loading-subtitle">Sistem Informasi Pemantauan PTM</p>
      
      <div class="loading-animation">
        <div class="circle"></div>
        <div class="circle"></div>
        <div class="circle"></div>
        <div class="circle"></div>
        <div class="circle"></div>
      </div>
      
      <p class="loading-text">{{ loadingText }}</p>
      <div class="progress-bar">
        <div class="progress" :style="{ width: `${progress}%` }"></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LoadingPage',
  props: {
    // Tambahkan prop untuk mengontrol status API
    apiStatus: {
      type: String,
      default: 'idle', // idle, loading, success, error
    }
  },
  data() {
    return {
      progress: 0,
      loadingText: 'Mempersiapkan data...',
      loadingTexts: [
        'Mempersiapkan data...',
        'Mengambil statistik terbaru...',
        'Memuat dashboard...',
        'Hampir selesai...'
      ],
      interval: null,
      animationComplete: false
    };
  },
  watch: {
    // Pantau perubahan status API
    apiStatus(newStatus) {
      if (newStatus === 'success' && this.animationComplete) {
        // Jika API berhasil dan animasi loading sudah selesai, beri tahu parent
        this.$emit('loading-complete');
      } else if (newStatus === 'error') {
        // Jika API error, tampilkan pesan error
        this.loadingText = 'Terjadi kesalahan saat memuat data...';
        // Tetap tampilkan loading page, tapi beri tahu user ada error
        setTimeout(() => {
          this.$emit('loading-error');
        }, 1500);
      }
    },
    animationComplete(newValue) {
      if (newValue && this.apiStatus === 'success') {
        // Jika animasi selesai dan API berhasil, beri tahu parent
        this.$emit('loading-complete');
      }
    }
  },
  mounted() {
    this.startLoading();
  },
  beforeUnmount() {
    clearInterval(this.interval);
  },
  methods: {
    startLoading() {
      let textIndex = 0;
      this.interval = setInterval(() => {
        if (this.progress < 100) {
          // Jika API masih loading dan progress sudah hampir 100%, perlambat progressnya
          if (this.apiStatus === 'loading' && this.progress > 85) {
            this.progress += 0.5; // Perlambat progress
          } else {
            this.progress += Math.floor(Math.random() * 8) + 1;
          }
          
          if (this.progress > 100) this.progress = 100;
          
          // Ubah teks loading berdasarkan progress
          if (this.progress > 25 && textIndex === 0) {
            this.loadingText = this.loadingTexts[1];
            textIndex = 1;
          } else if (this.progress > 50 && textIndex === 1) {
            this.loadingText = this.loadingTexts[2];
            textIndex = 2;
          } else if (this.progress > 75 && textIndex === 2) {
            this.loadingText = this.loadingTexts[3];
            textIndex = 3;
          }
          
          if (this.progress === 100) {
            clearInterval(this.interval);
            this.animationComplete = true;
          }
        }
      }, 200);
    }
  }
};
</script>

<style scoped>
.loading-page {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.loading-container {
  background-color: white;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  padding: 40px;
  text-align: center;
  max-width: 500px;
  width: 90%;
}

.logo-container {
  margin-bottom: 20px;
}

.logo {
  width: 100px;
  height: 100px;
  object-fit: contain;
  border-radius: 50%;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.loading-title {
  font-family: 'Inter', sans-serif;
  font-size: 28px;
  font-weight: 700;
  color: #10b981;
  margin: 0 0 5px 0;
}

.loading-subtitle {
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  color: #4b5563;
  margin: 0 0 30px 0;
}

.loading-animation {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 20px;
}

.circle {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #10b981;
  animation: bounce 1.4s infinite ease-in-out both;
}

.circle:nth-child(1) { animation-delay: -0.32s; }
.circle:nth-child(2) { animation-delay: -0.24s; }
.circle:nth-child(3) { animation-delay: -0.16s; }
.circle:nth-child(4) { animation-delay: -0.08s; }
.circle:nth-child(5) { animation-delay: 0s; }

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

.loading-text {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 15px;
  min-height: 20px;
}

.progress-bar {
  height: 8px;
  background-color: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 10px;
}

.progress {
  height: 100%;
  background: linear-gradient(90deg, #10b981, #3b82f6);
  border-radius: 4px;
  transition: width 0.3s ease;
}
</style>