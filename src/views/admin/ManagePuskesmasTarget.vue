<template>
    <div class="manage-targets-page">
      <div v-if="isOverallLoading" class="top-loading-bar">
        <div class="loading-bar-progress"></div>
      </div>
  
      <header class="page-header- MuiPaper-elevation4">
        <h1 class="page-title-"><font-awesome-icon :icon="['fas', 'bullseye']" /> Manajemen Target Tahunan Puskesmas</h1>
        <p class="page-subtitle-">Sesuaikan target sasaran tahunan untuk setiap Puskesmas berdasarkan program kesehatan dan tahun.</p>
      </header>
  
      <div class="controls-card MuiPaper-elevation1">
        <div class="filter-controls">
          <div class="control-group">
            <label class="control-label" for="select-year">
              <font-awesome-icon :icon="['fas', 'calendar-alt']" /> Tahun:
            </label>
            <div class="select-wrapper">
              <select id="select-year" v-model="selectedYear" @change="clearPuskesmasData" class="modern-select">
                <option v-for="year in years" :key="year" :value="String(year)">{{ year }}</option>
              </select>
            </div>
          </div>
  
          <div class="control-group">
            <label class="control-label" for="select-program">
              <font-awesome-icon :icon="['fas', 'stethoscope']" /> Program Kesehatan:
            </label>
            <div class="select-wrapper">
              <select id="select-program" v-model="selectedProgram" @change="clearPuskesmasData" class="modern-select">
                <option v-for="program in programs" :key="program" :value="program">{{ program }}</option>
              </select>
            </div>
          </div>
           <button @click="fetchPuskesmasTargets" class="load-data-button modern-button primary" :disabled="isLoadingData || isSavingData">
              <font-awesome-icon v-if="isLoadingData" :icon="['fas', 'spinner']" spin />
              <font-awesome-icon v-else :icon="['fas', 'search']" />
              Muat Data Target
            </button>
        </div>
      </div>
  
      <div v-if="error" class="error-message- MuiPaper-elevation1">
        <font-awesome-icon :icon="['fas', 'exclamation-circle']" />
        {{ error }}
         <button @click="fetchPuskesmasTargets" class="retry-button- modern-button error" :disabled="isLoadingData">
          <font-awesome-icon :icon="['fas', 'sync']" /> Coba Lagi
        </button>
      </div>
  
      <div v-if="!isLoadingData && puskesmasTargets.length > 0" class="targets-table-card MuiPaper-elevation1">
        <div class="table-actions">
          <p class="total-puskesmas">Menampilkan {{ puskesmasTargets.length }} Puskesmas</p>
          <div>
            <button @click="resetChanges" class="modern-button warning" :disabled="isSavingData || !hasUnsavedChanges">
              <font-awesome-icon :icon="['fas', 'undo']" /> Reset Perubahan
            </button>
            <button @click="saveAllChanges" class="modern-button success" :disabled="isSavingData || !hasUnsavedChanges">
              <font-awesome-icon v-if="isSavingData" :icon="['fas', 'spinner']" spin />
              <font-awesome-icon v-else :icon="['fas', 'save']" />
              Simpan Semua Perubahan
            </button>
          </div>
        </div>
  
        <div class="table-container-responsive">
          <table class="targets-table">
            <thead>
              <tr>
                <th class="th-no">No.</th>
                <th class="th-name">Nama Puskesmas</th>
                <th class="th-current-target">Target Saat Ini ({{ selectedYear }})</th>
                <th class="th-new-target">Input Target Baru ({{ selectedYear }})</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(puskesmas, index) in puskesmasTargets" :key="puskesmas.puskesmas_id" :class="{ 'row-dirty': puskesmas.is_dirty }">
                <td class="td-no">{{ index + 1 }}</td>
                <td class="td-name">{{ puskesmas.puskesmas_name }}</td>
                <td class="td-current-target">{{ puskesmas.current_target === null ? '-' : puskesmas.current_target }}</td>
                <td class="td-new-target">
                  <input
                    type="number"
                    min="0"
                    v-model.number="puskesmas.new_target"
                    @input="handleTargetInputChange(puskesmas)"
                    @blur="formatTargetInput(puskesmas)"
                    class="target-input"
                    :disabled="isSavingData"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
         <div v-if="hasUnsavedChanges" class="unsaved-changes-footer MuiPaper-elevation0">
            <font-awesome-icon :icon="['fas', 'exclamation-triangle']" /> Anda memiliki perubahan yang belum disimpan.
        </div>
      </div>
       <div v-if="!isLoadingData && apiStatus === 'success' && puskesmasTargets.length === 0 && initialLoadAttempted" class="no-data-message MuiPaper-elevation1">
        <font-awesome-icon :icon="['fas', 'info-circle']" />
        Tidak ada data Puskesmas ditemukan untuk tahun dan program yang dipilih, atau belum ada Puskesmas yang terdata.
      </div>
  
    </div>
  </template>
  
  <script>
  import apiClient from "../../api.js"; // Sesuaikan path ke apiClient Anda
  import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
  import {
    faCalendarAlt, faStethoscope, faSearch, faSpinner, faExclamationCircle,
    faSync, faSave, faUndo, faBullseye, faInfoCircle, faExclamationTriangle
  } from '@fortawesome/free-solid-svg-icons';
  import { library } from '@fortawesome/fontawesome-svg-core';
  
  library.add(
    faCalendarAlt, faStethoscope, faSearch, faSpinner, faExclamationCircle,
    faSync, faSave, faUndo, faBullseye, faInfoCircle, faExclamationTriangle
  );
  
  export default {
    name: "ManagePuskesmasTargets",
    components: {
      FontAwesomeIcon,
    },
    data() {
      const currentYear = new Date().getFullYear();
      const startYear = currentYear - 5; // Atau rentang tahun yang sesuai
      const years = Array.from({ length: currentYear - startYear + 1 }, (_, i) => startYear + i).reverse();
  
      return {
        selectedYear: String(currentYear),
        years: years.filter((year) => year >= 2024 && year <= 2025), // Sesuaikan dengan kebutuhan
        selectedProgram: "Diabetes Mellitus", // Default program
        programs: ["Diabetes Mellitus", "Hipertensi"],
        
        puskesmasTargets: [], // Data: { puskesmas_id, puskesmas_name, current_target, new_target, original_target, is_dirty }
        originalPuskesmasTargetsMap: new Map(), // Untuk menyimpan original target value for reset and dirty checking
  
        apiStatus: 'idle', // 'idle', 'loading', 'success', 'error'
        isLoadingData: false,
        isSavingData: false,
        initialLoadAttempted: false, // Untuk membedakan "belum ada data" dari "belum load"
        error: null,
      };
    },
    computed: {
      isOverallLoading() {
        return this.isLoadingData || this.isSavingData;
      },
      programTypeKey() {
        return this.selectedProgram === "Hipertensi" ? "ht" : "dm";
      },
      hasUnsavedChanges() {
        return this.puskesmasTargets.some(p => p.is_dirty);
      }
    },
    methods: {
      clearPuskesmasData() {
        this.puskesmasTargets = [];
        this.originalPuskesmasTargetsMap.clear();
        this.apiStatus = 'idle';
        this.initialLoadAttempted = false;
        this.error = null;
      },
      async fetchPuskesmasTargets() {
        this.isLoadingData = true;
        this.apiStatus = 'loading';
        this.error = null;
        this.initialLoadAttempted = true;
        this.puskesmasTargets = [];
        this.originalPuskesmasTargetsMap.clear();
  
        try {
          const response = await apiClient.get("/admin/yearly-targets", {
            params: {
              year: this.selectedYear,
              disease_type: this.programTypeKey,
            },
          });
  
          if (response.data && Array.isArray(response.data.targets)) {
            this.puskesmasTargets = response.data.targets.map(p => {
              const currentTarget = p.target_count === null || p.target_count === undefined ? null : Number(p.target_count);
              this.originalPuskesmasTargetsMap.set(p.puskesmas_id, currentTarget);
              return {
                id: p.id,
                puskesmas_id: p.puskesmas_id,
                puskesmas_name: p.puskesmas_name,
                current_target: currentTarget,
                new_target: currentTarget, // new_target diisi dengan current_target awal
                is_dirty: false,
              };
            });
            this.apiStatus = 'success';
          } else {
            this.puskesmasTargets = [];
            this.apiStatus = 'success'; // Success, tapi data kosong
            console.warn("API response data is not an array or missing:", response.data);
          }
        } catch (err) {
          console.error("Error fetching Puskesmas targets:", err);
          this.error = `Gagal memuat data target: ${err.response?.data?.message || err.message || 'Error tidak diketahui.'}`;
          this.apiStatus = 'error';
          this.puskesmasTargets = [];
        } finally {
          this.isLoadingData = false;
        }
      },
  
      handleTargetInputChange(puskesmasItem) {
        const originalTarget = this.originalPuskesmasTargetsMap.get(puskesmasItem.puskesmas_id);
        // Pastikan new_target adalah angka, jika kosong atau tidak valid, anggap null atau 0
        let newTargetValue = puskesmasItem.new_target;
        if (typeof newTargetValue === 'string' && newTargetValue.trim() === '') {
          newTargetValue = null;
        } else {
          newTargetValue = Number(newTargetValue);
          if (isNaN(newTargetValue) || newTargetValue < 0) {
            newTargetValue = 0; // atau null, tergantung preferensi jika input tidak valid
          }
        }
        puskesmasItem.new_target = newTargetValue; // Update model
        
        // Bandingkan dengan nilai numerik atau null secara konsisten
        const originalIsNull = originalTarget === null || originalTarget === undefined;
        const newIsNull = newTargetValue === null || newTargetValue === undefined;
  
        if (originalIsNull && newIsNull) {
          puskesmasItem.is_dirty = false;
        } else {
          puskesmasItem.is_dirty = newTargetValue !== originalTarget;
        }
      },
      
      formatTargetInput(puskesmasItem) {
        // Fungsi ini bisa digunakan untuk memformat input saat blur, misal memastikan itu angka
        // atau mengembalikan ke nilai original jika input tidak valid.
        // Untuk sekarang, validasi utama ada di handleTargetInputChange dan sebelum save.
        if (puskesmasItem.new_target === null || puskesmasItem.new_target === undefined || String(puskesmasItem.new_target).trim() === '') {
           puskesmasItem.new_target = null; // Atau 0 jika preferensi
        } else {
          const numValue = Number(puskesmasItem.new_target);
          puskesmasItem.new_target = isNaN(numValue) || numValue < 0 ? 0 : numValue;
        }
        this.handleTargetInputChange(puskesmasItem); // re-evaluate dirty status
      },
  
      async saveAllChanges() {
        if (!this.hasUnsavedChanges) {
          alert("Tidak ada perubahan untuk disimpan.");
          return;
        }
        this.isSavingData = true;
        this.error = null;
  
        const dirtyTargets = this.puskesmasTargets.filter(p => p.is_dirty);
  
        if (dirtyTargets.length === 0) {
          alert("Tidak ada perubahan valid untuk disimpan."); // Seharusnya tidak terjadi jika hasUnsavedChanges true
          this.isSavingData = false;
          return;
        }
  
        let allRequestsSuccessful = true;
        const errorMessages = [];
  
        // Iterasi setiap target yang berubah dan kirim request PUT
        for (const targetItem of dirtyTargets) {
          // Pastikan targetItem.id ada (seharusnya sudah dari fetch)
          if (targetItem.id === undefined || targetItem.id === null) {
            console.warn(`Target untuk Puskesmas ${targetItem.puskesmas_name} tidak memiliki ID record. Dilewati.`);
            errorMessages.push(`Data target untuk ${targetItem.puskesmas_name} tidak lengkap (missing ID).`);
            allRequestsSuccessful = false;
            continue; 
          }

          // Persiapkan payload untuk PUT.
          // API PUT /api/admin/yearly-targets/{id} mungkin mengharapkan body yang merepresentasikan resource target.
          // Berdasarkan GET response, field yang relevan adalah: puskesmas_id, disease_type, year, dan target_count.
          const payload = {
            target_count: targetItem.new_target === null || String(targetItem.new_target).trim() === '' ? null : Number(targetItem.new_target),
          };
  
          try {
            // Ganti dengan endpoint API PUT Anda, menggunakan targetItem.id
            await apiClient.put(`/admin/yearly-targets/${targetItem.id}`, payload);
            // Tidak perlu update state lokal per item di sini, karena kita akan fetch ulang semua data
          } catch (err) {
            allRequestsSuccessful = false;
            const message = `Gagal menyimpan target untuk ${targetItem.puskesmas_name}: ${err.response?.data?.message || err.message || 'Error tidak diketahui.'}`;
            errorMessages.push(message);
            console.error(message, err);
          }
        }
  
        this.isSavingData = false;
 
        if (allRequestsSuccessful) {
          alert("Semua perubahan target berhasil disimpan!");
          await this.fetchPuskesmasTargets(); // Muat ulang data untuk mendapatkan state terbaru & reset dirty flags
        } else {
          this.error = "Beberapa perubahan gagal disimpan:\n- " + errorMessages.join("\n- ");
          alert(this.error);
          // Muat ulang data juga jika ada kegagalan, untuk menyinkronkan dengan state server
          await this.fetchPuskesmasTargets(); 
        }
      },
  
      resetChanges() {
        this.puskesmasTargets.forEach(p => {
          p.new_target = this.originalPuskesmasTargetsMap.get(p.puskesmas_id);
          p.is_dirty = false;
        });
      }
    },
    // watch: { // Jika ingin auto-load saat filter berubah, tapi tombol "Muat Data" lebih eksplisit
    //   selectedYear() {
    //     this.fetchPuskesmasTargets();
    //   },
    //   selectedProgram() {
    //     this.fetchPuskesmasTargets();
    //   }
    // }
  };
  </script>
  
  <style scoped>
  /* General Page Styles */
