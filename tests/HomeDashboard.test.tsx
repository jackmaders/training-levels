import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import 'fake-indexeddb/auto'
import { HomeDashboard } from '../src/components/HomeDashboard'
import {
  TrainingDatabase,
  getOrCreateActiveDog,
  recordDrillSession,
} from '../src/db/index'
import trainingData from '../src/data/training-levels.json'
import type { TrainingLevelsData } from '../src/types/curriculum'

describe('Home Dashboard Surface (Seam 2)', () => {
  let db: TrainingDatabase
  const curriculum = trainingData as unknown as TrainingLevelsData

  beforeEach(async () => {
    db = new TrainingDatabase('test-dashboard-db-' + Math.random().toString(36).substring(2))
    await db.open()
  })

  it('renders the hero card with dynamically recommended next drill for a new dog', async () => {
    render(
      <HomeDashboard
        db={db}
        curriculumData={curriculum}
        onStartDrill={() => {}}
      />
    )

    await waitFor(() => {
      expect(screen.getByTestId('recommended-hero-card')).toBeInTheDocument()
    })

    expect(screen.getByTestId('hero-behavior-title')).toHaveTextContent('Zen')
    expect(screen.getByTestId('hero-step-number')).toHaveTextContent('Step 1')
    expect(screen.getByTestId('hero-criterion-text')).toBeTruthy()
    expect(screen.getByRole('button', { name: /start practice drill/i })).toBeInTheDocument()
  })

  it('allows switching mode between Practice Mode and Cold Test Mode on hero card', async () => {
    render(
      <HomeDashboard
        db={db}
        curriculumData={curriculum}
        onStartDrill={() => {}}
      />
    )

    await waitFor(() => {
      expect(screen.getByTestId('recommended-hero-card')).toBeInTheDocument()
    })

    const practiceToggle = screen.getByRole('button', { name: /practice mode/i })
    const coldToggle = screen.getByRole('button', { name: /cold test/i })

    expect(practiceToggle).toHaveClass('active')
    expect(screen.getByRole('button', { name: /start practice drill/i })).toBeInTheDocument()

    // Switch to Cold Test mode
    fireEvent.click(coldToggle)
    expect(coldToggle).toHaveClass('active')
    expect(screen.getByRole('button', { name: /start cold test/i })).toBeInTheDocument()
  })

  it('invokes onStartDrill with selected stepId and mode when CTA button is clicked', async () => {
    let startedStepId = ''
    let startedMode = ''

    render(
      <HomeDashboard
        db={db}
        curriculumData={curriculum}
        onStartDrill={(stepId, mode) => {
          startedStepId = stepId
          startedMode = mode
        }}
      />
    )

    await waitFor(() => {
      expect(screen.getByTestId('recommended-hero-card')).toBeInTheDocument()
    })

    // Switch to Cold Test
    fireEvent.click(screen.getByRole('button', { name: /cold test/i }))
    fireEvent.click(screen.getByRole('button', { name: /start cold test/i }))

    expect(startedStepId).toBe('level-1-zen-step-1')
    expect(startedMode).toBe('cold')
  })

  it('displays chronological recent session history feed with compliance badges', async () => {
    const dog = await getOrCreateActiveDog(db)

    // Record session 1: Practice passed 5/5
    await recordDrillSession(db, {
      dogId: dog.id,
      stepId: 'level-1-zen-step-1',
      levelId: 1,
      behaviorKey: 'zen',
      stepNumber: 1,
      reps: ['pass', 'pass', 'pass', 'pass', 'pass'],
      mode: 'practice',
    })

    // Record session 2: Cold Test passed
    await recordDrillSession(db, {
      dogId: dog.id,
      stepId: 'level-1-zen-step-1',
      levelId: 1,
      behaviorKey: 'zen',
      stepNumber: 1,
      reps: ['pass'],
      mode: 'cold',
    })

    render(
      <HomeDashboard
        db={db}
        curriculumData={curriculum}
        onStartDrill={() => {}}
      />
    )

    await waitFor(() => {
      expect(screen.getByTestId('session-history-feed')).toBeInTheDocument()
    })

    const historyCards = screen.getAllByTestId(/^session-log-card-/)
    expect(historyCards).toHaveLength(2)

    // Most recent is the cold test (Session 2)
    expect(historyCards[0]).toHaveTextContent(/passed cold/i)
    // Earlier is the practice test (Session 1)
    expect(historyCards[1]).toHaveTextContent(/5\/5 passed/i)
  })
})
