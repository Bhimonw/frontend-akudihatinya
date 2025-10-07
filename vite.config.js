import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

// Build output now goes langsung ke Laravel public/ (tanpa subfolder 'spa') sesuai permintaan.
// Peringatan: Pastikan tidak menimpa file lain di public/ yang bukan bagian build.
export default defineConfig({
  base: './', // ensure relative asset linking
  plugins: [vue(), tailwindcss()],
  build: {
  outDir: resolve(__dirname, '../akudihatinya-backend/public'),
  assetsDir: 'assets', // menghasilkan public/assets
  // IMPORTANT: Do not wipe entire Laravel public directory
  emptyOutDir: false,
    sourcemap: false,
  },
})
