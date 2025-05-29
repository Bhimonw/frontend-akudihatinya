<template>
  <LoadingPage 
    v-if="isLoading" 
    :apiStatus="apiStatus" 
    @loading-complete="onLoadingComplete" 
    @loading-error="onLoadingError" 
  />
  
  <div v-show="!isLoading" class="dashboard-content">
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

        <button class="print-button" @click="printReport">
          <span class="button-icon">🖨️</span>
          <span>Print Laporan</span>
          <div class="button-shine"></div>
        </button>
      </div>
    </div>

    <div v-if="error" class="error-message">
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

    <div class="overview-section">
      <div class="overview-card">
        <div class="overview-header">
          <h2 class="overview-title">
            <span class="title-accent"></span>
            Ranking Puskesmas
          </h2>
          <p class="overview-subtitle">Berdasarkan persentase capaian</p>
        </div>
        <div class="overview-list">
          <div v-for="(item) in puskesmasRanking" :key="item.puskesmas_name" class="overview-item">
            <div class="item-number">{{ item.ranking }}</div>
            <div class="item-details">
              <span class="item-name">{{ item.puskesmas_name }}</span>
              <span class="item-value">{{ item.achievement_percentage !== null ? item.achievement_percentage.toFixed(2) : '-' }}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="table-section">
      <div class="table-card-enhanced">
        <div class="table-header-enhanced">
          <div class="table-title-section">
            <h2 class="table-title">
              <span class="title-accent"></span>
              Rekap Data {{ selectedProgram }}
            </h2>
            <p class="table-subtitle">Data detail per bulan untuk tahun {{ selectedYear }}</p>
          </div>
           <div class="view-toggle-tabs">
            <button 
              @click="tableViewMode = 'detailed'" 
              :class="{ active: tableViewMode === 'detailed' }">
              <font-awesome-icon :icon="['fas', 'table-list']" /> Detailed
            </button>
            <button 
              @click="tableViewMode = 'monthly'" 
              :class="{ active: tableViewMode === 'monthly' }">
              <font-awesome-icon :icon="['fas', 'calendar-days']" /> Monthly
            </button>
            <button 
              @click="tableViewMode = 'quarterly'" 
              :class="{ active: tableViewMode === 'quarterly' }">
              <font-awesome-icon :icon="['fas', 'calendar-week']" /> Quarterly
            </button>
          </div>
        </div>
        <div class="table-container-enhanced">
          <table class="data-table-enhanced">
            <template v-if="tableViewMode === 'detailed'">
              <thead>
                <tr class="header-row-1">
                  <th rowspan="3" class="sticky-col sticky-col-no">NO</th>
                  <th rowspan="3" class="sticky-col sticky-col-puskesmas">NAMA PUSKESMAS</th>
                  <th rowspan="3" class="sasaran-header">SASARAN</th>
                  <th colspan="12" class="quarter-group-header">TRIWULAN I</th>
                  <th colspan="12" class="quarter-group-header">TRIWULAN II</th>
                  <th colspan="12" class="quarter-group-header">TRIWULAN III</th>
                  <th colspan="12" class="quarter-group-header">TRIWULAN IV</th>
                  <th colspan="3" rowspan="2" class="year-total-header">TOTAL CAPAIAN TAHUN {{ selectedYear }}</th>
                  <th rowspan="3" class="overall-achievement-header">% CAPAIAN PELAYANAN SESUAI STANDAR</th>
                </tr>
                <tr class="header-row-2">
                  <th colspan="3" class="month-header">JANUARI</th>
                  <th colspan="3" class="month-header">FEBRUARI</th>
                  <th colspan="3" class="month-header">MARET</th>
                  <th colspan="3" class="tw-total-header">TOTAL TW I</th>
                  <th colspan="3" class="month-header">APRIL</th>
                  <th colspan="3" class="month-header">MEI</th>
                  <th colspan="3" class="month-header">JUNI</th>
                  <th colspan="3" class="tw-total-header">TOTAL TW II</th>
                  <th colspan="3" class="month-header">JULI</th>
                  <th colspan="3" class="month-header">AGUSTUS</th>
                  <th colspan="3" class="month-header">SEPTEMBER</th>
                  <th colspan="3" class="tw-total-header">TOTAL TW III</th>
                  <th colspan="3" class="month-header">OKTOBER</th>
                  <th colspan="3" class="month-header">NOVEMBER</th>
                  <th colspan="3" class="month-header">DESEMBER</th>
                  <th colspan="3" class="tw-total-header">TOTAL TW IV</th>
                </tr>
                <tr class="header-row-3">
                  <template v-for="q_idx in 4" :key="`q${q_idx}`">
                    <template v-for="m_idx in 3" :key="`q${q_idx}m${m_idx}`">
                      <th class="sub-header">S</th><th class="sub-header">TS</th><th class="sub-header percent-col">%</th>
                    </template>
                    <th class="sub-header total-col">S</th><th class="sub-header total-col">TS</th><th class="sub-header total-col percent-col">%</th>
                  </template>
                  <th class="sub-header total-col">S</th><th class="sub-header total-col">TS</th><th class="sub-header total-col percent-col">%</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(puskesmas, index) in processedTableData" :key="puskesmas.puskesmas_name">
                  <td class="sticky-col sticky-col-no">{{ index + 1 }}</td>
                  <td class="sticky-col sticky-col-puskesmas puskesmas-name-cell">{{ puskesmas.puskesmas_name }}</td>
                  <td class="data-cell sasaran-cell">{{ puskesmas.sasaran }}</td>
                  <template v-for="quarter in puskesmas.quarters" :key="quarter.id">
                    <template v-for="monthData in quarter.months_detail" :key="monthData.id">
                      <td class="data-cell">{{ monthData.s }}</td>
                      <td class="data-cell">{{ monthData.ts }}</td>
                      <td class="data-cell percent-col" :data-value="getPercentageClass(monthData.percent)">{{ monthData.percent !== null ? monthData.percent.toFixed(1) : '-' }}</td>
                    </template>
                    <td class="data-cell total-col">{{ quarter.total_s }}</td>
                    <td class="data-cell total-col">{{ quarter.total_ts }}</td>
                    <td class="data-cell total-col percent-col" :data-value="getPercentageClass(quarter.total_percent)">{{ quarter.total_percent !== null ? quarter.total_percent.toFixed(1) : '-' }}</td>
                  </template>
                  <td class="data-cell total-col">{{ puskesmas.year_total_s }}</td>
                  <td class="data-cell total-col">{{ puskesmas.year_total_ts }}</td>
                  <td class="data-cell total-col percent-col" :data-value="getPercentageClass(puskesmas.year_total_percent)">{{ puskesmas.year_total_percent !== null ? puskesmas.year_total_percent.toFixed(1) : '-' }}</td>
                  <td class="data-cell overall-achievement-cell percent-col" :data-value="getPercentageClass(puskesmas.overall_achievement_percentage)">{{ puskesmas.overall_achievement_percentage !== null ? puskesmas.overall_achievement_percentage.toFixed(1) : '-' }}</td>
                </tr>
                 <tr v-if="!processedTableData.length">
                    <td :colspan="3 + (4*3*3) + (4*3) + 3 + 1" class="no-data-cell">Tidak ada data untuk ditampilkan.</td>
                </tr>
              </tbody>
            </template>

            <template v-if="tableViewMode === 'monthly'">
              <thead>
                <tr>
                  <th rowspan="2" class="sticky-col sticky-col-no">NO</th>
                  <th rowspan="2" class="sticky-col sticky-col-puskesmas">NAMA PUSKESMAS</th>
                  <th rowspan="2" class="sasaran-header">SASARAN</th>
                  <th v-for="month in monthNames" :key="`header-month-${month}`" colspan="3" class="month-header">{{ month.toUpperCase() }}</th>
                  <th colspan="3" class="year-total-header">TOTAL CAPAIAN TAHUN {{ selectedYear }}</th>
                  <th rowspan="2" class="overall-achievement-header">% CAPAIAN PELAYANAN SESUAI STANDAR</th>
                </tr>
                <tr>
                  <template v-for="i in 12" :key="`sub-month-${i}`">
                     <th class="sub-header">S</th><th class="sub-header">TS</th><th class="sub-header percent-col">%</th>
                  </template>
                  <th class="sub-header total-col">S</th><th class="sub-header total-col">TS</th><th class="sub-header total-col percent-col">%</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(puskesmas, index) in processedTableData" :key="puskesmas.puskesmas_name">
                  <td class="sticky-col sticky-col-no">{{ index + 1 }}</td>
                  <td class="sticky-col sticky-col-puskesmas puskesmas-name-cell">{{ puskesmas.puskesmas_name }}</td>
                  <td class="data-cell sasaran-cell">{{ puskesmas.sasaran }}</td>
                  <template v-for="monthData in puskesmas.months" :key="monthData.id">
                    <td class="data-cell">{{ monthData.s }}</td>
                    <td class="data-cell">{{ monthData.ts }}</td>
                    <td class="data-cell percent-col" :data-value="getPercentageClass(monthData.percent)">{{ monthData.percent !== null ? monthData.percent.toFixed(1) : '-' }}</td>
                  </template>
                  <td class="data-cell total-col">{{ puskesmas.year_total_s }}</td>
                  <td class="data-cell total-col">{{ puskesmas.year_total_ts }}</td>
                    <td class="data-cell total-col percent-col" :data-value="getPercentageClass(puskesmas.year_total_percent)">{{ puskesmas.year_total_percent !== null ? puskesmas.year_total_percent.toFixed(1) : '-' }}</td>
                  <td class="data-cell overall-achievement-cell percent-col" :data-value="getPercentageClass(puskesmas.overall_achievement_percentage)">{{ puskesmas.overall_achievement_percentage !== null ? puskesmas.overall_achievement_percentage.toFixed(1) : '-' }}</td>
                </tr>
                 <tr v-if="!processedTableData.length">
                    <td :colspan="3 + (12*3) + 3 + 1" class="no-data-cell">Tidak ada data untuk ditampilkan.</td>
                </tr>
              </tbody>
            </template>

            <template v-if="tableViewMode === 'quarterly'">
                <thead>
                <tr>
                  <th rowspan="2" class="sticky-col sticky-col-no">NO</th>
                  <th rowspan="2" class="sticky-col sticky-col-puskesmas">NAMA PUSKESMAS</th>
                  <th rowspan="2" class="sasaran-header">SASARAN</th>
                  <th colspan="3" class="quarter-group-header">TRIWULAN I</th>
                  <th colspan="3" class="quarter-group-header">TRIWULAN II</th>
                  <th colspan="3" class="quarter-group-header">TRIWULAN III</th>
                  <th colspan="3" class="quarter-group-header">TRIWULAN IV</th>
                  <th colspan="3" class="year-total-header">TOTAL CAPAIAN TAHUN {{ selectedYear }}</th>
                  <th rowspan="2" class="overall-achievement-header">% CAPAIAN PELAYANAN SESUAI STANDAR</th>
                </tr>
                 <tr>
                  <template v-for="i in 4" :key="`sub-quarter-${i}`">
                     <th class="sub-header total-col">S</th><th class="sub-header total-col">TS</th><th class="sub-header total-col percent-col">%</th>
                  </template>
                  <th class="sub-header total-col">S</th><th class="sub-header total-col">TS</th><th class="sub-header total-col percent-col">%</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(puskesmas, index) in processedTableData" :key="puskesmas.puskesmas_name">
                  <td class="sticky-col sticky-col-no">{{ index + 1 }}</td>
                  <td class="sticky-col sticky-col-puskesmas puskesmas-name-cell">{{ puskesmas.puskesmas_name }}</td>
                  <td class="data-cell sasaran-cell">{{ puskesmas.sasaran }}</td>
                  <template v-for="quarterData in puskesmas.quarters" :key="quarterData.id">
                    <td class="data-cell total-col">{{ quarterData.total_s }}</td>
                    <td class="data-cell total-col">{{ quarterData.total_ts }}</td>
                    <td class="data-cell total-col percent-col" :data-value="getPercentageClass(quarterData.total_percent)">{{ quarterData.total_percent !== null ? quarterData.total_percent.toFixed(1) : '-' }}</td>
                  </template>
                  <td class="data-cell total-col">{{ puskesmas.year_total_s }}</td>
                  <td class="data-cell total-col">{{ puskesmas.year_total_ts }}</td>
                  <td class="data-cell total-col percent-col" :data-value="getPercentageClass(puskesmas.year_total_percent)">{{ puskesmas.year_total_percent !== null ? puskesmas.year_total_percent.toFixed(1) : '-' }}</td>
                  <td class="data-cell overall-achievement-cell percent-col" :data-value="getPercentageClass(puskesmas.overall_achievement_percentage)">{{ puskesmas.overall_achievement_percentage !== null ? puskesmas.overall_achievement_percentage.toFixed(1) : '-' }}</td>
                </tr>
                 <tr v-if="!processedTableData.length">
                    <td :colspan="3 + (4*3) + 3 + 1" class="no-data-cell">Tidak ada data untuk ditampilkan.</td>
                </tr>
              </tbody>
            </template>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// Script Anda sudah baik, tidak ada perubahan signifikan yang diperlukan di sini
