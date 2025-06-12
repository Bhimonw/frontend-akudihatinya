<template>
  <div v-if="apiStatus === 'loading'" class="top-loading-bar">
    <div class="loading-bar-progress"></div>
  </div>

  <div v-show="!(isLoading && !isDownloading)" class="dashboard-content">
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

    <div v-if="error && !isLoading" class="error-message">
      <font-awesome-icon :icon="['fas', 'exclamation-circle']" />
      {{ error }}
      <button @click="fetchData" class="retry-button">
        <font-awesome-icon :icon="['fas', 'sync']" /> Coba Lagi
      </button>
    </div>

    <div class="metrics-section">
      <div class="metrics-grid three-columns">
        <div class="metric-card puskesmas-count">
          <div class="metric-header">
            <div class="metric-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 7H20M4 7L4 17C4 18.1046 4.89543 19 6 19H18C19.1046 19 20 18.1046 20 17V7M4 7L12 3L20 7M7 10H9M11 10H13M15 10H17M7 13H9M11 13H13M15 13H17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <span class="metric-trend">🏢</span>
          </div>
          <div class="metric-content">
            <h3 class="metric-title">Jumlah Puskesmas</h3>
            <p class="metric-value">{{ summaryCards.jumlahPuskesmas || '0' }}</p>
            <p class="metric-subtitle">Total Puskesmas Terdata</p>
          </div>
        </div>

        <div class="metric-card total-services"> <div class="metric-header">
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
            <p class="metric-subtitle">Total Services Given</p>
          </div>
        </div>

        <div class="metric-card achievement-rate"> <div class="metric-header">
            <div class="metric-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M9 7H6C4.89543 7 4 7.89543 4 9V15C4 16.1046 4.89543 17 6 17H9M15 7H18C19.1046 7 20 7.89543 20 9V15C20 16.1046 19.1046 17 18 17H15M9 7V17M15 7V17M9 12H15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </div>
            <span class="metric-trend">📊</span>
          </div>
          <div class="metric-content">
            <h3 class="metric-title">% Capaian Layanan</h3>
            <p class="metric-value">{{ summaryCards.persenCapaianPelayanan || '0%' }}</p>
            <p class="metric-subtitle">Overall Achievement Rate</p>
          </div>
        </div>
      </div>
    </div>
    <div class="main-content-row">
      <div class="charts-section main-chart-column">
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

      <div class="overview-section main-ranking-column">
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
                <span class="item-value">{{ item.achievement_percentage !== null && item.achievement_percentage !== undefined ? item.achievement_percentage.toFixed(2) : '-' }}%</span>
              </div>
            </div>
              <div v-if="!puskesmasRanking.length" class="overview-item-empty">
                Tidak ada data ranking untuk ditampilkan.
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
                    <button @click="tableViewMode = 'detailed'" :class="{ active: tableViewMode === 'detailed' }">
                        <font-awesome-icon :icon="['fas', 'table-list']" /> Semua
                    </button>
                    <button @click="tableViewMode = 'monthly'" :class="{ active: tableViewMode === 'monthly' }">
                        <font-awesome-icon :icon="['fas', 'calendar-days']" /> Bulanan
                    </button>
                    <button @click="tableViewMode = 'quarterly'" :class="{ active: tableViewMode === 'quarterly' }">
                        <font-awesome-icon :icon="['fas', 'calendar-week']" /> Triwulan
                    </button>
                </div>
            </div>
            <div class="table-container-enhanced">
                <table class="data-table-enhanced">
                    <template v-if="tableViewMode === 'detailed'">
                        <thead>
                            <tr class="header-row-1">
                                <th rowspan="3" class="sticky-col sticky-col-no sortable-header" @click="sortBy('no')">
                                  NO
                                  <span v-if="sortKey === 'no'">{{ sortOrders.no === 'asc' ? '▲' : '▼' }}</span>
                                </th>
                                <th rowspan="3" class="sticky-col sticky-col-puskesmas sortable-header" @click="sortBy('puskesmas_name')">
                                  NAMA PUSKESMAS
                                  <span v-if="sortKey === 'puskesmas_name'">{{ sortOrders.puskesmas_name === 'asc' ? '▲' : '▼' }}</span>
                                </th>
                                <th rowspan="3" class="sasaran-header sortable-header" @click="sortBy('sasaran')">
                                  SASARAN
                                   <span v-if="sortKey === 'sasaran'">{{ sortOrders.sasaran === 'asc' ? '▲' : '▼' }}</span>
                                </th>
                                <th colspan="12" class="quarter-group-header">TRIWULAN I</th>
                                <th colspan="12" class="quarter-group-header">TRIWULAN II</th>
                                <th colspan="12" class="quarter-group-header">TRIWULAN III</th>
                                <th colspan="12" class="quarter-group-header">TRIWULAN IV</th>
                                <th colspan="3" rowspan="2" class="year-total-header">TOTAL CAPAIAN TAHUN {{ selectedYear }}</th>
                                <th rowspan="3" class="overall-achievement-header sortable-header" @click="sortBy('overall_achievement_percentage')">
                                  % CAPAIAN PELAYANAN SESUAI STANDAR
                                  <span v-if="sortKey === 'overall_achievement_percentage'">{{ sortOrders.overall_achievement_percentage === 'asc' ? '▲' : '▼' }}</span>
                                </th>
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
                                        <th class="sub-header" title="Sasaran Kontak">S</th>
                                        <th class="sub-header" title="Tercapai Standar">TS</th>
                                        <th class="sub-header percent-col">%</th>
                                    </template>
                                    <th class="sub-header total-col" title="Total Sasaran Kontak Kuartal">S</th>
                                    <th class="sub-header total-col" title="Total Tercapai Standar Kuartal">TS</th>
                                    <th class="sub-header total-col percent-col">%</th>
                                </template>
                                <th class="sub-header total-col" title="Total Sasaran Kontak Tahun">S</th>
                                <th class="sub-header total-col" title="Total Tercapai Standar Tahun">TS</th>
                                <th class="sub-header total-col percent-col">%</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(puskesmas, index) in paginatedData" :key="puskesmas.puskesmas_name">
                                <td class="sticky-col sticky-col-no">{{ puskesmas.no || (currentPage - 1) * itemsPerPage + index + 1 }}</td>
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
                            <tr v-if="!paginatedData.length && !isLoading">
                                <td :colspan="55" class="no-data-cell">Tidak ada data untuk ditampilkan.</td>
                            </tr>
                        </tbody>
                    </template>
                     <template v-if="tableViewMode === 'monthly'">
                        <thead>
                            <tr>
                                <th rowspan="2" class="sticky-col sticky-col-no sortable-header" @click="sortBy('no')">
                                  NO
                                  <span v-if="sortKey === 'no'">{{ sortOrders.no === 'asc' ? '▲' : '▼' }}</span>
                                </th>
                                <th rowspan="2" class="sticky-col sticky-col-puskesmas sortable-header" @click="sortBy('puskesmas_name')">
                                  NAMA PUSKESMAS
                                  <span v-if="sortKey === 'puskesmas_name'">{{ sortOrders.puskesmas_name === 'asc' ? '▲' : '▼' }}</span>
                                </th>
                                <th rowspan="2" class="sasaran-header sortable-header" @click="sortBy('sasaran')">
                                  SASARAN
                                  <span v-if="sortKey === 'sasaran'">{{ sortOrders.sasaran === 'asc' ? '▲' : '▼' }}</span>
                                  </th>
                                <th v-for="month in monthNames" :key="`header-month-${month}`" colspan="3" class="month-header">{{ month.toUpperCase() }}</th>
                                <th colspan="3" class="year-total-header">TOTAL CAPAIAN TAHUN {{ selectedYear }}</th>
                                <th rowspan="2" class="overall-achievement-header sortable-header" @click="sortBy('overall_achievement_percentage')">
                                  % CAPAIAN PELAYANAN SESUAI STANDAR
                                   <span v-if="sortKey === 'overall_achievement_percentage'">{{ sortOrders.overall_achievement_percentage === 'asc' ? '▲' : '▼' }}</span>
                                </th>
                            </tr>
                            <tr>
                                <template v-for="i in 12" :key="`sub-month-${i}`">
                                    <th class="sub-header" title="Sasaran Kontak">S</th><th class="sub-header" title="Tercapai Standar">TS</th><th class="sub-header percent-col">%</th>
                                </template>
                                <th class="sub-header total-col" title="Total Sasaran Kontak Tahun">S</th><th class="sub-header total-col" title="Total Tercapai Standar Tahun">TS</th><th class="sub-header total-col percent-col">%</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(puskesmas, index) in paginatedData" :key="puskesmas.puskesmas_name">
                                <td class="sticky-col sticky-col-no">{{ puskesmas.no || (currentPage - 1) * itemsPerPage + index + 1 }}</td>
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
                            <tr v-if="!paginatedData.length && !isLoading">
                                <td :colspan="3 + (12*3) + 3 + 1" class="no-data-cell">Tidak ada data untuk ditampilkan.</td>
                            </tr>
                        </tbody>
                    </template>
                    <template v-if="tableViewMode === 'quarterly'">
                        <thead>
                            <tr>
                                <th rowspan="2" class="sticky-col sticky-col-no sortable-header" @click="sortBy('no')">
                                  NO
                                  <span v-if="sortKey === 'no'">{{ sortOrders.no === 'asc' ? '▲' : '▼' }}</span>
                                </th>
                                <th rowspan="2" class="sticky-col sticky-col-puskesmas sortable-header" @click="sortBy('puskesmas_name')">
                                  NAMA PUSKESMAS
                                  <span v-if="sortKey === 'puskesmas_name'">{{ sortOrders.puskesmas_name === 'asc' ? '▲' : '▼' }}</span>
                                </th>
                                <th rowspan="2" class="sasaran-header sortable-header" @click="sortBy('sasaran')">
                                  SASARAN
                                  <span v-if="sortKey === 'sasaran'">{{ sortOrders.sasaran === 'asc' ? '▲' : '▼' }}</span>
                                </th>
                                <th colspan="3" class="quarter-group-header">TRIWULAN I</th>
                                <th colspan="3" class="quarter-group-header">TRIWULAN II</th>
                                <th colspan="3" class="quarter-group-header">TRIWULAN III</th>
                                <th colspan="3" class="quarter-group-header">TRIWULAN IV</th>
                                <th colspan="3" class="year-total-header">TOTAL CAPAIAN TAHUN {{ selectedYear }}</th>
                                <th rowspan="2" class="overall-achievement-header sortable-header" @click="sortBy('overall_achievement_percentage')">
                                  % CAPAIAN PELAYANAN SESUAI STANDAR
                                  <span v-if="sortKey === 'overall_achievement_percentage'">{{ sortOrders.overall_achievement_percentage === 'asc' ? '▲' : '▼' }}</span>
                                </th>
                            </tr>
                            <tr>
                                <template v-for="i in 4" :key="`sub-quarter-${i}`">
                                    <th class="sub-header total-col" title="Total Sasaran Kontak Kuartal">S</th><th class="sub-header total-col" title="Total Tercapai Standar Kuartal">TS</th><th class="sub-header total-col percent-col">%</th>
                                </template>
                                <th class="sub-header total-col" title="Total Sasaran Kontak Tahun">S</th><th class="sub-header total-col" title="Total Tercapai Standar Tahun">TS</th><th class="sub-header total-col percent-col">%</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(puskesmas, index) in paginatedData" :key="puskesmas.puskesmas_name">
                                <td class="sticky-col sticky-col-no">{{ puskesmas.no || (currentPage - 1) * itemsPerPage + index + 1 }}</td>
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
                             <tr v-if="!paginatedData.length && !isLoading">
                                <td :colspan="3 + (4*3) + 3 + 1" class="no-data-cell">Tidak ada data untuk ditampilkan.</td>
                            </tr>
                        </tbody>
                    </template>
                </table>
            </div>
            <div class="pagination-controls" v-if="processedTableData.length > 0">
              <button @click="prevPage" :disabled="currentPage === 1">Sebelumnya</button>
              <span>Halaman {{ currentPage }} dari {{ totalPages }}</span>
              <button @click="nextPage" :disabled="currentPage === totalPages">Berikutnya</button>
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
  faTableList, faCalendarDays, faCalendarWeek,
  faExclamationCircle, faSync, faDownload,
  faFileExcel, faFilePdf, faSpinner,
  // No need to import sort icons here if using text (▲▼)
} from '@fortawesome/free-solid-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';

