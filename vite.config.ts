import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

declare const process: { env: Record<string, string | undefined> }

// https://vite.dev/config/
// Backend default olaraq 9090-da qalxir (bax: application.yaml server.port)
const proxyTarget = process.env.VITE_PROXY_TARGET || 'http://localhost:9090'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: Number(process.env.PORT) || 5173,
    proxy: {
      // Dev zamani /api sorgularini Spring backend-e yonlendir (CORS-suz)
      '/api': {
        target: proxyTarget,
        changeOrigin: true,
      },
      // Yuklenmis mekan sekilleri backend-de /uploads altinda servis olunur
      '/uploads': {
        target: proxyTarget,
        changeOrigin: true,
      },
    },
  },
})
