import type { TrainingLevelsData, StepData } from '../types/curriculum'
import type { StepProgress, StepStatus } from '../types/db'
import type { TrainingDatabase } from './index'

export interface RecommendedDrill {
  levelNumber: number
  levelTitle: string
  behaviorKey: string
  behaviorTitle: string
  step: StepData
  status: StepStatus
  suggestedMode: 'practice' | 'cold'
  reason: string
}

/**
 * Determine the dynamically recommended next drill based on the dog's mastery state.
 *
 * Priority:
 * 1. An actively in-progress step (most recently updated if multiple).
 * 2. A step that passed practice and is waiting for Cold Test Certification.
 * 3. The first incomplete step in sequential curriculum order.
 */
export async function getRecommendedNextDrill(
  database: TrainingDatabase,
  dogId: string,
  curriculumData: TrainingLevelsData
): Promise<RecommendedDrill | null> {
  const progressRecords = await database.stepProgress
    .where('dogId')
    .equals(dogId)
    .toArray()

  const progressMap = new Map<string, StepProgress>(
    progressRecords.map((p) => [p.stepId, p])
  )

  // Helper to resolve metadata from curriculum
  function findStepMeta(stepId: string) {
    for (const level of curriculumData.levels) {
      for (const behavior of level.behaviors) {
        const step = behavior.steps.find((s) => s.id === stepId)
        if (step) {
          return {
            levelNumber: level.level,
            levelTitle: level.title,
            behaviorKey: behavior.behaviorKey,
            behaviorTitle: behavior.title,
            step,
          }
        }
      }
    }
    return null
  }

  // 1. Check for most recently updated in_progress step
  const inProgressList = progressRecords
    .filter((p) => p.status === 'in_progress')
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))

  if (inProgressList.length > 0) {
    const targetProgress = inProgressList[0]
    const meta = findStepMeta(targetProgress.stepId)
    if (meta) {
      return {
        ...meta,
        status: 'in_progress',
        suggestedMode: 'practice',
        reason: 'In progress — continue 5-rep practice drill',
      }
    }
  }

  // 2. Check for a step that passed practice but hasn't passed cold
  // Walk in curriculum order to prioritize current level/behavior
  for (const level of curriculumData.levels) {
    for (const behavior of level.behaviors) {
      for (const step of behavior.steps) {
        const prog = progressMap.get(step.id)
        if (prog?.status === 'passed_practice') {
          return {
            levelNumber: level.level,
            levelTitle: level.title,
            behaviorKey: behavior.behaviorKey,
            behaviorTitle: behavior.title,
            step,
            status: 'passed_practice',
            suggestedMode: 'cold',
            reason: 'Passed practice — ready for Cold Test Certification!',
          }
        }
      }
    }
  }

  // 3. Sequential walk: first step not passed cold or passed practice
  for (const level of curriculumData.levels) {
    for (const behavior of level.behaviors) {
      for (const step of behavior.steps) {
        const prog = progressMap.get(step.id)
        const status = prog?.status || 'not_started'
        if (status !== 'passed_cold' && status !== 'skipped') {
          return {
            levelNumber: level.level,
            levelTitle: level.title,
            behaviorKey: behavior.behaviorKey,
            behaviorTitle: behavior.title,
            step,
            status,
            suggestedMode: 'practice',
            reason:
              status === 'not_started'
                ? 'Next foundational step in curriculum'
                : 'Current training step',
          }
        }
      }
    }
  }

  // If all completed, return first step as fallback
  const firstLevel = curriculumData.levels[0]
  const firstBehavior = firstLevel?.behaviors[0]
  const firstStep = firstBehavior?.steps[0]
  if (firstLevel && firstBehavior && firstStep) {
    return {
      levelNumber: firstLevel.level,
      levelTitle: firstLevel.title,
      behaviorKey: firstBehavior.behaviorKey,
      behaviorTitle: firstBehavior.title,
      step: firstStep,
      status: progressMap.get(firstStep.id)?.status || 'not_started',
      suggestedMode: 'practice',
      reason: 'Curriculum review',
    }
  }

  return null
}