.manage-targets-page {
  padding: 24px; /* Increased padding */
  max-width: 1200px;
  margin: 30px auto; /* Increased margin */
  font-family: var(--font-sans, "Inter", sans-serif);
  background-color: var(--gray-50, #f8f9fa); /* Slightly lighter bg */
  border-radius: var(--radius-xl, 0.75rem);
  box-shadow: var(--shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05));
}

/* Using semantic names for shadows instead of MuiPaper-elevationX */
.card-shadow-1 { /* Replaces MuiPaper-elevation1 */
  box-shadow: var(--shadow-md);
}
.card-shadow-2 { /* Replaces MuiPaper-elevation4 */
  box-shadow: var(--shadow-lg);
}
.card-shadow-0 { /* Replaces MuiPaper-elevation0 */
  box-shadow: none;
}


.page-header- {
  background-color: var(--primary-500, #047d78);
  color: white;
  padding: 24px 30px; /* Increased padding */
  border-radius: var(--radius-lg, 0.5rem) var(--radius-lg, 0.5rem) 0 0; /* Consistent radius */
  margin: -24px -24px 24px -24px; /* Adjust to new padding */
}

.page-title- {
  font-size: 1.875rem; /* Slightly larger */
  font-weight: 600;
  margin: 0 0 8px 0; /* Increased bottom margin */
  display: flex;
  align-items: center;
  gap: 12px; /* Increased gap */
}

.page-subtitle- {
  font-size: 1rem; /* Slightly larger for readability */
  font-weight: 300;
  opacity: 0.95; /* Slightly more opaque */
  margin: 0;
}

.controls-card {
  background-color: white;
  padding: 24px; /* Increased padding */
  border-radius: var(--radius-lg, 0.5rem);
  margin-bottom: 24px; /* Increased margin */
}

.filter-controls {
  display: flex;
  gap: 24px; /* Increased gap */
  align-items: flex-end;
  flex-wrap: wrap;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex-grow: 1;
  min-width: 200px; /* Slightly wider min-width */
}

.control-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--gray-700, #495057);
  display: flex;
  align-items: center;
  gap: 8px; /* Increased gap */
}

