import { describe, it, expect } from 'vitest'
import { extractStepDurationSeconds } from '../src/utils/duration'
import type { StepData } from '../src/types/curriculum'

describe('extractStepDurationSeconds (Seam: Duration Extractor)', () => {
  const makeStep = (title: string, criterionSummary: string): StepData => ({
    id: 'test-step',
    stepNumber: 1,
    title,
    criterionSummary,
    instructionsMarkdown: '',
    tryItCold: null,
    comeafters: null,
    callouts: [],
  })

  it('extracts seconds from criterionSummary', () => {
    const step = makeStep('Fist Zen', 'Dog stays away from the treat in a closed hand for 5 seconds.')
    expect(extractStepDurationSeconds(step)).toBe(5)
  })

  it('extracts seconds from title when criterionSummary is generic', () => {
    const step = makeStep('The dog downs and stays down for 10 seconds.', 'Dog downs.')
    expect(extractStepDurationSeconds(step)).toBe(10)
  })

  it('extracts minutes and converts to seconds', () => {
    const step = makeStep('Down Stay', 'Dog stays down for 1 minute.')
    expect(extractStepDurationSeconds(step)).toBe(60)

    const step3Min = makeStep('Crate Stay', 'Dog stays in crate for 3 minutes.')
    expect(extractStepDurationSeconds(step3Min)).toBe(180)
  })

  it('extracts shorthand "10s" or "5s"', () => {
    const step = makeStep('Zen 10s hold', 'Dog holds 10s.')
    expect(extractStepDurationSeconds(step)).toBe(10)
  })

  it('returns null for non-duration steps', () => {
    const step = makeStep('Dog takes 3 steps to touch hand', 'Dog takes 3 steps.')
    expect(extractStepDurationSeconds(step)).toBeNull()

    const stepDistance = makeStep('Dog runs 10 feet between 2 people', 'Dog runs 10 feet.')
    expect(extractStepDurationSeconds(stepDistance)).toBeNull()
  })

  it('handles null or undefined safely', () => {
    expect(extractStepDurationSeconds(null)).toBeNull()
    expect(extractStepDurationSeconds(undefined)).toBeNull()
  })
})
