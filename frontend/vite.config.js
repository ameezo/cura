import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Hosts allowed to access the Vite dev server (used only in development)
    allowedHosts: [
      'ameezozdomain.cfd',
      'app.ameezozdomain.cfd',
      'api.ameezozdomain.cfd',
      '.ameezozdomain.cfd',  // wildcard for all subdomains
    ],
    host: '0.0.0.0',  // listen on all interfaces inside Docker
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://backend:5001',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
