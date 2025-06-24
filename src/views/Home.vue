<template>
  <div>
    <div class="home-container">
      <nav class="navbar">
        <div class="nav-logo">
          <div class="logo-circle"></div>
          <div class="nav-title">akudihatinya</div>
        </div>
        <button class="login-nav-button" @click="navigateToLogin">Login</button>
      </nav>

      <div class="hero-container">
        <div class="hero-content">
          <h1 class="hero-title">akudihatinya</h1>
          <p class="hero-subtitle">Aplikasi Kesehatan untuk Diabetes Mellitus dan Hipertensi Terlayani</p>
          <p class="hero-description">
            Aplikasi milik Dinas Kesehatan Kab. Banjar <br>
            Bidang P2P Seksi Penyakit Tidak Menular
          </p>
          <button class="cta-button" @click="navigateToLogin">Mulai Sekarang</button>
        </div>
      </div>

      <div class="documentation-section" ref="documentationSectionRef">
        <h2 class="section-title">Dokumentasi Kegiatan</h2>
        <div class="cards-container">
          <div
            v-for="(card, index) in documentationCards"
            :key="index"
            class="doc-card"
            :class="{ 'animate-in': isVisible }"
            :style="{ animationDelay: `${index * 0.1}s` }"
          >
            <div class="card-image">
              <img :src="card.image" :alt="card.title">
            </div>
            <div class="card-content">
              <h3 class="card-title">{{ card.title }}</h3>
              <p class="card-description">{{ card.description }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="features-section">
        <h2 class="section-title">Fitur Aplikasi</h2>
        <div class="features-container">
          <div class="feature-card">
            <div class="feature-icon">
              <font-awesome-icon :icon="['fas', 'chart-line']" />
            </div>
            <h3>Monitoring Pasien</h3>
            <p>Pemantauan kondisi pasien secara berkala dan terstruktur</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">
              <font-awesome-icon :icon="['fas', 'file-medical-alt']" />
            </div>
            <h3>Rekam Medis Digital</h3>
            <p>Penyimpanan data medis pasien secara digital dan aman</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">
              <font-awesome-icon :icon="['fas', 'heartbeat']" />
            </div>
            <h3>Pemantauan Hipertensi</h3>
            <p>Pencatatan dan analisis tekanan darah pasien</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">
              <font-awesome-icon :icon="['fas', 'prescription-bottle-alt']" />
            </div>
            <h3>Manajemen Diabetes</h3>
            <p>Kontrol gula darah dan pengelolaan diabetes mellitus</p>
          </div>
        </div>
      </div>

      <div class="scroll-indicator" @click="navigateToLogin">
        <span>Login</span>
        <font-awesome-icon :icon="['fas', 'chevron-down']" bounce />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

// Menggunakan <script setup> membuatnya lebih ringkas dan modern
const router = useRouter();

// Variabel reaktif untuk kontrol animasi
const isVisible = ref(false);
const documentationSectionRef = ref(null); // Ref untuk menargetkan elemen section

// Placeholder untuk gambar (bisa diganti dengan API atau data statis)
const placeholderImageUrls = [
  'https://via.placeholder.com/400x300/097678/FFFFFF?text=Kegiatan+1',
  'https://via.placeholder.com/400x300/097678/FFFFFF?text=Kegiatan+2',
  'https://via.placeholder.com/400x300/097678/FFFFFF?text=Kegiatan+3',
  'https://via.placeholder.com/400x300/097678/FFFFFF?text=Kegiatan+4',
  'https://via.placeholder.com/400x300/097678/FFFFFF?text=Kegiatan+5',
  'https://via.placeholder.com/400x300/097678/FFFFFF?text=Kegiatan+6'
];

const documentationCards = ref([
  { title: 'Penyuluhan Diabetes', description: 'Kegiatan penyuluhan tentang pencegahan dan penanganan diabetes mellitus', image: placeholderImageUrls[0] },
  { title: 'Pengukuran Tekanan Darah', description: 'Pemeriksaan tekanan darah rutin untuk masyarakat', image: placeholderImageUrls[1] },
  { title: 'Pengecekan Gula Darah', description: 'Skrining gula darah untuk deteksi dini diabetes', image: placeholderImageUrls[2] },
  { title: 'Konsultasi Kesehatan', description: 'Konsultasi kesehatan dengan tenaga medis profesional', image: placeholderImageUrls[3] },
  { title: 'Pelatihan Kader', description: 'Pelatihan kader kesehatan untuk pendampingan pasien', image: placeholderImageUrls[4] },
  { title: 'Senam Sehat', description: 'Kegiatan olahraga rutin untuk menjaga kesehatan', image: placeholderImageUrls[5] }
]);

// Fungsi navigasi ke halaman login
const navigateToLogin = () => {
  router.push({ path: '/auth/login', query: { fromHome: 'true' } });
};

// Hook onMounted untuk logika setelah komponen dimuat
onMounted(() => {
  // Check for intersection observer to animate cards when in view
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Tidak perlu timeout, langsung set isVisible menjadi true
        isVisible.value = true;
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1 // Pemicu saat 10% elemen terlihat
  });

  // Mengamati elemen section dokumentasi
  if (documentationSectionRef.value) {
    observer.observe(documentationSectionRef.value);
  }
});
</script>

