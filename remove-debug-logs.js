#!/usr/bin/env node

/**
 * Script untuk menghapus console.log debugging dari ManagePuskesmasTarget.vue
 * Jalankan dengan: node remove-debug-logs.js
 */

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'views', 'admin', 'ManagePuskesmasTarget.vue');

function removeDebugLogs() {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Remove API debugging logs
    content = content.replace(
      /\s*console\.log\('📊 Data received from API:'[^;]+;\s*/g,
      ''
    );
    content = content.replace(
      /\s*console\.log\('🔍 Search query:'[^;]+;\s*/g,
      ''
    );
    content = content.replace(
      /\s*console\.log\('📅 Selected year:'[^;]+;\s*/g,
      ''
    );
    content = content.replace(
      /\s*console\.log\('🏥 Selected program:'[^;]+;\s*/g,
      ''
    );
    content = content.replace(
      /\s*console\.log\('✅ Processed puskesmasTargets:'[^;]+;\s*/g,
      ''
    );
    content = content.replace(
      /\s*console\.log\('📄 Items per page:'[^;]+;\s*/g,
      ''
    );
    content = content.replace(
      /\s*console\.log\('📖 Current page:'[^;]+;\s*/g,
      ''
    );
    
    // Remove pagination debugging logs
    content = content.replace(
      /\s*console\.log\('🔢 Pagination calculation:'\);[\s\S]*?console\.log\('  - Paginated data length:'[^;]+;\s*/g,
      ''
    );
    
    // Clean up extra empty lines
    content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
    
    // Restore original paginatedPuskesmasTargets computed property
    content = content.replace(
      /paginatedPuskesmasTargets\(\) \{[\s\S]*?return paginatedData;\s*\}/,
      `paginatedPuskesmasTargets() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.puskesmasTargets.slice(start, end);
    }`
    );
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('✅ Debug logs berhasil dihapus dari ManagePuskesmasTarget.vue');
    console.log('📁 File telah dibersihkan dan siap untuk production');
    
  } catch (error) {
    console.error('❌ Error menghapus debug logs:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  console.log('🧹 Menghapus debug logs dari ManagePuskesmasTarget.vue...');
  removeDebugLogs();
}

module.exports = { removeDebugLogs };