// Pastikan FontAwesomeIcon diimport dan didaftarkan jika belum global
// import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
// import { faTableList, faCalendarDays, faCalendarWeek, faExclamationCircle, faSync } from '@fortawesome/free-solid-svg-icons';
// import { library } from '@fortawesome/fontawesome-svg-core';
// library.add(faTableList, faCalendarDays, faCalendarWeek, faExclamationCircle, faSync);

import { Chart } from "chart.js/auto";
import apiClient from "../../api.js"; // Pastikan path ini benar
import LoadingPage from "../../components/LoadingPage.vue"; // Pastikan path ini benar

export default {
  name: "Dashboard",
  components: {
    LoadingPage,
    // FontAwesomeIcon, // Daftarkan jika diimport lokal
  },
  data() {
    const currentYear = new Date().getFullYear();
    // Adjust year range if needed, example: last 5 years up to current year
    const startYear = currentYear - 4; // Example: 2020 if currentYear is 2024
    const years = Array.from({ length: currentYear - startYear + 1 }, (_, i) => startYear + i).reverse();
    
    return {
      chartInstance: null,
      selectedYear: String(currentYear),
      // years: years, // Use all generated years or filter as before
      years: years.filter((year) => year >= 2024 && year <= 2025), // Menggunakan filter tahun yang sudah ada
      selectedProgram: "Diabetes Mellitus",
      programs: ["Diabetes Mellitus", "Hipertensi"],
      summaryCards: {},
      processedTableData: [],
      puskesmasRanking: [],
      chartData: { lakiLaki: [], perempuan: [] }, // Initialize with empty arrays
      isLoading: true,
      apiStatus: 'idle', // 'idle', 'loading', 'success', 'error'
      error: null,
      tableViewMode: 'detailed', // 'detailed', 'monthly', 'quarterly'
      monthNames: ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"], // Adjusted month names
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
      this.isLoading = false;
      // Error already set in fetchData, can add more specific UI feedback here if needed
    },
    updateData() {
      this.fetchData();
    },
    async fetchData() {
      this.error = null;
      this.apiStatus = 'loading';
      this.isLoading = true; 
      
      try {
        const type = this.selectedProgram === "Hipertensi" ? "ht" : "dm";
        const response = await apiClient.get("/statistics/admin", {
          params: {
            year: this.selectedYear,
            type: type
          }
        });
        
        if (response.data) {
            this.processApiData(response.data);
            this.apiStatus = 'success';
        } else {
            throw new Error("Data tidak ditemukan dari API");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        this.error = `Gagal memuat data: ${error.message || "Silakan coba lagi nanti."}`;
        this.apiStatus = 'error';
        this.processedTableData = [];
        this.puskesmasRanking = [];
        this.summaryCards = {};
        this.chartData = { lakiLaki: [], perempuan: [] };
      } finally {
          // Add a slight delay to show loading spinner, then render chart
          setTimeout(() => {
            this.isLoading = false;
            this.$nextTick(() => {
                // Ensure chart container is visible and data is available
                if (this.apiStatus === 'success' && 
                    this.chartData.lakiLaki && this.chartData.lakiLaki.length > 0 &&
                    this.chartData.perempuan && this.chartData.perempuan.length > 0 &&
                    document.getElementById("chart")) {
                this.renderChart();
                } else if (this.apiStatus === 'success' && document.getElementById("chart")) {
                    // If chart data might be empty but still want to render an empty chart
                    this.renderChart(); 
                }
            });
          }, 300); // Delay can be adjusted or removed
      }
    },
    processApiData(apiData) {
      if (!apiData || !apiData.summary) {
        this.error = "Format data tidak sesuai atau data ringkasan tidak tersedia.";
        this.processedTableData = [];
        this.puskesmasRanking = [];
        this.summaryCards = {};
        this.chartData = { lakiLaki: [], perempuan: [] };
        this.apiStatus = 'error'; // Should be set if data is invalid
        return;
      }
      
      const dataTypeKey = this.selectedProgram === "Hipertensi" ? "ht" : "dm";
      const summaryData = apiData.summary[dataTypeKey.toLowerCase()];
      
      if (!summaryData) {
        this.error = `Data ringkasan untuk ${this.selectedProgram} tidak ditemukan.`;
        this.processedTableData = [];
        this.puskesmasRanking = [];
        this.summaryCards = {};
        this.chartData = { lakiLaki: [], perempuan: [] };
        this.apiStatus = 'error';
        return;
      }
      
      this.summaryCards = {
        sasaran: summaryData.target || 0,
        capaianStandar: summaryData.standard_patients || 0,
        capaianTidakStandar: summaryData.non_standard_patients || 0,
        totalPelayanan: summaryData.total_patients || 0,
        persenCapaianPelayanan: summaryData.achievement_percentage !== null && summaryData.achievement_percentage !== undefined 
                                ? summaryData.achievement_percentage.toFixed(1) + "%" 
                                : "0%"
      };
      
      this.puskesmasRanking = (apiData.data || [])
        .map(item => ({
          puskesmas_name: item.puskesmas_name,
          achievement_percentage: item[dataTypeKey.toLowerCase()]?.achievement_percentage,
          ranking: item.ranking // Make sure 'ranking' is provided by API or calculate if needed
        }))
        .sort((a, b) => (a.ranking || Infinity) - (b.ranking || Infinity)); // Handle potential null/undefined ranking

      this.processedTableData = (apiData.data || []).map((item, index) => {
        const puskesmasProgramData = item[dataTypeKey.toLowerCase()];
        // if (!puskesmasProgramData) return null; // Skip if no data for this program type

        const monthlyStats = [];
        for (let i = 1; i <= 12; i++) {
          const monthKey = String(i);
          const monthData = puskesmasProgramData?.monthly_data ? puskesmasProgramData.monthly_data[monthKey] : null;
          monthlyStats.push({
            id: `${item.puskesmas_name}-m${i}`, // Unique key for v-for
            s: monthData?.standard || 0,
            ts: monthData?.non_standard || 0,
            percent: monthData?.percentage !== undefined && monthData?.percentage !== null ? parseFloat(monthData.percentage) : null,
          });
        }

        const quarterlyStats = [];
        for (let q = 0; q < 4; q++) {
          const startMonthIndex = q * 3;
          const qMonthsData = monthlyStats.slice(startMonthIndex, startMonthIndex + 3);
          
          const qTotalS = qMonthsData.reduce((sum, m) => sum + (m.s || 0), 0);
          const qTotalTS = qMonthsData.reduce((sum, m) => sum + (m.ts || 0), 0);
          
          // Calculate quarterly target: (annual target / 4). Ensure target is a number.
          const annualTarget = Number(puskesmasProgramData?.target) || 0;
          const qTarget = annualTarget > 0 ? annualTarget / 4 : 0; 
          // Percentage based on 'S' against quarterly target. If qTarget is 0, percent is null or 0.
          const qPercent = qTarget > 0 ? (qTotalS / qTarget) * 100 : null;


          quarterlyStats.push({
            id: `${item.puskesmas_name}-q${q+1}`, // Unique key
            months_detail: qMonthsData,
            total_s: qTotalS,
            total_ts: qTotalTS,
            total_percent: qPercent,
          });
        }
        
        const yearTotalS = puskesmasProgramData?.standard_patients || 0;
        const yearTotalTS = puskesmasProgramData?.non_standard_patients || 0;
        const yearTotalPatients = yearTotalS + yearTotalTS;
        const yearTotalPercent = yearTotalPatients > 0 ? (yearTotalS / yearTotalPatients) * 100 : null;

        return {
          puskesmas_name: item.puskesmas_name,
          sasaran: puskesmasProgramData?.target || 0,
          months: monthlyStats,
          quarters: quarterlyStats,
          year_total_s: yearTotalS,
          year_total_ts: yearTotalTS,
          year_total_percent: yearTotalPercent,
          overall_achievement_percentage: puskesmasProgramData?.achievement_percentage !== undefined && puskesmasProgramData?.achievement_percentage !== null 
                                          ? parseFloat(puskesmasProgramData.achievement_percentage) 
                                          : null,
        };
      }).filter(Boolean); // Filter out any null entries if puskesmasProgramData was missing


      const apiMonthlyChartData = summaryData.monthly_data || {};
      this.chartData = {
        lakiLaki: Array.from({length: 12}, (_, i) => apiMonthlyChartData[String(i+1)]?.male || 0),
        perempuan: Array.from({length: 12}, (_, i) => apiMonthlyChartData[String(i+1)]?.female || 0),
      };
    },
    renderChart() {
      const chartElement = document.getElementById("chart");
      if (!chartElement ) return; // Element not found
      if(!this.chartData || !this.chartData.lakiLaki || !this.chartData.perempuan) {
          // console.warn("Chart data is not available for rendering.");
          // Optionally clear previous chart or show a message
          if (this.chartInstance) {
            this.chartInstance.destroy();
            this.chartInstance = null;
          }
          // You could display a message in the chart container here
          // chartElement.innerHTML = '<p style="text-align:center; padding-top: 50px;">Data grafik tidak tersedia.</p>';
          return;
      }

      const context = chartElement.getContext("2d");
      if (this.chartInstance) {
        this.chartInstance.destroy();
      }
      this.chartInstance = new Chart(context, {
        type: "line",
        data: {
          labels: this.monthNames,
          datasets: [
            {
              label: "Laki-laki",
              data: this.chartData.lakiLaki,
              borderColor: "#3B82F6",
              backgroundColor: "rgba(59, 130, 246, 0.1)",
              borderWidth: 3,
              fill: true,
              tension: 0.4,
              pointBackgroundColor: "#3B82F6",
              pointBorderColor: "#ffffff",
              pointBorderWidth: 2,
              pointRadius: 5, // Slightly smaller points
              pointHoverRadius: 7,
            },
            {
              label: "Perempuan",
              data: this.chartData.perempuan,
              borderColor: "#EC4899",
              backgroundColor: "rgba(236, 72, 153, 0.1)",
              borderWidth: 3,
              fill: true,
              tension: 0.4,
              pointBackgroundColor: "#EC4899",
              pointBorderColor: "#ffffff",
              pointBorderWidth: 2,
              pointRadius: 5,
              pointHoverRadius: 7,
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
              display: false, // Legend is handled by custom HTML elements
            },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.85)', // Darker tooltip
              titleColor: '#ffffff',
              bodyColor: '#ffffff',
              borderColor: 'rgba(255, 255, 255, 0.1)',
              borderWidth: 1,
              cornerRadius: 6, // Softer corners
              displayColors: true,
              usePointStyle: true,
              padding: 10, // More padding in tooltip
               callbacks: {
                    labelPointStyle: function(context) {
                        return {
                            pointStyle: 'circle', // or 'rect', 'triangle', etc.
                            rotation: 0
                        };
                    }
                }
            }
          },
          scales: {
            x: {
              grid: {
                display: false, // Cleaner X-axis
              },
              ticks: {
                color: '#4b5563', // var(--gray-600)
                font: {
                  size: 13, 
                  weight: '500',
                  family: 'Inter, sans-serif' // Consistent font
                }
              }
            },
            y: {
              grid: {
                color: 'rgba(0, 0, 0, 0.08)', // Softer grid lines
                drawBorder: false,
              },
              ticks: {
                color: '#4b5563', // var(--gray-600)
                font: {
                  size: 13, 
                  weight: '500',
                  family: 'Inter, sans-serif'
                },
                beginAtZero: true, // Ensure Y-axis starts at 0
                // autoSkipPadding: 20, // Adjust padding for ticks
                 maxTicksLimit: 6 // Limit number of Y-axis ticks for clarity
              }
            }
          }
        },
      });
    },
    printReport() {
      window.print();
    },
    getPercentageClass(value) {
      if (value === null || value === undefined) return ''; // No class for null/undefined
      if (value >= 80) return 'high'; // Good performance
      if (value < 50) return 'low';  // Needs attention
      return 'medium'; // Optional: for values in between
    }
  },
};
</script>

