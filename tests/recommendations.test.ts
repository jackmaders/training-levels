import { describe, it, expect, beforeEach } from 'vitest'
import 'fake-indexeddb/auto'
import {
  TrainingDatabase,
  getOrCreateActiveDog,
  recordDrillSession,
  getStepProgress,
  getRecommendedNextDrill,
  calculateRepScores,
} from '../src/db/index'
import trainingData from '../src/data/training-levels.json'
import type { TrainingLevelsData } from '../src/types/curriculum'

describe('Recommendation Engine & Cold Test Mode (Seam 1)', () => {
  let db: TrainingDatabase
  const curriculum = trainingData as unknown as TrainingLevelsData

  beforeEach(async () => {
    db = new TrainingDatabase('test-rec-db-' + Math.random().toString(36).substring(2))
    await db.open()
  })

  describe('Cold Test Mode 1-Rep Rule', () => {
    it('calculateRepScores handles cold mode with 1 rep', () => {
      const passResult = calculateRepScores(['pass'], 'cold')
      expect(passResult.isCompleted).toBe(true)
      expect(passResult.isPassed).toBe(true)
      expect(passResult.passedCount).toBe(1)
      expect(passResult.missedCount).toBe(0)

      const missResult = calculateRepScores(['miss'], 'cold')
      expect(missResult.isCompleted).toBe(true)
      expect(missResult.isPassed).toBe(false)
      expect(missResult.passedCount).toBe(0)
      expect(missResult.missedCount).toBe(1)
    })

    it('enforces single cold retention test and marks step as passed_cold on 1 passed rep', async () => {
      const dog = await getOrCreateActiveDog(db)
      const stepId = 'level-1-zen-step-1'

      const result = await recordDrillSession(db, {
        dogId: dog.id,
        stepId,
        levelId: 1,
        behaviorKey: 'zen',
        stepNumber: 1,
        reps: ['pass'],
        mode: 'cold',
      })

      expect(result.sessionLog.mode).toBe('cold')
      expect(result.sessionLog.passed).toBe(true)
      expect(result.sessionLog.completed).toBe(true)
      expect(result.progress.status).toBe('passed_cold')
      expect(result.progress.passedColdAt).toBeDefined()

      const progress = await getStepProgress(db, dog.id, stepId)
      expect(progress?.status).toBe('passed_cold')
      expect(progress?.passedColdAt).toBeTruthy()
    })

    it('does not mark step as passed_cold when cold retention test misses', async () => {
      const dog = await getOrCreateActiveDog(db)
      const stepId = 'level-1-zen-step-1'

      const result = await recordDrillSession(db, {
        dogId: dog.id,
        stepId,
        levelId: 1,
        behaviorKey: 'zen',
        stepNumber: 1,
        reps: ['miss'],
        mode: 'cold',
      })

      expect(result.sessionLog.mode).toBe('cold')
      expect(result.sessionLog.passed).toBe(false)
      expect(result.progress.status).toBe('in_progress')
      expect(result.progress.passedColdAt).toBeUndefined()
    })
  })

  describe('getRecommendedNextDrill', () => {
    it('returns Level 1 Step 1 (Zen) for a brand new dog with no training history', async () => {
      const dog = await getOrCreateActiveDog(db)
      const recommendation = await getRecommendedNextDrill(db, dog.id, curriculum)

      expect(recommendation).toBeDefined()
      expect(recommendation?.levelNumber).toBe(1)
      expect(recommendation?.behaviorKey).toBe('zen')
      expect(recommendation?.step.stepNumber).toBe(1)
      expect(recommendation?.step.id).toBe('level-1-zen-step-1')
      expect(recommendation?.suggestedMode).toBe('practice')
    })

    it('recommends Cold Test Certification when a step has passed_practice but not passed_cold', async () => {
      const dog = await getOrCreateActiveDog(db)
      const stepId = 'level-1-zen-step-1'

      await recordDrillSession(db, {
        dogId: dog.id,
        stepId,
        levelId: 1,
        behaviorKey: 'zen',
        stepNumber: 1,
        reps: ['pass', 'pass', 'pass', 'pass', 'pass'],
        mode: 'practice',
      })

      const recommendation = await getRecommendedNextDrill(db, dog.id, curriculum)
      expect(recommendation?.step.id).toBe('level-1-zen-step-1')
      expect(recommendation?.status).toBe('passed_practice')
      expect(recommendation?.suggestedMode).toBe('cold')
    })

    it('advances to next step (Step 2) when Step 1 is passed_cold', async () => {
      const dog = await getOrCreateActiveDog(db)
      const stepId = 'level-1-zen-step-1'

      await recordDrillSession(db, {
        dogId: dog.id,
        stepId,
        levelId: 1,
        behaviorKey: 'zen',
        stepNumber: 1,
        reps: ['pass'],
        mode: 'cold',
      })

      const recommendation = await getRecommendedNextDrill(db, dog.id, curriculum)
      expect(recommendation?.step.id).toBe('level-1-zen-step-2')
      expect(recommendation?.step.stepNumber).toBe(2)
      expect(recommendation?.suggestedMode).toBe('practice')
    })

    it('prioritizes an in_progress step recently touched by the handler', async () => {
      const dog = await getOrCreateActiveDog(db)

      // Mark Zen Step 1 as passed_cold
      await recordDrillSession(db, {
        dogId: dog.id,
        stepId: 'level-1-zen-step-1',
        levelId: 1,
        behaviorKey: 'zen',
        stepNumber: 1,
        reps: ['pass'],
        mode: 'cold',
      })

      // Start working on Come Step 1 (making it in_progress)
      await recordDrillSession(db, {
        dogId: dog.id,
        stepId: 'level-1-come-step-1',
        levelId: 1,
        behaviorKey: 'come',
        stepNumber: 1,
        reps: ['pass', 'miss', 'pass', 'miss', 'miss'],
        mode: 'practice',
      })

      const recommendation = await getRecommendedNextDrill(db, dog.id, curriculum)
      expect(recommendation?.step.id).toBe('level-1-come-step-1')
      expect(recommendation?.behaviorKey).toBe('come')
      expect(recommendation?.status).toBe('in_progress')
      expect(recommendation?.suggestedMode).toBe('practice')
    })
  })
})
