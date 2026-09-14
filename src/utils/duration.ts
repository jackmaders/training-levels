import type { StepData } from '../types/curriculum'

/**
 * Extracts the target duration in seconds for a duration-based step.
 * Checks both the criterionSummary and step title.
 * Returns null if the step is not duration-based.
 */
export function extractStepDurationSeconds(
  step: StepData | null | undefined
): number | null {
  if (!step) return null

  const text = `${step.criterionSummary || ''} ${step.title || ''}`

  // Match minutes: e.g. "1 minute", "2 minutes", "3 mins", "1 min"
  const minMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:minutes?|mins?|minute|min)\b/i)
  if (minMatch) {
    const minutes = parseFloat(minMatch[1])
    return Math.round(minutes * 60)
  }

  // Match seconds: e.g. "5 seconds", "10 sec", "10 secs", "5s", "10s hold"
  const secMatch =
    text.match(/(\d+)\s*(?:seconds?|secs?|second|sec)\b/i) ||
    text.match(/(\d+)\s*s\b/i)

  if (secMatch) {
    return parseInt(secMatch[1], 10)
  }

  return null
}
