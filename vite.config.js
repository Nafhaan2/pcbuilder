// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    // Optimize chunk size
    outDir: 'build',
    rollupOptions: {
      output: {
        manualChunks: {
          // Group vendor libraries
          vendor: ['react', 'react-dom'],
          // Separate utilities
          utils: ['./src/utils/price', './src/utils/validation', './src/utils/sanitize'],
        },
      },
    },
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
});