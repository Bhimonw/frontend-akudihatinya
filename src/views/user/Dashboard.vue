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
              <span>{{ isDownloading ? 'Mengunduh...' : 'Unduh Laporan' }}</span>
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
              <p class="metric-subtitle">Target Population</p>
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
              <p class="metric-subtitle">Total Services</p>
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
              <h3 class="metric-title">% Capaian</h3>
              <p class="metric-value">{{ summaryCards.persenCapaianPelayanan || '0%' }}</p>
              <p class="metric-subtitle">Achievement Rate</p>
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
                    <th colspan="2" class="th-group">Jenis Kelamin</th>
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
  import {
    faDownload, faSpinner, faFileExcel, faFilePdf,
    faExclamationCircle, faSync
  } from '@fortawesome/free-solid-svg-icons';
  import { library } from '@fortawesome/fontawesome-svg-core';
  
  library.add(
    faDownload, faSpinner, faFileExcel, faFilePdf,
    faExclamationCircle, faSync
  );
  
  export default {
    name: "Dashboard",
    components: {
      FontAwesomeIcon,
    },
    data() {
      const currentYear = new Date().getFullYear();
      const startYear = 2020;
      const years = Array.from({ length: currentYear - startYear + 1 }, (_, i) => startYear + i).reverse();
      return {
        chartInstance: null,
        selectedYear: String(currentYear),
        years: years.filter((year) => year >= 2024 && year <= 2025), // Keeping existing year logic
        selectedProgram: "Diabetes Mellitus",
        programs: ["Diabetes Mellitus", "Hipertensi"],
        summaryCards: {},
        tableData: [], // This seems unused in the provided user dashboard logic for display, can be kept or removed if truly not used.
        data: {}, // This also seems unused directly for display, data is processed into specific structures.
        monthlyTableData: [],
        chartData: {},
        apiStatus: 'idle',
        error: null,
        isDownloading: false, // Added for download functionality
        showDownloadOptions: false, // Added for download dropdown
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
          const response = await apiClient.get("/statistics/dashboard-statistics", {
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
              this.chartInstance.data.datasets[0].data = [];
              this.chartInstance.data.datasets[1].data = [];
              this.chartInstance.update();
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
                this.chartInstance.data.datasets[0].data = this.chartData.lakiLaki;
                this.chartInstance.data.datasets[1].data = this.chartData.perempuan;
                this.chartInstance.update();
            }
            return;
        }
  
        const puskesmasData = apiData.data[0];
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
                this.chartInstance.data.datasets[0].data = this.chartData.lakiLaki;
                this.chartInstance.data.datasets[1].data = this.chartData.perempuan;
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
            persenCapaianPelayanan: (data.achievement_percentage !== undefined && data.achievement_percentage !== null ? parseFloat(data.achievement_percentage).toFixed(1) : '0') + "%"
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
                data: this.chartData.lakiLaki || Array(12).fill(0),
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
                data: this.chartData.perempuan || Array(12).fill(0),
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
      generateMonthlyTableData(monthlyData) {
          const monthNames = [
              'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
              'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
          ];
  
          if (!monthlyData || typeof monthlyData !== 'object') {  
              return monthNames.map(monthName => ({
                  name: monthName,
                  standard: 0,
                  nonStandard: 0,
                  percentage: 0,
                  male: 0,
                  female: 0
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
      },
      toggleDownloadOptions() {
        this.showDownloadOptions = !this.showDownloadOptions;
      },
      async triggerDownload(format) {
        if (this.isDownloading) return;
        this.isDownloading = true;
        this.showDownloadOptions = false;
        this.error = null; // Clear previous errors
  
        const programType = this.selectedProgram === "Hipertensi" ? "ht" : "dm";
        // IMPORTANT: Replace '/statistics/user/export' with your actual user-specific export API endpoint
        const apiUrl = `/statistics/user/export`; 
  
        try {
          const response = await apiClient.get(apiUrl, {
            params: { 
              year: this.selectedYear, 
              type: programType, 
              format: format, 
            },
            responseType: 'blob', // Important for file download
          });
  
          const blob = new Blob([response.data], { type: response.headers['content-type'] });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          
          const programNameSanitized = this.selectedProgram.toLowerCase().replace(/\s+/g, '_');
          const fileName = `laporan_puskesmas_${programNameSanitized}_${this.selectedYear}.${format === 'excel' ? 'xlsx' : 'pdf'}`;
          
          link.setAttribute('download', fileName);
          document.body.appendChild(link);
          link.click();
          
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
  
        } catch (err) {
          console.error('Error downloading user report:', err);
          let message = `Gagal mengunduh laporan ${format.toUpperCase()}. `;
          if (err.response && err.response.data) {
              if (err.response.data instanceof Blob && err.response.data.type === "application/json") {
                  // Try to parse blob error as JSON
                  try {
                      const errorJson = JSON.parse(await err.response.data.text());
                      message += errorJson.message || err.message || 'Error tidak diketahui.';
                  } catch (parseError) {
                      message += err.message || 'Error tidak diketahui dan detail error tidak bisa dibaca.';
                  }
              } else if (err.response.data.message) {
                   message += err.response.data.message;
              } else {
                   message += err.message || 'Error tidak diketahui.';
              }
          } else {
              message += err.message || 'Error tidak diketahui.';
          }
          this.error = message;
          if (this.$toast && typeof this.$toast.error === 'function') {
              this.$toast.error(this.error);
          }
        } finally {
          this.isDownloading = false;
        }
      }
    },
  };
  </script>
  
<style scoped>
.top-loading-bar {
    position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background-color: var(--primary-100, #d1fae5);
  z-index: 9999;
  overflow: hidden;
}
  
.loading-bar-progress {
  width: 100%;
  height: 100%;
  background: var(--primary-500, #10b981);
  animation: indeterminate-progress 2s infinite linear;
  transform-origin: left;
}
  
@keyframes indeterminate-progress {
  0% { transform: translateX(-100%) scaleX(0.5); }
  50% { transform: translateX(0%) scaleX(1); }
  100% { transform: translateX(100%) scaleX(0.5); }
}
  
.dashboard-content {
  opacity: 1;
  transition: opacity 0.5s ease;
  max-width: 1400px;
  margin: 0 auto;
  animation: fadeInUp 0.6s ease-out;
}
  
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}
  
.error-message {
  background-color: var(--error-50, #fef2f2);
  border: 1px solid var(--error-200, #fecaca);
  color: var(--error-700, #b91c1c);
  padding: 1rem;
  border-radius: var(--radius-lg, 0.75rem);
  margin: 1rem auto;
  max-width: 800px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  box-shadow: var(--shadow-md);
}
.error-message .svg-inline--fa.fa-exclamation-circle { /* Target FontAwesome icon */
  margin-right: 8px;
}
.retry-button {
  background-color: var(--error-500, #ef4444);
  color: white;
  border: none;
  border-radius: var(--radius-md, 0.5rem);
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background-color 0.2s ease, transform 0.2s ease;
}
.retry-button:hover {
  background-color: var(--error-600, #dc2626);
  transform: translateY(-1px);
}
.retry-button .svg-inline--fa.fa-sync { /* Target FontAwesome icon */
    /* Add animation if needed, or keep as is */
  }
  
  
body { /* Styles from user - kept for context but might be global */
  background: linear-gradient(135deg, var(--primary-500), var(--primary-700) 100%);
  min-height: 100vh;
  box-sizing: border-box;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
  
  /* Toolbar (existing user styles) */
.toolbar-card {
  background: white;
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  margin-bottom: 2rem;
  overflow: hidden;
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
  .label-icon { font-size: 1rem; }
  .select-wrapper { position: relative; min-width: 200px; }
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
  /* Custom arrow for select to match admin if needed, or keep user's existing */
  background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%236B7280' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  padding-right: 2.5rem; /* Make space for the arrow */
}
.modern-select:focus {
  outline: none;
  border-color: var(--primary-500);
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1); /* Adjusted to user's primary color */
}
.select-arrow { /* This can be hidden if using background-image on select */
  display:none;
}
  
  /* Print button and new Download Button Styles */
.print-button { /* User's existing print button, adapted for new download behavior */
  background: linear-gradient(135deg, var(--primary-500), var(--primary-600));
  color: white;
  border: none;
  border-radius: var(--radius-lg); /* User's radius-lg */
  padding: 0.75rem 1.5rem; /* User's padding */
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.625rem; /* Adjusted gap from admin */
  position: relative;
  overflow: hidden;
  transition: all 0.2s ease-out; /* Matched from admin */
  box-shadow: var(--shadow-sm); /* Added from admin for consistency */
}
  .print-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px -3px rgba(16, 185, 129, 0.3), 0 4px 8px -4px rgba(16, 185, 129, 0.2); /* Adjusted shadow color to user's primary */
  }
  .button-icon {
      font-size: 1.125rem; /* Matched from admin */
  }
.button-shine { /* Kept user's shine, admin's was more complex, this is simpler */
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}
.print-button:hover .button-shine {
left: 100%;
}
.print-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: translateY(0);
  box-shadow: var(--shadow-sm);
}
.print-button:disabled:hover .button-shine {
  opacity: 0;
}
  
.download-button-container {
  position: relative;
  display: inline-block;
}
  
.download-options {
  position: absolute;
  top: 100%; 
  right: 0; 
  background-color: white;
  border-radius: var(--radius-md, 0.5rem); /* User's radius-md */
  box-shadow: var(--shadow-lg); /* User's shadow-lg */
  border: 1px solid var(--gray-200, #e5e7eb);
  z-index: 100; 
  min-width: 180px; 
  margin-top: 0.5rem; 
  overflow: hidden; 
  animation: fadeInScaleUp 0.2s ease-out;
}
  
@keyframes fadeInScaleUp {
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
  color: var(--gray-700, #374151);
  transition: background-color 0.15s ease, color 0.15s ease;
}
.download-option .svg-inline--fa {
  width: 1em;
  height: 1em;
  color: var(--gray-500); 
  transition: color 0.15s ease;
}
.download-option:hover {
  background-color: var(--primary-50, #ecfdf5); /* User's primary-50 */
  color: var(--primary-600, #059669); /* User's primary-600 */
}
.download-option:hover .svg-inline--fa {
  color: var(--primary-500, #10b981); /* User's primary-500 */
}
.download-option:not(:last-child) {
  border-bottom: 1px solid var(--gray-100, #f3f4f6);
}


/* Metrics Section (Existing user styles) */
.metrics-section { margin-bottom: 2rem; }
.section-title {
  font-size: 1.5rem; font-weight: 700; color: black; /* Assuming black from user context */
  margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;
}
  /* .title-accent defined under .table-title in user CSS, using that */
.metrics-grid {
  display: grid; grid-template-columns: repeat(5, 1fr); /* User's 5 column grid */
  gap: 1.5rem;
}
.metric-card {
  background: white; border-radius: var(--radius-xl); padding: 1.5rem;
  box-shadow: var(--shadow-lg); transition: all 0.3s; position: relative; overflow: hidden;
}
.metric-card::before { /* User's existing top border style */
  content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px;
  background: linear-gradient(135deg, var(--primary-500), var(--primary-600));
}
.metric-card.success::before { background: linear-gradient(135deg, var(--success-500), var(--success-600)); }
.metric-card.warning::before { background: linear-gradient(135deg, var(--warning-500), var(--warning-600)); }
.metric-card.info::before { background: linear-gradient(135deg, #06b6d4, #0891b2); }
.metric-card.accent::before { background: linear-gradient(135deg, var(--accent-500, #8b5cf6), var(--accent-600, #7c3aed)); } /* User's accent */
.metric-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-xl); }
.metric-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
.metric-icon {
  width: 48px; height: 48px; border-radius: var(--radius-lg);
  display: flex; align-items: center; justify-content: center;
  background: var(--primary-50); color: var(--primary-500);
}
.metric-title {
  font-size: 0.875rem; font-weight: 600; color: var(--gray-600);
  margin: 0 0 0.5rem 0;
}
.metric-value {
  font-size: 2rem; font-weight: 700; color: var(--gray-900);
  margin: 0 0 0.25rem 0;
}
.metric-subtitle {
  font-size: 0.75rem; color: var(--gray-500); margin: 0; font-weight: 500;
}
  
  /* Charts Section (Existing user styles) */
.charts-section { margin-bottom: 2rem; }
.chart-card {
  background: white; border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg); overflow: hidden;
}
.chart-header {
  padding: 1.5rem 1.5rem 1rem 1.5rem; border-bottom: 1px solid var(--gray-100);
  display: flex; justify-content: space-between; align-items: flex-start;
  flex-wrap: wrap; gap: 1rem;
}
.chart-title-section { flex-grow: 1; }
.chart-title { /* User's definition of .title-accent is under table-title, using that idea */
  font-size: 1.25rem; font-weight: 700; color: var(--gray-900);
  margin: 0 0 0.25rem 0; display: flex; align-items: center; gap: 0.5rem;
}
.chart-title .title-accent { /* Copied from table-title .title-accent in user CSS */
  width: 4px;
  height: 1.5rem;
  background: linear-gradient(135deg, var(--primary-500));
  border-radius: 2px;
}
.chart-subtitle { font-size: 0.875rem; color: var(--gray-500); margin: 0; }
.chart-legends { display: flex; gap: 1.5rem; }
.legend-item {
  display: flex; align-items: center; gap: 0.5rem;
  font-size: 0.875rem; font-weight: 500;
}
.legend-item.male { color: var(--primary-600); } /* User's primary color */
.legend-item.female { color: #EC4899; } /* Standard female color */
.legend-dot { width: 12px; height: 12px; border-radius: 50%; }
.legend-item.male .legend-dot { background: var(--primary-500); }
.legend-item.female .legend-dot { background: #EC4899; }
.chart-container { padding: 1rem 1.5rem 1.5rem 1.5rem; height: 400px; }
  
  /* Table Section (Existing user styles) */
.table-section { margin-bottom: 2rem; }
.table-card {
  background: white; border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg); overflow: hidden; padding: 20px;
}
.table-header { /* This one seems to have padding: 1.5rem 1.5rem 1rem 1.5rem; in user CSS */
  padding: 1.5rem 1.5rem 1rem 1.5rem; /* Keeping user's table-header padding */
  border-bottom: 1px solid var(--gray-100);
}
.table-title-section { text-align: left; }
.table-title {
  font-size: 1.25rem; font-weight: 700; color: var(--gray-900);
  margin: 0 0 0.25rem 0; display: flex; align-items: center; gap: 0.5rem;
}
.table-title .title-accent { /* User's definition of .title-accent */
    width: 4px;
    height: 1.5rem;
    background: linear-gradient(135deg, var(--primary-500));
    border-radius: 2px;
}
.table-subtitle { font-size: 0.875rem; color: var(--gray-500); margin: 0; }
.table-container {
  overflow-x: auto; box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
}
.data-table {
  width: 100%; border-collapse: separate; border-spacing: 0;
  font-family: "Inter", sans-serif; font-size: 14px; color: #333333;
  background: #ffffff; border-radius: 10px; overflow: hidden;
}
.data-table thead th {
  background: #f3f4f6; color: #333333; font-weight: 600;
  text-align: center; padding: 16px; border-bottom: 1px solid #e5e7eb;
}
.th-month {
  background: #f3f4f6; color: #333333; font-weight: 600;
  text-align: center; padding: 16px; border-bottom: 1px solid #e5e7eb;
  border-right: 1px solid #e5e7eb; vertical-align: middle;
}
.th-group { border-left: 1px solid #e5e7eb; border-right: 1px solid #e5e7eb; }
.th-sub {
  background: #f9fafb; font-size: 12px; font-weight: 600; padding: 12px;
}
.table-row:hover { background: #f9fafb; transition: background-color 0.3s ease; }
.month-name {
  font-weight: 600; text-align: center; padding: 20px;
  background: #f9fafb; border-bottom: 1px solid #e5e7eb;
}
.data-cell {
  text-align: center; padding: 20px; border-bottom: 1px solid #e5e7eb;
}
.percentage-value { display: block; margin-bottom: 4px; font-weight: 500; }
.percentage-bar {
  width: 60px; height: 4px; background: #e5e7eb;
  border-radius: 2px; overflow: hidden; margin: 0 auto;
}
.percentage-fill {
  height: 100%; background: linear-gradient(90deg, var(--primary-500), var(--primary-700));
  border-radius: 2px; transition: width 0.3s ease;
}
.data-table tr { height: 60px; }

/* Responsive Styles (Existing user styles) */
@media (max-width: 1200px) {
    .metrics-grid { grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); }
}
@media (max-width: 768px) {
    /* .dashboard-wrapper is not in the provided template, assuming .dashboard-content */
  .dashboard-content { padding: 1rem; }
    .page-title { font-size: 2rem; } /* .page-title is not in the template, but kept if used elsewhere */
    .toolbar-content { flex-direction: column; align-items: stretch; }
    .controls-section { justify-content: center; }
    .control-group { flex: 1; min-width: 200px; }
    .metrics-grid { grid-template-columns: 1fr; } /* Overrides 5-column for smaller screens */
    .chart-header { flex-direction: column; align-items: stretch; }
    .chart-legends { justify-content: center; }
    .chart-container { height: 300px; }
}
@media (max-width: 480px) {
    .page-title { font-size: 1.5rem; flex-direction: column; gap: 0.5rem; }
    /* .header-content is not in the template */
    .toolbar-content { padding: 1rem; }
  .download-button-container { width: 100%; }
  .print-button { width: 100%; justify-content: center;}
    .metric-card { padding: 1rem; }
    .metrics-grid { grid-template-columns: 1fr; } /* Explicitly 1 column */
    .chart-container { height: 250px; padding: 0.5rem; }
}

/* Print Styles (Existing user styles, slightly adapted for clarity) */
@media print {
  body { /* Basic print reset from user styles */
      background: white !important; /* Important to override screen styles */
      padding: 0 !important;
      color: black !important; /* Ensure text is black */
  }
  .dashboard-content {
      animation: none !important;
      max-width: none !important;
      padding: 0 !important; margin: 0 !important;
  }
  .page-header, .toolbar-card, .error-message /* Hide toolbar and errors on print */ {
      display: none !important;
  }
  .metrics-section, .charts-section, .table-section {
    page-break-inside: avoid;
    margin-bottom: 1rem !important; /* Add some space between printed sections */
  }
  .metric-card, .chart-card, .table-card {
    box-shadow: none !important;
    border: 1px solid var(--gray-300, #d1d5db) !important; /* Light border for print */
    break-inside: avoid;
    margin-bottom: 1rem !important;
    padding: 0.5cm !important; /* Add some padding for print */
    border-radius: 0 !important;
    overflow: visible !important;
  }
  .metric-card::before { display: none !important; } /* Hide decorative borders */
  .chart-container {
    height: auto !important; /* Let chart take needed height */
    max-height: 250px; /* But cap it */
    padding: 0 !important;
  }
  .table-container {
    overflow-x: visible !important;
    box-shadow: none !important;
    border-radius: 0 !important;
  }
  .data-table {
    font-size: 9pt !important; /* Smaller font for print */
    border-collapse: collapse !important;
  }
  .data-table th, .data-table td {
    border: 1px solid #ccc !important;
    padding: 4px 6px !important;
    white-space: normal !important; /* Allow wrapping */
    background-color: white !important;
    color: black !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .data-table thead th {
    background-color: #f0f0f0 !important;
  }
  .title-accent { display: none !important; }
  }
  
  /* Enhanced Hover Effects (from user styles) */
  .summary-card:hover .summary-icon { /* .summary-card and .summary-icon are not in template */
    transform: scale(1.1);
    transition: transform 0.3s ease;
  }
  .print-report-button:hover { /* This class is not used, .print-button is used */
    box-shadow: 0px 4px 12px rgba(16, 185, 129, 0.3);
  }
  
  /* Accessibility Improvements (from user styles) */
  .modern-select:focus, /* Changed from .dropdown-select */
  .print-button:focus, /* Changed from .print-report-button */
  .retry-button:focus {
    outline: 2px solid var(--primary-500);
    outline-offset: 2px;
  }
  
  /* Enhanced Table Styling (from user styles) */
  .data-table tbody tr:nth-child(even) {
    background-color: rgba(249, 250, 251, 0.5);
  }
  .data-table tbody tr:hover { /* This conflicts with .table-row:hover, be mindful */
    background-color: #f0f9ff; /* User specific hover for table rows */
    transform: scale(1.01); /* This might be too much for a table row */
    transition: all 0.2s ease;
  }
  
  /* Smooth Transitions (from user styles - applied globally, can be risky) */
  /* * {
      transition: all 0.2s ease;
  } */ 
  /* It's better to apply transitions to specific elements or classes */
  .modern-select, .print-button, .metric-card, .download-option, .retry-button {
      transition: all 0.2s ease-out; /* Apply transition more selectively */
  }
  
  </style>