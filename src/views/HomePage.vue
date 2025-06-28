<template>
  <div class="home-wrapper">
    <header class="hero-section">
      <nav class="top-nav">
        <div class="logo-container">
          <img src="../assets/ptm-icon.jpg" alt="Logo Aplikasi" class="logo-img" />
          <div class="logo-text">akudihatinya</div>
        </div>
        <router-link to="/auth/login" class="login-btn">Login</router-link>
      </nav>
      <div class="hero-content">
        <h1 class="hero-title">Aplikasi Kesehatan untuk Diabetes Mellitus dan Hipertensi Terlayani di Kabupaten Banjar</h1>
        <div class="arrow-container" @click="scrollToContent">
          <font-awesome-icon :icon="['fas', 'chevron-down']" />
        </div>
      </div>
    </header>

    <main class="info-content" ref="infoContent">
      <h2 class="section-title">Tentang Kami</h2>
      <section class="info-card">
        <div class="card-image-container">
          <img src="../assets/dinkes.webp" alt="Gedung Dinas Kesehatan Kabupaten Banjar" class="card-image"/>
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
            Sebagai bagian dari Bidang Pencegahan dan Pengendalian Penyakit (P2P), Seksi Penyakit Tidak Menular (PTM) memiliki fokus utama untuk menekan laju PTM di Kabupaten Banjar. Kami secara khusus menangani tantangan kesehatan utama seperti Diabetes Melitus dan Hipertensi melalui serangkaian program terpadu. Upaya kami meliputi kegiatan skrining deteksi dini, edukasi berkelanjutan kepada masyarakat, serta pemantauan rutin bagi penderita untuk memastikan mereka mendapatkan penanganan yang optimal dan komprehensif.
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

export default {
  name: 'HomePage',
  setup() {
    const router = useRouter();
    const loginSection = ref(null);
    const infoContent = ref(null);

    const scrollToContent = () => {
      infoContent.value?.scrollIntoView({ behavior: 'smooth' });
    };

    let observer = null;

    onMounted(() => {
      if (!loginSection.value) return;

      const options = {
        root: null,
        threshold: 0.1,
      };

      observer = new IntersectionObserver((entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          observer.unobserve(loginSection.value);
          router.push('/auth/login');
        }
      }, options);

      observer.observe(loginSection.value);
    });

    onBeforeUnmount(() => {
      if (observer) {
        observer.disconnect();
      }
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
.home-wrapper {
  font-family: var(--font-family-primary); 
  scroll-snap-type: y mandatory;
  overflow-y: scroll;
  height: 100vh;
  background-color: var(--background-light);
}

/* Hero Section Styles */
.hero-section {
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  text-align: center;
  padding: 20px;
  position: relative;
  scroll-snap-align: start;
  background: 
    linear-gradient(135deg, rgba(4, 125, 120, 0.7) 0%, rgba(3, 89, 85, 0.8) 100%),
    url('../assets/dokumentasi-dinkes.jpg') no-repeat center center/cover;
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

/* DITAMBAHKAN: Style untuk container logo dan teks */
.logo-container {
  display: flex;
  align-items: center;
  gap: 12px; /* Jarak antara logo dan teks */
}

/* DITAMBAHKAN: Style untuk gambar logo */
.logo-img {
  width: 40px;
  height: 40px;
  border-radius: 50%; /* Membuat gambar menjadi lingkaran */
  object-fit: cover; /* Memastikan gambar tidak terdistorsi */
}

.logo-text {
  font-size: 24px;
  font-weight: 700;
}

.login-btn {
  background-color: var(--bg-white);
  color: var(--primary-700);
  padding: 10px 25px;
  border-radius: var(--radius-lg);
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: var(--shadow-md);
}

.login-btn:hover {
  background-color: var(--primary-50);
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.hero-content {
  animation: fadeIn 1.5s ease-out;
  max-width: 900px;
  margin: 0 auto;
}

/* PERBAIKAN HERO TITLE - Lebih User Friendly */
.hero-title {
  font-family: var(--font-family-heading);
  font-size: 2.8rem; /* Dikurangi dari 3.5rem */
  font-weight: 600; /* Dikurangi dari 700 untuk less aggressive */
  line-height: 1.3; /* Ditambahkan untuk readability yang lebih baik */
  margin-bottom: 1.5rem;
  max-width: 800px;
  /* DIHAPUS: text-transform: uppercase; */
  color: var(--bg-white);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3); /* Ditambahkan untuk kontras yang lebih baik */
  letter-spacing: -0.5px; /* Sedikit mengurangi spacing untuk tampilan lebih natural */
}

.hero-subtitle {
  font-size: 1.25rem;
  max-width: 600px;
  opacity: 0.9;
  color: var(--primary-100);
}

.arrow-container {
  position: absolute;
  bottom: 40px;
  cursor: pointer;
  animation: bounce 2s infinite;
}

.arrow-container svg {
  font-size: 2rem;
}

.info-content {
  background-color: var(--background-light);
  padding: 80px 40px;
  display: flex;
  flex-direction: column;
  gap: 40px;
  scroll-snap-align: start;
}

.section-title {
  font-family: var(--font-family-heading);
  text-align: center;
  font-size: 2.25rem;
  font-weight: 700;
  color: var(--text-dark);
  margin-bottom: 20px;
}

.info-card {
  display: flex;
  align-items: center;
  gap: 60px;
  max-width: 1100px;
  margin: 0 auto;
  background: var(--bg-white);
  border-radius: var(--radius-xl);
  box-shadow: var(--card-shadow);
  padding: 40px;
  overflow: hidden;
}

.info-card.reverse {
  flex-direction: row-reverse;
}

.card-image-container {
  flex: 1;
  border-radius: var(--radius-lg);
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

.card-title {
  font-family: var(--font-family-heading);
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

.login-section-container {
  height: 100vh;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-20px); }
  60% { transform: translateY(-10px); }
}

@keyframes bounce-small {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-10px); }
  60% { transform: translateY(-5px); }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Media Queries - Responsiveness untuk Hero Title */
@media (max-width: 992px) {
  .info-card {
    flex-direction: column !important;
    gap: 30px;
    padding: 30px;
  }
  
  .hero-title {
    font-size: 2.4rem; /* Dikurangi untuk tablet */
  }
}

@media (max-width: 768px) {
  .top-nav { padding: 15px 20px; }
  
  .hero-title { 
    font-size: 2rem; /* Dikurangi dari 2.5rem untuk mobile */
    line-height: 1.4; /* Sedikit diperbesar untuk mobile readability */
    margin-bottom: 1rem;
  }
  
  .hero-subtitle { font-size: 1rem; }
  .info-content { padding: 60px 20px; }
  .section-title { font-size: 1.8rem; }
  .card-title { font-size: 1.5rem; }
  .card-description { font-size: 0.95rem; }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 1.7rem; /* Lebih kecil lagi untuk layar sangat kecil */
    padding: 0 10px;
  }
}
</style>