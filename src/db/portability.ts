import type { TrainingDatabase } from './index'
import type { StepProgress, StepStatus } from '../types/db'
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
        // Clear all tables for clean restore
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

      // 3. Merge sessions
      for (const session of sessions) {
        const existing = await database.sessions.get(session.id)
        if (!existing) {
          await database.sessions.put(session)
        }
      }

      // 4. Merge session logs
      for (const log of sessionLogs) {
        const existing = await database.sessionLogs.get(log.id)
        if (!existing) {
          await database.sessionLogs.put(log)
        }
      }

      // 5. Merge appState without overriding existing local preferences
      for (const state of appState) {
        const existing = await database.appState.get(state.key)
        if (!existing) {
          await database.appState.put(state)
        }
      }

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

/**
 * Triggers native Web Share API where supported, or falls back to direct JSON file download.
 */
export async function shareOrDownloadBackup(
  envelope: BackupEnvelope,
  customFilename?: string,
  navigatorObj: Navigator = typeof navigator !== 'undefined'
    ? navigator
    : ({} as Navigator)
): Promise<{ method: 'share' | 'download' }> {
  const jsonString = JSON.stringify(envelope, null, 2)
  const defaultDate = new Date().toISOString().split('T')[0]
  const filename =
    customFilename ||
    `training-levels-backup-${
      envelope.exportScope === 'dog' && envelope.dogId
        ? envelope.dogId
        : 'all'
    }-${defaultDate}.json`

  const blob = new Blob([jsonString], { type: 'application/json' })

  // Check if Web Share API with files is supported
  if (
    typeof navigatorObj?.canShare === 'function' &&
    typeof navigatorObj?.share === 'function' &&
    typeof File !== 'undefined'
  ) {
    try {
      const file = new File([blob], filename, { type: 'application/json' })
      if (navigatorObj.canShare({ files: [file] })) {
        await navigatorObj.share({
          title: 'Training Levels Backup',
          text: `Training Levels data export (${envelope.exportScope})`,
          files: [file],
        })
        return { method: 'share' }
      }
    } catch (err: unknown) {
      // If user aborted or share failed, proceed with fallback if not an explicit cancel
      if (err instanceof Error && err.name === 'AbortError') {
        return { method: 'share' }
      }
    }
  }

  // Fallback: direct download via anchor
  if (
    typeof document !== 'undefined' &&
    typeof URL !== 'undefined' &&
    typeof URL.createObjectURL === 'function'
  ) {
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = filename
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
    if (typeof URL.revokeObjectURL === 'function') {
      URL.revokeObjectURL(url)
    }
  }

  return { method: 'download' }
}
