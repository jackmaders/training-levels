import type { VitePWAOptions } from 'vite-plugin-pwa'

export const pwaOptions: Partial<VitePWAOptions> = {
  registerType: 'autoUpdate',
  injectRegister: 'auto',
  includeAssets: ['favicon.svg', 'pwa-icon.svg', 'icons.svg'],
  manifest: {
    name: 'Dog Training Levels',
    short_name: 'TrainingLevels',
    description: 'Dog Training Levels (Sue Ailsby Volumes 1 & 2) Offline PWA',
    theme_color: '#0f172a',
    background_color: '#0f172a',
    display: 'standalone',
    orientation: 'portrait-primary',
    start_url: '/',
    icons: [
      {
        src: '/pwa-icon.svg',
        sizes: '192x192',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/pwa-icon.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/pwa-icon.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
    ],
  },
  workbox: {
    globPatterns: ['**/*.{js,css,html,svg,png,ico,json}'],
    cleanupOutdatedCaches: true,
    clientsClaim: true,
    skipWaiting: true,
    navigateFallback: 'index.html',
  },
}
