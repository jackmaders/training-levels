import { z } from 'zod'
import {
  DogSchema,
  StepProgressSchema,
  TrainingSessionSchema,
  SessionLogSchema,
  AppStateSchema,
} from './db'

export const CURRENT_BACKUP_SCHEMA_VERSION = 1
export const APP_VERSION = '1.0.0'

export const BackupScopeSchema = z.enum(['all', 'dog'])
export type BackupScope = z.infer<typeof BackupScopeSchema>

export const BackupDataSchema = z.object({
  dogs: z.array(DogSchema).default([]),
  stepProgress: z.array(StepProgressSchema).default([]),
  sessions: z.array(TrainingSessionSchema).default([]),
  sessionLogs: z.array(SessionLogSchema).default([]),
  appState: z.array(AppStateSchema).default([]),
})
export type BackupData = z.infer<typeof BackupDataSchema>

export const BackupEnvelopeSchema = z.object({
  schemaVersion: z.literal(CURRENT_BACKUP_SCHEMA_VERSION),
  appVersion: z.string(),
  exportedAt: z.string(),
  exportScope: BackupScopeSchema,
  dogId: z.string().optional(),
  data: BackupDataSchema,
})
export type BackupEnvelope = z.infer<typeof BackupEnvelopeSchema>

/**
 * In-memory sequential migration pipeline.
 * Converts older schema versions or legacy structures up to the current schema version.
 */
export function migrateBackupPayload(raw: unknown): BackupEnvelope {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Invalid backup payload: expected a JSON object.')
  }

  const record = raw as Record<string, unknown>

  // Determine incoming version
  const rawVersion = record.schemaVersion

  if (rawVersion !== undefined && typeof rawVersion !== 'number') {
    throw new Error('Invalid schemaVersion: must be a number.')
  }

  // Future version guard
  if (typeof rawVersion === 'number' && rawVersion > CURRENT_BACKUP_SCHEMA_VERSION) {
    throw new Error(
      `Unsupported schema version ${rawVersion}. This app supports up to version ${CURRENT_BACKUP_SCHEMA_VERSION}.`
    )
  }

  let currentPayload = record

  // Stage 0 -> Stage 1 migration (Legacy format without envelope wrapper)
  if (rawVersion === undefined || rawVersion === 0) {
    const dogs = Array.isArray(currentPayload.dogs) ? currentPayload.dogs : []
    const stepProgress = Array.isArray(currentPayload.stepProgress)
      ? currentPayload.stepProgress
      : []
    const sessions = Array.isArray(currentPayload.sessions)
      ? currentPayload.sessions
      : []
    const sessionLogs = Array.isArray(currentPayload.sessionLogs)
      ? currentPayload.sessionLogs
      : []
    const appState = Array.isArray(currentPayload.appState)
      ? currentPayload.appState
      : []

    currentPayload = {
      schemaVersion: 1,
      appVersion: APP_VERSION,
      exportedAt: new Date().toISOString(),
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

  // Parse and validate with Zod at current schema version
  return BackupEnvelopeSchema.parse(currentPayload)
}
