import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

describe('High-Contrast Outdoor Styling & Design Tokens (Seam 3: Outdoor Theme)', () => {
  const cssFilePath = path.resolve(__dirname, '../src/index.css')
  const cssContent = fs.readFileSync(cssFilePath, 'utf-8')

  it('defines high-contrast theme color tokens for outdoor sunlight visibility', () => {
    // Deep dark slate background for high contrast glare reduction
    expect(cssContent).toMatch(/--outdoor-bg:\s*#0f172a/)
    expect(cssContent).toMatch(/--outdoor-surface:\s*#1e293b/)
    expect(cssContent).toMatch(/--outdoor-border:\s*#334155/)
    expect(cssContent).toMatch(/--outdoor-text:\s*#f8fafc/)
    expect(cssContent).toMatch(/--outdoor-accent:\s*#38bdf8/)
    expect(cssContent).toMatch(/--outdoor-pass:\s*#22c55e/)
    expect(cssContent).toMatch(/--outdoor-miss:\s*#ef4444/)
  })

  it('includes viewport and mobile outdoor touch optimization rules', () => {
    expect(cssContent).toMatch(/touch-action:\s*manipulation/)
    expect(cssContent).toMatch(/-webkit-tap-highlight-color:\s*transparent/)
    expect(cssContent).toMatch(/user-select:\s*none/)
  })
})
