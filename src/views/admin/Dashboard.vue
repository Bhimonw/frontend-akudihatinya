<template>
  <!-- Removed the outermost dashboard div with page-container -->
  <!-- Page now starts directly with the content -->
  
  <!-- Header with Year Dropdown and Print Report Button -->
  <div class="toolbar">
    <!-- Bagian Kiri -->
    <div class="left-section">
      <!-- Bagian Dropdown Tahun -->
      <div class="dropdown-container-year">
        <select id="yearPicker" class="dropdown-select" v-model="selectedYear">
          <option v-for="year in years" :key="year" :value="String(year)">{{ year }}</option>
        </select>
      </div>

      <!-- Dropdown Program Kesehatan -->
      <div class="dropdown-container-program">
        <select id="programPicker" class="dropdown-select" v-model="selectedProgram">
          <option v-for="program in programs" :key="program" :value="program">{{ program }}</option>
        </select>
      </div>

      <button class="print-report-button" @click="printReport">
        <font-awesome-icon :icon="['fas', 'print']" />
        Print Laporan
        <font-awesome-icon :icon="['fas', 'chevron-down']" />
      </button>
    </div>
  </div>

  <!-- Main Content Area with Statistik and Overview side by side -->
  <div class="main-content">
    <!-- Statistics Section - Left Side -->
    <div class="statistics-section">
      <h2 class="section-title">Statistik</h2>
      
      <!-- Legends -->
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
      
      <!-- Chart Container -->
      <div class="chart-container">
        <!-- Y-Axis Values -->
        <div class="y-axis-values">
          <div>100</div>
          <div>80</div>
          <div>60</div>
          <div>40</div>
          <div>20</div>
          <div>0</div>
        </div>
        
        <!-- Chart Placeholder -->
        <div class="chart">
          <!-- This would be your actual chart implementation -->
          <div class="chart-placeholder">
            <div class="chart-date">16 Aug 2022</div>
            <div class="chart-value">$59,492.10</div>
            <!-- Mock chart lines -->
            <div class="chart-line male"></div>
            <div class="chart-line female"></div>
          </div>
        </div>
      </div>
      
      <!-- X-Axis Values -->
      <div class="x-axis-values">
        <div>Jan</div>
        <div>Feb</div>
        <div>Mar</div>
        <div>Apr</div>
        <div>May</div>
        <div>Jun</div>
        <div>Jul</div>
      </div>
    </div>

    <!-- Overview Section - Right Side -->
    <div class="overview-section">
      <h2 class="section-title">Overview</h2>
      
      <div class="overview-list">
        <div class="overview-item">
          <div class="item-number">1</div>
          <div class="item-details">
            <span class="item-name">Martapura 1</span>
            <span class="item-value">169,72 %</span>
          </div>
        </div>
        
        <div class="overview-item">
          <div class="item-number">2</div>
          <div class="item-details">
            <span class="item-name">Gambut</span>
            <span class="item-value">152,44 %</span>
          </div>
        </div>
        
        <div class="overview-item">
          <div class="item-number">3</div>
          <div class="item-details">
            <span class="item-name">Astambul</span>
            <span class="item-value">122,31 %</span>
          </div>
        </div>
        
        <div class="overview-item">
          <div class="item-number">4</div>
          <div class="item-details">
            <span class="item-name">Cintapuri Darussalam</span>
            <span class="item-value">103,10 %</span>
          </div>
        </div>
        
        <div class="overview-item">
          <div class="item-number">5</div>
          <div class="item-details">
            <span class="item-name">Sambung Makmur</span>
            <span class="item-value">99,44 %</span>
          </div>
        </div>
        
        <div class="overview-item">
          <div class="item-number">6</div>
          <div class="item-details">
            <span class="item-name">Kertak Hanyar</span>
            <span class="item-value">93,90 %</span>
          </div>
        </div>
        
        <div class="overview-item">
          <div class="item-number">7</div>
          <div class="item-details">
            <span class="item-name">Sungai Tabuk 2</span>
            <span class="item-value">85,07 %</span>
          </div>
        </div>
        
        <div class="overview-item">
          <div class="item-number">8</div>
          <div class="item-details">
            <span class="item-name">Aranto</span>
            <span class="item-value">83,02 %</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Data Table Section - Full Width Below with Card styling -->
  <div class="table-section table-card">
    <div class="table-header">
      <h2 class="section-title">Rekap Data Diabetes Mellitus</h2>
      
      <div class="table-actions">
        <div class="search-container">
          <font-awesome-icon :icon="['fas', 'search']" class="search-icon" />
          <input type="text" placeholder="Search..." class="search-input" v-model="searchQuery" />
        </div>
        
        <button class="download-button">
          <font-awesome-icon :icon="['fas', 'download']" />
        </button>
        
        <button class="view-all-button">
          Lihat Semua
        </button>
      </div>
    </div>
    
    <!-- Table Container -->
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th rowspan="2">NO</th>
            <th rowspan="2">NAMA PKM</th>
            <th rowspan="2">SASARAN</th>
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
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1</td>
            <td>Puskesmas 1</td>
            <td>200</td>
            <td>40</td>
            <td>38</td>
            <td>48</td>
            <td>154</td>
            <td>24%</td>
            <td>48</td>
            <td>154</td>
            <td>24%</td>
            <td>48</td>
            <td>154</td>
            <td>24%</td>
            <td>48</td>
            <td>154</td>
            <td>24%</td>
            <td>48</td>
            <td>154</td>
            <td>24%</td>
            <td>48</td>
            <td>154</td>
            <td>24%</td>
            <td>48</td>
            <td>154</td>
            <td>24%</td>
            <td>48</td>
            <td>154</td>
            <td>24%</td>
            <td>48</td>
            <td>154</td>
            <td>24%</td>
            <td>48</td>
            <td>154</td>
            <td>24%</td>
            <td>48</td>
            <td>154</td>
            <td>24%</td>
            <td>48</td>
            <td>154</td>
            <td>24%</td>
          </tr>
          <!-- Add more rows as needed -->
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  name: "Dashboard",
  data() {
    const currentYear = new Date().getFullYear();
    const startYear = 2020;
    const years = Array.from({ length: currentYear - startYear + 1 }, (_, i) => startYear + i).reverse();

    return {
      selectedYear: String(currentYear),
      years: years,
      selectedProgram: "Diabetes Mellitus",
      programs: ["Diabetes Mellitus", "Hipertensi"],
      searchQuery: "",
      chartData: {
        // Your chart data would go here
      }
    };
  },
  methods: {
    printReport() {
      console.log("Mencetak laporan...");
      alert("Mencetak laporan untuk " + this.selectedProgram + " tahun " + this.selectedYear);
    }
  }
};
</script>

