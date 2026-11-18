import { z } from "zod";

const PRACTICE_STEP_ID = "level-1/zen:step-1";
const TARGET_MAX_LENGTH = 256;
const TRAINING_STEP_IDS = [
  "level-1/zen:step-1",
  "level-1/zen:step-2",
  "level-1/zen:step-3",
  "level-3/retrieve:step-1",
  "level-3/retrieve:step-2",
] as const;
const TOTAL_COUNT_MAX = 10_000;

export const practiceHistoryInputSchema = z.object({
  stepId: z.literal(PRACTICE_STEP_ID),
});

export const recordPracticeAttemptInputSchema = z.object({
  attemptId: z.string().uuid(),
  outcome: z.enum(["success", "not_yet"]),
  stepId: z.literal(PRACTICE_STEP_ID),
  target: z.string().trim().min(1).max(TARGET_MAX_LENGTH),
});

export const correctPracticeAttemptInputSchema = z.object({
  attemptId: z.string().uuid(),
  outcome: z.enum(["success", "not_yet"]),
});

export const undoPracticeAttemptInputSchema = z.object({
  attemptId: z.string().uuid(),
});

export const recordPracticeTotalsInputSchema = z
  .object({
    notYetCount: z.number().int().min(0).max(TOTAL_COUNT_MAX),
    recordId: z.string().uuid(),
    stepId: z.enum(TRAINING_STEP_IDS),
    successCount: z.number().int().min(0).max(TOTAL_COUNT_MAX),
    target: z.string().trim().min(1).max(TARGET_MAX_LENGTH),
  })
  .refine(({ notYetCount, successCount }) => successCount + notYetCount > 0, {
    message: "Enter at least one recorded result.",
  });

export const correctPracticeTotalsInputSchema = z
  .object({
    notYetCount: z.number().int().min(0).max(TOTAL_COUNT_MAX),
    recordId: z.string().uuid(),
    successCount: z.number().int().min(0).max(TOTAL_COUNT_MAX),
  })
  .refine(({ notYetCount, successCount }) => successCount + notYetCount > 0, {
    message: "Totals must include at least one recorded result.",
  });

export const savePracticeStepDecisionInputSchema = z.object({
  decision: z.enum(["keep_practicing", "recommend_test"]),
  stepId: z.enum(TRAINING_STEP_IDS),
});

export const recordStepTestInputSchema = z.object({
  coldOverride: z.boolean(),
  outcome: z.enum(["success", "not_yet"]),
  stepId: z.enum(TRAINING_STEP_IDS),
  testId: z.string().uuid(),
});

export type CorrectPracticeAttemptInput = z.infer<typeof correctPracticeAttemptInputSchema>;
export type RecordPracticeAttemptInput = z.infer<typeof recordPracticeAttemptInputSchema>;
export type RecordPracticeTotalsInput = z.infer<typeof recordPracticeTotalsInputSchema>;
export type CorrectPracticeTotalsInput = z.infer<typeof correctPracticeTotalsInputSchema>;
export type SavePracticeStepDecisionInput = z.infer<typeof savePracticeStepDecisionInputSchema>;
export type RecordStepTestInput = z.infer<typeof recordStepTestInputSchema>;
