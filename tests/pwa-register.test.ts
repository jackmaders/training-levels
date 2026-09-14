import { describe, it, expect, vi, beforeEach } from 'vitest'
import { registerServiceWorker } from '../src/pwa/register'

describe('Service Worker Registration Lifecycle (Seam 2: SW Register)', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('registers the service worker when navigator.serviceWorker is supported', async () => {
    const registerFn = vi.fn().mockResolvedValue({ scope: '/' })
    const mockServiceWorker = {
      register: registerFn,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }

    Object.defineProperty(globalThis, 'navigator', {
      value: {
        serviceWorker: mockServiceWorker,
        onLine: true,
      },
      writable: true,
      configurable: true,
    })

    const result = await registerServiceWorker()
    expect(result).toBe(true)
  })

  it('gracefully handles environments without serviceWorker support', async () => {
    Object.defineProperty(globalThis, 'navigator', {
      value: {
        onLine: true,
      },
      writable: true,
      configurable: true,
    })

    const result = await registerServiceWorker()
    expect(result).toBe(false)
  })
})
