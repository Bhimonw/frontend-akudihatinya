<template>
  <div class="home-wrapper">
    <header class="hero-section">
      <nav class="top-nav">
        <div class="logo-text">akudihatinya</div>
        <router-link to="/auth/login" class="login-btn">Login</router-link>
      </nav>
      <div class="hero-content">
        <h1 class="hero-title">Aplikasi Kesehatan Terpadu</h1>
        <p class="hero-subtitle">
          Diabetes Mellitus & Hipertensi Terlayani di Kabupaten Banjar
        </p>
        <div class="arrow-container" @click="scrollToContent">
          <font-awesome-icon :icon="['fas', 'chevron-down']" />
        </div>
      </div>
    </header>

    <main class="info-content" ref="infoContent">
      <h2 class="section-title">Tentang Kami</h2>
      <section class="info-card">
        <div class="card-image-container">
          <img src="../assets/ptm.jpg" alt="Gedung Dinas Kesehatan Kabupaten Banjar" class="card-image"/>
        </div>
        <div class="card-text">
          <h3 class="card-title">Dinas Kesehatan Kabupaten Banjar</h3>
          <p class="card-description">
            Dinas Kesehatan Kabupaten Banjar berkomitmen untuk meningkatkan kualitas kesehatan masyarakat melalui berbagai program promotif, preventif, kuratif, dan rehabilitatif. Visi kami adalah mewujudkan masyarakat Kabupaten Banjar yang sehat, mandiri, dan berkeadilan. Aplikasi "akudihatinya" merupakan salah satu inovasi digital kami untuk mendekatkan layanan kesehatan kepada masyarakat.
          </p>
        </div>
      </section>

      <section class="info-card reverse">
        <div class="card-image-container">
           <img src="../assets/ptm.jpg" alt="Kegiatan Seksi PTM" class="card-image"/>
        </div>
        <div class="card-text">
          <h3 class="card-title">Seksi Penyakit Tidak Menular (PTM)</h3>
          <p class="card-description">
            Seksi PTM berfokus pada pengendalian faktor risiko dan penanganan Penyakit Tidak Menular, khususnya Diabetes Mellitus dan Hipertensi, yang menjadi tantangan kesehatan utama. Kami menyelenggarakan skrining, edukasi, dan pemantauan rutin untuk memastikan penderita mendapatkan pelayanan yang optimal dan berkelanjutan.
          </p>
        </div>
      </section>
    </main>

    <footer class="scroll-prompt-footer">
      <p>Terus scroll ke bawah untuk masuk ke halaman Login</p>
      <font-awesome-icon :icon="['fas', 'arrow-down']" class="bounce-arrow" />
    </footer>

    <div class="login-section-container" ref="loginSection"></div>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';

