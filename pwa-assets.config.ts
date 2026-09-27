import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config'

// mənbə: public/favicon.svg (ağ fon + bilyard topları), nəticə: public/pwa/*
export default defineConfig({
  preset: minimal2023Preset,
  images: ['public/favicon.svg'],
})
