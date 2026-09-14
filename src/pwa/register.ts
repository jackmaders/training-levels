/**
 * Service Worker Registration & Lifecycle
 */

export async function registerServiceWorker(): Promise<boolean> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return false
  }

  try {
    const pwaModule = await import('virtual:pwa-register').catch(() => null)
    if (pwaModule && typeof pwaModule.registerSW === 'function') {
      pwaModule.registerSW({
        immediate: true,
        onNeedRefresh() {
          console.info('New training levels content available, refreshing...')
        },
        onOfflineReady() {
          console.info('Dog Training Levels app ready to work offline!')
        },
      })
    } else if (navigator.serviceWorker.register) {
      await navigator.serviceWorker.register('/sw.js', { scope: '/' })
    }

    return true
  } catch (err) {
    console.warn('Service worker registration failed:', err)
    return false
  }
}
