import Dexie, { type Table } from 'dexie'
import type {
  Dog,
  StepProgress,
  TrainingSession,
  SessionLog,
  AppState,
  RepResult,
} from '../types/db'

export class TrainingDatabase extends Dexie {
  dogs!: Table<Dog, string>
  stepProgress!: Table<StepProgress, [string, string]>
  sessions!: Table<TrainingSession, string>
  sessionLogs!: Table<SessionLog, string>
  appState!: Table<AppState, string>

  constructor(dbName = 'training-levels-db') {
    super(dbName)

    this.version(1).stores({
      dogs: '&id, name, createdAt, isArchived',
      stepProgress:
        '&[dogId+stepId], dogId, stepId, levelId, behaviorKey, status, [dogId+levelId], [dogId+behaviorKey], [dogId+status], updatedAt',
      sessions: '&id, dogId, startedAt, [dogId+startedAt]',
      sessionLogs:
        '&id, sessionId, dogId, stepId, [dogId+stepId], [dogId+startedAt]',
      appState: '&key',
    })
  }
}

export const db = new TrainingDatabase()

export const DEFAULT_DOG_ID = 'primary-dog-default'

/**
 * Get the active dog or initialize a default primary dog profile.
 */
export async function getOrCreateActiveDog(database: TrainingDatabase = db): Promise<Dog> {
  const activeDogState = await database.appState.get('activeDogId')
  const dogId = (activeDogState?.value as string) || DEFAULT_DOG_ID

  let dog = await database.dogs.get(dogId)
  if (!dog) {
    dog = {
      id: dogId,
      name: 'Primary Dog',
      createdAt: new Date().toISOString(),
      isArchived: false,
    }
    await database.dogs.put(dog)
    await database.appState.put({ key: 'activeDogId', value: dogId })
  }

  return dog
}

export interface RecordDrillSessionInput {
  logId?: string
  sessionId?: string
  dogId: string
  stepId: string
  levelId: number
  behaviorKey: string
  stepNumber: number
  reps: RepResult[]
  mode?: 'practice' | 'cold'
  notes?: string
}

/**
 * Record a 5-rep drill session atomically and update step progress.
 */
export async function recordDrillSession(
  database: TrainingDatabase = db,
  input: RecordDrillSessionInput
): Promise<{ sessionLog: SessionLog; progress: StepProgress }> {
  const now = new Date().toISOString()
  const mode = input.mode || 'practice'
  const passedCount = input.reps.filter((r) => r === 'pass').length
  const missedCount = input.reps.filter((r) => r === 'miss').length
  const isPassed = passedCount >= 4
  const isCompleted = input.reps.length === 5

  const sessionId =
    input.sessionId || `session-${now}-${Math.random().toString(36).substring(2, 8)}`
  const logId =
    input.logId || `log-${now}-${Math.random().toString(36).substring(2, 8)}`

  const sessionLog: SessionLog = {
    id: logId,
    sessionId,
    dogId: input.dogId,
    stepId: input.stepId,
    levelId: input.levelId,
    behaviorKey: input.behaviorKey,
    stepNumber: input.stepNumber,
    reps: input.reps,
    passedCount,
    missedCount,
    completed: isCompleted,
    passed: isPassed,
    mode,
    startedAt: now,
    completedAt: now,
    notes: input.notes,
  }

  return await database.transaction(
    'rw',
    [database.sessionLogs, database.stepProgress, database.sessions],
    async () => {
      // Ensure session exists
      const existingSession = await database.sessions.get(sessionId)
      if (!existingSession) {
        await database.sessions.put({
          id: sessionId,
          dogId: input.dogId,
          startedAt: now,
        })
      }

      // Save or update session log
      await database.sessionLogs.put(sessionLog)

      // Fetch or initialize step progress
      const existingProgress = await database.stepProgress.get([
        input.dogId,
        input.stepId,
      ])

      let nextStatus = existingProgress?.status || 'not_started'

      if (mode === 'cold') {
        if (isPassed && isCompleted) {
          nextStatus = 'passed_cold'
        }
      } else {
        if (isPassed && isCompleted) {
          // If it was already passed_cold, keep passed_cold; otherwise passed_practice
          if (nextStatus !== 'passed_cold') {
            nextStatus = 'passed_practice'
          }
        } else if (nextStatus === 'not_started') {
          nextStatus = 'in_progress'
        }
      }

      const prevAttempts = existingProgress?.attemptsCount || 0
      const updatedProgress: StepProgress = {
        dogId: input.dogId,
        stepId: input.stepId,
        levelId: input.levelId,
        behaviorKey: input.behaviorKey,
        status: nextStatus,
        attemptsCount: isCompleted ? prevAttempts + 1 : prevAttempts,
        passedPracticeAt:
          isPassed && isCompleted && mode === 'practice'
            ? existingProgress?.passedPracticeAt || now
            : existingProgress?.passedPracticeAt,
        passedColdAt:
          isPassed && isCompleted && mode === 'cold'
            ? existingProgress?.passedColdAt || now
            : existingProgress?.passedColdAt,
        updatedAt: now,
      }

      await database.stepProgress.put(updatedProgress)

      return { sessionLog, progress: updatedProgress }
    }
  )
}

export async function getStepProgress(
  database: TrainingDatabase = db,
  dogId: string,
  stepId: string
): Promise<StepProgress | undefined> {
  return await database.stepProgress.get([dogId, stepId])
}

export async function getSessionLogs(
  database: TrainingDatabase = db,
  dogId: string,
  stepId?: string
): Promise<SessionLog[]> {
  if (stepId) {
    return await database.sessionLogs
      .where('[dogId+stepId]')
      .equals([dogId, stepId])
      .reverse()
      .sortBy('startedAt')
  }
  return await database.sessionLogs
    .where('dogId')
    .equals(dogId)
    .reverse()
    .sortBy('startedAt')
}
