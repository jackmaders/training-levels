import { describe, it, expect, beforeEach } from 'vitest'
import 'fake-indexeddb/auto'
import {
  TrainingDatabase,
  getOrCreateActiveDog,
  recordDrillSession,
  getStepProgress,
  getAllStepProgress,
  getSessionLogs,
} from '../src/db/index'

describe('Dexie Database & Persistence (Seam 1)', () => {
  let db: TrainingDatabase

  beforeEach(async () => {
    db = new TrainingDatabase('test-training-db-' + Math.random().toString(36).substring(2))
    await db.open()
  })

  it('initializes and returns a default active dog profile', async () => {
    const dog = await getOrCreateActiveDog(db)
    expect(dog).toBeDefined()
    expect(dog.id).toBeTruthy()
    expect(dog.name).toBe('Primary Dog')
    expect(dog.isArchived).toBe(false)

    // Second call returns existing active dog
    const sameDog = await getOrCreateActiveDog(db)
    expect(sameDog.id).toBe(dog.id)
  })

  it('records a 5-rep drill and automatically marks status as passed_practice when >= 4 passes', async () => {
    const dog = await getOrCreateActiveDog(db)
    const stepId = 'level-1-zen-step-1'
    const levelId = 1
    const behaviorKey = 'zen'

    const result = await recordDrillSession(db, {
      dogId: dog.id,
      stepId,
      levelId,
      behaviorKey,
      stepNumber: 1,
      reps: ['pass', 'pass', 'pass', 'miss', 'pass'], // 4 passes, 1 miss
      mode: 'practice',
    })

    expect(result.sessionLog).toBeDefined()
    expect(result.sessionLog.passedCount).toBe(4)
    expect(result.sessionLog.missedCount).toBe(1)
    expect(result.sessionLog.passed).toBe(true)

    // Check stepProgress in Dexie
    const progress = await getStepProgress(db, dog.id, stepId)
    expect(progress).toBeDefined()
    expect(progress?.status).toBe('passed_practice')
    expect(progress?.attemptsCount).toBe(1)
    expect(progress?.passedPracticeAt).toBeDefined()

    // Check sessionLogs in Dexie
    const logs = await getSessionLogs(db, dog.id, stepId)
    expect(logs).toHaveLength(1)
    expect(logs[0].reps).toEqual(['pass', 'pass', 'pass', 'miss', 'pass'])
  })

  it('records a 5-rep drill with < 4 passes as in_progress without passing', async () => {
    const dog = await getOrCreateActiveDog(db)
    const stepId = 'level-1-zen-step-1'
    const levelId = 1
    const behaviorKey = 'zen'

    const result = await recordDrillSession(db, {
      dogId: dog.id,
      stepId,
      levelId,
      behaviorKey,
      stepNumber: 1,
      reps: ['pass', 'miss', 'miss', 'pass', 'miss'], // 2 passes, 3 misses
      mode: 'practice',
    })

    expect(result.sessionLog.passed).toBe(false)

    const progress = await getStepProgress(db, dog.id, stepId)
    expect(progress?.status).toBe('in_progress')
    expect(progress?.passedPracticeAt).toBeUndefined()
  })

  it('retrieves all step progress records mapped by stepId for a dog', async () => {
    const dog = await getOrCreateActiveDog(db)
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

    const allProgress = await getAllStepProgress(db, dog.id)
    expect(allProgress['level-1-zen-step-1']?.status).toBe('passed_practice')
    expect(allProgress['level-1-zen-step-2']?.status).toBe('passed_cold')
  })
})

