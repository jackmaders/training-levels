import { describe, it, expect, beforeEach, vi } from 'vitest'
import 'fake-indexeddb/auto'
import { TrainingDatabase, recordDrillSession } from '../src/db'
import {
  exportBackup,
  importBackup,
  shareOrDownloadBackup,
} from '../src/db/portability'

describe('Portability Engine & DB Integration (Seam 1 - Slice 2)', () => {
  let db: TrainingDatabase

  beforeEach(async () => {
    db = new TrainingDatabase(`test-portability-${Date.now()}-${Math.random()}`)
    await db.open()

    // Seed test data
    await db.dogs.put({
      id: 'dog-bella',
      name: 'Bella',
      createdAt: '2026-02-01T00:00:00.000Z',
      isArchived: false,
    })

    await db.dogs.put({
      id: 'dog-max',
      name: 'Max',
      createdAt: '2026-02-02T00:00:00.000Z',
      isArchived: false,
    })

    await db.appState.put({ key: 'activeDogId', value: 'dog-bella' })

    await recordDrillSession(db, {
      dogId: 'dog-bella',
      stepId: 'level-1-zen-step-1',
      levelId: 1,
      behaviorKey: 'zen',
      stepNumber: 1,
      reps: ['pass', 'pass', 'pass', 'pass', 'pass'],
      mode: 'practice',
    })
  })

  it('exports all database records with envelope metadata', async () => {
    const backup = await exportBackup(db, { scope: 'all' })

    expect(backup.schemaVersion).toBe(1)
    expect(backup.exportScope).toBe('all')
    expect(backup.data.dogs).toHaveLength(2)
    expect(backup.data.stepProgress).toHaveLength(1)
    expect(backup.data.sessions).toHaveLength(1)
    expect(backup.data.sessionLogs).toHaveLength(1)
    expect(backup.data.appState).toHaveLength(1)
  })

  it('exports single dog progress and associated logs only', async () => {
    // Add progress for max as well
    await recordDrillSession(db, {
      dogId: 'dog-max',
      stepId: 'level-1-come-step-1',
      levelId: 1,
      behaviorKey: 'come',
      stepNumber: 1,
      reps: ['pass', 'miss', 'pass', 'pass', 'pass'],
      mode: 'practice',
    })

    const bellaBackup = await exportBackup(db, {
      scope: 'dog',
      dogId: 'dog-bella',
    })

    expect(bellaBackup.exportScope).toBe('dog')
    expect(bellaBackup.dogId).toBe('dog-bella')
    expect(bellaBackup.data.dogs).toHaveLength(1)
    expect(bellaBackup.data.dogs[0].id).toBe('dog-bella')
    expect(bellaBackup.data.stepProgress).toHaveLength(1)
    expect(bellaBackup.data.stepProgress[0].dogId).toBe('dog-bella')
    expect(bellaBackup.data.sessionLogs).toHaveLength(1)
    expect(bellaBackup.data.sessionLogs[0].dogId).toBe('dog-bella')
  })

  it('restores backup with Overwrite mode, replacing all local data', async () => {
    const backupToRestore = {
      schemaVersion: 1,
      appVersion: '1.0.0',
      exportedAt: '2026-03-01T00:00:00.000Z',
      exportScope: 'all' as const,
      data: {
        dogs: [
          {
            id: 'dog-restored',
            name: 'Restored Dog',
            createdAt: '2026-03-01T00:00:00.000Z',
            isArchived: false,
          },
        ],
        stepProgress: [
          {
            dogId: 'dog-restored',
            stepId: 'level-1-sit-step-1',
            levelId: 1,
            behaviorKey: 'sit',
            status: 'passed_cold' as const,
            attemptsCount: 1,
            passedColdAt: '2026-03-01T00:00:00.000Z',
            updatedAt: '2026-03-01T00:00:00.000Z',
          },
        ],
        sessions: [],
        sessionLogs: [],
        appState: [{ key: 'activeDogId', value: 'dog-restored' }],
      },
    }

    const result = await importBackup(db, backupToRestore, {
      mode: 'overwrite',
    })
    expect(result.success).toBe(true)

    const allDogs = await db.dogs.toArray()
    expect(allDogs).toHaveLength(1)
    expect(allDogs[0].id).toBe('dog-restored')

    const allProgress = await db.stepProgress.toArray()
    expect(allProgress).toHaveLength(1)
    expect(allProgress[0].stepId).toBe('level-1-sit-step-1')

    const activeDogState = await db.appState.get('activeDogId')
    expect(activeDogState?.value).toBe('dog-restored')
  })

  it('merges backup data with existing records without data loss or key collision', async () => {
    // Current state: Bella has level-1-zen-step-1 as 'passed_practice'
    // Incoming backup: Bella has level-1-zen-step-1 as 'passed_cold', and a new dog Luna
    const mergeBackup = {
      schemaVersion: 1,
      appVersion: '1.0.0',
      exportedAt: '2026-03-05T00:00:00.000Z',
      exportScope: 'all' as const,
      data: {
        dogs: [
          {
            id: 'dog-bella',
            name: 'Bella',
            createdAt: '2026-02-01T00:00:00.000Z',
            isArchived: false,
          },
          {
            id: 'dog-luna',
            name: 'Luna',
            createdAt: '2026-03-05T00:00:00.000Z',
            isArchived: false,
          },
        ],
        stepProgress: [
          {
            dogId: 'dog-bella',
            stepId: 'level-1-zen-step-1',
            levelId: 1,
            behaviorKey: 'zen',
            status: 'passed_cold' as const,
            attemptsCount: 3,
            passedPracticeAt: '2026-02-01T00:00:00.000Z',
            passedColdAt: '2026-03-05T00:00:00.000Z',
            updatedAt: '2026-03-05T00:00:00.000Z',
          },
        ],
        sessions: [
          {
            id: 'session-luna-1',
            dogId: 'dog-luna',
            startedAt: '2026-03-05T00:00:00.000Z',
          },
        ],
        sessionLogs: [],
        appState: [],
      },
    }

    const result = await importBackup(db, mergeBackup, { mode: 'merge' })
    expect(result.success).toBe(true)

    // Existing dog Bella and Max should still be present, plus new dog Luna
    const allDogs = await db.dogs.toArray()
    expect(allDogs).toHaveLength(3)

    // Bella's step status should be promoted to passed_cold and attemptsCount merged
    const bellaProgress = await db.stepProgress.get([
      'dog-bella',
      'level-1-zen-step-1',
    ])
    expect(bellaProgress?.status).toBe('passed_cold')
    expect(bellaProgress?.passedColdAt).toBe('2026-03-05T00:00:00.000Z')

    // Session from Luna should be added
    const lunaSession = await db.sessions.get('session-luna-1')
    expect(lunaSession).toBeDefined()
  })

  it('rejects invalid backup schema during import without corrupting existing database', async () => {
    const corruptPayload = {
      schemaVersion: 1,
      data: 'not an object',
    }

    await expect(
      importBackup(db, corruptPayload, { mode: 'overwrite' })
    ).rejects.toThrow()

    // Ensure database remained intact
    const allDogs = await db.dogs.toArray()
    expect(allDogs).toHaveLength(2)
  })

  it('triggers Web Share API when supported, or falls back to direct download', async () => {
    const backup = await exportBackup(db, { scope: 'all' })

    // Test with mock Web Share
    const shareMock = vi.fn().mockResolvedValue(undefined)
    const mockNavigatorShare = {
      canShare: vi.fn().mockReturnValue(true),
      share: shareMock,
    } as unknown as Navigator

    const shareResult = await shareOrDownloadBackup(
      backup,
      'test-backup.json',
      mockNavigatorShare
    )
    expect(shareResult.method).toBe('share')
    expect(shareMock).toHaveBeenCalled()

    // Test fallback to download when canShare is unsupported
    const mockCreateObjectURL = vi.fn().mockReturnValue('blob:http://localhost/mock-url')
    const mockRevokeObjectURL = vi.fn()
    vi.stubGlobal('URL', {
      ...globalThis.URL,
      createObjectURL: mockCreateObjectURL,
      revokeObjectURL: mockRevokeObjectURL,
    })

    const mockNavigatorNoShare = {} as Navigator
    const downloadResult = await shareOrDownloadBackup(
      backup,
      'test-backup.json',
      mockNavigatorNoShare
    )
    expect(downloadResult.method).toBe('download')
    expect(mockCreateObjectURL).toHaveBeenCalled()
    expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:http://localhost/mock-url')

    vi.unstubAllGlobals()
  })
})
