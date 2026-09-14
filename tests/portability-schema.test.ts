import { describe, it, expect } from 'vitest'
import {
  CURRENT_BACKUP_SCHEMA_VERSION,
  BackupEnvelopeSchema,
  migrateBackupPayload,
} from '../src/types/portability'

describe('Portability Schema & Migration Pipeline (Seam 1 - Slice 1)', () => {
  it('validates a valid v1 full database backup envelope', () => {
    const validEnvelope = {
      schemaVersion: 1,
      appVersion: '1.0.0',
      exportedAt: new Date().toISOString(),
      exportScope: 'all' as const,
      data: {
        dogs: [
          {
            id: 'dog-1',
            name: 'Kira',
            createdAt: '2026-01-01T00:00:00.000Z',
            isArchived: false,
          },
        ],
        stepProgress: [
          {
            dogId: 'dog-1',
            stepId: 'level-1-zen-step-1',
            levelId: 1,
            behaviorKey: 'zen',
            status: 'passed_practice' as const,
            attemptsCount: 2,
            passedPracticeAt: '2026-01-02T00:00:00.000Z',
            updatedAt: '2026-01-02T00:00:00.000Z',
          },
        ],
        sessions: [
          {
            id: 'session-1',
            dogId: 'dog-1',
            startedAt: '2026-01-02T00:00:00.000Z',
          },
        ],
        sessionLogs: [
          {
            id: 'log-1',
            sessionId: 'session-1',
            dogId: 'dog-1',
            stepId: 'level-1-zen-step-1',
            levelId: 1,
            behaviorKey: 'zen',
            stepNumber: 1,
            reps: ['pass', 'pass', 'pass', 'pass', 'pass'] as const,
            passedCount: 5,
            missedCount: 0,
            completed: true,
            passed: true,
            mode: 'practice' as const,
            startedAt: '2026-01-02T00:00:00.000Z',
            completedAt: '2026-01-02T00:01:00.000Z',
          },
        ],
        appState: [
          {
            key: 'activeDogId',
            value: 'dog-1',
          },
        ],
      },
    }

    const parsed = BackupEnvelopeSchema.safeParse(validEnvelope)
    expect(parsed.success).toBe(true)
    if (parsed.success) {
      expect(parsed.data.schemaVersion).toBe(CURRENT_BACKUP_SCHEMA_VERSION)
      expect(parsed.data.exportScope).toBe('all')
      expect(parsed.data.data.dogs).toHaveLength(1)
    }
  })

  it('rejects an invalid backup envelope missing required fields', () => {
    const invalidEnvelope = {
      schemaVersion: 1,
      // missing appVersion and data
      exportedAt: 'not-a-valid-date',
    }

    const parsed = BackupEnvelopeSchema.safeParse(invalidEnvelope)
    expect(parsed.success).toBe(false)
  })

  it('migrates a legacy unversioned / v0 payload sequentially to current schema version', () => {
    // Legacy payload with top-level tables and no schemaVersion
    const legacyPayload = {
      dogs: [
        {
          id: 'dog-legacy',
          name: 'Rusty',
          createdAt: '2025-10-10T00:00:00.000Z',
          isArchived: false,
        },
      ],
      stepProgress: [
        {
          dogId: 'dog-legacy',
          stepId: 'level-1-sit-step-1',
          levelId: 1,
          behaviorKey: 'sit',
          status: 'passed_practice',
          attemptsCount: 1,
          updatedAt: '2025-10-10T00:00:00.000Z',
        },
      ],
      sessionLogs: [],
    }

    const migrated = migrateBackupPayload(legacyPayload)
    expect(migrated.schemaVersion).toBe(CURRENT_BACKUP_SCHEMA_VERSION)
    expect(migrated.exportScope).toBe('all')
    expect(migrated.data.dogs[0].name).toBe('Rusty')
    expect(migrated.data.stepProgress).toHaveLength(1)
    expect(migrated.data.sessions).toEqual([])
    expect(migrated.data.sessionLogs).toEqual([])
  })

  it('throws an error if backup payload is completely unparseable or corrupted', () => {
    expect(() => migrateBackupPayload(null)).toThrow()
    expect(() => migrateBackupPayload('invalid-json-string')).toThrow()
    expect(() => migrateBackupPayload({ schemaVersion: 999 })).toThrow(/unsupported schema version/i)
  })
})
