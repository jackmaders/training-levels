import { z } from "zod";

const PRACTICE_STEP_ID = "level-1/zen:step-1";
const TARGET_MAX_LENGTH = 256;

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

export type CorrectPracticeAttemptInput = z.infer<typeof correctPracticeAttemptInputSchema>;
export type RecordPracticeAttemptInput = z.infer<typeof recordPracticeAttemptInputSchema>;
