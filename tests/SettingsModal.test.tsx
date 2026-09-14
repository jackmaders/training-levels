import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import 'fake-indexeddb/auto'
import { TrainingDatabase, recordDrillSession } from '../src/db'
import { SettingsModal } from '../src/components/SettingsModal'
import { HomeDashboard } from '../src/components/HomeDashboard'
import trainingData from '../src/data/training-levels.json'
import type { TrainingLevelsData } from '../src/types/curriculum'

const mockCurriculumData = trainingData as unknown as TrainingLevelsData

describe('SettingsModal & Portability UI (Seam 2 - Slice 3)', () => {
  let db: TrainingDatabase

  beforeEach(async () => {
    db = new TrainingDatabase(`test-settings-ui-${Date.now()}-${Math.random()}`)
    await db.open()

    await db.dogs.put({
      id: 'dog-coco',
      name: 'Coco',
      createdAt: '2026-03-01T00:00:00.000Z',
      isArchived: false,
    })
    await db.appState.put({ key: 'activeDogId', value: 'dog-coco' })

    await recordDrillSession(db, {
      dogId: 'dog-coco',
      stepId: 'level-1-zen-step-1',
      levelId: 1,
      behaviorKey: 'zen',
      stepNumber: 1,
      reps: ['pass', 'pass', 'pass', 'pass', 'pass'],
      mode: 'practice',
    })
  })

  it('renders export buttons and triggers export on click', async () => {
    const handleClose = vi.fn()
    const activeDog = {
      id: 'dog-coco',
      name: 'Coco',
      createdAt: '2026-03-01T00:00:00.000Z',
      isArchived: false,
    }

    render(
      <SettingsModal
        isOpen={true}
        onClose={handleClose}
        db={db}
        activeDog={activeDog}
      />
    )

    expect(screen.getByTestId('settings-modal')).toBeInTheDocument()
    expect(screen.getByTestId('export-all-btn')).toBeInTheDocument()
    expect(screen.getByTestId('export-dog-btn')).toBeInTheDocument()
    expect(screen.getByText(/Export Coco Progress/i)).toBeInTheDocument()

    // Trigger export all
    fireEvent.click(screen.getByTestId('export-all-btn'))

    await waitFor(() => {
      expect(screen.getByTestId('export-status-message')).toBeInTheDocument()
    })
  })

  it('handles file upload and presents Overwrite vs Merge conflict resolution choices', async () => {
    const handleClose = vi.fn()
    const handleDataMutated = vi.fn()
    const activeDog = {
      id: 'dog-coco',
      name: 'Coco',
      createdAt: '2026-03-01T00:00:00.000Z',
      isArchived: false,
    }

    render(
      <SettingsModal
        isOpen={true}
        onClose={handleClose}
        db={db}
        activeDog={activeDog}
        onDataMutated={handleDataMutated}
      />
    )

    const validBackup = {
      schemaVersion: 1,
      appVersion: '1.0.0',
      exportedAt: '2026-03-02T00:00:00.000Z',
      exportScope: 'all',
      data: {
        dogs: [
          {
            id: 'dog-imported',
            name: 'Imported Milo',
            createdAt: '2026-03-02T00:00:00.000Z',
            isArchived: false,
          },
        ],
        stepProgress: [],
        sessions: [],
        sessionLogs: [],
        appState: [{ key: 'activeDogId', value: 'dog-imported' }],
      },
    }

    const file = new File([JSON.stringify(validBackup)], 'backup.json', {
      type: 'application/json',
    })

    const fileInput = screen.getByTestId('import-file-input')
    fireEvent.change(fileInput, { target: { files: [file] } })

    // Staged options should appear
    await waitFor(() => {
      expect(screen.getByTestId('import-mode-overwrite-btn')).toBeInTheDocument()
      expect(screen.getByTestId('import-mode-merge-btn')).toBeInTheDocument()
    })

    // Execute Overwrite restore
    fireEvent.click(screen.getByTestId('import-mode-overwrite-btn'))

    await waitFor(() => {
      expect(screen.getByTestId('import-success-banner')).toBeInTheDocument()
    })

    expect(handleDataMutated).toHaveBeenCalled()

    // Database should be replaced
    const dogs = await db.dogs.toArray()
    expect(dogs).toHaveLength(1)
    expect(dogs[0].name).toBe('Imported Milo')
  })

  it('displays error banner when importing corrupted or invalid JSON', async () => {
    const handleClose = vi.fn()
    const activeDog = {
      id: 'dog-coco',
      name: 'Coco',
      createdAt: '2026-03-01T00:00:00.000Z',
      isArchived: false,
    }

    render(
      <SettingsModal
        isOpen={true}
        onClose={handleClose}
        db={db}
        activeDog={activeDog}
      />
    )

    const file = new File(['{ invalid json: true'], 'broken.json', {
      type: 'application/json',
    })

    const fileInput = screen.getByTestId('import-file-input')
    fireEvent.change(fileInput, { target: { files: [file] } })

    await waitFor(() => {
      expect(screen.getByTestId('import-error-banner')).toBeInTheDocument()
    })
  })

  it('opens and closes settings modal from HomeDashboard header', async () => {
    const handleStartDrill = vi.fn()

    render(
      <HomeDashboard
        db={db}
        curriculumData={mockCurriculumData}
        onStartDrill={handleStartDrill}
      />
    )

    await waitFor(() => {
      expect(screen.getByTestId('settings-btn')).toBeInTheDocument()
    })

    // Open Settings Modal
    fireEvent.click(screen.getByTestId('settings-btn'))

    expect(screen.getByTestId('settings-modal')).toBeInTheDocument()

    // Close Settings Modal
    fireEvent.click(screen.getByTestId('close-settings-btn'))

    await waitFor(() => {
      expect(screen.queryByTestId('settings-modal')).not.toBeInTheDocument()
    })
  })
})
