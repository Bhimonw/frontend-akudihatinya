<template>
  <div class="manajemen-user">
    <div class="page-container card-shadow-1">
      <header class="page-header-alt card-shadow-2">
        <h1 class="page-title-alt">
          <font-awesome-icon :icon="['fas', 'bullseye']" /> Manajemen Sasaran Tahunan
          Puskesmas
        </h1>
        <p class="page-subtitle-alt">
          Sesuaikan target sasaran tahunan untuk setiap Puskesmas berdasarkan program
          kesehatan dan tahun.
        </p>
      </header>

      <div class="toolbar">
        <div class="left-section">
          <button
            @click="resetChanges"
            class="modern-button warning"
            :disabled="isSavingData || !hasUnsavedChanges"
          >
            <font-awesome-icon :icon="['fas', 'undo']" />
            <span>Reset Perubahan</span>
          </button>
          <button
            @click="saveAllChanges"
            class="modern-button success"
            :disabled="isSavingData || !hasUnsavedChanges"
          >
            <font-awesome-icon v-if="isSavingData" :icon="['fas', 'spinner']" spin />
            <font-awesome-icon v-else :icon="['fas', 'save']" />
            <span>Simpan Semua Perubahan</span>
          </button>
        </div>

        <div class="right-section">
          <div class="dropdown-container-year">
            <select
              id="select-year"
              v-model="selectedYear"
              @change="fetchPuskesmasTargets"
              class="dropdown-select"
            >
              <option v-for="year in years" :key="year" :value="String(year)">
                {{ year }}
              </option>
            </select>
          </div>

          <div class="dropdown-container-program">
            <select
              id="select-program"
              v-model="selectedProgram"
              @change="fetchPuskesmasTargets"
              class="dropdown-select"
            >
              <option v-for="program in programs" :key="program" :value="program">
                {{ program }}
              </option>
            </select>
          </div>

          <div class="search-container">
            <font-awesome-icon :icon="['fas', 'search']" class="search-icon" />
            <input
              type="text"
              placeholder="Cari Puskesmas..."
              class="search-input"
              v-model="searchQuery"
              @input="handleSearchInput"
            />
          </div>
        </div>
      </div>

      <div v-if="error" class="error-message-alt card-shadow-1">
        <div class="error-content">
          <font-awesome-icon :icon="['fas', 'exclamation-circle']" />
          <p>{{ error }}</p>
        </div>
        <button
          @click="fetchPuskesmasTargets"
          class="modern-button error"
          :disabled="isLoadingData"
        >
          <font-awesome-icon :icon="['fas', 'sync']" /> Coba Lagi
        </button>
      </div>

      <div class="table-container-enhanced">
        <table class="data-table-enhanced">
          <thead>
            <tr>
              <th class="narrow-cell">No</th>
              <th>Nama Puskesmas</th>
              <th class="th-target-col">Sasaran Saat Ini ({{ selectedYear }})</th>
              <th class="th-target-col">Input Sasaran Baru</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="isLoadingData">
              <td colspan="4"> <div class="loading-container">
                  <div class="loading-content">
                    <div class="spinner"></div>
                    <p>Memuat data...</p>
                  </div>
                </div>
              </td>
            </tr>
            <tr v-else-if="!isLoadingData && puskesmasTargets.length === 0">
              <td colspan="4" class="no-data"> <div class="empty-state-content">
                  <font-awesome-icon :icon="['fas', 'info-circle']" class="empty-icon" />
                  <h3>Tidak ada data ditemukan</h3>
                  <p>
                    Tidak ada data Puskesmas ditemukan untuk tahun dan program yang dipilih,
                    atau belum ada Puskesmas yang terdata.
                  </p>
                </div>
              </td>
            </tr>
            <tr
              v-else
              v-for="(puskesmas, index) in paginatedPuskesmasTargets"
              :key="puskesmas.puskesmas_id"
              :class="{ 'row-dirty': puskesmas.is_dirty }"
            >
              <td class="narrow-cell">{{ firstItemIndex + index + 1 }}</td>
              <td>{{ puskesmas.puskesmas_name }}</td>
              <td class="td-target-display">
                {{
                  puskesmas.current_target === null
                    ? '-'
                    : puskesmas.current_target
                }}
              </td>
              <td class="td-target-input">
                <input
                  type="number"
                  min="0"
                  v-model.number="puskesmas.new_target"
                  @input="handleTargetInputChange(puskesmas)"
                  @blur="formatTargetInput(puskesmas)"
                  class="target-input"
                  :disabled="isSavingData"
                  placeholder="Isi target..."
                />
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="hasUnsavedChanges" class="unsaved-changes-footer card-shadow-0">
          <font-awesome-icon :icon="['fas', 'exclamation-triangle']" /> Anda memiliki
          perubahan yang belum disimpan.
        </div>
        
        <!-- Pagination -->
        <div class="pagination-container" v-if="puskesmasTargets.length > 0">
          <div class="pagination-info">
            <p class="pagination-text">
              Baris per halaman:
              <div class="pagination-dropdown-wrapper">
                <select v-model.number="itemsPerPage" class="pagination-dropdown-select">
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
              </div>
              Menampilkan {{ firstItemIndex + 1 }} - {{ lastItemIndex }} dari {{ puskesmasTargets.length }} data
            </p>
          </div>
          <nav class="pagination-nav" aria-label="Pagination">
            <button class="pagination-button prev" @click="prevPage" :disabled="currentPage === 1">
              <font-awesome-icon :icon="['fas', 'chevron-left']" />
            </button>
            
            <template v-for="(item, index) in paginationItems" :key="index">
              <button v-if="item !== 'ellipsis'" :class="['pagination-button', { 'active': currentPage === item }]" @click="goToPage(item)">
                {{ item }}
              </button>
              <div v-else class="pagination-ellipsis">...</div>
            </template>
            
            <button class="pagination-button next" @click="nextPage" :disabled="currentPage === totalPages">
              <font-awesome-icon :icon="['fas', 'chevron-right']" />
            </button>
          </nav>
        </div>
      </div>
    </div>

    <div v-if="isOverallLoading" class="top-loading-bar">
      <div class="loading-bar-progress"></div>
    </div>
  </div>