<style scoped>
/* Root Styles - Removed the dashboard and page-container classes */
/* Background color applied to the body or parent element in your main app */
body {
  background-color: #f7f8f9;
  min-height: 100vh;
  box-sizing: border-box;
  padding: 20px;
}

/* Toolbar */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

/* Bagian Kiri */
.left-section {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

/* Bagian Kanan */
.right-section {
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

/* Main Content Area - Side by side layout */
.main-content {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
}

/* Statistics Section */
.statistics-section {
  flex: 3;
  padding: 20px;
  background: #ffffff;
  border-radius: 10px;
  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.05);
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

/* Chart Placeholder (replace with your actual chart) */
.chart-placeholder {
  position: relative;
  width: 100%;
  height: 100%;
}

.chart-date {
  position: absolute;
  top: 20px;
  left: 100px;
  font-family: "Inter", sans-serif;
  font-size: 12px;
  color: #4f5867;
}

.chart-value {
  position: absolute;
  top: 40px;
  left: 100px;
  font-family: "Inter", sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: #333333;
}

/* Mock chart lines */
.chart-line {
  position: absolute;
  height: 2px;
  bottom: 50px;
  left: 0;
  right: 0;
}

.chart-line.male {
  bottom: 120px;
  background: linear-gradient(90deg, transparent, #3b82f6, #3b82f6, #3b82f6, transparent);
}

.chart-line.female {
  bottom: 80px;
  background: linear-gradient(90deg, transparent, #f59e0b, #f59e0b, #f59e0b, transparent);
}

.x-axis-values {
  display: flex;
  justify-content: space-between;
  padding-left: 20px;
  font-family: "Inter", sans-serif;
  font-size: 12px;
  color: #9aa0a8;
}

/* Overview Section */
.overview-section {
  flex: 1;
  padding: 20px;
  background: #ffffff;
  border-radius: 10px;
  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.05);
}

.overview-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.overview-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.item-number {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 24px;
  height: 24px;
  background-color: #3b82f6;
  color: #ffffff;
  border-radius: 50%;
  font-family: "Inter", sans-serif;
  font-size: 12px;
  font-weight: 600;
}

.item-details {
  display: flex;
  justify-content: space-between;
  width: 100%;
}

.item-name {
  font-family: "Inter", sans-serif;
  font-size: 14px;
  color: #4f5867;
}

.item-value {
  font-family: "Inter", sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #333333;
}

/* Table Section - Added card styling */
.table-section {
  margin-bottom: 30px;
}

/* New class for table card */
.table-card {
  background: #ffffff;
  border-radius: 10px;
  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.05);
  padding: 20px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.table-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* Search Container */
.search-container {
  display: flex;
  align-items: center;
  position: relative;
}

.search-icon {
  position: absolute;
  left: 10px;
  color: #9aa0a8;
  font-size: 16px;
  pointer-events: none;
}

.search-input {
  width: 251px;
  height: 42px;
  padding: 10px 40px 10px 40px;
  border: 1px solid #cdcfD4;
  border-radius: 10px;
  font-family: "Inter", sans-serif;
  font-size: 14px;
  color: #4f5867;
  outline: none;
}

.search-input:hover {
  border-color: var(--primary-500, #10b981);
}

.download-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border: 1px solid #eaeaea;
  border-radius: 10px;
  background: #ffffff;
  color: #4f5867;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.download-button:hover {
  background: #f3f4f6;
  color: var(--primary-500, #10b981);
}

.view-all-button {
  padding: 10px 20px;
  border: 1px solid #eaeaea;
  border-radius: 10px;
  background: #ffffff;
  color: #4f5867;
  font-family: "Inter", sans-serif;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.view-all-button:hover {
  background: #f3f4f6;
  color: var(--primary-500, #10b981);
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
@media (max-width: 992px) {
  .toolbar,
  .table-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .left-section,
  .right-section,
  .table-actions {
    width: 100%;
  }

  .search-container {
    width: 100%;
  }

  .search-input {
    width: 100%;
  }

  .main-content {
    flex-direction: column;
  }

  .statistics-section,
  .overview-section {
    width: 100%;
  }
}
</style>