library.add(
  faTableList, faCalendarDays, faCalendarWeek,
  faExclamationCircle, faSync, faDownload,
  faFileExcel, faFilePdf, faSpinner
);

export default {
  name: "Dashboard",
  components: {
    FontAwesomeIcon,
  },
  data() {
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 4; // Show last 5 years
    const years = Array.from({ length: currentYear - startYear + 1 }, (_, i) => startYear + i)
                      .filter(year => year >= 2024 && year <= Math.max(2025, currentYear)) // ensure currentYear is available if > 2025
                      .reverse();

    return {
      chartInstance: null,
      selectedYear: String(Math.min(currentYear, Math.max(...years.map(y=>parseInt(y))))), // Default to current year or max available if current not in range
      years: years,
      selectedProgram: "Diabetes Mellitus",
      programs: ["Diabetes Mellitus", "Hipertensi"],
      summaryCards: {
        jumlahPuskesmas: 0,
        sasaran: 0,
        capaianStandar: 0,
        capaianTidakStandar: 0,
        totalPelayanan: 0,
        persenCapaianPelayanan: '0%'
      },
      processedTableData: [],
      puskesmasRanking: [],
      chartData: { lakiLaki: [], perempuan: [] },
      isLoading: true,
      isDownloading: false,
      showDownloadOptions: false,
      apiStatus: 'idle',
      error: null,
      tableViewMode: 'detailed',
      monthNames: ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"],
      // For sorting
      sortKey: '', // e.g. 'puskesmas_name'
      sortOrders: { // Stores sort order for each key
        'no': 'asc',
        'puskesmas_name': 'asc',
        'sasaran': 'asc',
        'overall_achievement_percentage': 'asc',
      },
      // For pagination
      currentPage: 1,
      itemsPerPage: 10, // Or any default number you prefer
    };
  },
  computed: {
    sortedData() {
      let data = [...this.processedTableData];
      if (this.sortKey) {
        const order = this.sortOrders[this.sortKey] === 'asc' ? 1 : -1;
        data.sort((a, b) => {
          let valA = a[this.sortKey];
          let valB = b[this.sortKey];

          if (this.sortKey === 'no') { // Handle 'no' if it's manually assigned for sorting
             valA = a.originalIndex; // Assuming you add originalIndex if 'no' is not a direct data property
             valB = b.originalIndex;
          }

          // Handle null or undefined for robust sorting
          if (valA === null || valA === undefined) return order; // or -order to put nulls last when asc
          if (valB === null || valB === undefined) return -order; // or order

          if (typeof valA === 'string' && typeof valB === 'string') {
            return valA.localeCompare(valB) * order;
          }
          return (valA < valB ? -1 : valA > valB ? 1 : 0) * order;
        });
      }
      return data;
    },
    totalPages() {
      return Math.ceil(this.sortedData.length / this.itemsPerPage);
    },
    paginatedData() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.sortedData.slice(start, end);
    }
  },
  mounted() {
    if (!this.years.includes(parseInt(this.selectedYear))) {
        this.selectedYear = this.years.length > 0 ? String(this.years[0]) : String(new Date().getFullYear());
    }
    this.fetchData();
  },
  methods: {
    onLoadingComplete() {
      // isLoading will be set to false in fetchData -> finally block
    },
    onLoadingError() {
      // Error is handled, isLoading also set to false in fetchData -> finally
    },
    updateData() {
      this.currentPage = 1; // Reset to first page on data change
      this.sortKey = ''; // Reset sort
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
            disease_type: type
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
        this.summaryCards = { jumlahPuskesmas: 0, sasaran: 0, capaianStandar: 0, capaianTidakStandar: 0, totalPelayanan: 0, persenCapaianPelayanan: '0%'};
        this.chartData = { lakiLaki: [], perempuan: [] };
        if (this.chartInstance) {
          this.chartInstance.destroy();
          this.chartInstance = null;
        }
      } finally {
        setTimeout(() => {
          this.isLoading = false;
          if (this.apiStatus === 'success') {
            this.$nextTick(() => {
              const chartElement = document.getElementById("chart");
              if (chartElement) {
                this.renderChart();
              }
            });
          }
        }, 300);
      }
    },

    processApiData(apiData) {
      if (!apiData || !apiData.summary || !apiData.data) {
        this.error = "Format data tidak sesuai atau data penting tidak tersedia dari API.";
        this.processedTableData = [];
        this.puskesmasRanking = [];
        this.summaryCards = { jumlahPuskesmas: 0, sasaran: 0, capaianStandar: 0, capaianTidakStandar: 0, totalPelayanan: 0, persenCapaianPelayanan: '0%' };
        this.chartData = { lakiLaki: [], perempuan: [] };
        this.apiStatus = 'error';
        if (this.chartInstance) {
            this.chartInstance.destroy();
            this.chartInstance = null;
        }
        return;
      }

      const dataTypeKey = this.selectedProgram === "Hipertensi" ? "ht" : "dm";
      const summaryData = apiData.summary[dataTypeKey.toLowerCase()];

      if (!summaryData) {
        this.error = `Data ringkasan untuk ${this.selectedProgram} tidak ditemukan dalam respons API.`;
        this.processedTableData = [];
        this.puskesmasRanking = [];
        this.summaryCards = { jumlahPuskesmas: 0, sasaran: 0, capaianStandar: 0, capaianTidakStandar: 0, totalPelayanan: 0, persenCapaianPelayanan: '0%' };
        this.chartData = { lakiLaki: [], perempuan: [] };
        this.apiStatus = 'error';
        if (this.chartInstance) {
            this.chartInstance.destroy();
            this.chartInstance = null;
        }
        return;
      }

      this.summaryCards = {
        jumlahPuskesmas: apiData.total_puskesmas || 0,
        sasaran: parseFloat(summaryData.target) || 0,
        capaianStandar: parseFloat(summaryData.standard_patients) || 0,
        capaianTidakStandar: parseFloat(summaryData.non_standard_patients) || 0,
        totalPelayanan: parseFloat(summaryData.total_patients) || 0,
        persenCapaianPelayanan: summaryData.achievement_percentage !== null && summaryData.achievement_percentage !== undefined
                                ? parseFloat(summaryData.achievement_percentage).toFixed(1) + "%"
                                : "0%"
      };
      
      this.puskesmasRanking = (apiData.data || [])
        .map(item => {
            const programSpecificData = item[dataTypeKey.toLowerCase()];
            return {
                puskesmas_name: item.puskesmas_name,
                achievement_percentage: programSpecificData?.achievement_percentage, 
                ranking: item.ranking 
            };
        })
        .sort((a, b) => (a.ranking || Infinity) - (b.ranking || Infinity));


      this.processedTableData = (apiData.data || []).map((item, index) => {
        const puskesmasProgramData = item[dataTypeKey.toLowerCase()];
        const monthlyStats = [];
        for (let i = 1; i <= 12; i++) {
          const monthKey = String(i);
          const monthData = puskesmasProgramData?.monthly_data ? puskesmasProgramData.monthly_data[monthKey] : null;
          monthlyStats.push({
            id: `${item.puskesmas_name}-m${i}`,
            s: monthData?.standard ? Number(monthData.standard) : 0,
            ts: monthData?.non_standard ? Number(monthData.non_standard) : 0,
            percent: monthData?.percentage !== undefined && monthData?.percentage !== null ? Number(monthData.percentage) : null,
          });
        }

        const quarterlyStats = [];
        const annualTargetPuskesmas = Number(puskesmasProgramData?.target) || 0;

        for (let q = 0; q < 4; q++) {
          const startMonthIndex = q * 3;
          const qMonthsDetail = monthlyStats.slice(startMonthIndex, startMonthIndex + 3);
          const lastMonthDataOfQuarter = qMonthsDetail[2] || { s: 0, ts: 0, percent: null }; 

          quarterlyStats.push({
            id: `${item.puskesmas_name}-q${q+1}`,
            months_detail: qMonthsDetail,
            total_s: lastMonthDataOfQuarter.s,
            total_ts: lastMonthDataOfQuarter.ts,
            total_percent: lastMonthDataOfQuarter.percent
          });
        }
        
        const yearTotalS = puskesmasProgramData?.standard_patients ? parseFloat(puskesmasProgramData.standard_patients) : 0;
        const yearTotalTS = puskesmasProgramData?.non_standard_patients ? parseFloat(puskesmasProgramData.non_standard_patients) : 0;
        const yearTotalPercent = annualTargetPuskesmas > 0 ? (yearTotalS / annualTargetPuskesmas) * 100 : null;

        return {
          no: index + 1, // For sorting by original order / display number
          originalIndex: index, // For stable sorting if 'no' is used
          puskesmas_name: item.puskesmas_name,
          sasaran: annualTargetPuskesmas,
          months: monthlyStats, 
          quarters: quarterlyStats,
          year_total_s: yearTotalS,
          year_total_ts: yearTotalTS,
          year_total_percent: yearTotalPercent,
          overall_achievement_percentage: puskesmasProgramData?.achievement_percentage !== undefined && puskesmasProgramData?.achievement_percentage !== null
                                          ? parseFloat(puskesmasProgramData.achievement_percentage)
                                          : null,
        };
      }).filter(Boolean);

      const apiGlobalMonthlyChartData = summaryData.monthly_data || {};
      this.chartData = {
        lakiLaki: Array.from({length: 12}, (_, i) => parseFloat(apiGlobalMonthlyChartData[String(i+1)]?.male) || 0),
        perempuan: Array.from({length: 12}, (_, i) => parseFloat(apiGlobalMonthlyChartData[String(i+1)]?.female) || 0),
      };

      this.apiStatus = 'success';
      this.currentPage = 1; // Reset pagination
    },
    renderChart() {
      const chartElement = document.getElementById("chart");
      if (!chartElement ) return;

      if(!this.chartData || !this.chartData.lakiLaki || !this.chartData.perempuan || this.chartData.lakiLaki.length !== 12 || this.chartData.perempuan.length !== 12) {
          console.warn("Chart data is incomplete or invalid. Skipping chart rendering.");
          if (this.chartInstance) {
              this.chartInstance.destroy();
              this.chartInstance = null;
          }
          const context = chartElement.getContext("2d");
          context.clearRect(0, 0, chartElement.width, chartElement.height); 
          context.font = "16px Arial";
          context.fillStyle = "#666";
          context.textAlign = "center";
          context.fillText("Data grafik tidak tersedia.", chartElement.width / 2, chartElement.height / 2);
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
              pointRadius: 5,
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
          scales: {
            y: { beginAtZero: true, grid: { color: "rgba(200, 200, 200, 0.2)" }, ticks: { color: '#666' } },
            x: { grid: { display: false }, ticks: { color: '#666' } }
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              enabled: true, mode: 'index', intersect: false,
              backgroundColor: 'rgba(0,0,0,0.7)', titleFont: { size: 14 }, bodyFont: { size: 12 },
              padding: 10, cornerRadius: 4, titleColor: '#fff', bodyColor: '#fff',
            }
          },
          animation: { duration: 500, easing: 'easeInOutQuad' }
        }
      });
    },
    toggleDownloadOptions() {
      this.showDownloadOptions = !this.showDownloadOptions;
    },
    async triggerDownload(format) {
      if (this.isDownloading) return;
      this.isDownloading = true;
      this.showDownloadOptions = false;
      this.error = null;
      const programType = this.selectedProgram === "Hipertensi" ? "ht" : "dm";
      const tableTypePayload = this.tableViewMode === 'detailed' ? 'all' : this.tableViewMode;

      const apiUrl = `/statistics/admin/export`;
      try {
        const response = await apiClient.get(apiUrl, {
          params: { 
            year: this.selectedYear, 
            type: programType, 
            format: format, 
            table_type: tableTypePayload,
          },
          responseType: 'blob',
        });
        const blob = new Blob([response.data], { type: response.headers['content-type'] });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const programNameSanitized = this.selectedProgram.toLowerCase().replace(/\s+/g, '_');
        const fileName = `rekap_laporan_${programNameSanitized}_${this.selectedYear}.${tableTypePayload}.${format === 'excel' ? 'xlsx' : 'pdf'}`;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (err) {
        console.error('Error downloading report:', err);
        let message = `Gagal mengunduh laporan ${format.toUpperCase()}. `;
        if (err.response && err.response.data) {
            if (err.response.data instanceof Blob && err.response.data.type === "application/json") {
                try {
                    const errorJson = JSON.parse(await err.response.data.text());
                    message += errorJson.message || err.message || 'Error tidak diketahui.';
                } catch (parseError) {
                    message += err.message || 'Error tidak diketahui dan detail error tidak bisa dibaca.';
                }
            } else if (err.response.data.message) { message += err.response.data.message; }
            else { message += err.message || 'Error tidak diketahui.'; }
        } else { message += err.message || 'Error tidak diketahui.'; }
        this.error = message;
      } finally { this.isDownloading = false; }
    },
    getPercentageClass(value) {
      if (value === null || value === undefined) return '';
      if (value >= 80) return 'high';
      if (value < 50) return 'low';
      return 'medium';
    },
    sortBy(key) {
      if (this.sortKey === key) {
        this.sortOrders[key] = this.sortOrders[key] === 'asc' ? 'desc' : 'asc';
      } else {
        // Reset other sort orders if you want only one active sort at a time (optional)
        // Object.keys(this.sortOrders).forEach(k => {
        //   if (k !== key) this.sortOrders[k] = 'asc';
        // });
        this.sortKey = key;
        this.sortOrders[key] = 'asc'; // Default to ascending on new key
      }
      this.currentPage = 1; // Reset to first page after sorting
    },
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    },
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    },
    goToPage(page) {
        if (page >= 1 && page <= this.totalPages) {
            this.currentPage = page;
        }
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

.top-loading-bar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background-color: var(--primary-100, #d1e9e8);
  z-index: 9999;
  overflow: hidden;
}

.loading-bar-progress {
  width: 100%;
  height: 100%;
  background: var(--primary-500, #047d78);
  animation: indeterminate-progress 2s infinite linear;
  transform-origin: left;
}

@keyframes indeterminate-progress {
  0% {
    transform: translateX(-100%) scaleX(0.5);
  }
  50% {
    transform: translateX(0%) scaleX(1);
  }
  100% {
    transform: translateX(100%) scaleX(0.5);
  }
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
  box-shadow: var(--shadow-md); margin-bottom: 1.5rem;
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
/* .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.5rem; } */
.metrics-grid.three-columns {
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* Selalu 3 kolom */
  gap: 1.5rem;
}

.metric-card {
  background: white; border-radius: var(--radius-lg); padding: 1.5rem;
  box-shadow: var(--shadow-lg); transition: all 0.3s ease-in-out; position: relative; overflow: hidden;
  border-top: 4px solid var(--primary-500); /* Aksen atas default */
}
/* Specific styles for new metric cards */
.metric-card.puskesmas-count { border-top-color: #6366f1; } /* Indigo */
.metric-card.puskesmas-count .metric-icon { background: #e0e7ff; color: #4f46e5; }

.metric-card.total-services { border-top-color: #06b6d4; } /* Cyan */
.metric-card.total-services .metric-icon { background: #cffafe; color: #0891b2; }

.metric-card.achievement-rate { border-top-color: #8b5cf6; } /* Violet */
.metric-card.achievement-rate .metric-icon { background: #f5f3ff; color: #7c3aed; }


.metric-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-xl); }
.metric-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
.metric-icon {
  width: 48px; height: 48px; border-radius: var(--radius-md);
  display: flex; align-items: center; justify-content: center;
  /* background: var(--primary-50); color: var(--primary-600); removed default, using specific above */
}

.metric-icon svg { width: 24px; height: 24px; }
.metric-trend { font-size: 1.25rem; }
.metric-content { text-align: left; }
.metric-title { font-size: 0.875rem; font-weight: 500; color: var(--gray-600); margin: 0 0 0.375rem 0; }
.metric-value { font-size: 2rem; font-weight: 700; color: var(--gray-800); margin: 0 0 0.25rem 0; line-height: 1.2; }
.metric-subtitle { font-size: 0.75rem; color: var(--gray-500); margin: 0; font-weight: 400; }


/* MODIFIED: Chart and Ranking Layout */
.main-content-row {
  display: flex;
  gap: 1.5rem; /* Jarak antar kolom chart dan ranking */
  margin-bottom: 2rem; /* Margin bawah untuk keseluruhan baris */
  flex-wrap: wrap; /* Allow wrapping on smaller screens */
}

.main-content-row .charts-section, /* Target .charts-section di dalam .main-content-row */
.main-content-row .overview-section { /* Target .overview-section di dalam .main-content-row */
  margin-bottom: 0; /* Hapus margin bawah individu karena diatur oleh parent */
}

.main-chart-column {
  flex: 2; /* Chart mengambil 2/3 ruang */
  min-width: 300px; /* Lebar minimum sebelum wrap */
}

.main-ranking-column {
  flex: 1; /* Ranking mengambil 1/3 ruang */
  min-width: 280px; /* Lebar minimum sebelum wrap */
}
.overview-item-empty {
    text-align: center;
    padding: 1.5rem;
    color: var(--gray-500);
    font-style: italic;
}


/* Charts Section (Original styles, some might be overridden or adjusted by flex layout) */
/* .charts-section { margin-bottom: 2rem; } -- Dihapus, diatur oleh .main-content-row */
.chart-card { background: white; border-radius: var(--radius-lg); box-shadow: var(--shadow-lg); overflow: hidden; height: 100%; display: flex; flex-direction: column;}
.chart-header {
  padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--gray-200);
  display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem;
}
.chart-title-section { flex-grow: 1; }
.chart-title {
  font-size: 1.25rem; font-weight: 600; color: var(--gray-800);
  margin: 0 0 0.25rem 0; display: flex; align-items: center; gap: 0.625rem;
}
.chart-subtitle { font-size: 0.875rem; color: var(--gray-500); margin: 0; }
.chart-legends { display: flex; gap: 1.25rem; margin-top: 0.25rem; }
.legend-item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; font-weight: 500; }
.legend-item.male { color: #3B82F6; }
.legend-item.female { color: #EC4899; }
.legend-dot { width: 12px; height: 12px; border-radius: 50%; }
.legend-item.male .legend-dot { background: #3B82F6; }
.legend-item.female .legend-dot { background: #EC4899; }
.chart-container { padding: 1.5rem; height: 380px; flex-grow: 1; } /* Adjusted height */


/* Overview Section (Original styles, some might be overridden or adjusted by flex layout) */
/* .overview-section { margin-bottom: 2rem; } -- Dihapus, diatur oleh .main-content-row */
.overview-card { background: white; border-radius: var(--radius-lg); box-shadow: var(--shadow-lg); overflow: hidden; height: 100%; display: flex; flex-direction: column;}
.overview-header { padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--gray-200); }
.overview-title { font-size: 1.25rem; font-weight: 600; color: var(--gray-800); margin: 0 0 0.25rem 0; display: flex; align-items: center; gap: 0.625rem; }
.overview-subtitle { font-size: 0.875rem; color: var(--gray-500); margin: 0; }
.overview-list { padding: 0.75rem 0; flex-grow: 1; overflow-y: auto; max-height: 380px; /* Match chart height roughly */ }
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
  font-size: 0.875rem; /* 13px, sedikit lebih kecil untuk data padat */
  color: var(--gray-700, #374151);
}

.data-table-enhanced th,
.data-table-enhanced td {
  border-bottom: 1px solid var(--gray-200, #e5e7eb); /* Hanya border bawah untuk kesan lebih ringan */
  border-right: 1px solid var(--gray-200, #e5e7eb); /* Border kanan */
  text-align: center;
  vertical-align: middle;
  white-space: nowrap;
}
/* Apply general header padding like user table's th */
.data-table-enhanced th {
  padding: 0.875rem 1rem; /* 14px 16px */
}

/* Apply general data cell padding closer to user table's td */
.data-table-enhanced td {
  padding: 1rem 0.875rem; /* 16px vertical, 14px horizontal */
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
  font-size: 0.8125rem; /* 13px, header lebih kecil */
  text-transform: uppercase;
  letter-spacing: 0.025em; /* Sedikit spasi antar huruf */
  position: sticky;
  top: 0;
  z-index: 10;
}
.data-table-enhanced thead tr.header-row-1 th { top: 0; }
.data-table-enhanced thead tr.header-row-2 th { top: 48px; } /* Approx: 48px (padding 14*2 + font 13 + border 1 + buffer 6) */
.data-table-enhanced thead tr.header-row-3 th { top: 96px; } /* Approx: 48px * 2 */

.data-table-enhanced .quarter-group-header {
  background-color: var(--primary-50, #eef7f7) !important;
  color: var(--primary-700, #025752) !important;
  font-weight: 600;
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
.data-table-enhanced .sub-header[title] {
  cursor: help;
}

.data-table-enhanced .total-col {
  font-weight: 600;
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
  font-weight: 600;
  color: var(--gray-800, #1f2937);
}
.data-table-enhanced .puskesmas-name-cell::before { display: none; } /* Hapus aksen titik jika ada */

.data-table-enhanced .sasaran-cell {
  font-weight: 600;
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
  background-color: var(--success-50, #f0fdf4);
  font-weight: 600;
}
.data-table-enhanced .percent-col[data-value="low"] {
  color: var(--error-600, #dc2626);
  background-color: var(--error-50, #fef2f2);
  font-weight: 600;
}
.data-table-enhanced .percent-col[data-value="medium"] {
  /* color: var(--warning-500); Optional: if you want a specific color for medium */
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

/* Sortable Headers */
.sortable-header {
  cursor: pointer;
  user-select: none; /* Prevent text selection on click */
}
.sortable-header:hover {
  background-color: var(--gray-200, #e5e7eb) !important;
}
.sortable-header span { /* Sort indicator */
  margin-left: 0.5rem;
  font-size: 0.8em;
  color: var(--primary-500);
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

/* Pagination Styles */
.pagination-controls {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 1rem 0;
  margin-top: 1rem;
  gap: 0.75rem;
}
.pagination-controls button {
  padding: 0.5rem 1rem;
  border: 1px solid var(--gray-300, #d1d5db);
  background-color: white;
  color: var(--primary-600, #036a65);
  border-radius: var(--radius-md, 0.5rem);
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
}
.pagination-controls button:hover:not(:disabled) {
  background-color: var(--primary-50, #eef7f7);
  border-color: var(--primary-400);
}
.pagination-controls button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.pagination-controls span {
  font-size: 0.875rem;
  color: var(--gray-600, #4b5563);
}


/* Responsive adjustments */
@media (max-width: 1024px) { /* Breakpoint untuk stacking chart dan ranking */
  .main-content-row {
    flex-direction: column; /* Stack chart and ranking */
  }
  .main-content-row .main-chart-column,
  .main-content-row .main-ranking-column {
    flex: 1 1 100%; /* Make them full width when stacked */
    margin-bottom: 1.5rem; /* Add margin between stacked items */
  }
  .main-content-row .main-ranking-column {
    margin-bottom: 0; /* Remove margin from the last item if needed, or handled by .main-content-row's own margin */
  }
  .metrics-grid.three-columns {
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); /* Back to auto-fit for smaller screens */
  }
}


@media (max-width: 768px) {
  .dashboard-content { padding: 0.75rem 1rem; }
  .toolbar-content, .table-header-enhanced { flex-direction: column; align-items: stretch; }
  .controls-section { gap: 1rem; }
  .select-wrapper { width: 100%; }
  .print-button { width: 100%; justify-content: center; }

  .view-toggle-tabs { width: 100%; display: grid; grid-template-columns: repeat(3, 1fr); }
  .view-toggle-tabs button { justify-content: center; font-size: 0.8125rem; padding: 0.6rem 0.5rem;}

  /* Adjust table font and padding for smaller screens if they were made larger for desktop */
  .data-table-enhanced { font-size: 0.8125rem; } /* 13px (slightly smaller than new desktop 14px) */
  .data-table-enhanced th { padding: 0.75rem; /* 12px */ }
  .data-table-enhanced td { padding: 0.875rem 0.75rem; /* 14px vertical, 12px horizontal */ }
  .data-table-enhanced thead tr th { font-size: 0.75rem; /* 12px */ }
  .data-table-enhanced .sub-header { font-size: 0.6875rem; /* 11px */ }


  .data-table-enhanced .puskesmas-name-cell { min-width: 160px; }
  .sticky-col-puskesmas { min-width: 160px; left: 44px; }
  .sticky-col-no { min-width: 44px; max-width: 44px; }

  /* RECALCULATE sticky top for 768px if header row heights changed */
  .data-table-enhanced thead tr.header-row-2 th { top: 37px; } /* Approx: 12*2 (padding) + 12 (font) + 1 (border) */
  .data-table-enhanced thead tr.header-row-3 th { top: 74px; }

  .pagination-controls { flex-direction: column; gap: 0.5rem; }
  .pagination-controls button { width: 100%; }


}

@media (max-width: 480px) {
  .dashboard-content { padding: 0.5rem; }
  .table-card-enhanced { padding: 1rem 0.75rem; }
  .table-header-enhanced { gap: 0.75rem; margin-bottom: 1rem; }
  .table-title { font-size: 1.125rem; }
  .table-subtitle { font-size: 0.8125rem; }
  .view-toggle-tabs button { font-size: 0.75rem; padding: 0.5rem; gap: 0.25rem; }

  /* Further adjust table font and padding */
  .data-table-enhanced { font-size: 0.75rem; } /* 12px */
  .data-table-enhanced th { padding: 0.625rem; /* 10px */ }
  .data-table-enhanced td { padding: 0.75rem 0.625rem; /* 12px vertical, 10px horizontal */ }
  .data-table-enhanced thead tr th { font-size: 0.6875rem; /* 11px */ }
  .data-table-enhanced .sub-header { font-size: 0.625rem; /* 10px */ }

  .data-table-enhanced .puskesmas-name-cell { min-width: 120px; }
  .sticky-col-puskesmas { min-width: 120px; left: 38px; }
  .sticky-col-no { min-width: 38px; max-width: 38px; }

  /* RECALCULATE sticky top for 480px */
  .data-table-enhanced thead tr.header-row-2 th { top: 32px; } /* Approx: 10*2 (padding) + 11 (font) + 1 (border) */
  .data-table-enhanced thead tr.header-row-3 th { top: 64px; }

  .metrics-grid.three-columns {
    grid-template-columns: 1fr; /* Single column for very small screens */
  }
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
  .toolbar-card, .metrics-section, .main-content-row, .view-toggle-tabs, .error-message, .download-button-container, .pagination-controls /* Sembunyikan juga tombol download & pagination */ { display: none !important; }
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
  .data-table-enhanced .sortable-header span { display: none; } /* Hide sort indicators on print */

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
/* Download Button Container & Dropdown */
.download-button-container {
  position: relative;
  display: inline-block; /* Agar container tidak mengambil full width jika tidak diperlukan */
}

.download-options {
  position: absolute;
  top: 100%; /* Muncul di bawah tombol */
  right: 0; /* Rata kanan dengan tombol */
  background-color: white;
  border-radius: var(--radius-md, 0.5rem);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--gray-200, #e5e7eb);
  z-index: 100; /* Pastikan di atas elemen lain */
  min-width: 180px; /* Lebar minimum dropdown */
  margin-top: 0.5rem; /* Jarak dari tombol */
  overflow: hidden; /* Agar border-radius bekerja dengan baik */
  animation: fadeInScaleUp 0.2s ease-out;
}

@keyframes fadeInScaleUp {
  from { opacity: 0; transform: translateY(-10px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.download-option {
  display: flex;
  align-items: center;
  gap: 0.75rem; /* Jarak antara ikon dan teks */
  width: 100%;
  padding: 0.75rem 1rem; /* Padding dalam item dropdown */
  text-align: left;
  background-color: transparent;
  border: none;
  cursor: pointer;
  font-size: 0.875rem; /* 14px */
  color: var(--gray-700, #374151);
  transition: background-color 0.15s ease, color 0.15s ease;
}

.download-option .svg-inline--fa { /* Atur ukuran ikon FontAwesome */
  width: 1em;
  height: 1em;
  color: var(--gray-500); /* Warna ikon default */
  transition: color 0.15s ease;
}

.download-option:hover {
  background-color: var(--primary-50, #eef7f7);
  color: var(--primary-600, #036a65);
}
.download-option:hover .svg-inline--fa {
  color: var(--primary-500, #047d78);
}

.download-option:not(:last-child) {
  border-bottom: 1px solid var(--gray-100, #f3f4f6); /* Garis pemisah antar item */
}

/* Update print button untuk mengakomodasi ikon spinner */
.print-button .button-icon .svg-inline--fa.fa-spinner {
    /* Jika perlu style khusus untuk spinner */
}

.print-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: translateY(0); /* Reset transform saat disabled */
  box-shadow: var(--shadow-sm); /* Reset shadow saat disabled */
}
.print-button:disabled:hover .button-shine {
    opacity: 0; /* Sembunyikan shine saat disabled */
}
</style>