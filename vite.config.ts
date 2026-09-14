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
      // Proxy all API calls to the FastAPI backend
      '/auth': { target: 'http://localhost:8000', changeOrigin: true },
      '/transactions': { target: 'http://localhost:8000', changeOrigin: true },
      '/rf': { target: 'http://localhost:8000', changeOrigin: true },
      '/risk': { target: 'http://localhost:8000', changeOrigin: true },
      '/federated': { target: 'http://localhost:8000', changeOrigin: true },
      '/explainability': { target: 'http://localhost:8000', changeOrigin: true },
      '/alerts': { target: 'http://localhost:8000', changeOrigin: true },
      '/system': { target: 'http://localhost:8000', changeOrigin: true },
      '/health': { target: 'http://localhost:8000', changeOrigin: true },
      '/demo': { target: 'http://localhost:8000', changeOrigin: true },
    }
  }
})