</template>

<script>
import apiClient from "../../api.js";
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import {
  faCalendarAlt, faStethoscope, faSearch, faSpinner, faExclamationCircle,
  faSync, faSave, faUndo, faBullseye, faInfoCircle, faExclamationTriangle,
  faEdit, faUsers, faPlus, faTimes, faUsersSlash, faChevronLeft, faChevronRight,
  faDownload
} from '@fortawesome/free-solid-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';

library.add(
  faCalendarAlt, faStethoscope, faSearch, faSpinner, faExclamationCircle,
  faSync, faSave, faUndo, faBullseye, faInfoCircle, faExclamationTriangle,
  faEdit, faUsers, faPlus, faTimes, faUsersSlash, faChevronLeft, faChevronRight,
  faDownload
);

export default {
  name: "ManagePuskesmasTargets",
  components: {
    FontAwesomeIcon,
  },
  data() {
    const currentYear = new Date().getFullYear();
    const yearsAvailable = Array.from({ length: 4 }, (_, i) => currentYear + 1 - i);

    return {
      selectedYear: String(currentYear),
      years: yearsAvailable,
      selectedProgram: "Diabetes Mellitus", // Default program
      programs: ["Diabetes Mellitus", "Hipertensi"],

      puskesmasTargets: [],
      originalPuskesmasTargetsMap: new Map(),

      apiStatus: 'idle',
      isLoadingData: false,
      isSavingData: false,
      initialLoadAttempted: false,
      error: null,
      searchQuery: '',
      searchTimeout: null,
      
      // Pagination
      currentPage: 1,
      itemsPerPage: 10,
      totalRecords: 0,
      lastPage: 1,
      from: 0,
      to: 0,
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
    },
    
    // Pagination computed properties
    totalPages() {
      return Math.ceil(this.totalRecords / this.itemsPerPage);
    },
    paginatedPuskesmasTargets() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      const paginatedData = this.puskesmasTargets.slice(start, end);
      
      console.log('🔢 Pagination calculation:');
      console.log('  - Total data:', this.puskesmasTargets.length);
      console.log('  - Current page:', this.currentPage);
      console.log('  - Items per page:', this.itemsPerPage);
      console.log('  - Start index:', start);
      console.log('  - End index:', end);
      console.log('  - Paginated data length:', paginatedData.length);
      
      return paginatedData;
    },
    firstItemIndex() {
      return (this.currentPage - 1) * this.itemsPerPage;
    },
    lastItemIndex() {
      const last = this.currentPage * this.itemsPerPage;
      return Math.min(last, this.puskesmasTargets.length);
    },
    paginationItems() {
      const result = [];
      const totalPages = this.totalPages;
      const currentPage = this.currentPage;
      
      if (totalPages <= 7) {
        for (let i = 1; i <= totalPages; i++) {
          result.push(i);
        }
        return result;
      }
      
      result.push(1);
      
      if (currentPage > 4) {
        result.push('ellipsis');
      }
      
      if (currentPage <= 4) {
        for (let i = 2; i <= 5; i++) {
          if (i < totalPages) result.push(i);
        }
      } else if (currentPage >= totalPages - 3) {
        for (let i = totalPages - 4; i < totalPages; i++) {
          result.push(i);
        }
      } else {
        result.push(currentPage - 1, currentPage, currentPage + 1);
      }
      
      if (currentPage < totalPages - 3) {
        result.push('ellipsis');
      }
      
      if (totalPages > 1) {
        result.push(totalPages);
      }
      
      return [...new Set(result)];
    },
  },
  created() {
    this.fetchPuskesmasTargets();
  },
  methods: {
    async fetchPuskesmasTargets() {
      this.isLoadingData = true;
      this.apiStatus = 'loading';
      this.error = null;
      this.initialLoadAttempted = true;

      try {
        const response = await apiClient.get("/admin/yearly-targets", {
          params: {
            year: this.selectedYear,
            disease_type: this.programTypeKey,
            search: this.searchQuery || undefined,
            page: this.currentPage,
            per_page: this.itemsPerPage
          },
        });

        const payload = response.data;
        const rows = payload.data || [];
        const meta = payload.meta || {};

        this.puskesmasTargets = rows.map(p => {
          const currentTarget = p.target_count === null || p.target_count === undefined ? null : Number(p.target_count);
          this.originalPuskesmasTargetsMap.set(p.puskesmas_id, currentTarget);
          return {
            id: p.id,
            puskesmas_id: p.puskesmas_id,
            puskesmas_name: p.puskesmas?.name || 'Nama Puskesmas Tidak Tersedia',
            current_target: currentTarget,
            new_target: currentTarget,
            is_dirty: false,
          };
        });

        // Update pagination meta
        this.currentPage = meta.current_page || this.currentPage;
        this.itemsPerPage = meta.per_page || this.itemsPerPage;
        this.totalRecords = meta.total || this.puskesmasTargets.length;
        this.lastPage = meta.last_page || 1;
        this.from = meta.from || 0;
        this.to = meta.to || 0;

        this.apiStatus = 'success';
      } catch (err) {
        console.error("Error fetching Puskesmas targets:", err);
        this.error = `Gagal memuat data target: ${err.response?.data?.message || err.message || 'Error tidak diketahui.'}`;
        this.apiStatus = 'error';
        this.puskesmasTargets = [];
      } finally {
        this.isLoadingData = false;
      }
    },

    handleSearchInput() {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        this.fetchPuskesmasTargets();
      }, 500);
    },

    handleTargetInputChange(puskesmasItem) {
      const originalTarget = this.originalPuskesmasTargetsMap.get(puskesmasItem.puskesmas_id);
      let newTargetValue = puskesmasItem.new_target;

      if (typeof newTargetValue === 'string' && newTargetValue.trim() === '') {
        newTargetValue = null;
      } else {
        newTargetValue = Number(newTargetValue);
        if (isNaN(newTargetValue) || newTargetValue < 0) {
          newTargetValue = 0;
        }
      }
      puskesmasItem.new_target = newTargetValue;

      const originalIsNull = originalTarget === null || originalTarget === undefined;
      const newIsNull = newTargetValue === null || newTargetValue === undefined;

      if (originalIsNull && newIsNull) {
        puskesmasItem.is_dirty = false;
      } else {
        puskesmasItem.is_dirty = newTargetValue !== originalTarget;
      }
    },

    formatTargetInput(puskesmasItem) {
      if (puskesmasItem.new_target === null || puskesmasItem.new_target === undefined || String(puskesmasItem.new_target).trim() === '') {
        puskesmasItem.new_target = null;
      } else {
        const numValue = Number(puskesmasItem.new_target);
        puskesmasItem.new_target = isNaN(numValue) || numValue < 0 ? 0 : numValue;
      }
      this.handleTargetInputChange(puskesmasItem);
    },

    async saveAllChanges() {
      if (!this.hasUnsavedChanges) {
        Swal.fire('Info', 'Tidak ada perubahan untuk disimpan.', 'info');
        return;
      }

      this.isSavingData = true;
      this.error = null;

      const dirtyTargets = this.puskesmasTargets.filter(p => p.is_dirty);

      if (dirtyTargets.length === 0) {
        Swal.fire('Info', 'Tidak ada perubahan valid untuk disimpan.', 'info');
        this.isSavingData = false;
        return;
      }

      let allRequestsSuccessful = true;
      const errorMessages = [];
      const successMessages = [];

      for (const targetItem of dirtyTargets) {
        if (targetItem.puskesmas_id === undefined || targetItem.puskesmas_id === null) {
          console.warn(`Target untuk Puskesmas ${targetItem.puskesmas_name} tidak memiliki ID Puskesmas. Dilewati.`);
          errorMessages.push(`Data target untuk ${targetItem.puskesmas_name} tidak lengkap (missing Puskesmas ID).`);
          allRequestsSuccessful = false;
          continue;
        }

        const payload = {
          target_count: targetItem.new_target === null || String(targetItem.new_target).trim() === '' ? null : Number(targetItem.new_target),
        };

        try {
          await apiClient.put(`/admin/yearly-targets`, payload, {
            params: {
              puskesmas_id: targetItem.puskesmas_id,
              disease_type: this.programTypeKey,
              year: this.selectedYear,
            }
          });
          successMessages.push(`Target untuk ${targetItem.puskesmas_name} berhasil disimpan.`);
        } catch (err) {
          allRequestsSuccessful = false;
          const message = `Gagal menyimpan target untuk ${targetItem.puskesmas_name}: ${err.response?.data?.message || err.message || 'Error tidak diketahui.'}`;
          errorMessages.push(message);
          console.error(message, err);
        }
      }

      this.isSavingData = false;

      if (allRequestsSuccessful) {
        Swal.fire('Berhasil!', 'Semua perubahan target berhasil disimpan!', 'success');
        await this.fetchPuskesmasTargets();
      } else {
        const title = errorMessages.length === dirtyTargets.length ? 'Gagal Total!' : 'Ada Kesalahan!';
        let text = "Beberapa perubahan gagal disimpan:\n- " + errorMessages.join("\n- ");
        if (successMessages.length > 0) {
            text = "Beberapa perubahan berhasil disimpan, namun ada yang gagal:\n" +
                   "- Berhasil: " + successMessages.join("\n- ") + "\n" +
                   "- Gagal: " + errorMessages.join("\n- ");
        }
        Swal.fire({
            title: title,
            text: text,
            icon: 'error',
            customClass: {
                popup: 'swal2-popup-custom',
            },
            width: '600px',
        });
        await this.fetchPuskesmasTargets();
      }
    },

    resetChanges() {
      if (!this.hasUnsavedChanges) {
        Swal.fire('Info', 'Tidak ada perubahan untuk direset.', 'info');
        return;
      }
      this.puskesmasTargets.forEach(p => {
        p.new_target = this.originalPuskesmasTargetsMap.get(p.puskesmas_id);
        p.is_dirty = false;
      });
      Swal.fire('Direset!', 'Semua perubahan berhasil direset.', 'info');
    },
    
    // Pagination methods
    nextPage() {
      if (this.currentPage < (this.lastPage || this.totalPages)) {
        this.currentPage++;
        this.fetchPuskesmasTargets();
      }
    },
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.fetchPuskesmasTargets();
      }
    },
    goToPage(page) {
      if (page !== this.currentPage) {
        this.currentPage = page;
        this.fetchPuskesmasTargets();
      }
    }
  },
  watch: {
    itemsPerPage() {
      this.currentPage = 1;
    },
    puskesmasTargets() {
      // Reset to first page when data changes (e.g., after search)
      this.currentPage = 1;
    }
  },
  beforeUnmount() {
    clearTimeout(this.searchTimeout);
  }
};
</script>

