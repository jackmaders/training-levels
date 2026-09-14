import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import 'fake-indexeddb/auto'
import { BehaviorDetailView } from '../src/components/BehaviorDetailView'
import { TrainingDatabase, getOrCreateActiveDog, recordDrillSession } from '../src/db/index'
import trainingData from '../src/data/training-levels.json'
import type { TrainingLevelsData } from '../src/types/curriculum'

describe('BehaviorDetailView Component', () => {
  let db: TrainingDatabase
  const curriculum = trainingData as unknown as TrainingLevelsData

  beforeEach(async () => {
    db = new TrainingDatabase('test-behavior-db-' + Math.random().toString(36).substring(2))
    await db.open()
  })

  it('renders comebefores, equipment, think about notes, 5-step criteria table, and direct step launchers', async () => {
    const dog = await getOrCreateActiveDog(db)

    // Mark Zen step 1 as passed practice
    await recordDrillSession(db, {
      dogId: dog.id,
      stepId: 'level-1-zen-step-1',
      levelId: 1,
      behaviorKey: 'zen',
      stepNumber: 1,
      reps: ['pass', 'pass', 'pass', 'pass', 'pass'],
      mode: 'practice',
    })

    const onBackToLevel = vi.fn()
    const onStartDrill = vi.fn()
    const onOpenNav = vi.fn()

    render(
      <BehaviorDetailView
        levelNumber={1}
        behaviorKey="zen"
        curriculumData={curriculum}
        db={db}
        onBackToLevel={onBackToLevel}
        onStartDrill={onStartDrill}
        onOpenNav={onOpenNav}
      />
    )

    await waitFor(() => {
      expect(screen.getByTestId('behavior-detail-view')).toBeInTheDocument()
    })

    // Behavior Header
    expect(screen.getByTestId('behavior-detail-title')).toHaveTextContent(/Zen/i)

    // Prerequisites / Comebefores
    expect(screen.getByTestId('behavior-comebefores-section')).toBeInTheDocument()

    // Equipment & Setting
    expect(screen.getByTestId('behavior-equipment-section')).toBeInTheDocument()

    // 5-step criteria table
    expect(screen.getByTestId('behavior-criteria-table-section')).toBeInTheDocument()
    const criteriaRows = screen.getAllByRole('row')
    expect(criteriaRows.length).toBeGreaterThanOrEqual(6) // 1 header + 5 rows

    // Step cards with direct step launchers
    expect(screen.getByTestId('step-card-level-1-zen-step-1')).toBeInTheDocument()
    expect(screen.getByTestId('step-card-level-1-zen-step-2')).toBeInTheDocument()

    // Check step 1 progress badge
    await waitFor(() => {
      expect(screen.getByTestId('step-progress-badge-level-1-zen-step-1')).toHaveTextContent(/passed practice/i)
    })

    // Click direct step launchers for step 1
    const practiceBtn = screen.getByTestId('start-practice-btn-level-1-zen-step-1')
    fireEvent.click(practiceBtn)
    expect(onStartDrill).toHaveBeenCalledWith('level-1-zen-step-1', 'practice')

    const coldBtn = screen.getByTestId('start-cold-btn-level-1-zen-step-1')
    fireEvent.click(coldBtn)
    expect(onStartDrill).toHaveBeenCalledWith('level-1-zen-step-1', 'cold')

    // Click back to level
    fireEvent.click(screen.getByTestId('back-to-level-btn'))
    expect(onBackToLevel).toHaveBeenCalled()

    // Click nav toggle
    fireEvent.click(screen.getByTestId('nav-toggle-btn'))
    expect(onOpenNav).toHaveBeenCalled()
  })
})
