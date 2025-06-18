import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path' // For path aliases if needed

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    strictPort: true,
    // Example proxy for backend API if running on different port during dev
    // proxy: {
    //   '/api': {
    //     target: 'http://localhost:8000', // Your backend API URL
    //     changeOrigin: true,
    //     // rewrite: (path) => path.replace(/^\/api/, '') // if your backend doesn't have /api prefix on all routes
    //   }
    // }
  },
  build: {
    outDir: 'dist',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // Example alias for @/components/*
    },
  },
})
