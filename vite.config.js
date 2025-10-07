import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

// Build output is redirected into the Laravel backend's public/frontend directory
// so deployment only needs backend artifact syncing.
// NOTE: Relative path assumes this file lives in frontend-akudihatinya/ with sibling akudihatinya-backend/
export default defineConfig({
  plugins: [vue(), tailwindcss()],
  build: {
    outDir: resolve(__dirname, '../akudihatinya-backend/public/frontend'),
    emptyOutDir: true, // clears existing frontend assets in backend before rebuilding
    sourcemap: false,
  },
})
