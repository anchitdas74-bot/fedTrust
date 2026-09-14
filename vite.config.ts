import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],

  server: {
    port: 5173,
    strictPort: false,

    proxy: {
      // Authentication
      '/auth': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },

      // Transactions
      '/transactions': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },

      // Live Demo Simulator
      '/simulator': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },

      // RF Authentication
      '/rf': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },

      // Risk Engine + Step-Up Verification
      '/risk': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },

      // Federated Network
      '/federated': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },

      // Explainability
      '/explainability': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },

      // Alerts
      '/alerts': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },

      // System
      '/system': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },

      // Health
      '/health': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },

      // Demo
      '/demo': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})