<style scoped>
/* Fallback or component-specific variables */
:root {
  --primary-50: #eef7f7;
  --primary-100: #d1e9e8;
  --primary-200: #a3d3d1;
  --primary-300: #75c2bf; /* Used for scrollbar thumb */
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
  --warning-600: #d97706;
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
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  --font-sans: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji",
    "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
}

/* Using semantic names for shadows */
.card-shadow-1 {
  box-shadow: var(--shadow-md);
}
.card-shadow-2 {
  box-shadow: var(--shadow-lg);
}
.card-shadow-0 {
  box-shadow: none;
}

/* General Page Styles - This is the outermost wrapper */
.manajemen-user {
  font-family: var(--font-sans, "Inter", sans-serif);
  box-sizing: border-box;
  background-color: var(--gray-50, #f8f9fa);
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 30px;
}

/* NEW: This is the actual card container */
.page-container {
  width: 100%;
  max-width: 1400px;
  background: #ffffff;
  border-radius: var(--radius-xl);
  padding: 30px;
  overflow: hidden;
  box-sizing: border-box;
}

/* Page header styles */
.page-header-alt {
  background-color: var(--primary-500, #047d78);
  color: white;
  margin: -30px -30px 30px -30px;
  padding: 24px 30px;
  border-radius: var(--radius-lg, 0.5rem) var(--radius-lg, 0.5rem) 0 0;
}

.page-title-alt {
  font-size: 1.875rem;
  font-weight: 600;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-subtitle-alt {
  font-size: 1rem;
  font-weight: 300;
  opacity: 0.95;
  margin: 0;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 24px;
  gap: 20px;
  flex-wrap: wrap;
}

.left-section,
.right-section {
  display: flex;
  align-items: flex-end;
  gap: 16px;
  flex-wrap: wrap;
}

/* Dropdown Styles */
.dropdown-container-year,
.dropdown-container-program {
  position: relative;
  width: 180px;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
}

.dropdown-container-year .svg-inline--fa,
.dropdown-container-program .svg-inline--fa {
  font-size: 1rem;
  color: var(--gray-600);
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
  padding-right: 30px;
}

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

/* Pagination Styles */
.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: white;
  border-top: 1px solid var(--gray-200);
  border-radius: 0 0 var(--radius-lg) var(--radius-lg);
  margin-top: 0;
}

.pagination-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.pagination-text {
  font-size: 0.875rem;
  color: var(--gray-600);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.pagination-dropdown-wrapper {
  position: relative;
}

.pagination-dropdown-select {
  padding: 0.25rem 0.5rem;
  border: 1px solid var(--gray-300);
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
  background: white;
  cursor: pointer;
  min-width: 60px;
}

.pagination-nav {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.pagination-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border: 1px solid var(--gray-300);
  background: white;
  color: var(--gray-700);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
  font-weight: 500;
}

.pagination-button:hover:not(:disabled) {
  background: var(--gray-50);
  border-color: var(--gray-400);
}

.pagination-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-button.active {
  background: var(--primary-500);
  border-color: var(--primary-500);
  color: white;
}

.pagination-button.prev,
.pagination-button.next {
  width: 2.5rem;
}

.pagination-ellipsis {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  color: var(--gray-400);
  font-weight: 500;
}

/* Responsive pagination */
@media (max-width: 768px) {
  .pagination-container {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .pagination-info {
    justify-content: center;
  }
  
  .pagination-nav {
    justify-content: center;
  }
  
  .pagination-button {
    width: 2rem;
    height: 2rem;
    font-size: 0.75rem;
  }
  
  .pagination-ellipsis {
    width: 2rem;
    height: 2rem;
  }
}

.dropdown-select:hover {
  border-color: var(--primary-500);
}

.dropdown-select:focus {
  border-color: var(--primary-500);
  box-shadow: 0 0 0 3px rgba(4, 125, 120, 0.2);
}

/* Search Input Styles */
.search-container {
  display: flex;
  align-items: center;
  position: relative;
  width: 251px;
}

.search-icon {
  position: absolute;
  left: 16px;
  color: var(--gray-400);
  font-size: 16px;
  pointer-events: none;
}

.search-input {
  width: 100%;
  height: 42px;
  padding: 12px 40px 12px 40px;
  border: 1px solid var(--gray-300);
  border-radius: var(--radius-md);
  font-family: var(--font-sans);
  font-size: 0.9375rem;
  color: var(--gray-800);
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.search-input:focus {
  border-color: var(--primary-500);
  box-shadow: 0 0 0 3px rgba(4, 125, 120, 0.2);
}

/* Modern Button Styles */
.modern-button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: var(--radius-md);
  font-family: var(--font-sans);
  font-size: 0.9375rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.1s, box-shadow 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  line-height: 1.5;
  box-shadow: var(--shadow-sm);
}

.modern-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.modern-button:active:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.modern-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  box-shadow: none;
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


/* Error Message Styling */
.error-message-alt {
  background-color: var(--error-50, #fef2f2);
  color: var(--error-600, #dc2626);
  padding: 1.5rem;
  border-radius: var(--radius-md, 0.375rem);
  margin-bottom: 24px;
  border: 1px solid var(--error-200, #fecaca);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  font-weight: 500;
  box-shadow: var(--shadow-md);
}

.error-message-alt .error-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.error-message-alt .svg-inline--fa {
  font-size: 1.5em;
  color: var(--error-500);
}

.error-message-alt p {
  margin: 0;
  line-height: 1.5;
}


/* Table styling */
.table-container-enhanced {
  overflow-x: auto;
  margin-bottom: 24px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--gray-200);
  background-color: white;
  scrollbar-width: thin;
  scrollbar-color: var(--primary-300) var(--gray-100);
}
.table-container-enhanced::-webkit-scrollbar {
  height: 8px;
  width: 8px;
}
.table-container-enhanced::-webkit-scrollbar-track {
  background: var(--gray-100);
  border-radius: 4px;
}
.table-container-enhanced::-webkit-scrollbar-thumb {
  background-color: var(--primary-300);
  border-radius: 4px;
}
.table-container-enhanced::-webkit-scrollbar-thumb:hover {
  background-color: var(--primary-400);
}

.data-table-enhanced {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 0.875rem;
  color: var(--gray-700);
  background-color: #ffffff;
}
.data-table-enhanced th,
.data-table-enhanced td {
  padding: 16px;
  text-align: left;
  border-bottom: 1px solid var(--gray-200);
  border-right: 1px solid var(--gray-200);
  vertical-align: middle;
}
.data-table-enhanced th:first-child,
.data-table-enhanced td:first-child {
  border-left: 1px solid var(--gray-200);
}
.data-table-enhanced thead tr:first-child th {
  border-top: 1px solid var(--gray-200);
}

.data-table-enhanced thead th {
  background: var(--gray-100);
  font-weight: 600;
  color: var(--gray-700);
  text-transform: uppercase;
  font-size: 0.8125rem;
  letter-spacing: 0.5px;
  position: sticky;
  top: 0;
  z-index: 1;
}
.data-table-enhanced tbody tr:hover {
  background-color: var(--primary-50);
}
.data-table-enhanced tbody tr:last-child td {
  border-bottom: none;
}

/* Narrow cell for 'No' column */
.data-table-enhanced th.narrow-cell,
.data-table-enhanced td.narrow-cell {
  width: 60px; /* Adjust as needed for number */
  text-align: center;
}

/* Styles for "Current Target" column (display only) */
.th-current-target-col, .td-target-display {
  width: 20%; /* Adjust width for better distribution */
  text-align: center;
  font-weight: 500;
  color: var(--gray-800);
}

/* Styles for "New Target Input" column */
.th-new-target-input-col, .td-target-input {
  width: 20%; /* Adjust width for better distribution */
  text-align: center;
}

/* General target input group styles */
.target-input-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.current-target-display {
  font-size: 0.875rem;
  color: var(--gray-600);
}

.target-input {
  width: 100%;
  max-width: 120px;
  padding: 0.5rem 0.625rem;
  border: 1px solid var(--gray-300, #dee2e6);
  border-radius: var(--radius-sm, 0.25rem);
  font-size: 0.875rem;
  text-align: center;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}

.target-input:focus {
  outline: none;
  border-color: var(--primary-500, #047d78);
  box-shadow: 0 0 0 2px rgba(4, 125, 120, 0.2);
}

.target-input:disabled {
  background-color: var(--gray-100, #f1f3f5);
  cursor: not-allowed;
  color: var(--gray-500);
}

.row-dirty td {
  background-color: var(--warning-50, #fffbeb) !important;
}
.row-dirty .target-input {
  border-color: var(--warning-500, #f59e0b);
  background-color: white;
}

/* Removed table-actions-info as requested */
/* .table-actions-info {
  padding: 16px 24px;
  border-bottom: 1px solid var(--gray-200);
  background-color: white;
  border-top-left-radius: var(--radius-lg);
  border-top-right-radius: var(--radius-lg);
}

.total-puskesmas {
  font-size: 0.9375rem;
  color: var(--gray-600);
  margin: 0;
}
.total-puskesmas .results-count {
  font-weight: 600;
  color: var(--gray-900);
} */


/* Empty State Message (re-purposed for 'no data' within table) */
.no-data {
  text-align: center;
  color: #9aa0a8;
  font-size: 16px;
  font-weight: 500;
  padding: 60px 20px;
  background-color: white;
}
.empty-state-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
}
.empty-icon {
  font-size: 48px;
  color: var(--gray-300);
  margin-bottom: 16px;
}
.empty-state-content h3 {
  font-size: 18px;
  font-weight: 600;
  color: var(--gray-600);
  margin-bottom: 8px;
}
.empty-state-content p {
  font-size: 14px;
  color: var(--gray-600);
}

/* Loading State Styles (for inside table) */
.loading-container {
  width: 100%;
  height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid var(--primary-500);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-content p {
  margin: 0;
  color: var(--primary-500);
  font-weight: 600;
}

.unsaved-changes-footer {
  padding: 12px 24px;
  background-color: var(--warning-50, #fffbeb);
  color: var(--warning-700, #b45309);
  font-size: 0.9375rem;
  font-weight: 500;
  text-align: center;
  border-top: 1px solid var(--warning-200, #fde68a);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border-bottom-left-radius: var(--radius-lg);
  border-bottom-right-radius: var(--radius-lg);
}
.unsaved-changes-footer .svg-inline--fa {
  font-size: 1.2em;
}


.top-loading-bar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
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
  50% { transform: translateX(0%) scaleX(0.75); }
  100% { transform: translateX(100%) scaleX(0.5); }
}

@media (max-width: 768px) {
  .manajemen-user {
    padding: 16px;
  }

  .page-container {
    padding: 16px;
  }

  .page-header-alt {
    margin: -16px -16px 16px -16px;
    padding: 20px 16px;
  }

  .toolbar {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
  .left-section,
  .right-section {
    width: 100%;
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }

  .dropdown-container-year,
  .dropdown-container-program,
  .search-container {
    width: 100%;
  }

  .modern-button {
    width: 100%;
    justify-content: center;
  }

  .error-message-alt {
    flex-direction: column;
    text-align: center;
    gap: 12px;
    padding: 1rem;
  }
  .error-message-alt .error-content {
    flex-direction: column;
    gap: 8px;
  }
  .error-message-alt .modern-button {
    margin-top: 10px;
  }

  .data-table-enhanced th,
  .data-table-enhanced td {
    padding: 12px 10px;
    font-size: 0.8125rem;
  }

  /* Adjust widths for new columns on mobile if necessary */
  .data-table-enhanced th.th-current-target-col,
  .data-table-enhanced th.th-new-target-input-col {
    width: auto;
  }

  .td-target-input {
    min-width: 150px; /* Adjusted min-width */
  }
  .target-input {
    max-width: 100%;
  }

  .table-actions-info { /* This class is now removed from template */
    padding: 12px 16px;
  }
  .total-puskesmas { /* This class is now removed from template */
    font-size: 0.875rem;
  }

  .no-data {
    padding: 30px 16px;
  }
  .empty-state-content h3 {
    font-size: 16px;
  }
  .empty-state-content p {
    font-size: 13px;
  }
}
</style>