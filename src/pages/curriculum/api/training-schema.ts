import { z } from "zod";

const TARGET_MAX_LENGTH = 256;

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

export type CorrectPracticeAttemptInput = z.infer<typeof correctPracticeAttemptInputSchema>;
export type RecordPracticeAttemptInput = z.infer<typeof recordPracticeAttemptInputSchema>;