.select-wrapper {
  position: relative;
}

.modern-select {
  width: 100%;
  padding: 0.75rem 1rem; /* Increased padding for better touch targets / click area */
  border-radius: var(--radius-md, 0.375rem);
  border: 1px solid var(--gray-300, #dee2e6);
  background-color: white;
  font-size: 0.9375rem; /* 15px, slightly larger for readability */
  color: var(--gray-800, #343a40);
  appearance: none;
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s;
  background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23495057' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E"); /* Thicker arrow, darker color */
  background-repeat: no-repeat;
  background-position: right 0.875rem center;
  padding-right: 3rem; /* More space for arrow */
  line-height: 1.5;
}

.modern-select:hover {
  border-color: var(--primary-400, #47b1ac);
}

.modern-select:focus {
  outline: none;
  border-color: var(--primary-500, #047d78);
  box-shadow: 0 0 0 3px rgba(4, 125, 120, 0.25); /* Slightly more prominent focus */
}

.modern-button {
  padding: 0.75rem 1.5rem; /* Increased padding */
  border: none;
  border-radius: var(--radius-md, 0.375rem);
  font-size: 0.9375rem; /* Consistent with select */
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.1s, box-shadow 0.2s; /* Added box-shadow transition */
  display: inline-flex;
  align-items: center;
  gap: 10px; /* Increased gap */
  line-height: 1.5; /* Ensure text vertical alignment */
  box-shadow: var(--shadow-sm); /* Subtle shadow for buttons */
}

.modern-button:hover:not(:disabled) {
  transform: translateY(-2px); /* More noticeable hover effect */
  box-shadow: var(--shadow-md); /* Enhanced shadow on hover */
}

.modern-button:active:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.modern-button:disabled {
  opacity: 0.5; /* Slightly more opaque when disabled */
  cursor: not-allowed;
  box-shadow: none;
}

.modern-button.primary {
  background-color: var(--primary-500, #047d78);
  color: white;
}
.modern-button.primary:hover:not(:disabled) {
  background-color: var(--primary-600, #036a65);
}

.modern-button.success {
  background-color: var(--success-500, #22c55e);
  color: white;
}
.modern-button.success:hover:not(:disabled) {
  background-color: var(--success-600, #16a34a);
}

.modern-button.warning {
  background-color: var(--warning-500, #f59e0b);
  color: white;
}
.modern-button.warning:hover:not(:disabled) {
  background-color: var(--warning-600, #d97706);
}

.modern-button.error {
  background-color: var(--error-500, #ef4444);
  color: white;
}
.modern-button.error:hover:not(:disabled) {
  background-color: var(--error-600, #dc2626);
}

.load-data-button {
  /* No specific changes, inherits from modern-button.primary */
  min-height: calc(0.75rem * 2 + 1.5em + 2px); /* Match select height roughly */
}


.error-message- {
  background-color: var(--error-50, #fef2f2);
  color: var(--error-600, #dc2626); /* Darker error text for contrast */
  padding: 1rem 1.5rem;
  border-radius: var(--radius-md, 0.375rem);
  margin-bottom: 24px;
  border: 1px solid var(--error-200, #fecaca);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px; /* Increased gap */
  font-weight: 500; /* Make error text slightly bolder */
}
.error-message- .svg-inline--fa {
  font-size: 1.25em; /* Make icon slightly larger */
}
/* Retain card shadow for error message too */
.error-message-.card-shadow-1 {
  box-shadow: var(--shadow-md);
}


.targets-table-card {
  background-color: white;
  border-radius: var(--radius-lg, 0.5rem);
  padding: 0;
  margin-top: 24px;
  overflow: hidden;
}

.table-actions {
  padding: 16px 24px; /* Adjusted padding */
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px; /* Increased gap */
  border-bottom: 1px solid var(--gray-200, #e9ecef);
}

.total-puskesmas {
  font-size: 0.9375rem; /* Consistent with button/select text */
  color: var(--gray-700, #495057);
  margin: 0;
  font-weight: 500;
}

.table-actions div {
  display: flex;
  gap: 12px; /* Adjusted gap */
}

.table-container-responsive {
  overflow-x: auto;
  width: 100%;
}

.targets-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.targets-table th,
.targets-table td {
  padding: 14px 18px; /* Increased padding */
  text-align: left;
  border-bottom: 1px solid var(--gray-200, #e9ecef);
  vertical-align: middle;
}
.targets-table tr:last-child td {
  border-bottom: none; /* Remove border from last row for cleaner look inside card */
}

.targets-table thead th {
  background-color: var(--gray-100, #f1f3f5); /* Slightly lighter header */
  color: var(--gray-800, #343a40); /* Darker text for better contrast */
  font-weight: 600; /* Bolder headers */
  white-space: nowrap;
  font-size: 0.9rem; /* Header font slightly larger */
}

.th-no { width: 5%; text-align: center; }
.th-name { width: auto; min-width: 250px; } /* Allow name to take more space */
.th-current-target { width: 20%; text-align: center; }
.th-new-target { width: 25%; text-align: center; }

.td-no,
.td-current-target { text-align: center; color: var(--gray-700, #495057); }

.td-name {
  color: var(--gray-900, #212529); /* Darker name for emphasis */
  font-weight: 500;
}

.target-input {
  width: 100%;
  max-width: 100px; /* Slightly smaller max-width if centered */
  padding: 0.5rem 0.625rem; /* 8px 10px */
  border: 1px solid var(--gray-300, #dee2e6);
  border-radius: var(--radius-sm, 0.25rem);
  font-size: 0.875rem;
  text-align: center;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box; /* Important for consistent sizing */
}

.target-input:focus {
  outline: none;
  border-color: var(--primary-500, #047d78);
  box-shadow: 0 0 0 2px rgba(4, 125, 120, 0.2); /* Slightly softer focus */
}

.target-input:disabled {
  background-color: var(--gray-100, #f1f3f5);
  cursor: not-allowed;
  color: var(--gray-500); /* Indicate disabled text */
}

.row-dirty td {
  background-color: var(--warning-50, #fffbeb) !important;
  /* Consider removing !important if possible by ensuring selector specificity */
}
.row-dirty .target-input {
  border-color: var(--warning-500, #f59e0b);
  background-color: white; /* Ensure input remains white when dirty */
}

.no-data-message {
  padding: 24px; /* Increased padding */
  text-align: center;
  color: var(--gray-700, #495057); /* Darker text */
  background-color: white;
  border-radius: var(--radius-md, 0.375rem);
  margin-top: 24px;
  font-size: 1rem; /* Larger font */
  display: flex; /* For icon alignment */
  flex-direction: column; /* Stack icon and text */
  align-items: center;
  justify-content: center;
  gap: 12px;
}
.no-data-message .svg-inline--fa {
  font-size: 2em; /* Larger icon */
  color: var(--primary-500, #047d78);
}
/* Retain card shadow for no-data message too */
.no-data-message.card-shadow-1 {
  box-shadow: var(--shadow-md);
}


.unsaved-changes-footer {
  padding: 12px 24px; /* Adjusted padding */
  background-color: var(--warning-50, #fffbeb);
  color: var(--warning-700, #b45309);
  font-size: 0.9375rem; /* Consistent with buttons */
  font-weight: 500; /* Bolder text */
  text-align: center;
  border-top: 1px solid var(--warning-200, #fde68a);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px; /* Increased gap */
}
.unsaved-changes-footer .svg-inline--fa {
  font-size: 1.2em; /* Slightly larger icon */
}


.top-loading-bar {
  position: fixed; /* Ensure it's fixed */
  top: 0;
  left: 0;
  width: 100%;
  height: 3px; /* Thinner bar */
  background-color: var(--primary-100, #d1e9e8);
  z-index: 9999;
  overflow: hidden;
}
.loading-bar-progress {
  width: 100%;
  height: 100%;
  background: var(--primary-500, #047d78);
  animation: indeterminate-progress-targets 2s infinite linear;
  transform-origin: left;
}
@keyframes indeterminate-progress-targets {
  0% { transform: translateX(-100%) scaleX(0.5); }
  50% { transform: translateX(0%) scaleX(0.75); } /* Changed scaleX */
  100% { transform: translateX(100%) scaleX(0.5); }
}


@media (max-width: 768px) {
  .manage-targets-page {
    margin: 15px; /* Adjusted margin */
    padding: 16px; /* Adjusted padding */
  }
  .page-header- {
    margin: -16px -16px 16px -16px; /* Adjusted to new padding */
    padding: 20px 24px; /* Adjusted padding */
  }
  .page-title- {
    font-size: 1.625rem; /* Adjusted font size */
    gap: 10px;
  }
  .page-subtitle- {
    font-size: 0.9375rem;
  }

  .filter-controls {
    flex-direction: column;
    align-items: stretch;
    gap: 16px; /* Adjusted gap */
  }
  .control-group {
    min-width: unset;
  }
  .load-data-button {
    width: 100%;
    justify-content: center;
    margin-top: 8px; /* Adjusted margin */
  }

  .table-actions {
    flex-direction: column;
    align-items: stretch;
    padding: 16px; /* Adjusted padding */
  }
  .table-actions div {
    flex-direction: column;
    width: 100%;
    gap: 10px; /* Adjusted gap */
  }
  .modern-button { /* Applies to all buttons in table-actions on mobile */
    width: 100%;
    justify-content: center;
  }

  .targets-table th,
  .targets-table td {
    padding: 12px 10px; /* Adjusted padding */
    font-size: 0.8125rem; /* Slightly smaller font for small screens */
  }
  .th-no, .td-no { display: none; }
  .th-name { width: auto; min-width: 150px;} /* Allow name to take up space */
  .th-current-target { width: 28%; }
  .th-new-target { width: 32%; }

  .target-input {
    max-width: 70px; /* Smaller input on mobile */
    padding: 0.4rem 0.5rem; /* Adjust padding */
    font-size: 0.8125rem;
  }
  .error-message- {
    flex-direction: column; /* Stack elements in error message on mobile */
    text-align: center;
  }
  .error-message- .retry-button- {
    width: 100%;
    margin-top: 10px;
  }
}
</style>