import { z } from "zod";

import { PRACTICE_STEP_OPTIONS } from "../model/practice-ladders";

const TARGET_MAX_LENGTH = 256;
const TRAINING_STEP_IDS: readonly [string, ...string[]] = [
  ...PRACTICE_STEP_OPTIONS.map((step) => step.stepId),
  "level-3/retrieve:step-1",
  "level-3/retrieve:step-2",
];
const TOTAL_COUNT_MAX = 10_000;

export const practiceHistoryInputSchema = z.object({
  stepId: z.string().trim().min(1),
});

export const recordPracticeAttemptInputSchema = z.object({
  attemptId: z.string().uuid(),
  outcome: z.enum(["success", "not_yet"]),
  stepId: z.string().trim().min(1),
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
  testId: z.uuid(),
});

export type CorrectPracticeAttemptInput = z.infer<typeof correctPracticeAttemptInputSchema>;
export type RecordPracticeAttemptInput = z.infer<typeof recordPracticeAttemptInputSchema>;
export type RecordPracticeTotalsInput = z.infer<typeof recordPracticeTotalsInputSchema>;
export type CorrectPracticeTotalsInput = z.infer<typeof correctPracticeTotalsInputSchema>;
export type SavePracticeStepDecisionInput = z.infer<typeof savePracticeStepDecisionInputSchema>;
export type RecordStepTestInput = z.infer<typeof recordStepTestInputSchema>;
