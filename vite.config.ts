import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

declare const process: { env: Record<string, string | undefined> }

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: Number(process.env.PORT) || 5173,
    proxy: {
      // Dev zamani /api sorgularini Spring backend-e yonlendir (CORS-suz)
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      // Yuklenmis mekan sekilleri backend-de /uploads altinda servis olunur
      '/uploads': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
