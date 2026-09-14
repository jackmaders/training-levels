import type { Table } from 'dexie'
import type { TrainingDatabase } from './index'
import type { StepProgress, TrainingSession, SessionLog, AppState, StepStatus } from '../types/db'
import {
  type BackupEnvelope,
  CURRENT_BACKUP_SCHEMA_VERSION,
  APP_VERSION,
  migrateBackupPayload,
} from '../types/portability'

export type ExportScopeOptions =
  | { scope: 'all' }
  | { scope: 'dog'; dogId: string }

export interface ImportOptions {
  mode: 'overwrite' | 'merge'
}

export interface ImportResult {
  success: boolean
  importedDogCount: number
  importedProgressCount: number
  importedSessionCount: number
  importedLogCount: number
  mode: 'overwrite' | 'merge'
}

const STATUS_RANK: Record<StepStatus, number> = {
  not_started: 0,
  skipped: 1,
  in_progress: 2,
  passed_practice: 3,
  passed_cold: 4,
}

/**
 * Generic helper to insert records into a Dexie table if key doesn't already exist.
 */
async function mergeUniqueRecords<T, K>(
  table: Table<T, K>,
  records: T[],
  getKey: (item: T) => K
): Promise<void> {
  for (const item of records) {
    const existing = await table.get(getKey(item))
    if (!existing) {
      await table.put(item)
    }
  }
}

/**
 * Exports data into a standardized versioned JSON backup envelope.
 */
export async function exportBackup(
  database: TrainingDatabase,
  options: ExportScopeOptions = { scope: 'all' }
): Promise<BackupEnvelope> {
  const exportedAt = new Date().toISOString()

  if (options.scope === 'dog') {
    const dog = await database.dogs.get(options.dogId)
    if (!dog) {
      throw new Error(`Dog with id "${options.dogId}" not found.`)
    }

    const stepProgress = await database.stepProgress
      .where('dogId')
      .equals(options.dogId)
      .toArray()

    const sessions = await database.sessions
      .where('dogId')
      .equals(options.dogId)
      .toArray()

    const sessionLogs = await database.sessionLogs
      .where('dogId')
      .equals(options.dogId)
      .toArray()

    return {
      schemaVersion: CURRENT_BACKUP_SCHEMA_VERSION,
      appVersion: APP_VERSION,
      exportedAt,
      exportScope: 'dog',
      dogId: options.dogId,
      data: {
        dogs: [dog],
        stepProgress,
        sessions,
        sessionLogs,
        appState: [],
      },
    }
  }

  // scope: 'all'
  const dogs = await database.dogs.toArray()
  const stepProgress = await database.stepProgress.toArray()
  const sessions = await database.sessions.toArray()
  const sessionLogs = await database.sessionLogs.toArray()
  const appState = await database.appState.toArray()

  return {
    schemaVersion: CURRENT_BACKUP_SCHEMA_VERSION,
    appVersion: APP_VERSION,
    exportedAt,
    exportScope: 'all',
    data: {
      dogs,
      stepProgress,
      sessions,
      sessionLogs,
      appState,
    },
  }
}

/**
 * Validates, migrates, and restores or merges backup data into IndexedDB.
 */
export async function importBackup(
  database: TrainingDatabase,
  rawPayload: unknown,
  options: ImportOptions
): Promise<ImportResult> {
  // Validate schema & run sequential migrations
  const envelope = migrateBackupPayload(rawPayload)

  return await database.transaction(
    'rw',
    [
      database.dogs,
      database.stepProgress,
      database.sessions,
      database.sessionLogs,
      database.appState,
    ],
    async () => {
      const { dogs, stepProgress, sessions, sessionLogs, appState } =
        envelope.data

      if (options.mode === 'overwrite') {
        if (envelope.exportScope === 'dog' && envelope.dogId) {
          const targetDogId = envelope.dogId
          // Scoped overwrite: replace only this dog's records
          await database.stepProgress.where('dogId').equals(targetDogId).delete()
          await database.sessions.where('dogId').equals(targetDogId).delete()
          await database.sessionLogs.where('dogId').equals(targetDogId).delete()

          if (dogs.length > 0) await database.dogs.bulkPut(dogs)
          if (stepProgress.length > 0) await database.stepProgress.bulkPut(stepProgress)
          if (sessions.length > 0) await database.sessions.bulkPut(sessions)
          if (sessionLogs.length > 0) await database.sessionLogs.bulkPut(sessionLogs)
        } else {
          // Full overwrite: clear all tables for clean restore
          await Promise.all([
            database.dogs.clear(),
            database.stepProgress.clear(),
            database.sessions.clear(),
            database.sessionLogs.clear(),
            database.appState.clear(),
          ])

          if (dogs.length > 0) await database.dogs.bulkPut(dogs)
          if (stepProgress.length > 0)
            await database.stepProgress.bulkPut(stepProgress)
          if (sessions.length > 0) await database.sessions.bulkPut(sessions)
          if (sessionLogs.length > 0)
            await database.sessionLogs.bulkPut(sessionLogs)
          if (appState.length > 0) await database.appState.bulkPut(appState)
        }

        return {
          success: true,
          importedDogCount: dogs.length,
          importedProgressCount: stepProgress.length,
          importedSessionCount: sessions.length,
          importedLogCount: sessionLogs.length,
          mode: 'overwrite',
        }
      }

      // Merge Mode
      // 1. Merge dogs
      for (const dog of dogs) {
        const existingDog = await database.dogs.get(dog.id)
        if (!existingDog) {
          await database.dogs.put(dog)
        } else if (dog.name && dog.name !== existingDog.name) {
          // Update profile attributes while preserving existing entity
          await database.dogs.put({ ...existingDog, name: dog.name, isArchived: dog.isArchived })
        }
      }

      // 2. Merge stepProgress
      for (const item of stepProgress) {
        const existing = await database.stepProgress.get([
          item.dogId,
          item.stepId,
        ])
        if (!existing) {
          await database.stepProgress.put(item)
        } else {
          const currentRank = STATUS_RANK[existing.status] ?? 0
          const incomingRank = STATUS_RANK[item.status] ?? 0
          const mergedStatus =
            incomingRank >= currentRank ? item.status : existing.status

          const mergedAttempts = Math.max(
            existing.attemptsCount || 0,
            item.attemptsCount || 0
          )
          const mergedPassedPracticeAt =
            item.passedPracticeAt || existing.passedPracticeAt
          const mergedPassedColdAt =
            item.passedColdAt || existing.passedColdAt
          const mergedUpdatedAt =
            item.updatedAt > existing.updatedAt
              ? item.updatedAt
              : existing.updatedAt

          const merged: StepProgress = {
            ...existing,
            ...item,
            status: mergedStatus,
            attemptsCount: mergedAttempts,
            passedPracticeAt: mergedPassedPracticeAt,
            passedColdAt: mergedPassedColdAt,
            updatedAt: mergedUpdatedAt,
          }

          await database.stepProgress.put(merged)
        }
      }

      // 3. Merge sessions, session logs, and appState
      await mergeUniqueRecords<TrainingSession, string>(
        database.sessions,
        sessions,
        (s) => s.id
      )
      await mergeUniqueRecords<SessionLog, string>(
        database.sessionLogs,
        sessionLogs,
        (l) => l.id
      )
      await mergeUniqueRecords<AppState, string>(
        database.appState,
        appState,
        (a) => a.key
      )

      return {
        success: true,
        importedDogCount: dogs.length,
        importedProgressCount: stepProgress.length,
        importedSessionCount: sessions.length,
        importedLogCount: sessionLogs.length,
        mode: 'merge',
      }
    }
  )
}
