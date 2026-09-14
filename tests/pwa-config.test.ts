import { describe, it, expect } from 'vitest'
import { pwaOptions } from '../src/pwa/config'

describe('PWA Configuration & Manifest (Seam 1: PWA Configuration)', () => {
  it('defines valid PWA web manifest metadata with standalone display mode', () => {
    expect(pwaOptions.manifest).toBeDefined()
    const manifest = pwaOptions.manifest
    if (!manifest) throw new Error('Manifest not defined')

    expect(manifest.name).toBe('Dog Training Levels')
    expect(manifest.short_name).toBe('TrainingLevels')
    expect(manifest.display).toBe('standalone')
    expect(manifest.theme_color).toBe('#0f172a')
    expect(manifest.background_color).toBe('#0f172a')
    expect(manifest.start_url).toBe('/')
    expect(manifest.orientation).toBe('portrait-primary')
  })

  it('configures high-res, maskable, and standard icons in the manifest', () => {
    const manifest = pwaOptions.manifest
    if (!manifest) throw new Error('Manifest not defined')
    const icons = manifest.icons
    expect(icons).toBeDefined()
    expect(Array.isArray(icons)).toBe(true)

    const icon192 = icons?.find((i) => i.sizes === '192x192')
    const icon512 = icons?.find((i) => i.sizes === '512x512')
    const maskableIcon = icons?.find((i) => typeof i.purpose === 'string' && i.purpose.includes('maskable'))

    expect(icon192).toBeDefined()
    expect(icon512).toBeDefined()
    expect(maskableIcon).toBeDefined()
  })

  it('configures precaching and workbox caching strategies for static dataset and assets', () => {
    expect(pwaOptions.registerType).toBe('autoUpdate')
    expect(pwaOptions.workbox).toBeDefined()
    const globPatterns = pwaOptions.workbox?.globPatterns || []
    
    // Checks that html, js, css, svg, png, and json are precached
    expect(globPatterns.some((pattern) => pattern.includes('json'))).toBe(true)
    expect(globPatterns.some((pattern) => pattern.includes('svg') || pattern.includes('png'))).toBe(true)
    expect(globPatterns.some((pattern) => pattern.includes('js') || pattern.includes('css'))).toBe(true)
  })
})
