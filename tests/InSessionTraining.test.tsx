import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import 'fake-indexeddb/auto'
import { InSessionTraining } from '../src/components/InSessionTraining'
import { TrainingDatabase, getStepProgress, getSessionLogs } from '../src/db/index'
import trainingData from '../src/data/training-content.json'

describe('In-Session Training Surface (Seam 2)', () => {
  let db: TrainingDatabase

  beforeEach(async () => {
    db = new TrainingDatabase('test-ui-db-' + Math.random().toString(36).substring(2))
    await db.open()
  })

  it('renders pinned top criterion header with behavior title, step number, and pass criterion', async () => {
    const level1 = trainingData.levels[0]
    const zenBehavior = level1.behaviors[0]
    const zenStep1 = zenBehavior.steps[0]

    render(
      <InSessionTraining
        db={db}
        initialStepId={zenStep1.id}
        curriculumData={trainingData as any}
      />
    )

    // Verify pinned header contains behavior title, step number, and criterion
    await waitFor(() => {
      expect(screen.getByTestId('criterion-header')).toBeInTheDocument()
    })

    expect(screen.getByTestId('behavior-title')).toHaveTextContent(zenBehavior.title)
    expect(screen.getByTestId('step-number')).toHaveTextContent('Step 1')
    expect(screen.getByTestId('criterion-text')).toHaveTextContent(zenStep1.criterionSummary)
  })

  it('renders 5-rep matrix and fixed bottom action buttons [✕ Miss] and [✓ Pass]', async () => {
    render(
      <InSessionTraining
        db={db}
        initialStepId="level-1-zen-step-1"
        curriculumData={trainingData as any}
      />
    )

    await waitFor(() => {
      expect(screen.getByTestId('rep-matrix')).toBeInTheDocument()
    })

    const dots = screen.getAllByTestId(/^rep-dot-/)
    expect(dots).toHaveLength(5)

    expect(screen.getByRole('button', { name: /miss/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /pass/i })).toBeInTheDocument()
  })

  it('completes a 5-rep drill with 4 passes and 1 miss, updating UI and persisting passed_practice to Dexie', async () => {
    render(
      <InSessionTraining
        db={db}
        initialStepId="level-1-zen-step-1"
        curriculumData={trainingData as any}
      />
    )

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /pass/i })).toBeInTheDocument()
    })

    const passBtn = screen.getByRole('button', { name: /pass/i })
    const missBtn = screen.getByRole('button', { name: /miss/i })

    // Log 4 passes and 1 miss
    fireEvent.click(passBtn) // Rep 1: Pass
    fireEvent.click(passBtn) // Rep 2: Pass
    fireEvent.click(missBtn) // Rep 3: Miss
    fireEvent.click(passBtn) // Rep 4: Pass
    fireEvent.click(passBtn) // Rep 5: Pass

    // UI should show passed badge
    await waitFor(() => {
      expect(screen.getByTestId('step-status-badge')).toHaveTextContent(/passed practice/i)
    })

    // Check Dexie database persistence
    const appState = await db.appState.get('activeDogId')
    const dogId = (appState?.value as string) || 'primary-dog-default'

    const progress = await getStepProgress(db, dogId, 'level-1-zen-step-1')
    expect(progress?.status).toBe('passed_practice')
    expect(progress?.attemptsCount).toBe(1)

    const logs = await getSessionLogs(db, dogId, 'level-1-zen-step-1')
    expect(logs).toHaveLength(1)
    expect(logs[0].reps).toEqual(['pass', 'pass', 'miss', 'pass', 'pass'])
    expect(logs[0].passedCount).toBe(4)
    expect(logs[0].missedCount).toBe(1)
    expect(logs[0].passed).toBe(true)

    // Resetting starts a new 5-rep drill
    const resetBtn = screen.getByRole('button', { name: /start new 5-rep drill/i })
    fireEvent.click(resetBtn)

    const dots = screen.getAllByTestId(/^rep-dot-/)
    expect(dots[0]).toHaveTextContent('1')
  })

  it('marks status as passed_cold when achieving >= 4 passes in Cold Test mode', async () => {
    render(
      <InSessionTraining
        db={db}
        initialStepId="level-1-zen-step-1"
        curriculumData={trainingData as any}
      />
    )

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /cold test/i })).toBeInTheDocument()
    })

    // Switch to cold test mode
    fireEvent.click(screen.getByRole('button', { name: /cold test/i }))

    const passBtn = screen.getByRole('button', { name: /pass/i })
    fireEvent.click(passBtn)
    fireEvent.click(passBtn)
    fireEvent.click(passBtn)
    fireEvent.click(passBtn)
    fireEvent.click(passBtn)

    await waitFor(() => {
      expect(screen.getByTestId('step-status-badge')).toHaveTextContent(/passed cold/i)
    })

    const appState = await db.appState.get('activeDogId')
    const dogId = (appState?.value as string) || 'primary-dog-default'

    const progress = await getStepProgress(db, dogId, 'level-1-zen-step-1')
    expect(progress?.status).toBe('passed_cold')
    expect(progress?.passedColdAt).toBeDefined()
  })

  it('allows changing the active step via dropdown and updates header criterion', async () => {
    render(
      <InSessionTraining
        db={db}
        initialStepId="level-1-zen-step-1"
        curriculumData={trainingData as any}
      />
    )

    await waitFor(() => {
      expect(screen.getByLabelText(/change step/i)).toBeInTheDocument()
    })

    const select = screen.getByLabelText(/change step/i)
    fireEvent.change(select, { target: { value: 'level-1-come-step-1' } })

    await waitFor(() => {
      expect(screen.getByTestId('behavior-title')).toHaveTextContent('Come')
    })
  })
})
