import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

// Build output now goes langsung ke Laravel public/assets
// Laravel's app.blade.php will handle the HTML shell and runtime config
export default defineConfig({
  base: '/assets/', // assets will be served from /assets/ path
  plugins: [vue(), tailwindcss()],
  build: {
    outDir: resolve(__dirname, '../akudihatinya-backend/public/assets'),
    assetsDir: '.', // flat structure inside assets/
    emptyOutDir: true, // safe to empty only the assets/ subdirectory
    sourcemap: false,
    rollupOptions: {
      input: resolve(__dirname, 'src/main.js'),
      output: {
        entryFileNames: 'index.js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]'
      }
    }
  },
  publicDir: false // Don't copy public/ folder to build output
})
