import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['.kapucl.be', 'kotbd.kapucl.be'],
    proxy: {
      '/api': {
        target: 'http://localhost:8001',
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})