<style scoped>
/* Import global variables if not already available */
/* @import url('../../assets/styles/global.css'); */ /* Example */

/* Fallback or component-specific variables */
:root { 
  --primary-50: #eef7f7;
  --primary-100: #d1e9e8;
  --primary-200: #a3d3d1;
  --primary-300: #75c2bf; /* Digunakan untuk scrollbar thumb */
  --primary-400: #47b1ac;
  --primary-500: #047d78; 
  --primary-600: #036a65;
  --primary-700: #025752; 
  --primary-800: #024542;
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
  --success-50: #f0fdf4;
  --success-500: #22c55e; 
  --success-600: #16a34a;
  --warning-50: #fffbeb;
  --warning-500: #f59e0b; 
  --error-50: #fef2f2; 
  --error-100: #fee2e2; 
  --error-200: #fecaca; 
  --error-500: #ef4444; 
  --error-600: #dc2626; 
  --radius-sm: 0.375rem; 
  --radius-md: 0.5rem; 
  --radius-lg: 0.75rem; 
  --radius-xl: 1rem; 
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05); 
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); 
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); 
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
}

body {
  font-family: var(--font-sans);
  background-color: var(--gray-50); /* Latar belakang body utama */
  color: var(--gray-800);
}

.dashboard-content {
  opacity: 1;
  transition: opacity 0.5s ease;
  max-width: 100%; 
  padding: 1rem 1.5rem; /* Sedikit padding atas bawah */
  margin: 0 auto;
  animation: fadeInUp 0.6s ease-out;
}
@media (min-width: 1500px) { 
    .dashboard-content {
        max-width: 1800px; /* Max width untuk layar sangat besar */
    }
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); } /* Sedikit kurangi jarak animasi */
  to { opacity: 1; transform: translateY(0); }
}

