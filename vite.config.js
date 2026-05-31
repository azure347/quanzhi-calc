import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/quanzhi-calc/',
  plugins: [vue()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      // PK API代理到 Spring Boot 后端
      '/api/pk': {
        target: process.env.VITE_PK_API_URL || 'http://localhost:8080',
        changeOrigin: true
      },
      // WebSocket 代理
      '/ws/pk': {
        target: process.env.VITE_PK_WS_URL || 'ws://localhost:8080',
        ws: true
      }
    }
  }
})