<template>
  <div v-if="apiStatus === 'loading'" class="top-loading-bar">
    <div class="loading-bar-progress"></div>
  </div>

  <div class="dashboard-content">
    <div class="toolbar-card">
      <div class="toolbar-content">
        <div class="controls-section">
          <div class="control-group">
            <label class="control-label">
              <span class="label-icon">📅</span>
              Tahun
            </label>
            <div class="select-wrapper">
              <select v-model="selectedYear" @change="updateData" class="modern-select">
                <option v-for="year in years" :key="year" :value="String(year)">{{ year }}</option>
              </select>
              <span class="select-arrow">
                <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                  <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </span>
            </div>
          </div>

          <div class="control-group">
            <label class="control-label">
              <span class="label-icon">🏥</span>
              Program Kesehatan
            </label>
            <div class="select-wrapper">
              <select v-model="selectedProgram" @change="updateData" class="modern-select">
                <option v-for="program in programs" :key="program" :value="program">{{ program }}</option>
              </select>
              <span class="select-arrow">
                <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                  <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </span>
            </div>
          </div>
        </div>

        <div class="download-button-container">
          <button class="print-button" @click="toggleDownloadOptions" :disabled="isDownloading">
            <span class="button-icon">
              <font-awesome-icon v-if="isDownloading" :icon="['fas', 'spinner']" spin />
              <font-awesome-icon v-else :icon="['fas', 'download']" />
            </span>
            <span>{{ isDownloading ? 'Memproses...' : 'Unduh Laporan' }}</span>
            <div class="button-shine"></div>
          </button>
          <div v-if="showDownloadOptions" class="download-options" @mouseleave="showDownloadOptions = false">
            <button @click="triggerDownload('excel')" class="download-option">
              <font-awesome-icon :icon="['fas', 'file-excel']" /> Download Excel
            </button>
            <button @click="triggerDownload('pdf')" class="download-option">
              <font-awesome-icon :icon="['fas', 'file-pdf']" /> Download PDF
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="error && apiStatus === 'error'" class="error-message">
      <font-awesome-icon :icon="['fas', 'exclamation-circle']" />
      {{ error }}
      <button @click="fetchData" class="retry-button">
        <font-awesome-icon :icon="['fas', 'sync']" /> Coba Lagi
      </button>
    </div>

    <div class="metrics-section">
      <div class="metrics-grid">
        <div class="metric-card primary">
          <div class="metric-header">
            <div class="metric-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="currentColor" stroke-width="2"/>
                <path d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z" stroke="currentColor" stroke-width="2"/>
              </svg>
            </div>
            <span class="metric-trend">📈</span>
          </div>
          <div class="metric-content">
            <h3 class="metric-title">Total Sasaran</h3>
            <p class="metric-value">{{ summaryCards.sasaran || '0' }}</p>
            <p class="metric-subtitle">Sesuai Standar</p>
          </div>
        </div>

        <div class="metric-card success">
          <div class="metric-header">
            <div class="metric-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <span class="metric-trend">✅</span>
          </div>
          <div class="metric-content">
            <h3 class="metric-title">Capaian Standar</h3>
            <p class="metric-value">{{ summaryCards.capaianStandar || '0' }}</p>
            <p class="metric-subtitle">Sesuai Standar</p>
          </div>
        </div>

        <div class="metric-card warning">
          <div class="metric-header">
            <div class="metric-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M10 14L12 12M12 12L14 10M12 12L10 10M12 12L14 14M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <span class="metric-trend">❌</span>
          </div>
          <div class="metric-content">
            <h3 class="metric-title">Tidak Standar</h3>
            <p class="metric-value">{{ summaryCards.capaianTidakStandar || '0' }}</p>
            <p class="metric-subtitle">Perlu Perhatian</p>
          </div>
        </div>

        <div class="metric-card info">
          <div class="metric-header">
            <div class="metric-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M19 14C20.49 12.54 22 10.79 22 8.5C22 7.04131 21.4205 5.64236 20.3891 4.61091C19.3576 3.57946 17.9587 3 16.5 3C15.74 3 15.04 3.16 14.38 3.46C13.75 3.14 13.02 3 12.19 3C10.77 3 9.39 3.64 8.41 4.61C7.43 5.58 6.81 6.94 6.81 8.31C6.81 10.5 8.26 12.36 9.71 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" stroke="currentColor" stroke-width="2"/>
              </svg>
            </div>
            <span class="metric-trend">🏥</span>
          </div>
          <div class="metric-content">
            <h3 class="metric-title">Total Pelayanan</h3>
            <p class="metric-value">{{ summaryCards.totalPelayanan || '0' }}</p>
            <p class="metric-subtitle">Pelayanan</p>
          </div>
        </div>

        <div class="metric-card accent">
          <div class="metric-header">
            <div class="metric-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M9 7H6C4.89543 7 4 7.89543 4 9V15C4 16.1046 4.89543 17 6 17H9M15 7H18C19.1046 7 20 7.89543 20 9V15C20 16.1046 19.1046 17 18 17H15M9 7V17M15 7V17M9 12H15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <span class="metric-trend">📊</span>
          </div>
          <div class="metric-content">
            <h3 class="metric-title">% Capaian Pelayanan</h3>
            <p class="metric-value">{{ summaryCards.persenCapaianPelayanan || '0%' }}</p>
            <p class="metric-subtitle">% Sesuai Standar</p>
          </div>
        </div>
      </div>
    </div>

    <div class="charts-section">
      <div class="chart-card">
        <div class="chart-header">
          <div class="chart-title-section">
            <h2 class="chart-title">
              <span class="title-accent"></span>
              Statistik Berdasarkan Jenis Kelamin
            </h2>
            <p class="chart-subtitle">Distribusi pasien per bulan dalam tahun {{ selectedYear }}</p>
          </div>
          <div class="chart-legends">
            <div class="legend-item male">
              <div class="legend-dot"></div>
              <span>Laki-laki</span>
            </div>
            <div class="legend-item female">
              <div class="legend-dot"></div>
              <span>Perempuan</span>
            </div>
          </div>
        </div>
        <div class="chart-container">
          <canvas id="chart"></canvas>
        </div>
      </div>
    </div>

    <div class="table-section">
      <div class="table-card">
        <div class="table-header">
          <div class="table-title-section">
            <h2 class="table-title">
              <span class="title-accent"></span>
              Rekap Data {{ selectedProgram }}
            </h2>
            <p class="table-subtitle">Data detail per bulan untuk tahun {{ selectedYear }}</p>
          </div>
        </div>
        <div class="table-container">
          <table class="data-table">
              <thead>
                <tr>
                  <th rowspan="2" class="th-month">Bulan</th>
                  <th colspan="3" class="th-group">Jumlah</th>
                  <th colspan="2" class="th-group">Jumlah Standar Berdasarkan Jenis Kelamin</th>
                </tr>
                <tr>
                  <th class="th-sub">S</th>
                  <th class="th-sub">TS</th>
                  <th class="th-sub">%</th>
                  <th class="th-sub">Laki-laki</th>
                  <th class="th-sub">Perempuan</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(month, index) in monthlyTableData" :key="index" class="table-row">
                  <td class="month-name">{{ month.name }}</td>
                  <td class="data-cell">{{ month.standard }}</td>
                  <td class="data-cell">{{ month.nonStandard }}</td>
                  <td class="data-cell">
                    <span class="percentage-value">{{ month.percentage }}%</span>
                    <div class="percentage-bar">
                      <div class="percentage-fill" :style="{ width: month.percentage + '%' }"></div>
                    </div>
                  </td>
                  <td class="data-cell">{{ month.male }}</td>
                  <td class="data-cell">{{ month.female }}</td>
                </tr>
              </tbody>
            </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Chart } from "chart.js/auto";
