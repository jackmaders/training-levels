import { z } from 'zod'

export const StepStatusSchema = z.enum([
  'not_started',
  'in_progress',
  'passed_practice',
  'passed_cold',
  'skipped',
])
export type StepStatus = z.infer<typeof StepStatusSchema>

export const DogSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.string(),
  isArchived: z.boolean(),
})
export type Dog = z.infer<typeof DogSchema>

export const StepProgressSchema = z.object({
  dogId: z.string(),
  stepId: z.string(),
  levelId: z.number(),
  behaviorKey: z.string(),
  status: StepStatusSchema,
  attemptsCount: z.number().default(0),
  passedPracticeAt: z.string().optional(),
  passedColdAt: z.string().optional(),
  updatedAt: z.string(),
})
export type StepProgress = z.infer<typeof StepProgressSchema>

export const TrainingSessionSchema = z.object({
  id: z.string(),
  dogId: z.string(),
  startedAt: z.string(),
  endedAt: z.string().optional(),
})
export type TrainingSession = z.infer<typeof TrainingSessionSchema>

export const RepResultSchema = z.enum(['pass', 'miss'])
export type RepResult = z.infer<typeof RepResultSchema>

export const SessionLogSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  dogId: z.string(),
  stepId: z.string(),
  levelId: z.number(),
  behaviorKey: z.string(),
  stepNumber: z.number(),
  reps: z.array(RepResultSchema),
  passedCount: z.number(),
  missedCount: z.number(),
  completed: z.boolean(),
  passed: z.boolean(),
  mode: z.enum(['practice', 'cold']).default('practice'),
  startedAt: z.string(),
  completedAt: z.string(),
  notes: z.string().optional(),
})
export type SessionLog = z.infer<typeof SessionLogSchema>

export const AppStateSchema = z.object({
  key: z.string(),
  value: z.unknown(),
})
export type AppState = z.infer<typeof AppStateSchema>
