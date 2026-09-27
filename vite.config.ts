import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

declare const process: { env: Record<string, string | undefined> }

// https://vite.dev/config/
// Backend default olaraq 9090-da qalxir (bax: application.yaml server.port)
const proxyTarget = process.env.VITE_PROXY_TARGET || 'http://localhost:9090'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'favicon.ico', 'apple-touch-icon-180x180.png'],
      manifest: {
        name: 'Eloabf · Bilyard Reytinq Platforması',
        short_name: 'Eloabf',
        description:
          'Eloabf — bilyard oyunçuları üçün Elo reytinqi, dəvətlər, turnirlər və klub axtarışı.',
        lang: 'az',
        start_url: '/',
        display: 'standalone',
        background_color: '#101010',
        theme_color: '#101010',
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        navigateFallbackDenylist: [/^\/api/, /^\/uploads/],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/uploads'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'uploads',
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
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
