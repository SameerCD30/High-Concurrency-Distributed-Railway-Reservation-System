import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// The Spring Boot API runs on 8080; Vite proxies /api so the browser
// can call it without CORS during development.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