// Script tetap sama, tidak ada perubahan logika
export default {
  name: 'HomePage',
  setup() {
    const router = useRouter();
    const loginSection = ref(null);
    const infoContent = ref(null);

    const scrollToContent = () => {
      infoContent.value?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleScroll = () => {
      if (!loginSection.value) return;
      const { top } = loginSection.value.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      if (top < windowHeight && top > 0) {
        window.removeEventListener('scroll', handleScrollThrottled);
        router.push('/auth/login');
      }
    };
    
    let throttleTimeout = null;
    const handleScrollThrottled = () => {
      if (throttleTimeout) return;
      throttleTimeout = setTimeout(() => {
        handleScroll();
        throttleTimeout = null;
      }, 200);
    };

    onMounted(() => {
      window.addEventListener('scroll', handleScrollThrottled);
    });

    onBeforeUnmount(() => {
      window.removeEventListener('scroll', handleScrollThrottled);
    });

    return {
      loginSection,
      infoContent,
      scrollToContent,
    };
  },
};
</script>

<style scoped>
/* Variabel CSS disalin dari Login.vue untuk konsistensi */
:root {
  --primary-500: #10B981;
  --primary-700: #047857;
  --background-light: #F9FAFB;
  --text-dark: #1F2937;
  --text-medium: #6B7280;
  --text-light: #9CA3AF;
  --card-shadow: 0 8px 25px -8px rgba(0, 0, 0, 0.1);
}

.home-wrapper {
  /* Menggunakan font Inter yang sama dengan Login.vue */
  font-family: "Inter", sans-serif;
  scroll-snap-type: y mandatory;
  overflow-y: scroll;
  height: 100vh;
  background-color: var(--background-light); /* Latar belakang dasar */
}

/* Hero Section Styles */
.hero-section {
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  /* Menggunakan gradient warna yang sama */
  background: linear-gradient(135deg, var(--primary-500) 0%, var(--primary-700) 100%);
  color: white;
  text-align: center;
  padding: 20px;
  position: relative;
  scroll-snap-align: start;
}

.top-nav {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  padding: 20px 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo-text {
  font-size: 24px;
  font-weight: 700;
}

/* Tombol login disesuaikan gayanya */
.login-btn {
  background-color: white;
  color: var(--primary-700);
  padding: 10px 25px;
  border-radius: 12px; /* Disesuaikan dengan Login.vue */
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
}

.login-btn:hover {
  background-color: #f0fdf4;
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0,0,0,0.1);
}

.hero-content {
  animation: fadeIn 1.5s ease-out;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.hero-subtitle {
  font-size: 1.25rem;
  max-width: 600px;
  opacity: 0.9;
  color: #D1FAE5; /* Warna hijau muda untuk subjudul */
}

.arrow-container {
  position: absolute;
  bottom: 40px;
  cursor: pointer;
  animation: bounce 2s infinite;
}

.arrow-container svg { /* Targetkan svg di dalam container */
  font-size: 2rem;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-20px); }
  60% { transform: translateY(-10px); }
}

/* Info Content Styles */
.info-content {
  background-color: var(--background-light);
  padding: 80px 40px;
  display: flex;
  flex-direction: column;
  gap: 40px;
  scroll-snap-align: start;
}

.section-title {
  text-align: center;
  font-size: 2.25rem;
  font-weight: 700;
  color: var(--text-dark);
  margin-bottom: 20px;
}

/* Card disesuaikan dengan gaya .login-card */
.info-card {
  display: flex;
  align-items: center;
  gap: 60px;
  max-width: 1100px;
  margin: 0 auto;
  background: white;
  border-radius: 16px;
  box-shadow: var(--card-shadow);
  padding: 40px;
  overflow: hidden;
}

.info-card.reverse {
  flex-direction: row-reverse;
}

.card-image-container {
  flex: 1;
  border-radius: 12px;
  overflow: hidden;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.card-image-container:hover .card-image {
  transform: scale(1.05);
}

.card-text {
  flex: 1.2;
}

/* Judul dan deskripsi card disesuaikan dengan font dan warna Login.vue */
.card-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-dark);
  margin-bottom: 1rem;
}

.card-description {
  font-size: 1rem;
  line-height: 1.7;
  color: var(--text-medium);
}

/* Footer & Login Section */
.scroll-prompt-footer {
  text-align: center;
  padding: 60px 20px;
  background-color: var(--background-light);
  color: var(--text-medium);
  font-size: 1.1rem;
  scroll-snap-align: end;
}

.bounce-arrow {
  margin-top: 10px;
  animation: bounce-small 2s infinite;
}

@keyframes bounce-small {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-10px); }
  60% { transform: translateY(-5px); }
}


.login-section-container {
  height: 100vh;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 992px) {
  .info-card {
    flex-direction: column !important;
    gap: 30px;
    padding: 30px;
  }
}

@media (max-width: 768px) {
  .top-nav { padding: 15px 20px; }
  .hero-title { font-size: 2.5rem; }
  .hero-subtitle { font-size: 1rem; }
  
  .info-content { padding: 60px 20px; }
  .section-title { font-size: 1.8rem; }
  .card-title { font-size: 1.5rem; }
  .card-description { font-size: 0.95rem; }
}
</style>