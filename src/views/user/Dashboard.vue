<template>
  <!-- Main content with adjusted layout based on sketch -->
  
  <!-- Header with Year and Program Dropdowns -->
  <div class="toolbar">
    <div class="left-section">
      <!-- Dropdown Tahun -->
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
      
      <!-- Print Button - Moved from right to align with sketch -->
      <button class="print-report-button" @click="printReport">
        <font-awesome-icon :icon="['fas', 'print']" />
        Print Laporan
        <font-awesome-icon :icon="['fas', 'chevron-down']" />
      </button>
    </div>
  </div>

  <!-- Summary Cards Section - Added as per sketch -->
  <div class="summary-cards">
    <div class="summary-card">
      <div class="icon-container">
        <font-awesome-icon :icon="['fas', 'users']" class="summary-icon" />
      </div>
      <div class="card-content">
        <h3 class="card-title">Sasaran</h3>
        <p class="card-value">250</p>
        <p class="card-subtitle">(Jumlah)</p>
      </div>
    </div>
    
    <div class="summary-card">
      <div class="icon-container">
        <font-awesome-icon :icon="['fas', 'chart-line']" class="summary-icon" />
      </div>
      <div class="card-content">
        <h3 class="card-title">Total Capaian</h3>
        <p class="card-value">189</p>
        <p class="card-subtitle">(Jumlah)</p>
      </div>
    </div>
    
    <div class="summary-card">
      <div class="icon-container">
        <font-awesome-icon :icon="['fas', 'hospital']" class="summary-icon" />
      </div>
      <div class="card-content">
        <h3 class="card-title">Total Pelayanan</h3>
        <p class="card-value">412</p>
        <p class="card-subtitle">(Jumlah)</p>
      </div>
    </div>
    
    <div class="summary-card">
      <div class="icon-container">
        <font-awesome-icon :icon="['fas', 'percent']" class="summary-icon" />
      </div>
      <div class="card-content">
        <h3 class="card-title">% Capaian Pelayanan</h3>
        <p class="card-value">75.6%</p>
        <p class="card-subtitle">(Sesuai Standar)</p>
      </div>
    </div>
  </div>

  <!-- Statistics Section - Full Width as per sketch -->
  <div class="statistics-card">
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

  <!-- Data Table Section - Full Width Below -->
  <div class="table-section table-card">
    <div class="table-header">
      <h2 class="section-title">Rekap Data Diabetes Mellitus</h2>
    </div>
    
    <!-- Table Container -->
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
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>40</td>
            <td>38</td>
            <td>48</td>
            <td>154</td>
            <td>24%</td>
            <td>30</td>
            <td>124</td>
            <td>24%</td>
            <td>30</td>
            <td>124</td>
            <td>24%</td>
            <td>30</td>
            <td>124</td>
            <td>24%</td>
            <td>30</td>
            <td>124</td>
            <td>24%</td>
            <td>30</td>
            <td>124</td>
            <td>24%</td>
            <td>30</td>
            <td>124</td>
            <td>24%</td>
            <td>30</td>
            <td>124</td>
            <td>24%</td>
            <td>30</td>
            <td>124</td>
            <td>24%</td>
            <td>30</td>
            <td>124</td>
            <td>24%</td>
            <td>30</td>
            <td>124</td>
            <td>24%</td>
            <td>30</td>
            <td>124</td>
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
/* Root Styles */
body {
  background-color: #f7f8f9;
  min-height: 100vh;
  box-sizing: border-box;
  padding: 20px;
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

/* Summary Cards - New section added as per sketch */
.summary-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
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

  @media (max-width: 576px) {
    .summary-cards {
      grid-template-columns: 1fr;
    }
  }
}
</style>