import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import 'fake-indexeddb/auto'
import { LevelView } from '../src/components/LevelView'
import { TrainingDatabase, getOrCreateActiveDog, recordDrillSession } from '../src/db/index'
import trainingData from '../src/data/training-levels.json'
import type { TrainingLevelsData } from '../src/types/curriculum'

describe('LevelView Component', () => {
  let db: TrainingDatabase
  const curriculum = trainingData as unknown as TrainingLevelsData

  beforeEach(async () => {
    db = new TrainingDatabase('test-level-db-' + Math.random().toString(36).substring(2))
    await db.open()
  })

  it('renders level header, overview, full behavior list, step progress indicators, and homework summary', async () => {
    const dog = await getOrCreateActiveDog(db)

    // Mark step 1 as passed practice and step 2 as passed cold
    await recordDrillSession(db, {
      dogId: dog.id,
      stepId: 'level-1-zen-step-1',
      levelId: 1,
      behaviorKey: 'zen',
      stepNumber: 1,
      reps: ['pass', 'pass', 'pass', 'pass', 'pass'],
      mode: 'practice',
    })

    await recordDrillSession(db, {
      dogId: dog.id,
      stepId: 'level-1-zen-step-2',
      levelId: 1,
      behaviorKey: 'zen',
      stepNumber: 2,
      reps: ['pass'],
      mode: 'cold',
    })

    const onSelectBehavior = vi.fn()
    const onStartDrill = vi.fn()
    const onOpenNav = vi.fn()

    render(
      <LevelView
        levelNumber={1}
        curriculumData={curriculum}
        db={db}
        onSelectBehavior={onSelectBehavior}
        onStartDrill={onStartDrill}
        onOpenNav={onOpenNav}
      />
    )

    await waitFor(() => {
      expect(screen.getByTestId('level-view')).toBeInTheDocument()
    })

    // Level Header & Title
    expect(screen.getByTestId('level-title')).toHaveTextContent(/Level 1/i)

    // Overview section
    expect(screen.getByTestId('level-overview-section')).toBeInTheDocument()

    // Full behavior list for Level 1 (5 behaviors: Zen, Come, Sit, Target, Down)
    expect(screen.getByTestId('behavior-card-level-1-zen')).toBeInTheDocument()
    expect(screen.getByTestId('behavior-card-level-1-come')).toBeInTheDocument()
    expect(screen.getByTestId('behavior-card-level-1-sit')).toBeInTheDocument()
    expect(screen.getByTestId('behavior-card-level-1-target')).toBeInTheDocument()
    expect(screen.getByTestId('behavior-card-level-1-down')).toBeInTheDocument()

    // Step progress indicators for Zen
    await waitFor(() => {
      const step1Indicator = screen.getByTestId('step-indicator-level-1-zen-step-1')
      expect(step1Indicator).toHaveTextContent(/passed practice/i)
    })

    const step2Indicator = screen.getByTestId('step-indicator-level-1-zen-step-2')
    expect(step2Indicator).toHaveTextContent(/passed cold/i)

    const step3Indicator = screen.getByTestId('step-indicator-level-1-zen-step-3')
    expect(step3Indicator).toHaveTextContent(/not started/i)

    // Homework Section
    expect(screen.getByTestId('level-homework-section')).toBeInTheDocument()
    expect(screen.getByTestId('homework-title')).toHaveTextContent(/homework/i)

    // Behavior card click navigates to behavior detail
    fireEvent.click(screen.getByTestId('view-behavior-btn-level-1-zen'))
    expect(onSelectBehavior).toHaveBeenCalledWith('zen')

    // Direct step launcher click starts drill
    const quickTrainBtn = screen.getByTestId('quick-train-btn-level-1-zen-step-1')
    fireEvent.click(quickTrainBtn)
    expect(onStartDrill).toHaveBeenCalledWith('level-1-zen-step-1', 'practice')

    // Open nav menu
    fireEvent.click(screen.getByTestId('nav-toggle-btn'))
    expect(onOpenNav).toHaveBeenCalled()
  })

  it('allows switching between levels via props or level selector', async () => {
    render(
      <LevelView
        levelNumber={2}
        curriculumData={curriculum}
        db={db}
        onSelectBehavior={vi.fn()}
        onStartDrill={vi.fn()}
      />
    )

    await waitFor(() => {
      expect(screen.getByTestId('level-title')).toHaveTextContent(/Level 2/i)
    })

    // Level 2 has 15 behaviors including 'go-to-mat' and 'lazy-leash'
    expect(screen.getByTestId('behavior-card-level-2-go-to-mat')).toBeInTheDocument()
  })
})
