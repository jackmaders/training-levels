/// <reference types="vitest" />
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vite'
import { pwaOptions } from './src/pwa/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), VitePWA(pwaOptions)],
  test: {
    globals: true,
    environment: 'jsdom',
  },
})