.error-message {
  display: flex; align-items: center; gap: 0.75rem; /* var(--spacing-3, 12px) */
  background-color: var(--error-50, #fef2f2); 
  color: var(--error-600, #dc2626); 
  padding: 1rem; border-radius: var(--radius-md, 0.5rem); 
  margin-bottom: 1.5rem; border-left: 4px solid var(--error-500, #ef4444); 
  font-weight: 500;
}
.retry-button {
  margin-left: auto; background-color: var(--error-100, #fee2e2); 
  color: var(--error-600, #dc2626); border: 1px solid var(--error-200); padding: 0.5rem 1rem; 
  border-radius: var(--radius-md, 0.5rem); cursor: pointer; font-weight: 500; 
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.retry-button:hover { background-color: var(--error-200, #fecaca); } 

.toolbar-card {
  background-color: white; border-radius: var(--radius-lg, 0.75rem); 
  box-shadow: var(--shadow-md); margin-bottom: 1.5rem; overflow: hidden; 
}
.toolbar-content {
  display: flex; justify-content: space-between; align-items: center;
  padding: 1rem 1.5rem; flex-wrap: wrap; gap: 1rem;
}
.controls-section { display: flex; gap: 1.5rem; align-items: center; flex-wrap: wrap; }
.control-group { display: flex; flex-direction: column; gap: 0.5rem; }
.control-label {
  display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; /* 14px */
  font-weight: 500; color: var(--gray-700, #374151); 
}
.label-icon { font-size: 1rem; color: var(--primary-500); } /* 16px */
.select-wrapper { position: relative; width: 200px; } /* Sedikit lebih kecil */
.modern-select {
  width: 100%; padding: 0.625rem 1rem; /* 10px 16px */
  border-radius: var(--radius-md, 0.5rem); border: 1px solid var(--gray-300, #d1d5db); 
  background-color: white; font-size: 0.875rem; /* 14px */
  color: var(--gray-800, #1f2937); appearance: none; cursor: pointer; 
  transition: all 0.2s ease;
  background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%236B7280' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  padding-right: 2.5rem; /* Space for arrow */
}
.modern-select:hover { border-color: var(--primary-400); } 
.modern-select:focus {
  outline: none; border-color: var(--primary-500, #047d78); 
  box-shadow: 0 0 0 3px rgba(4, 125, 120, 0.2); 
}
.select-arrow { display: none; } /* Digantikan oleh background-image pada select */

.print-button {
  display: flex; align-items: center; gap: 0.625rem; /* 10px */
  padding: 0.75rem 1.25rem; /* 12px 20px */
  background: linear-gradient(135deg, var(--primary-500, #047d78), var(--primary-600, #04726d)); 
  color: white; border: none; border-radius: var(--radius-md); 
  font-size: 0.875rem; font-weight: 600; cursor: pointer; /* 14px */
  position: relative; overflow: hidden; transition: all 0.2s ease-out;
  box-shadow: var(--shadow-sm);
}
.print-button:hover { 
  transform: translateY(-2px); 
  box-shadow: 0 6px 12px -3px rgba(4, 125, 120, 0.3), 0 4px 8px -4px rgba(4, 125, 120, 0.2);
} 
.button-icon { font-size: 1.125rem; } /* 18px */
.button-shine { /* Efek kilau halus (opsional) */
    content: "";
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: rgba(255, 255, 255, 0.1);
    transform: rotate(45deg);
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.4s ease, transform 0.4s ease;
}
.print-button:hover .button-shine {
    opacity: 1;
    transform: rotate(30deg) translate(10%, -10%);
}


/* Metrics Section */
.metrics-section { margin-bottom: 2rem; }
.metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.5rem; }
.metric-card {
  background: white; border-radius: var(--radius-lg); padding: 1.5rem; 
  box-shadow: var(--shadow-lg); transition: all 0.3s ease-in-out; position: relative; overflow: hidden; 
  border-top: 4px solid var(--primary-500); /* Aksen atas default */
}
.metric-card.primary { border-top-color: var(--primary-500); }
.metric-card.success { border-top-color: var(--success-500); }
.metric-card.warning { border-top-color: var(--warning-500); }
.metric-card.info { border-top-color: #06b6d4; } /* Contoh warna info */
.metric-card.accent { border-top-color: #8b5cf6; } /* Contoh warna aksen */

.metric-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-xl); } 
.metric-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
.metric-icon {
  width: 48px; height: 48px; border-radius: var(--radius-md); 
  display: flex; align-items: center; justify-content: center;
  background: var(--primary-50); color: var(--primary-600); 
}
.metric-card.success .metric-icon { background: var(--success-50); color: var(--success-600); } 
.metric-card.warning .metric-icon { background: var(--warning-50); color: var(--warning-500); } 
.metric-card.info .metric-icon { background: #e0f2fe; color: #0ea5e9; } /* Light blue */
.metric-card.accent .metric-icon { background: #f5f3ff; color: #7c3aed; } /* Light purple */

.metric-icon svg { width: 24px; height: 24px; }
.metric-trend { font-size: 1.25rem; }
.metric-content { text-align: left; }
.metric-title { font-size: 0.875rem; font-weight: 500; color: var(--gray-600); margin: 0 0 0.375rem 0; } 
.metric-value { font-size: 2rem; font-weight: 700; color: var(--gray-800); margin: 0 0 0.25rem 0; line-height: 1.2; } 
.metric-subtitle { font-size: 0.75rem; color: var(--gray-500); margin: 0; font-weight: 400; } 


/* Charts Section */
.charts-section { margin-bottom: 2rem; }
.chart-card { background: white; border-radius: var(--radius-lg); box-shadow: var(--shadow-lg); overflow: hidden; } 
.chart-header {
  padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--gray-200); 
  display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem;
}
.chart-title-section { flex-grow: 1; }
.chart-title {
  font-size: 1.25rem; font-weight: 600; color: var(--gray-800); 
  margin: 0 0 0.25rem 0; display: flex; align-items: center; gap: 0.625rem; 
}
/* .title-accent in .chart-title and .overview-title is shared with .table-title one */
.chart-subtitle { font-size: 0.875rem; color: var(--gray-500); margin: 0; } 
.chart-legends { display: flex; gap: 1.25rem; margin-top: 0.25rem; } 
.legend-item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; font-weight: 500; } 
.legend-item.male { color: #3B82F6; }
.legend-item.female { color: #EC4899; }
.legend-dot { width: 12px; height: 12px; border-radius: 50%; } 
.legend-item.male .legend-dot { background: #3B82F6; }
.legend-item.female .legend-dot { background: #EC4899; }
.chart-container { padding: 1.5rem; height: 380px; } /* Adjusted height */


/* Overview Section */
.overview-section { margin-bottom: 2rem; }
.overview-card { background: white; border-radius: var(--radius-lg); box-shadow: var(--shadow-lg); overflow: hidden; } 
.overview-header { padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--gray-200); } 
.overview-title { font-size: 1.25rem; font-weight: 600; color: var(--gray-800); margin: 0 0 0.25rem 0; display: flex; align-items: center; gap: 0.625rem; } 
.overview-subtitle { font-size: 0.875rem; color: var(--gray-500); margin: 0; } 
.overview-list { padding: 0.75rem 0; } 
.overview-item { 
  display: flex; align-items: center; gap: 1rem; padding: 1rem 1.5rem; 
  border-bottom: 1px solid var(--gray-100); transition: background-color 0.2s ease, transform 0.2s ease; 
} 
.overview-item:last-child { border-bottom: none; }
.overview-item:hover { background: var(--primary-50); transform: translateX(3px); } 
.item-number {
  min-width: 32px; width: 32px; height: 32px; 
  border-radius: 50%; background: var(--primary-100); 
  color: var(--primary-700); display: flex; align-items: center; 
  justify-content: center; font-weight: 600; font-size: 0.875rem;
  transition: transform 0.3s ease;
}
.overview-item:hover .item-number { transform: scale(1.05); background-color: var(--primary-200); }
.item-details { flex-grow: 1; display: flex; justify-content: space-between; align-items: center; }
.item-name { font-weight: 500; color: var(--gray-700); font-size:0.9rem; } 
.item-value { font-weight: 600; color: var(--primary-600); font-size:0.9rem; } 


/* --- Enhanced Table Styles --- */
.table-section { margin-bottom: 2rem; }
.table-card-enhanced {
  background: white;
  border-radius: var(--radius-xl, 1rem);
  box-shadow: var(--shadow-lg); /* Konsisten dengan card lain */
  padding: 1.5rem 1.75rem; /* 24px 28px */
}

.table-header-enhanced {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem; /* Kurangi gap sedikit */
  margin-bottom: 1.25rem; /* 20px */
}

.table-title-section {
  flex-grow: 1; /* Agar title mengambil ruang yang tersedia */
}

.table-title { /* Style ini bisa di-share dengan chart & overview title */
  font-size: 1.25rem; /* Konsisten dengan judul card lain */
  font-weight: 600; /* Konsisten */
  color: var(--gray-800);
  margin: 0 0 0.25rem 0;
  display: flex;
  align-items: center;
  gap: 0.625rem; /* 10px */
}

.title-accent { /* Style ini bisa di-share dengan chart & overview title-accent */
  width: 5px; /* Lebih ramping */
  height: 1.5rem; /* Sesuaikan tinggi */
  background: var(--primary-500, #047d78); 
  border-radius: 3px;
}

.table-subtitle {
  font-size: 0.875rem; /* 14px */
  color: var(--gray-500, #6b7280);
  margin: 0;
}

.view-toggle-tabs {
  display: flex;
  gap: 0.375rem; /* 6px */
  background-color: var(--gray-100, #f3f4f6);
  padding: 0.375rem; /* 6px */
  border-radius: var(--radius-lg, 0.75rem);
  box-shadow: inset 0 1px 2px rgba(0,0,0,0.05); /* Inner shadow halus */
}

.view-toggle-tabs button {
  padding: 0.625rem 1.125rem; /* 10px 18px */
  border: none;
  background-color: transparent;
  color: var(--gray-600, #4b5563);
  border-radius: var(--radius-md, 0.5rem);
  cursor: pointer;
  font-weight: 500; /* Sedikit lebih ringan dari active */
  font-size: 0.875rem; /* 14px */
  transition: all 0.2s ease-in-out;
  display: flex;
  align-items: center;
  gap: 0.5rem; /* 8px */
}

.view-toggle-tabs button .svg-inline--fa { /* Jika FontAwesome terpasang */
  width: 1em; /* Sesuaikan ukuran ikon */
  height: 1em;
  margin-right: 0.125rem; /* Jarak kecil setelah ikon */
}

.view-toggle-tabs button:hover:not(.active) { /* Hanya hover jika tidak aktif */
  background-color: var(--gray-200, #e5e7eb);
  color: var(--primary-600, #04726d);
}

.view-toggle-tabs button.active {
  background: var(--primary-500, #047d78);
  color: white;
  font-weight: 600; /* Lebih tebal saat aktif */
  box-shadow: 0 2px 4px -1px rgba(4, 125, 120, 0.2), 0 1px 2px -1px rgba(4, 125, 120, 0.1);
}

.table-container-enhanced {
  overflow-x: auto; 
  width: 100%;
  border: 1px solid var(--gray-200, #e5e7eb); 
  border-radius: var(--radius-md, 0.5rem); /* Radius lebih kecil untuk kontainer dalam */
  /* Custom scrollbar */
  scrollbar-width: thin;
  scrollbar-color: var(--primary-300, #75c2bf) var(--gray-100, #f3f4f6);
}

.table-container-enhanced::-webkit-scrollbar { height: 8px; width: 8px; }
.table-container-enhanced::-webkit-scrollbar-track { background: var(--gray-100, #f3f4f6); border-radius: 4px; }
.table-container-enhanced::-webkit-scrollbar-thumb { background-color: var(--primary-300, #75c2bf); border-radius: 4px; }
.table-container-enhanced::-webkit-scrollbar-thumb:hover { background-color: var(--primary-400); }


.data-table-enhanced {
  width: 100%;
  border-collapse: separate; /* Penting untuk sticky & border-spacing */
  border-spacing: 0; 
  font-size: 0.8125rem; /* 13px, sedikit lebih kecil untuk data padat */
  color: var(--gray-700, #374151);
}

.data-table-enhanced th,
.data-table-enhanced td {
  border-bottom: 1px solid var(--gray-200, #e5e7eb); /* Hanya border bawah untuk kesan lebih ringan */
  border-right: 1px solid var(--gray-200, #e5e7eb); /* Border kanan */
  padding: 0.75rem 1rem; /* 12px 16px, padding konsisten */
  text-align: center;
  vertical-align: middle;
  white-space: nowrap; 
}
.data-table-enhanced th:first-child,
.data-table-enhanced td:first-child {
    border-left: 1px solid var(--gray-200, #e5e7eb); /* Border kiri untuk sel pertama */
}
.data-table-enhanced thead tr:first-child th {
    border-top: 1px solid var(--gray-200, #e5e7eb); /* Border atas untuk header baris pertama */
}


/* Styling untuk Header Tabel */
.data-table-enhanced thead tr th {
  background-color: var(--gray-100, #f3f4f6); /* Warna latar header lebih terang */
  color: var(--gray-700, #374151);
  font-weight: 600; 
  font-size: 0.75rem; /* 12px, header lebih kecil */
  text-transform: uppercase; 
  letter-spacing: 0.025em; /* Sedikit spasi antar huruf */
  position: sticky; 
  top: 0; 
  z-index: 10; 
}
.data-table-enhanced thead tr.header-row-1 th { top: 0; } 
.data-table-enhanced thead tr.header-row-2 th { top: 39px; } /* Sesuaikan berdasarkan tinggi header-row-1 (padding + font-size + border) */
.data-table-enhanced thead tr.header-row-3 th { top: 78px; } /* Sesuaikan berdasarkan total tinggi header-row-1 & 2 */

.data-table-enhanced .quarter-group-header { 
  background-color: var(--primary-50, #eef7f7) !important; 
  color: var(--primary-700, #025752) !important; 
  font-weight: 600;
  font-size: 0.8125rem; /* 13px */
}

.data-table-enhanced .month-header { 
  background-color: var(--gray-100, #f3f4f6) !important; 
  font-weight: 500;
}

.data-table-enhanced .tw-total-header,
.data-table-enhanced .year-total-header { 
  background-color: var(--gray-200, #e5e7eb) !important; 
  font-weight: 600 !important; 
}

.data-table-enhanced .overall-achievement-header { 
  background-color: var(--primary-100, #d1e9e8) !important; 
  color: var(--primary-800, #024542) !important; 
  font-weight: 600 !important;
}
.data-table-enhanced .sasaran-header { /* Khusus untuk header kolom Sasaran */
  background-color: var(--gray-200, #e5e7eb) !important;
  font-weight: 600 !important;
}


.data-table-enhanced .sub-header { /* S, TS, % */
  font-size: 0.75rem; /* 12px */
  background-color: var(--gray-50, #f9fafb) !important; 
  font-weight: 500;
}

.data-table-enhanced .total-col { 
  font-weight: 500; 
  background-color: var(--gray-50, #f9fafb); 
}

.data-table-enhanced .percent-col { 
  color: var(--primary-600, #036a65); 
  font-weight: 500; 
}

/* Styling untuk Body Tabel */
.data-table-enhanced tbody tr:nth-child(even) .data-cell,
.data-table-enhanced tbody tr:nth-child(even) .sticky-col { /* Zebra striping juga untuk sticky col */
  background-color: var(--gray-50, #f9fafb);
}

.data-table-enhanced tbody tr:hover .data-cell,
.data-table-enhanced tbody tr:hover .sticky-col { 
  background-color: var(--primary-50, #eef7f7); 
}

.data-table-enhanced .puskesmas-name-cell {
  text-align: left; 
  white-space: normal; /* Izinkan wrap jika nama panjang */
  min-width: 200px; /* Atur lebar minimum */
  font-weight: 500; 
  color: var(--gray-800, #1f2937);
}
.data-table-enhanced .puskesmas-name-cell::before { display: none; } /* Hapus aksen titik jika ada */

.data-table-enhanced .sasaran-cell { 
  font-weight: 500; 
  color: var(--gray-800, #1f2937);
  background-color: var(--gray-100, #f3f4f6) !important; 
}

.data-table-enhanced .overall-achievement-cell { 
  font-weight: 600; 
  background-color: var(--primary-50, #eef7f7) !important; 
  color: var(--primary-700, #025752);
  font-size: 0.875rem; /* 14px */
}

.data-table-enhanced .percent-col[data-value="high"] {
  color: var(--success-600, #16a34a);
  /* background-color: var(--success-50, #f0fdf4); */ /* Optional: background highlight */
  font-weight: 600;
}
.data-table-enhanced .percent-col[data-value="low"] {
  color: var(--error-600, #dc2626);
  /* background-color: var(--error-50, #fef2f2); */ /* Optional: background highlight */
  font-weight: 600;
}
.data-table-enhanced .percent-col[data-value="medium"] {
  /* No specific style, or a neutral one if desired */
}

/* --- Sticky Columns Styling (PENTING!) --- */
.sticky-col {
  position: sticky; 
  left: 0; 
  background-color: white; /* WAJIB: Background solid untuk menutupi konten di belakangnya */
  z-index: 5; 
  border-right: 1px solid var(--gray-300, #d1d5db) !important; /* Border kanan lebih tegas untuk pemisah */
}
/* Background untuk baris genap pada sticky column agar konsisten */
.data-table-enhanced tbody tr:nth-child(even) .sticky-col {
  background-color: var(--gray-50, #f9fafb); /* Sama dengan zebra striping */
}


.data-table-enhanced .sticky-col-no {
  min-width: 50px; /* Lebar kolom NO */
  max-width: 50px;
  left: 0; 
  font-weight: 500;
  color: var(--gray-600, #4b5563);
}

.data-table-enhanced .sticky-col-puskesmas {
  min-width: 200px; /* Lebar kolom Nama Puskesmas */
  left: 50px; /* Harus sama dengan width/max-width .sticky-col-no */
  /* box-shadow: 3px 0 5px -2px rgba(0,0,0,0.08); */ /* Shadow halus di kanan kolom sticky */
}

/* Pastikan header sticky juga memiliki background solid dan z-index lebih tinggi */
.data-table-enhanced thead .sticky-col {
  z-index: 15 !important; /* Lebih tinggi dari body sticky dan header non-sticky */
  background-color: var(--gray-100, #f3f4f6) !important; /* Warna background header */
}
/* Jika ada header bertingkat, pastikan semua bagian sticky header punya background */
.data-table-enhanced thead tr.header-row-1 .sticky-col,
.data-table-enhanced thead tr.header-row-2 .sticky-col,
.data-table-enhanced thead tr.header-row-3 .sticky-col {
    background-color: var(--gray-100, #f3f4f6) !important;
}
.data-table-enhanced thead .sticky-col-no,
.data-table-enhanced thead .sticky-col-puskesmas {
    border-right: 1px solid var(--gray-300, #d1d5db) !important;
}


.no-data-cell {
  text-align: center;
  padding: 2.5rem 1rem; 
  color: var(--gray-500, #6b7280);
  font-size: 1rem; 
  font-style: italic;
  background-color: white !important; /* Pastikan background diterapkan */
}
.data-table-enhanced tbody tr:hover .no-data-cell { /* Hapus hover effect untuk no-data-cell */
    background-color: white !important;
}


/* Responsive adjustments */
@media (max-width: 768px) {
  .dashboard-content { padding: 0.75rem 1rem; }
  .toolbar-content, .table-header-enhanced { flex-direction: column; align-items: stretch; }
  .controls-section { gap: 1rem; }
  .select-wrapper { width: 100%; }
  .print-button { width: 100%; justify-content: center; }
  
  .view-toggle-tabs { width: 100%; display: grid; grid-template-columns: repeat(3, 1fr); }
  .view-toggle-tabs button { justify-content: center; font-size: 0.8125rem; padding: 0.6rem 0.5rem;}

  .data-table-enhanced { font-size: 0.75rem; } /* 12px */
  .data-table-enhanced th, .data-table-enhanced td { padding: 0.625rem 0.75rem; } /* 10px 12px */
  .data-table-enhanced .puskesmas-name-cell { min-width: 160px; }
  .sticky-col-puskesmas { min-width: 160px; left: 44px; /* Disesuaikan dengan lebar NO */ }
  .sticky-col-no { min-width: 44px; max-width: 44px; }
  .data-table-enhanced thead tr.header-row-2 th { top: 37px; } /* Re-calculate for smaller font/padding */
  .data-table-enhanced thead tr.header-row-3 th { top: 74px; } /* Re-calculate */

}

@media (max-width: 480px) {
  .dashboard-content { padding: 0.5rem; }
  .table-card-enhanced { padding: 1rem 0.75rem; }
  .table-header-enhanced { gap: 0.75rem; margin-bottom: 1rem; }
  .table-title { font-size: 1.125rem; }
  .table-subtitle { font-size: 0.8125rem; }
  .view-toggle-tabs button { font-size: 0.75rem; padding: 0.5rem; gap: 0.25rem; }
  
  .data-table-enhanced { font-size: 0.6875rem; } /* ~11px */
  .data-table-enhanced th, .data-table-enhanced td { padding: 0.5rem 0.375rem; } /* 8px 6px */
  .data-table-enhanced .puskesmas-name-cell { min-width: 120px; }
  .sticky-col-puskesmas { min-width: 120px; left: 38px; /* Disesuaikan dengan lebar NO */ }
  .sticky-col-no { min-width: 38px; max-width: 38px; }
  .data-table-enhanced thead tr.header-row-2 th { top: 34px; } /* Re-calculate */
  .data-table-enhanced thead tr.header-row-3 th { top: 68px; } /* Re-calculate */
}

/* Print Styles */
@media print {
  :root { /* Definisikan variabel fallback untuk print jika global.css tidak ter-load */
    --primary-50: #eef7f7; --primary-100: #d1e9e8; --primary-200: #a3d3d1;
    --primary-300: #75c2bf; --primary-400: #47b1ac; --primary-500: #047d78;
    --primary-600: #036a65; --primary-700: #025752; --primary-800: #024542;
    --gray-50: #f9fafb; --gray-100: #f3f4f6; --gray-200: #e5e7eb;
    --gray-300: #d1d5db; --gray-500: #6b7280; --gray-600: #4b5563;
    --gray-700: #374151; --gray-800: #1f2937; --gray-900: #111827;
    --success-50: #f0fdf4; --success-600: #16a34a;
    --error-50: #fef2f2; --error-600: #dc2626;
  }
  body { background-color: white !important; color: black !important; font-size: 10pt; }
  .dashboard-content { max-width: none !important; padding:0 !important; margin: 0 !important; animation: none !important; }
  .toolbar-card, .metrics-section, .charts-section, .overview-section, .view-toggle-tabs, .error-message { display: none !important; }
  .table-section, .table-card-enhanced { 
    box-shadow: none !important; border: none !important; 
    margin-bottom: 0 !important; padding: 0 !important; overflow: visible !important; 
    border-radius: 0 !important;
  }
  .table-container-enhanced { 
    overflow-x: visible !important; border: none !important; 
    border-radius: 0 !important; box-shadow: none !important; 
  }
  .data-table-enhanced { 
    width: 100% !important; font-size: 8pt !important; color: #000 !important;
    border-collapse: collapse !important; /* Collapse untuk print */
    border-spacing: 0 !important;
  }
  .data-table-enhanced th, .data-table-enhanced td {
    border: 1px solid #ccc !important;
    padding: 3px 4px !important;
    white-space: normal !important; /* Allow wrapping untuk print */
    page-break-inside: avoid !important;
    background-color: white !important; 
    color: #000 !important;
    -webkit-print-color-adjust: exact; /* Ensure backgrounds print in Chrome */
    print-color-adjust: exact; /* Standard */
  }
  .sticky-col { position: static !important; background-color: white !important; box-shadow: none !important; border-right: 1px solid #ccc !important; } 
  .data-table-enhanced thead tr th { background-color: #f0f0f0 !important; } /* Header abu-abu muda untuk print */
  .data-table-enhanced .percent-col[data-value="high"],
  .data-table-enhanced .percent-col[data-value="low"],
  .data-table-enhanced .percent-col[data-value="medium"] {
      background-color: white !important; /* Hapus background warna untuk persen di print */
      color: black !important;
  }
  .table-title-section { margin-bottom: 10px; }
  .table-title { font-size: 12pt !important; color: black !important; }
  .table-subtitle { font-size: 9pt !important; color: black !important; }
  .title-accent { display: none !important; } /* Sembunyikan aksen visual */
}

</style>