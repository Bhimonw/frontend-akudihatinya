<template>
  <LoadingPage 
    v-if="isLoading" 
    :apiStatus="apiStatus" 
    @loading-complete="onLoadingComplete" 
    @loading-error="onLoadingError" 
  />
  
  <div v-show="!isLoading" class="dashboard-content"></div>
  <div class="toolbar">
    <div class="left-section">
      <!-- Dropdown Tahun -->
      <div class="dropdown-container-year">
        <select id="yearPicker" class="dropdown-select" v-model="selectedYear" @change="updateData">
          <option v-for="year in years" :key="year" :value="String(year)">{{ year }}</option>
        </select>
      </div>
      <!-- Dropdown Program Kesehatan -->
      <div class="dropdown-container-program">
        <select id="programPicker" class="dropdown-select" v-model="selectedProgram" @change="updateData">
          <option v-for="program in programs" :key="program" :value="program">{{ program }}</option>
        </select>
      </div>
      <!-- Print Button -->
      <button class="print-report-button" @click="printReport">
        <font-awesome-icon :icon="['fas', 'print']" />
        Print Laporan
        <font-awesome-icon :icon="['fas', 'chevron-down']" />
      </button>
    </div>
  </div>

  <!-- Error message jika ada error -->
  <div v-if="error" class="error-message">
      <font-awesome-icon :icon="['fas', 'exclamation-circle']" />
      {{ error }}
      <button @click="fetchData" class="retry-button">
        <font-awesome-icon :icon="['fas', 'sync']" /> Coba Lagi
      </button>
    </div>

  <!-- Summary Cards Section -->
  <div class="summary-cards">
    <div class="summary-card">
      <div class="icon-container">
        <font-awesome-icon :icon="['fas', 'users']" class="summary-icon" />
      </div>
      <div class="card-content">
        <h3 class="card-title">Sasaran</h3>
        <p class="card-value">{{ summaryCards.sasaran }}</p>
        <p class="card-subtitle">(Jumlah)</p>
      </div>
    </div>
    <div class="summary-card">
      <div class="icon-container">
        <font-awesome-icon :icon="['fas', 'check-circle']" class="summary-icon standar" />
      </div>
      <div class="card-content">
        <h3 class="card-title">Capaian Standar</h3>
        <p class="card-value">{{ summaryCards.capaianStandar }}</p>
        <p class="card-subtitle">(Sesuai Standar)</p>
      </div>
    </div>
    <div class="summary-card">
      <div class="icon-container">
        <font-awesome-icon :icon="['fas', 'times-circle']" class="summary-icon non-standar" />
      </div>
      <div class="card-content">
        <h3 class="card-title">Capaian Tidak Standar</h3>
        <p class="card-value">{{ summaryCards.capaianTidakStandar }}</p>
        <p class="card-subtitle">(Tidak Sesuai Standar)</p>
      </div>
    </div>
    <div class="summary-card">
      <div class="icon-container">
        <font-awesome-icon :icon="['fas', 'hospital']" class="summary-icon" />
      </div>
      <div class="card-content">
        <h3 class="card-title">Total Pelayanan</h3>
        <p class="card-value">{{ summaryCards.totalPelayanan }}</p>
        <p class="card-subtitle">(Jumlah)</p>
      </div>
    </div>
    <div class="summary-card">
      <div class="icon-container">
        <font-awesome-icon :icon="['fas', 'percent']" class="summary-icon" />
      </div>
      <div class="card-content">
        <h3 class="card-title">% Capaian Pelayanan</h3>
        <p class="card-value">{{ summaryCards.persenCapaianPelayanan }}</p>
        <p class="card-subtitle">(Sesuai Standar)</p>
      </div>
    </div>
  </div>

  <!-- Statistics Section -->
  <div class="statistics-card">
    <h2 class="section-title">Statistik</h2>
    <div class="chart-legends">
      <div class="legend-item">
        <div class="legend-dot male"></div>
        <span>Laki-laki</span>
      </div>
      <div class="legend-item">
        <div class="legend-dot female"></div>
        <span>Perempuan</span>
      </div>
    </div>
    <div class="chart-container">
      <div class="y-axis-values">
        <div>100</div>
        <div>80</div>
        <div>60</div>
        <div>40</div>
        <div>20</div>
        <div>0</div>
      </div>
      <canvas id="chart"></canvas>
    </div>
    <div class="x-axis-values">
      <div>Jan</div>
      <div>Feb</div>
      <div>Mar</div>
      <div>Apr</div>
      <div>May</div>
      <div>Jun</div>
      <div>Jul</div>
      <div>Aug</div>
      <div>Sep</div>
      <div>Oct</div>
      <div>Nov</div>
      <div>Dec</div>
    </div>
  </div>


  <!-- Data Table Section -->
  <div class="table-section table-card">
    <div class="table-header">
      <h2 class="section-title">Rekap Data {{ selectedProgram }}</h2>
    </div>
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th colspan="2" class="th-group">JUMLAH</th>
            <th colspan="3" class="th-group">JANUARI</th>
            <th colspan="3" class="th-group">FEBRUARI</th>
            <th colspan="3" class="th-group">MARET</th>
            <th colspan="3" class="th-group">APRIL</th>
            <th colspan="3" class="th-group">MEI</th>
            <th colspan="3" class="th-group">JUNI</th>
            <th colspan="3" class="th-group">JULI</th>
            <th colspan="3" class="th-group">AGUSTUS</th>
            <th colspan="3" class="th-group">SEPTEMBER</th>
            <th colspan="3" class="th-group">OKTOBER</th>
            <th colspan="3" class="th-group">NOVEMBER</th>
            <th colspan="3" class="th-group">DESEMBER</th>
          </tr>
          <tr>
            <th>LAKI-LAKI</th>
            <th>PEREMPUAN</th>
            <th>S</th>
            <th>TS</th>
            <th>%</th>
            <th>S</th>
            <th>TS</th>
            <th>%</th>
            <th>S</th>
            <th>TS</th>
            <th>%</th>
            <th>S</th>
            <th>TS</th>
            <th>%</th>
            <th>S</th>
            <th>TS</th>
            <th>%</th>
            <th>S</th>
            <th>TS</th>
            <th>%</th>
            <th>S</th>
            <th>TS</th>
            <th>%</th>
            <th>S</th>
            <th>TS</th>
            <th>%</th>
            <th>S</th>
            <th>TS</th>
            <th>%</th>
            <th>S</th>
            <th>TS</th>
            <th>%</th>
            <th>S</th>
            <th>TS</th>
            <th>%</th>
            <th>S</th>
            <th>TS</th>
            <th>%</th>
            <th>S</th>
            <th>TS</th>
            <th>%</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, index) in tableData" :key="index">
            <td>{{ row.jenisKelamin }}</td>
            <td>{{ row.jenisKelamin }}</td>
            <td>{{ row.januari.s }}</td>
            <td>{{ row.januari.ts }}</td>
            <td>{{ row.januari.persen }}</td>
            <td>{{ row.februari.s }}</td>
            <td>{{ row.februari.ts }}</td>
            <td>{{ row.februari.persen }}</td>
            <td>{{ row.maret.s }}</td>
            <td>{{ row.maret.ts }}</td>
            <td>{{ row.maret.persen }}</td>
            <td>{{ row.april.s }}</td>
            <td>{{ row.april.ts }}</td>
            <td>{{ row.april.persen }}</td>
            <td>{{ row.mei.s }}</td>
            <td>{{ row.mei.ts }}</td>
            <td>{{ row.mei.persen }}</td>
            <td>{{ row.juni.s }}</td>
            <td>{{ row.juni.ts }}</td>
            <td>{{ row.juni.persen }}</td>
            <td>{{ row.juli.s }}</td>
            <td>{{ row.juli.ts }}</td>
            <td>{{ row.juli.persen }}</td>
            <td>{{ row.agustus.s }}</td>
            <td>{{ row.agustus.ts }}</td>
            <td>{{ row.agustus.persen }}</td>
            <td>{{ row.september.s }}</td>
            <td>{{ row.september.ts }}</td>
            <td>{{ row.september.persen }}</td>
            <td>{{ row.oktober.s }}</td>
            <td>{{ row.oktober.ts }}</td>
            <td>{{ row.oktober.persen }}</td>
            <td>{{ row.november.s }}</td>
            <td>{{ row.november.ts }}</td>
            <td>{{ row.november.persen }}</td>
            <td>{{ row.desember.s }}</td>
            <td>{{ row.desember.ts }}</td>
            <td>{{ row.desember.persen }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { Chart } from "chart.js/auto";
import apiClient from "../../api.js";
import LoadingPage from "../../components/LoadingPage.vue";

export default {
  name: "Dashboard",
  components: {
    LoadingPage
  },
  data() {
    const currentYear = new Date().getFullYear();
    const startYear = 2020;
    const years = Array.from({ length: currentYear - startYear + 1 }, (_, i) => startYear + i).reverse();
    return {
      chartInstance: null,
      selectedYear: String(currentYear),
      years: years.filter((year) => year >= 2024 && year <= 2025), // Hanya 2024 dan 2025
      selectedProgram: "Diabetes Mellitus",
      programs: ["Diabetes Mellitus", "Hipertensi"],
      summaryCards: {},
      tableData: [],
      chartData: {},
      isLoading: true,
      apiStatus: 'idle',
      error: null
    };
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    onLoadingComplete() {
      this.isLoading = false;
    },
    onLoadingError() {
      // Jika terjadi error saat loading, tetap tampilkan dashboard dengan pesan error
      this.isLoading = false;
    },
    updateData() {
      this.fetchData();
    },
    async fetchData() {
      this.error = null;
      this.apiStatus = 'loading';
      
      try {
        // Konversi nama program ke parameter type yang sesuai dengan API
        const type = this.selectedProgram === "Hipertensi" ? "ht" : "dm";
        
        // Panggil API dengan parameter year dan type
        const response = await apiClient.get("/statistics", {
          params: {
            year: this.selectedYear,
            type: type
          }
        });
        
        // Proses data dari API
        this.processApiData(response.data);
        this.apiStatus = 'success';
      } catch (error) {
        console.error("Error fetching data:", error);
        this.error = "Gagal memuat data. Silakan coba lagi nanti.";
        this.apiStatus = 'error';
        // Tampilkan pesan error ke pengguna
        this.$toast.error("Gagal memuat data: " + (error.response?.data?.message || error.message));
      }
    },
    processApiData(apiData) {
      if (!apiData || !apiData.data || apiData.data.length === 0) {
        this.error = "Tidak ada data yang tersedia.";
        this.apiStatus = 'error';
        return;
      }
      
      // Ambil data puskesmas pertama (atau yang sesuai dengan kebutuhan)
      const puskesmasData = apiData.data[0];
      
      // Tentukan jenis data berdasarkan program yang dipilih
      const dataType = this.selectedProgram === "Hipertensi" ? "ht" : "dm";
      const data = puskesmasData[dataType.toLowerCase()];
      
      if (!data) {
        this.error = `Data ${this.selectedProgram} tidak tersedia.`;
        this.apiStatus = 'error';
        return;
      }
      
      // Proses data untuk summary cards
      this.summaryCards = {
        sasaran: data.target,
        capaianStandar: data.standard_patients,
        capaianTidakStandar: data.non_standard_patients,
        totalPelayanan: data.total_patients,
        persenCapaianPelayanan: data.achievement_percentage + "%"
      };
      
      // Proses data untuk tabel
      this.tableData = [
        {
          jenisKelamin: "Laki-laki",
          jumlah: data.male_patients,
          januari: this.getMonthData(data.monthly_data["1"], "male"),
          februari: this.getMonthData(data.monthly_data["2"], "male"),
          maret: this.getMonthData(data.monthly_data["3"], "male"),
          april: this.getMonthData(data.monthly_data["4"], "male"),
          mei: this.getMonthData(data.monthly_data["5"], "male"),
          juni: this.getMonthData(data.monthly_data["6"], "male"),
          juli: this.getMonthData(data.monthly_data["7"], "male"),
          agustus: this.getMonthData(data.monthly_data["8"], "male"),
          september: this.getMonthData(data.monthly_data["9"], "male"),
          oktober: this.getMonthData(data.monthly_data["10"], "male"),
          november: this.getMonthData(data.monthly_data["11"], "male"),
          desember: this.getMonthData(data.monthly_data["12"], "male")
        },
        {
          jenisKelamin: "Perempuan",
          jumlah: data.female_patients,
          januari: this.getMonthData(data.monthly_data["1"], "female"),
          februari: this.getMonthData(data.monthly_data["2"], "female"),
          maret: this.getMonthData(data.monthly_data["3"], "female"),
          april: this.getMonthData(data.monthly_data["4"], "female"),
          mei: this.getMonthData(data.monthly_data["5"], "female"),
          juni: this.getMonthData(data.monthly_data["6"], "female"),
          juli: this.getMonthData(data.monthly_data["7"], "female"),
          agustus: this.getMonthData(data.monthly_data["8"], "female"),
          september: this.getMonthData(data.monthly_data["9"], "female"),
          oktober: this.getMonthData(data.monthly_data["10"], "female"),
          november: this.getMonthData(data.monthly_data["11"], "female"),
          desember: this.getMonthData(data.monthly_data["12"], "female")
        }
      ];
      
      // Proses data untuk chart
      this.chartData = {
        lakiLaki: Object.keys(data.monthly_data).map(month => data.monthly_data[month].male),
        perempuan: Object.keys(data.monthly_data).map(month => data.monthly_data[month].female)
      };
      
      // Render chart
      this.$nextTick(() => {
        this.renderChart();
      });
    },
    getMonthData(monthData, gender) {
      if (!monthData) {
        return { s: 0, ts: 0, persen: "0%" };
      }
      
      // Untuk data laki-laki, kita hanya perlu nilai male dari data bulanan
      // Untuk data perempuan, kita hanya perlu nilai female dari data bulanan
      // Nilai standard dan non_standard adalah total, jadi kita perlu memperkirakan berdasarkan proporsi
      
      const genderCount = monthData[gender] || 0;
      const totalCount = monthData.total || 0;
      
      // Hitung perkiraan standard dan non-standard berdasarkan proporsi gender
      let standardCount = 0;
      let nonStandardCount = 0;
      
      if (totalCount > 0) {
        const genderRatio = genderCount / totalCount;
        standardCount = Math.round((monthData.standard || 0) * genderRatio);
        nonStandardCount = Math.round((monthData.non_standard || 0) * genderRatio);
      }
      
      return {
        s: standardCount,
        ts: nonStandardCount,
        persen: monthData.percentage ? monthData.percentage + "%" : "0%"
      };
    },
    renderChart() {
      const ctx = document.getElementById("chart");
      if (!ctx) return;
      
      const context = ctx.getContext("2d");
      if (this.chartInstance) {
        this.chartInstance.destroy(); // Hapus chart sebelumnya jika ada
      }
      this.chartInstance = new Chart(context, {
        type: "line",
        data: {
          labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
          datasets: [
            {
              label: "Laki-laki",
              data: this.chartData.lakiLaki,
              borderColor: "#3b82f6",
              fill: false,
            },
            {
              label: "Perempuan",
              data: this.chartData.perempuan,
              borderColor: "#f59e0b",
              fill: false,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
        },
      });
    },
    printReport() {
      window.print();
    }
  },
};
</script>

<style scoped>
/* Root Styles */
.dashboard-content {
  opacity: 1;
  transition: opacity 0.5s ease;
}

/* Error Message */
.error-message {
  background-color: #fee2e2;
  border: 1px solid #ef4444;
  color: #b91c1c;
  padding: 16px;
  border-radius: 10px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.retry-button {
  margin-left: auto;
  background-color: #b91c1c;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 8px 12px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.retry-button:hover {
  background-color: #991b1b;
}
body {
  background-color: #f7f8f9;
  min-height: 100vh;
  box-sizing: border-box;
  padding: 20px;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.loading-spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #10b981;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Error Message */
.error-message {
  background-color: #fee2e2;
  border: 1px solid #ef4444;
  color: #b91c1c;
  padding: 16px;
  border-radius: 10px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.retry-button {
  margin-left: auto;
  background-color: #b91c1c;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 8px 12px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.retry-button:hover {
  background-color: #991b1b;
}
/* Toolbar - Adjusted as per sketch */
.toolbar {
  display: flex;
  margin-bottom: 20px;
}

/* Left Section - Modified to match sketch */
.left-section {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

/* Dropdown Tahun */
.dropdown-container-year,
.dropdown-container-program {
  position: relative;
  width: 200px;
}

.dropdown-select {
  width: 100%;
  height: 42px;
  padding: 8px;
  border: 1px solid #eaeaea;
  border-radius: 10px;
  font-family: "Inter", sans-serif;
  font-size: 14px;
  color: #000000;
  background: #ffffff;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  outline: none;
}

/* Dropdown Icon (Chevron Down) */
.dropdown-container-year::after,
.dropdown-container-program::after {
  content: "▼";
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 12px;
  color: #9aa0a8;
  pointer-events: none;
}

/* Print Report Button */
.print-report-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: var(--primary-500, #10b981);
  color: #ffffff;
  font-family: "Inter", sans-serif;
  font-size: 14px;
  font-weight: 500;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.print-report-button:hover {
  background: var(--primary-700, #047857);
}

/* Section Title */
.section-title {
  font-family: "Inter", sans-serif;
  font-size: 18px;
  font-weight: 600;
  color: #333333;
  margin-bottom: 16px;
}

/* Summary Cards - Modified to have 5 cards with grid */
.summary-cards {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}

.summary-card {
  background: #ffffff;
  border-radius: 10px;
  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.05);
  padding: 20px;
  display: flex;
  align-items: center;
}

.icon-container {
  background-color: rgba(16, 185, 129, 0.1);
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 16px;
}

.summary-icon {
  color: #10b981;
  font-size: 20px;
}

/* Custom colors for standar and non-standar icons */
.summary-icon.standar {
  color: #3b82f6; /* Blue for standard */
}

.icon-container .standar {
  background-color: rgba(59, 130, 246, 0.1);
}

.summary-icon.non-standar {
  color: #ef4444; /* Red for non-standard */
}

.icon-container .non-standar {
  background-color: rgba(239, 68, 68, 0.1);
}

.card-content {
  flex-grow: 1;
}

.card-title {
  font-family: "Inter", sans-serif;
  font-size: 14px;
  color: #4f5867;
  margin: 0;
  margin-bottom: 4px;
}

.card-value {
  font-family: "Inter", sans-serif;
  font-size: 24px;
  font-weight: 600;
  color: #333333;
  margin: 0;
  margin-bottom: 2px;
}

.card-subtitle {
  font-family: "Inter", sans-serif;
  font-size: 12px;
  color: #9aa0a8;
  margin: 0;
}

/* Statistics Card - Adjusted to full width as per sketch */
.statistics-card {
  background: #ffffff;
  border-radius: 10px;
  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.05);
  padding: 20px;
  margin-bottom: 30px;
  width: 100%;
}

/* Chart Legends */
.chart-legends {
  display: flex;
  margin-bottom: 15px;
  gap: 20px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: "Inter", sans-serif;
  font-size: 14px;
  color: #4f5867;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.legend-dot.male {
  background-color: #3b82f6;
}

.legend-dot.female {
  background-color: #f59e0b;
}

/* Chart Container */
.chart-container {
  display: flex;
  height: 300px;
  position: relative;
  margin-bottom: 10px;
}

.y-axis-values {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-right: 10px;
  font-family: "Inter", sans-serif;
  font-size: 12px;
  color: #9aa0a8;
  height: 100%;
}

.chart {
  flex-grow: 1;
  position: relative;
  border-left: 1px solid #eaeaea;
  border-bottom: 1px solid #eaeaea;
}

.x-axis-values {
  display: flex;
  justify-content: space-between;
  padding-left: 20px;
  font-family: "Inter", sans-serif;
  font-size: 12px;
  color: #9aa0a8;
}

/* Table Section - Already styled as a card */
.table-section {
  margin-bottom: 30px;
}

.table-card {
  background: #ffffff;
  border-radius: 10px;
  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.05);
  padding: 20px;
}

.table-header {
  margin-bottom: 16px;
}

/* Table Container */
.table-container {
  overflow-x: auto;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
}

/* Data Table */
.data-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-family: "Inter", sans-serif;
  font-size: 14px;
  color: #333333;
  background: #ffffff;
  border-radius: 10px;
  overflow: hidden;
}

/* Header */
.data-table thead th {
  background: #f3f4f6;
  color: #333333;
  font-weight: 600;
  text-align: center;
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.th-group {
  border-left: 1px solid #e5e7eb;
  border-right: 1px solid #e5e7eb;
}

/* Data Rows */
.data-table tbody tr:hover {
  background: #f9fafb;
  transition: background-color 0.3s ease;
}

/* Data Cell */
.data-table td {
  text-align: center;
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
}

.data-table tr {
  height: 60px;
}

/* Responsive Styles */
@media (max-width: 1200px) {
  .summary-cards {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 992px) {
  .toolbar {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  .left-section {
    width: 100%;
  }
  .summary-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 576px) {
  .summary-cards {
    grid-template-columns: 1fr;
  }
}
</style>
