import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 1001,
    host: '0.0.0.0',
    allowedHosts: ['gtkr.deshinb.com'],
    // 页面走 https://gtkr.deshinb.com，热更新不能再连 localhost:1001
    ws: {
      protocol: 'wss',
      host: 'gtkr.deshinb.com',
      clientPort: 443,
    },
  },
})
