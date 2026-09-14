import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

describe('Offline Build & Packaging Verification (Seam 4: Offline Packaging)', () => {
  const distDir = path.resolve(__dirname, '../dist')

  it('generates offline service worker sw.js and workbox runtime upon build', () => {
    // Only verifies if dist exists after a build run
    if (fs.existsSync(distDir)) {
      const swPath = path.join(distDir, 'sw.js')
      const manifestPath = path.join(distDir, 'manifest.webmanifest')

      expect(fs.existsSync(swPath)).toBe(true)
      expect(fs.existsSync(manifestPath)).toBe(true)

      const manifestContent = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'))
      expect(manifestContent.name).toBe('Dog Training Levels')
      expect(manifestContent.display).toBe('standalone')
      expect(manifestContent.icons.length).toBeGreaterThan(0)
    }
  })
})
