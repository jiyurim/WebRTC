import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  
  
  // global 정의
  define: {
    global: 'globalThis',
    'process.env': {}
  },
  
  // 개발 서버 설정
  server: {
    port: 3000,
    proxy: {
      '/signal': {
        target: 'http://localhost:8080',
        ws: true,
        changeOrigin: true
      },
      '/app': {
        target: 'http://localhost:8080',
        ws: true,
        changeOrigin: true
      },
      '/topic': {
        target: 'http://localhost:8080',
        ws: true,
        changeOrigin: true
      }
    }
  },
  
  // 빌드 설정
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})