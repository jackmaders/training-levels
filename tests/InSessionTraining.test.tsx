import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import 'fake-indexeddb/auto'
import { InSessionTraining } from '../src/components/InSessionTraining'
import { TrainingDatabase, getStepProgress, getSessionLogs } from '../src/db/index'
import trainingData from '../src/data/training-levels.json'

describe('In-Session Training Surface (Seam 2 & Seam 3)', () => {
  let db: TrainingDatabase

  beforeEach(async () => {
    db = new TrainingDatabase('test-ui-db-' + Math.random().toString(36).substring(2))
    await db.open()

    // Mock navigator.vibrate
    Object.defineProperty(navigator, 'vibrate', {
      value: vi.fn(),
      writable: true,
      configurable: true,
    })
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

  it('activates inline hold timer for duration-based steps with target preset and hides for non-duration steps', async () => {
    // level-1-zen-step-1 is not duration-based
    const { rerender } = render(
      <InSessionTraining
        db={db}
        initialStepId="level-1-zen-step-1"
        curriculumData={trainingData as any}
      />
    )

    await waitFor(() => {
      expect(screen.getByTestId('rep-matrix')).toBeInTheDocument()
    })
    expect(screen.queryByTestId('hold-timer')).not.toBeInTheDocument()

    // Switch to level-1-zen-step-2 (5 seconds hold)
    rerender(
      <InSessionTraining
        db={db}
        initialStepId="level-1-zen-step-2"
        curriculumData={trainingData as any}
      />
    )

    await waitFor(() => {
      expect(screen.getByTestId('hold-timer')).toBeInTheDocument()
    })
    expect(screen.getByTestId('timer-display')).toHaveTextContent('5s')
  })

  it('displays real-time passing pace percentage as reps are recorded', async () => {
    render(
      <InSessionTraining
        db={db}
        initialStepId="level-1-zen-step-1"
        curriculumData={trainingData as any}
      />
    )

    await waitFor(() => {
      expect(screen.getByTestId('pace-indicator')).toBeInTheDocument()
    })

    const passBtn = screen.getByRole('button', { name: /pass/i })
    const missBtn = screen.getByRole('button', { name: /miss/i })

    // Rep 1: Pass -> 1/1 = 100%
    fireEvent.click(passBtn)
    expect(screen.getByTestId('pace-indicator')).toHaveTextContent(/100%\s*passing pace/i)

    // Rep 2: Miss -> 1/2 = 50%
    fireEvent.click(missBtn)
    expect(screen.getByTestId('pace-indicator')).toHaveTextContent(/50%\s*passing pace/i)

    // Rep 3: Pass -> 2/3 = 67%
    fireEvent.click(passBtn)
    expect(screen.getByTestId('pace-indicator')).toHaveTextContent(/67%\s*passing pace/i)

    // Rep 4: Pass -> 3/4 = 75%
    fireEvent.click(passBtn)
    expect(screen.getByTestId('pace-indicator')).toHaveTextContent(/75%\s*passing pace/i)

    // Rep 5: Pass -> 4/5 = 80%
    fireEvent.click(passBtn)
    expect(screen.getByTestId('pace-indicator')).toHaveTextContent(/80%\s*passing pace/i)
  })

  it('triggers visible split-criteria warning when 3 consecutive misses occur', async () => {
    render(
      <InSessionTraining
        db={db}
        initialStepId="level-1-zen-step-1"
        curriculumData={trainingData as any}
      />
    )

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /miss/i })).toBeInTheDocument()
    })

    const missBtn = screen.getByRole('button', { name: /miss/i })

    // Log 2 misses -> no split alert yet
    fireEvent.click(missBtn)
    fireEvent.click(missBtn)
    expect(screen.queryByTestId('split-criteria-alert')).not.toBeInTheDocument()

    // Log 3rd miss -> triggers alert
    fireEvent.click(missBtn)
    expect(screen.getByTestId('split-criteria-alert')).toBeInTheDocument()
    expect(screen.getByTestId('split-criteria-alert')).toHaveTextContent(/split criteria/i)
    expect(screen.getByTestId('split-criteria-alert')).toHaveTextContent(/3 consecutive misses/i)
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
      expect(screen.getByLabelText(/^step:/i)).toBeInTheDocument()
    })

    const select = screen.getByLabelText(/^step:/i)
    fireEvent.change(select, { target: { value: 'level-1-come-step-1' } })

    await waitFor(() => {
      expect(screen.getByTestId('behavior-title')).toHaveTextContent('Come')
    })
  })

  it('triggers slide-up reference drawer from pinned header [Full Guide] button and renders content', async () => {
    render(
      <InSessionTraining
        db={db}
        initialStepId="level-1-zen-step-1"
        curriculumData={trainingData as any}
      />
    )

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /full guide/i })).toBeInTheDocument()
    })

    // Click [Full Guide]
    const guideBtn = screen.getByRole('button', { name: /full guide/i })
    fireEvent.click(guideBtn)

    // Drawer should open and display dialog
    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: /quick reference guide/i })).toBeInTheDocument()
    })

    // Check step instructions and criteria summary table rendered
    expect(screen.getByTestId('drawer-step-title')).toHaveTextContent('Step 1')
    expect(screen.getByTestId('drawer-criteria-table')).toBeInTheDocument()
    expect(screen.getByTestId('drawer-comebefores')).toBeInTheDocument()
    expect(screen.getByTestId('drawer-comeafters')).toBeInTheDocument()

    // Check callouts are rendered with distinct styles
    const callouts = screen.getAllByTestId(/^callout-card-/)
    expect(callouts.length).toBeGreaterThan(0)
    expect(screen.getByTestId('callout-card-warning-0')).toHaveClass('callout-warning')

    // Close the drawer using the close button
    const closeBtn = screen.getByRole('button', { name: /close reference guide/i })
    fireEvent.click(closeBtn)

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: /quick reference guide/i })).not.toBeInTheDocument()
    })
  })

  it('preserves active in-progress rep counts and session state when opening and closing drawer', async () => {
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

    // Log 2 reps
    fireEvent.click(passBtn) // Rep 1: Pass
    fireEvent.click(missBtn) // Rep 2: Miss

    const dot0 = screen.getByTestId('rep-dot-0')
    const dot1 = screen.getByTestId('rep-dot-1')
    expect(dot0).toHaveClass('pass')
    expect(dot1).toHaveClass('miss')

    // Open Drawer
    const guideBtn = screen.getByRole('button', { name: /full guide/i })
    fireEvent.click(guideBtn)

    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: /quick reference guide/i })).toBeInTheDocument()
    })

    // Close Drawer
    const closeBtn = screen.getByRole('button', { name: /close reference guide/i })
    fireEvent.click(closeBtn)

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: /quick reference guide/i })).not.toBeInTheDocument()
    })

    // Rep matrix must still have the 2 logged reps intact
    expect(screen.getByTestId('rep-dot-0')).toHaveClass('pass')
    expect(screen.getByTestId('rep-dot-1')).toHaveClass('miss')

    // Continue logging remaining 3 reps
    fireEvent.click(passBtn) // Rep 3: Pass
    fireEvent.click(passBtn) // Rep 4: Pass
    fireEvent.click(passBtn) // Rep 5: Pass

    // Drill completes successfully with 4 passes
    await waitFor(() => {
      expect(screen.getByTestId('step-status-badge')).toHaveTextContent(/passed practice/i)
    })
  })
})