import apiClient from "../../api.js";

// Import FontAwesome icons
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faExclamationCircle, faSync,
  faDownload, faFileExcel, faFilePdf, faSpinner
} from '@fortawesome/free-solid-svg-icons';

library.add(
  faExclamationCircle, faSync,
  faDownload, faFileExcel, faFilePdf, faSpinner
);

export default {
  name: "Dashboard",
  components: {
    FontAwesomeIcon
  },
  data() {
    const currentYear = new Date().getFullYear();
    const startYear = 2024;
     const years = Array.from({ length: currentYear - startYear + 1 }, (_, i) => startYear + i).reverse();
    return {
      chartInstance: null,
      selectedYear: String(currentYear),
      years: years,
      selectedProgram: "Diabetes Mellitus",
      programs: ["Diabetes Mellitus", "Hipertensi"],
      summaryCards: {},
      monthlyTableData: [],
      chartData: {},
      apiStatus: 'idle',
      error: null,
      isDownloading: false,
      showDownloadOptions: false,
    };
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    updateData() {
      this.fetchData();
    },
    async fetchData() {
      this.error = null;
      this.apiStatus = 'loading';

      try {
        const type = this.selectedProgram === "Hipertensi" ? "ht" : "dm";
        const response = await apiClient.get("/statistics/dashboard-statistics", { // Endpoint untuk data dashboard pengguna
          params: {
            year: this.selectedYear,
            type: type
          }
        });

        this.processApiData(response.data);
        this.apiStatus = 'success';
      } catch (error) {
        console.error("Error fetching data:", error);
        this.error = "Gagal memuat data. Silakan coba lagi nanti.";
        this.apiStatus = 'error';
        this.summaryCards = {};
        this.monthlyTableData = this.generateMonthlyTableData({});
        this.chartData = { lakiLaki: [], perempuan: [] };
        if (this.chartInstance) {
            this.chartInstance.destroy();
            this.chartInstance = null;
        }
        if (this.$toast && typeof this.$toast.error === 'function') {
            this.$toast.error("Gagal memuat data: " + (error.response?.data?.message || error.message));
        }
      }
    },
    processApiData(apiData) {
      if (!apiData || !apiData.data || apiData.data.length === 0) {
        this.error = "Tidak ada data yang tersedia untuk parameter yang dipilih.";
        this.apiStatus = 'error';
        this.summaryCards = {
            sasaran: '0',
            capaianStandar: '0',
            capaianTidakStandar: '0',
            totalPelayanan: '0',
            persenCapaianPelayanan: '0%'
        };
        this.monthlyTableData = this.generateMonthlyTableData({});
        this.chartData = { lakiLaki: Array(12).fill(0), perempuan: Array(12).fill(0) };
        if (this.chartInstance) {
            this.chartInstance.destroy();
            this.chartInstance = null;
        }
        return;
      }

      const puskesmasData = apiData.data[0]; // User dashboard biasanya menampilkan data satu puskesmas atau agregat sederhana
      const dataType = this.selectedProgram === "Hipertensi" ? "ht" : "dm";
      const data = puskesmasData[dataType.toLowerCase()];

      if (!data) {
        this.error = `Data ${this.selectedProgram} tidak tersedia.`;
        this.apiStatus = 'error';
        this.summaryCards = {
            sasaran: '0',
            capaianStandar: '0',
            capaianTidakStandar: '0',
            totalPelayanan: '0',
            persenCapaianPelayanan: '0%'
        };
        this.monthlyTableData = this.generateMonthlyTableData({});
        this.chartData = { lakiLaki: Array(12).fill(0), perempuan: Array(12).fill(0) };
        if (this.chartInstance) {
            this.chartInstance.data.datasets[0].data = [...(this.chartData.lakiLaki || [])];
            this.chartInstance.data.datasets[1].data = [...(this.chartData.perempuan || [])];
            this.chartInstance.update();
        }
        return;
      }
      
      this.error = null;
      this.summaryCards = {
          sasaran: data.target || '0',
          capaianStandar: data.standard_patients || '0',
          capaianTidakStandar: data.non_standard_patients || '0',
          totalPelayanan: data.total_patients || '0',
          persenCapaianPelayanan: (data.achievement_percentage || 0) + "%"
      };
      this.monthlyTableData = this.generateMonthlyTableData(data.monthly_data || {});
      const monthlyDataForChart = data.monthly_data && typeof data.monthly_data === 'object' ? data.monthly_data : {};
      const allMonthsMaleData = [];
      const allMonthsFemaleData = [];
      for (let i = 1; i <= 12; i++) {
          const monthKey = String(i);
          const currentMonthData = monthlyDataForChart[monthKey] || { male: 0, female: 0 };
          allMonthsMaleData.push(currentMonthData.male || 0);
          allMonthsFemaleData.push(currentMonthData.female || 0);
      }
      this.chartData = {
          lakiLaki: allMonthsMaleData,
          perempuan: allMonthsFemaleData
      };
      this.$nextTick(() => {
          this.renderChart();
      });
    },
    renderChart() {
      const ctx = document.getElementById("chart");
      if (!ctx) return;

      const context = ctx.getContext("2d");
      if (this.chartInstance) {
        this.chartInstance.destroy();
      }
      this.chartInstance = new Chart(context, {
        type: "line",
        data: {
          labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
          datasets: [
            {
              label: "Laki-laki",
              data: [...(this.chartData.lakiLaki || Array(12).fill(0))],
              borderColor: "#3B82F6",
              backgroundColor: "rgba(59, 130, 246, 0.1)",
              borderWidth: 3,
              fill: true,
              tension: 0.4,
              pointBackgroundColor: "#3B82F6",
              pointBorderColor: "#ffffff",
              pointBorderWidth: 2,
              pointRadius: 6,
              pointHoverRadius: 8,
            },
            {
              label: "Perempuan",
              data: [...(this.chartData.perempuan || Array(12).fill(0))],
              borderColor: "#EC4899",
              backgroundColor: "rgba(236, 72, 153, 0.1)",
              borderWidth: 3,
              fill: true,
              tension: 0.4,
              pointBackgroundColor: "#EC4899",
              pointBorderColor: "#ffffff",
              pointBorderWidth: 2,
              pointRadius: 6,
              pointHoverRadius: 8,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            intersect: false,
            mode: 'index',
          },
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              titleColor: '#ffffff',
              bodyColor: '#ffffff',
              borderColor: 'rgba(255, 255, 255, 0.1)',
              borderWidth: 1,
              cornerRadius: 8,
              displayColors: true,
              usePointStyle: true,
            }
          },
          scales: {
            x: {
              grid: {
                display: false,
              },
              ticks: {
                color: '#6B7280',
                font: {
                  size: 12,
                  weight: '500'
                }
              }
            },
            y: {
              grid: {
                color: 'rgba(0, 0, 0, 0.05)',
                drawBorder: false,
              },
              ticks: {
                color: '#6B7280',
                font: {
                  size: 12,
                  weight: '500'
                },
                beginAtZero: true
              }
            }
          }
        },
      });
    },
    toggleDownloadOptions() {
      this.showDownloadOptions = !this.showDownloadOptions;
    },
    // MODIFIED: triggerDownload method to use admin's API endpoint
    async triggerDownload(format) {
      if (this.isDownloading) return;
      this.isDownloading = true;
      this.showDownloadOptions = false;
      this.error = null;

      // Menggunakan programType yang sama dengan di admin dashboard
      const programType = this.selectedProgram === "Hipertensi" ? "ht" : "dm";
      const apiUrl = `/statistics/export`; // API endpoint yang sama dengan admin

      try {
        const response = await apiClient.get(apiUrl, {
          params: {
            year: this.selectedYear,
            disease_type: programType, // Parameter di API admin adalah 'type' untuk jenis penyakit
            format: format,
            table_type: "puskesmas",
          },
          responseType: 'blob', // Penting untuk menerima file
        });

        const blob = new Blob([response.data], { type: response.headers['content-type'] });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;

        // Membuat nama file yang mirip dengan admin
        const programNameSanitized = this.selectedProgram.toLowerCase().replace(/\s+/g, '_');
        const fileName = `rekap_laporan_${programNameSanitized}_${this.selectedYear}.${format === 'excel' ? 'xlsx' : 'pdf'}`;
        
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        if (this.$toast && typeof this.$toast.success === 'function') {
          this.$toast.success(`Laporan ${format.toUpperCase()} berhasil diunduh.`);
        }

      } catch (err) {
        console.error(`Error downloading ${format} report:`, err);
        let message = `Gagal mengunduh laporan ${format.toUpperCase()}. `;
        
        // Mencoba membaca pesan error dari respons blob jika ada
        if (err.response && err.response.data && err.response.data instanceof Blob && err.response.data.type === "application/json") {
            try {
                const errorJson = JSON.parse(await err.response.data.text());
                message += errorJson.message || 'Detail error tidak tersedia.';
            } catch (parseError) {
                message += 'Tidak bisa membaca detail error dari server.';
            }
        } else if (err.response && err.response.data && err.response.data.message) {
            message += err.response.data.message;
        } else {
            message += err.message || 'Terjadi kesalahan tidak diketahui.';
        }
        
        this.error = message;
        if (this.$toast && typeof this.$toast.error === 'function') {
            this.$toast.error(this.error);
        }
      } finally {
        this.isDownloading = false;
      }
    },
    generateMonthlyTableData(monthlyData) {
        const monthNames = [
            'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
            'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
        ];
        if (!monthlyData || typeof monthlyData !== 'object') { 
            return monthNames.map(monthName => ({
                name: monthName, standard: 0, nonStandard: 0, percentage: 0, male: 0, female: 0
            }));
        }
        return monthNames.map((monthName, index) => {
            const monthKey = String(index + 1);
            const currentMonthData = monthlyData[monthKey] || {}; 
            return {
                name: monthName,
                standard: currentMonthData.standard || 0,
                nonStandard: currentMonthData.non_standard || 0,
                percentage: currentMonthData.percentage || 0,
                male: currentMonthData.male || 0,
                female: currentMonthData.female || 0
            };
        });
    }
  },
};
</script>

