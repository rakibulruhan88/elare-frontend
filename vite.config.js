import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/postcss'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:8000',
      '/uploads': 'http://localhost:8000', 
    },
  },
})