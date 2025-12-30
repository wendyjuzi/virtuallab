import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    global: 'window' // 👈 让 sockjs-client 不再找不到 global
  },
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')

      },
      '/ai': { target: 'http://localhost:8080', changeOrigin: true },
      '/monitor': { target: 'http://localhost:8080', changeOrigin: true },
      '/system-admin': { target: 'http://localhost:8080', changeOrigin: true },
      '/log': {
        target: 'http://localhost:8080', // 后端服务端口
        changeOrigin: true,
      },
      '/resource-share': {
        target: 'http://localhost:8080',
        changeOrigin: true
      },
      '/resource': {
        target: 'http://localhost:8080',
        changeOrigin: true
      },
      '/user': 'http://localhost:8080',
      '/student': {
        target: 'http://localhost:8080',
        changeOrigin: true
      },
      '/system': { target: 'http://localhost:8080', changeOrigin: true },
      '/experiment': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        // rewrite: path => path.replace(/^\/api/, '')
      },

      '/upload': {
        target: 'http://localhost:8080', // 你的后端服务地址
        changeOrigin: true,
      }
      
      // 你可以根据实际后端接口继续补充其它代理
    }
  },
  optimizeDeps:{
    exclude:['@rollup/rollup-win32-x64-msvc']
  }
}) 