import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: true,            // tạo sourcemap để debug nếu cần
    chunkSizeWarningLimit: 1500 // cảnh báo chunk lớn >1.5MB
  },
  server: {
    open: true
  }
})