<style scoped>
/* Root Variables (matching DiabetesMellitus style) */
:root {
  --primary-100: #e6f2f2;
  --primary-300: #66b2b2;
  --primary-500: #097678;
  --primary-700: #054a47;
  --secondary-100: #e6f7f7;
  --secondary-300: #b3e6e6;
}

/* Home Container */
.home-container {
  font-family: "Inter", sans-serif;
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  padding-bottom: 70px;

  /* PERBAIKAN LATAR BELAKANG DENGAN GAMBAR */
  /* Ganti '/path/to/your-transparent-image.png' dengan path gambar Anda */
  /* Pastikan gambar ada di folder 'public' atau dihandle oleh build tool Anda (misal: di 'src/assets') */
  background-color: #054a47; /* Fallback color */
  background-image:
    url('/path/to/your-transparent-image.png'), /* Gambar Anda (di atas gradien) */
    linear-gradient(135deg, #097678 0%, #054a47 100%); /* Gradien asli */
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover; /* atau 'contain', sesuai kebutuhan */
}

.home-container::before {
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

/* Navbar */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 50px;
  position: relative;
  z-index: 10;
}

.nav-logo {
  display: flex;
  align-items: center;
}

.logo-circle {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: white;
  margin-right: 10px;
}

.nav-title {
  color: white;
  font-weight: 600;
  font-size: 18px;
}

.login-nav-button {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid white;
  border-radius: 20px;
  padding: 8px 24px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.login-nav-button:hover {
  background-color: white;
  color: var(--primary-500);
}

/* Hero Section */
.hero-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px 30px;
  position: relative;
  z-index: 1;
}

.hero-content {
  text-align: center;
  color: white;
  max-width: 800px;
}

.hero-title {
  font-size: 48px;
  font-weight: 700;
  margin-bottom: 10px;
  animation: fadeInUp 1s ease;
}

.hero-subtitle {
  font-size: 20px;
  margin-bottom: 20px;
  animation: fadeInUp 1s ease 0.2s;
  animation-fill-mode: both;
}

.hero-description {
  font-size: 16px;
  margin-bottom: 30px;
  line-height: 1.6;
  animation: fadeInUp 1s ease 0.4s;
  animation-fill-mode: both;
}

.cta-button {
  background-color: white;
  color: var(--primary-500);
  border: none;
  border-radius: 25px;
  padding: 12px 30px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  animation: fadeInUp 1s ease 0.6s;
  animation-fill-mode: both;
}

.cta-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.15);
}

/* Documentation Cards Section */
.documentation-section {
  padding: 60px 30px;
  position: relative;
  z-index: 1;
}

.section-title {
  color: white;
  text-align: center;
  margin-bottom: 40px;
  font-size: 32px;
  font-weight: 600;
}

.cards-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 30px;
  max-width: 1200px;
  margin: 0 auto;
}

.doc-card {
  background-color: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  opacity: 0;
  transform: translateY(30px);
}

.doc-card.animate-in {
  animation: fadeInUp 0.6s ease forwards;
}

.doc-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
}

.card-image {
  height: 180px;
  overflow: hidden;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.doc-card:hover .card-image img {
  transform: scale(1.1);
}

.card-content {
  padding: 20px;
}

.card-title {
  color: var(--primary-500);
  margin-bottom: 10px;
  font-size: 18px;
}

.card-description {
  color: #666;
  font-size: 14px;
  line-height: 1.5;
}

/* Features Section */
.features-section {
  padding: 60px 30px;
  position: relative;
  z-index: 1;
}

.features-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 30px;
  max-width: 1200px;
  margin: 0 auto;
}

.feature-card {
  text-align: center;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 30px 20px;
  color: white;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.feature-card:hover {
  background-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-5px);
}

.feature-icon {
  font-size: 36px;
  margin-bottom: 20px;
  color: white;
}

.feature-card h3 {
  margin-bottom: 15px;
  font-size: 20px;
}

.feature-card p {
  font-size: 14px;
  line-height: 1.6;
}

/* Scroll Indicator */
.scroll-indicator {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  z-index: 1;
}

.scroll-indicator span {
  margin-bottom: 10px;
  font-size: 14px;
}

.scroll-indicator svg {
  font-size: 24px;
}

/* Animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Responsive Styles */
@media (max-width: 768px) {
  .navbar {
    padding: 15px 20px;
  }
  
  .hero-title {
    font-size: 36px;
  }
  
  .hero-subtitle {
    font-size: 18px;
  }
  
  .cards-container {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 28px;
  }
  
  .section-title {
    font-size: 24px;
  }
  
  .cards-container,
  .features-container {
    grid-template-columns: 1fr;
  }
}
</style>