<style scoped>
/* Root Styles (Ensure these or equivalent are globally available or defined here) */
:root {
  --primary-50: #ecfdf5;
  --primary-100: #d1fae5;
  --primary-200: #a7f3d0;
  --primary-300: #6ee7b7;
  --primary-400: #34d399;
  --primary-500: #10b981;
  --primary-600: #059669;
  --primary-700: #047857;
  --primary-800: #065f46;
  --primary-900: #064e3b;
  
  --success-50: #f0fdf4;
  --success-100: #dcfce7;
  --success-500: #22c55e;
  --success-600: #16a34a;
  --success-700: #15803d;
  
  --warning-50: #fffbeb;
  --warning-100: #fef3c7;
  --warning-500: #f59e0b;
  --warning-600: #d97706;
  --warning-700: #b45309;
  
  --error-50: #fef2f2;
  --error-100: #fee2e2;
  --error-200: #fecaca;
  --error-500: #ef4444;
  --error-600: #dc2626;
  --error-700: #b91c1c;
  
  --accent-500: #8b5cf6; /* Used by metric card, ensure defined */
  --accent-600: #7c3aed; /* Used by metric card, ensure defined */
  /* --accent-5000, --accent-6000 are typos in original user CSS, assuming they meant --accent-500, --accent-600 */

  --gray-50: #f9fafb;
  --gray-100: #f3f4f6;
  --gray-200: #e5e7eb;
  --gray-300: #d1d5db;
  --gray-400: #9ca3af;
  --gray-500: #6b7280;
  --gray-600: #4b5563;
  --gray-700: #374151;
  --gray-800: #1f2937;
  --gray-900: #111827;
  
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
}
.top-loading-bar {
  position: fixed; /* Atau absolute jika tata letak Anda mengizinkan */
  top: 0;
  left: 0;
  width: 100%;
  height: 4px; /* Tinggi bar loading */
  background-color: var(--primary-100, #d1fae5); /* Latar belakang terang untuk track bar */
  z-index: 9999; /* Pastikan berada di atas konten lain */
  overflow: hidden; /* Sembunyikan bagian progress bar yang keluar */
}

.loading-bar-progress {
  width: 100%;
  height: 100%;
  background: var(--primary-500, #10b981); /* Warna progress */
  animation: indeterminate-progress 2s infinite linear;
  transform-origin: left;
}

@keyframes indeterminate-progress {
  0% {
    transform: translateX(-100%) scaleX(0.5); /* Mulai di luar layar, lebih sempit */
  }
  50% {
    transform: translateX(0%) scaleX(1);    /* Bergerak melintasi, lebar penuh */
  }
  100% {
    transform: translateX(100%) scaleX(0.5); /* Pindah ke luar layar, lebih sempit */
  }
}
.dashboard-content {
  opacity: 1;
  transition: opacity 0.5s ease;
  max-width: 1400px;
  margin: 0 auto;
  animation: fadeInUp 0.6s ease-out;
  padding: 1rem 1.5rem;
}

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

/* Header Section */
.page-header {
  margin-bottom: 2rem;
  text-align: center;
}

.header-content {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-xl);
  padding: 2rem;
  color: white;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.title-icon {
  font-size: 2rem;
}

.page-subtitle {
  font-size: 1.125rem;
  opacity: 0.9;
  margin: 0;
  font-weight: 400;
}

/* Error Message */
.error-message {
  background-color: var(--error-50, #fef2f2); /* Menggunakan variabel CSS jika tersedia */
  border: 1px solid var(--error-200, #fecaca);
  color: var(--error-700, #b91c1c);
  padding: 1rem; /* Sedikit padding */
  border-radius: var(--radius-lg, 0.75rem);
  margin: 1rem auto; /* Tengah dan dengan margin */
  max-width: 800px; /* Batasi lebar agar tidak terlalu memanjang */
  display: flex;
  align-items: center;
  justify-content: space-between; /* Mendorong tombol coba lagi ke kanan */
  gap: 10px;
  box-shadow: var(--shadow-md); /* Tambahkan sedikit bayangan */
}
.error-message .fa-exclamation-circle { /* Untuk ikon FontAwesome */
  margin-right: 8px;
}
/* Styles for retry button in error message were duplicated, ensure one source of truth */
.retry-button {
  background-color: var(--error-500, #ef4444);
  color: white;
  border: none;
  border-radius: var(--radius-md, 0.5rem);
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-size: 0.875rem; /* 14px */
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background-color 0.2s ease, transform 0.2s ease;
}
.retry-button:hover {
  background-color: var(--error-600, #dc2626);
  transform: translateY(-1px);
}

body { /* This might conflict if user has global body styles, keep an eye on it */
  background: linear-gradient(135deg, var(--primary-500), var(--primary-700) 100%);
  min-height: 100vh;
  box-sizing: border-box;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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
  border: 4px solid var(--gray-200);
  border-top: 4px solid var(--primary-500);
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

/* Toolbar */
  .toolbar-card {
    background: white;
    border-radius: var(--radius-xl);
    box-shadow: var(--shadow-lg);
    margin-bottom: 2rem;
  }
  
  .toolbar-content {
    padding: 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
  }
  
  .controls-section {
    display: flex;
    gap: 1.5rem;
    flex-wrap: wrap;
  }
  
  .control-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .control-label {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--gray-700);
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .label-icon {
    font-size: 1rem;
  }
  
  .select-wrapper {
    position: relative;
    min-width: 200px;
  }
  
  .modern-select {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 2px solid var(--gray-200);
    border-radius: var(--radius-lg);
    background: white;
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--gray-700);
    appearance: none;
    cursor: pointer;
    transition: all 0.2s;
  }

.modern-select:hover { 
  border-color: var(--primary-400); 
}
  
  .modern-select:focus {
    outline: none;
    border-color: var(--primary-500);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  .select-arrow {
    position: absolute;
    right: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: var(--gray-400);
    pointer-events: none;
  }
  
  /* Styles for the main print/download button */
  .print-button {
    background: linear-gradient(135deg, var(--primary-500), var(--primary-600));
    color: white;
    border: none;
    border-radius: var(--radius-lg);
    padding: 0.75rem 1.5rem;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem; /* Adjusted from 0.5rem in user, 0.625rem in admin, using user's */
    position: relative;
    overflow: hidden;
    transition: all 0.2s; /* Adjusted from 0.2s ease-out in admin */
  }
  
  .print-button:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg); /* Consistent with user button hover */
  }
  
  .button-icon {
    font-size: 1rem; /* Adjusted from 1.125rem in admin */
  }
  
  .button-shine {
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s; /* Consistent with user button shine */
  }
  
  .print-button:hover .button-shine {
    left: 100%; /* Consistent */
  }

  /* --- ADDED: Styles for Download Dropdown (from admin dashboard) --- */
  .download-button-container {
    position: relative;
    display: inline-block;
  }

  .download-options {
    position: absolute;
    top: 100%;
    right: 0;
    background-color: white;
    border-radius: var(--radius-md, 0.5rem); /* Use existing var if available */
    box-shadow: var(--shadow-lg); /* Use existing var */
    border: 1px solid var(--gray-200, #e5e7eb); /* Use existing var */
    z-index: 100;
    min-width: 180px;
    margin-top: 0.5rem;
    overflow: hidden;
    animation: fadeInScaleUp 0.2s ease-out;
  }

  @keyframes fadeInScaleUp { /* Copied from admin */
    from { opacity: 0; transform: translateY(-10px) scale(0.95); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }

  .download-option {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    width: 100%;
    padding: 0.75rem 1rem;
    text-align: left;
    background-color: transparent;
    border: none;
    cursor: pointer;
    font-size: 0.875rem;
    color: var(--gray-700, #374151); /* Use existing var */
    transition: background-color 0.15s ease, color 0.15s ease;
  }

  .download-option .svg-inline--fa { /* For FontAwesome icons */
    width: 1em;
    height: 1em;
    color: var(--gray-500); /* Use existing var */
    transition: color 0.15s ease;
  }
  /* Ensure FontAwesomeIcon component usage sets class for this */
   .download-option .fa-file-excel { color: var(--success-500, #22c55e); }
   .download-option .fa-file-pdf { color: var(--error-500, #ef4444); }


  .download-option:hover {
    background-color: var(--primary-50, #ecfdf5); /* Use existing var */
    color: var(--primary-600, #059669); /* Use existing var */
  }
  .download-option:hover .svg-inline--fa {
    color: var(--primary-500, #10b981); /* Use existing var */
  }
   .download-option:hover .fa-file-excel { color: var(--success-600, #16a34a); }
   .download-option:hover .fa-file-pdf { color: var(--error-600, #dc2626); }


  .download-option:not(:last-child) {
    border-bottom: 1px solid var(--gray-100, #f3f4f6); /* Use existing var */
  }

  .print-button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: translateY(0);
    box-shadow: var(--shadow-sm); /* Use existing var */
  }
  .print-button:disabled:hover .button-shine {
    opacity: 0;
  }
  /* --- END ADDED Styles --- */


  /* Error Card (Original user styles had this, seems distinct from .error-message) */
    .error-card {
    background: var(--error-50);
    border: 1px solid var(--error-200);
    border-radius: var(--radius-xl);
    margin-bottom: 2rem;
    overflow: hidden;
  }
  
  .error-content {
    padding: 1.5rem;
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  
  .error-icon {
    font-size: 2rem; /* Assuming this is for an emoji or a larger icon */
    color: var(--error-500);
    flex-shrink: 0;
  }
  
  .error-text {
    flex-grow: 1;
  }
  
  .error-text h3 {
    margin: 0 0 0.25rem 0;
    font-size: 1rem;
    font-weight: 600;
    color: var(--error-600);
  }
  
  .error-text p {
    margin: 0;
    font-size: 0.875rem;
    color: var(--error-500);
  }
  
  /* The .retry-button style was defined earlier. Re-defining it here might be redundant */
  /* unless it's specifically for the .error-card context. */
  /* .error-card .retry-button { ... } */
  
  .retry-icon { /* This seems to be for an animated retry icon */
    animation: spin 1s linear infinite; /* Uses the same spin animation */
  }
  
  /* Metrics Section */
  .metrics-section {
    margin-bottom: 2rem;
  }
  
  .section-title { /* This class wasn't used in the template but defined */
    font-size: 1.5rem;
    font-weight: 700;
    color: black; /* Consider var(--gray-900) */
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  /* .title-accent is used in chart and table, ensure consistency */
  .title-accent {
    width: 4px;
    height: 1.5rem;
    background: var(--primary-500); /* Simplified from linear-gradient for this instance */
    border-radius: 2px;
  }
  
  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr); /* Default in user dashboard */
    gap: 1.5rem;
  }
  
  .metric-card {
    background: white;
    border-radius: var(--radius-xl);
    padding: 1.5rem;
    box-shadow: var(--shadow-lg);
    transition: all 0.3s;
    position: relative;
    overflow: hidden;
  }
  
  .metric-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    /* Default primary color for the top border */
    background: linear-gradient(135deg, var(--primary-500), var(--primary-600));
  }
  
  .metric-card.primary::before { /* Explicitly for the first card if needed, or rely on default */
    background: linear-gradient(135deg, var(--primary-500), var(--primary-600));
  }
  .metric-card.success::before {
    background: linear-gradient(135deg, var(--success-500), var(--success-600));
  }
  .metric-card.warning::before {
    background: linear-gradient(135deg, var(--warning-500), var(--warning-600));
  }
  .metric-card.info::before { /* User dashboard has its own 'info' color */
    background: linear-gradient(135deg, #06b6d4, #0891b2); /* Cyan shades */
  }
  .metric-card.accent::before { /* Uses --accent-500, --accent-600 which should be fine */
    background: linear-gradient(135deg, var(--accent-500), var(--accent-600));
  }
  
  .metric-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-xl);
  }
  
  .metric-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }
  
  .metric-icon {
    width: 48px;
    height: 48px;
    border-radius: var(--radius-lg);
    display: flex;
    align-items: center;
    justify-content: center;
    /* Default icon background and color (for primary) */
    background: var(--primary-50);
    color: var(--primary-500);
  }
  .metric-card.primary .metric-icon { /* Explicit for primary, if default isn't enough */
     background: var(--primary-50);
     color: var(--primary-500);
  }
  .metric-card.success .metric-icon {
    background: var(--success-50);
    color: var(--success-500);
  }
  .metric-card.warning .metric-icon {
    background: var(--warning-50);
    color: var(--warning-500);
  }
  .metric-card.info .metric-icon { /* User dashboard info icon style */
    background: #f0f9ff; /* Light cyan */
    color: #0891b2; /* Darker cyan */
  }
  .metric-card.accent .metric-icon { /* Uses --accent-500 */
    background: #f5f3ff; /* Light violet */
    color: var(--accent-500);
  }
  
  .metric-trend {
    font-size: 1.25rem;
  }
  
  .metric-content {
    text-align: left;
  }
  
  .metric-title {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--gray-600);
    margin: 0 0 0.5rem 0;
  }
  
  .metric-value {
    font-size: 2rem;
    font-weight: 700;
    color: var(--gray-900);
    margin: 0 0 0.25rem 0;
  }
  
  .metric-subtitle {
    font-size: 0.75rem;
    color: var(--gray-500);
    margin: 0;
    font-weight: 500;
  }

/* Charts Section */
  .charts-section {
    margin-bottom: 2rem;
  }
  
  .chart-card {
    background: white;
    border-radius: var(--radius-xl);
    box-shadow: var(--shadow-lg);
    overflow: hidden;
  }
  
  .chart-header {
    padding: 1.5rem 1.5rem 1rem 1.5rem;
    border-bottom: 1px solid var(--gray-100);
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    flex-wrap: wrap;
    gap: 1rem;
  }
  
  .chart-title-section {
    flex-grow: 1;
  }
  
  .chart-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--gray-900);
    margin: 0 0 0.25rem 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .chart-subtitle {
    font-size: 0.875rem;
    color: var(--gray-500);
    margin: 0;
  }
  
  .chart-legends {
    display: flex;
    gap: 1.5rem;
  }
  
  .legend-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    font-weight: 500;
  }
  
  .legend-item.male {
    color: #3B82F6;
  }
  
  .legend-item.female {
    color: #ec4899
  }
  
  .legend-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
  }
  
  .legend-item.male .legend-dot {
    background: #3B82F6;
  }
  
  .legend-item.female .legend-dot {
    background: #ec4899; /* Consistent */
  }
  
  .chart-container {
    padding: 1rem 1.5rem 1.5rem 1.5rem;
    height: 400px;
  }

/* Table Section */
.table-section {
    margin-bottom: 2rem;
  }
  
  .table-card {
    background: white;
    border-radius: var(--radius-xl);
    box-shadow: var(--shadow-lg);
    overflow: hidden;
    padding: 20px; /* Original user table padding */
  }
  
  .table-header { /* Used by user table */
    padding: 1.5rem 1.5rem 1rem 1.5rem; /* Original user table header padding */
    border-bottom: 1px solid var(--gray-100);
    /* Note: admin table has a more complex .table-header-enhanced */
  }
  
  .table-title-section { /* Shared between user and admin conceptually */
    text-align: left;
  }
  
  .table-title { /* Shared */
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--gray-900);
    margin: 0 0 0.25rem 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .table-subtitle { /* Shared */
    font-size: 0.875rem;
    color: var(--gray-500);
    margin: 0;
  }
  
  .table-container { /* User table container */
    overflow-x: auto;
    /* User table specific shadow and radius, distinct from admin's enhanced container */
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1); 
    border-radius: 10px;
  }
  
  .data-table { /* User's data table style */
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    font-family: "Inter", sans-serif; /* User specific font */
    font-size: 14px; /* User specific font size */
    color: #333333; /* User specific color */
    background: #ffffff;
    border-radius: 10px; /* Matches its container */
    overflow: hidden;
  }
  
  .data-table thead th { /* User specific header cell style */
    background: #f3f4f6; /* var(--gray-100) */
    color: #333333; /* var(--gray-800) */
    font-weight: 600;
    text-align: center;
    padding: 16px; /* User specific padding */
    border-bottom: 1px solid #e5e7eb; /* var(--gray-200) */
  }
  
  .th-month { /* User specific */
    background: #f3f4f6;
    color: #333333;
    font-weight: 600;
    text-align: center;
    padding: 16px;
    border-bottom: 1px solid #e5e7eb;
    border-right: 1px solid #e5e7eb;
    vertical-align: middle;
  }
  
  .th-group { /* User specific */
    border-left: 1px solid #e5e7eb;
    border-right: 1px solid #e5e7eb;
  }
  
  .th-sub { /* User specific */
    background: #f9fafb; /* var(--gray-50) */
    font-size: 12px;
    font-weight: 600;
    padding: 12px;
    vertical-align: middle;
  }

  
  
  .table-row:hover { /* User specific row hover */
    background: #f9fafb; /* var(--gray-50) */
    transition: background-color 0.3s ease;
  }
  
  .month-name { /* User specific */
    font-weight: 600;
    text-align: center;
    padding: 20px;
    background: #f9fafb;
    border-bottom: 1px solid #e5e7eb;
  }
  
  .data-cell { /* User specific */
    text-align: center;
    padding: 20px;
    border-bottom: 1px solid #e5e7eb;
  }
  
  .percentage-value { /* User specific */
    display: block;
    margin-bottom: 4px;
    font-weight: 500;
  }
  
  .percentage-bar { /* User specific */
    width: 60px;
    height: 4px;
    background: #e5e7eb;
    border-radius: 2px;
    overflow: hidden;
    margin: 0 auto;
  }
  
  .percentage-fill { /* User specific */
    height: 100%;
    background: linear-gradient(90deg, var(--primary-500), var(--primary-700));
    border-radius: 2px;
    transition: width 0.3s ease;
  }
  
  .data-table tr { /* User specific row height */
    height: 60px;
  }

/* Responsive Styles */
@media (max-width: 1200px) {
    .metrics-grid { /* Applies to user's 5-column grid */
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    }
  }
  
  @media (max-width: 768px) {
    .dashboard-wrapper { /* This class seems to be from a parent or global scope */
      padding: 1rem;
    }
    
    .page-title { /* From user's header section */
      font-size: 2rem;
    }
    
    .toolbar-content { /* Affects user's toolbar */
      flex-direction: column;
      align-items: stretch;
    }
    
    .controls-section { /* User's toolbar controls */
      justify-content: center;
    }
    
    .control-group { /* User's toolbar control group */
      flex: 1;
      min-width: 200px;
    }
    
    .metrics-grid { /* User's metrics grid */
      grid-template-columns: 1fr; /* Stack metrics on smaller screens */
    }
    
    .chart-header { /* User's chart header */
      flex-direction: column;
      align-items: stretch;
    }
    
    .chart-legends { /* User's chart legends */
      justify-content: center;
    }
    
    .chart-container { /* User's chart container */
      height: 300px;
    }
  }
  
  @media (max-width: 480px) {
    .page-title {
      font-size: 1.5rem;
      flex-direction: column;
      gap: 0.5rem;
    }
    
    .header-content { /* From user's header section */
      padding: 1.5rem;
    }
    
    .toolbar-content {
      padding: 1rem;
    }
    
    .metric-card { /* Affects user's metric cards */
      padding: 1rem;
    }
    
    .chart-container {
      height: 250px;
      padding: 0.5rem;
    }
  }

/* Print Styles */
@media print {
    .dashboard-wrapper { /* Global/parent class */
      background: white;
      padding: 0;
    }
    
    /* Hide toolbar and original page header when printing */
    .page-header, 
    .toolbar-card,
    .download-button-container /* Hide new download button too */ {
      display: none;
    }
    
    .metric-card,
    .chart-card,
    .table-card { /* Styling for cards in print mode */
      box-shadow: none;
      border: 1px solid var(--gray-300);
      break-inside: avoid;
      margin-bottom: 1rem;
    }
    
    .chart-container { /* Adjust chart height for print */
      height: 300px; 
    }
  }

  /* Enhanced Hover Effects (from original user CSS, likely for other elements) */
  .summary-card:hover .summary-icon { /* .summary-card not in provided HTML */
    transform: scale(1.1);
    transition: transform 0.3s ease;
  }
  
  /* .print-report-button was the old button, new one is .print-button */
  /* .print-report-button:hover { 
    box-shadow: 0px 4px 12px rgba(16, 185, 129, 0.3);
  } */

  /* Accessibility Improvements (from original user CSS) */
  .dropdown-select:focus, /* .dropdown-select not in provided HTML */
  .print-button:focus, /* Applies to new button too */
  .retry-button:focus {
    outline: 2px solid var(--primary-500);
    outline-offset: 2px;
  }

  /* Enhanced Table Styling (from original user CSS, for .data-table) */
  .data-table tbody tr:nth-child(even) {
    background-color: rgba(249, 250, 251, 0.5); /* var(--gray-50) with alpha */
  }
  
  .data-table tbody tr:hover { /* This is .table-row:hover in user CSS */
    background-color: #f0f9ff; /* Lighter blue, distinct from var(--primary-50) */
    transform: scale(1.01); /* Subtle scale effect */
    transition: all 0.2s ease; /* Ensure this doesn't conflict with .table-row's transition */
  }

  /* Smooth Transitions (Global, from original user CSS - use with caution) */
  /* It's generally better to apply transitions to specific elements */
  /* * {
    transition: all 0.2s ease; 
  } */
</style>