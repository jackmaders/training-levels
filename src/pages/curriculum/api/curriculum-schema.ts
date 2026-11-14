import { z } from "zod";

const MAX_PAGE_SLUG_LENGTH = 128;
const MAX_STEP_ID_LENGTH = 160;
const PAGE_SLUG_PATTERN = /^(?:theory|level-[1-4]|appendices)\/[a-zA-Z0-9_-]+$/u;

export const getCurriculumPageInputSchema = z.object({
  pageSlug: z
    .string()
    .trim()
    .min(1, "Page slug is required")
    .max(MAX_PAGE_SLUG_LENGTH, "Page slug is too long")
    .regex(PAGE_SLUG_PATTERN, "Invalid curriculum page slug"),
});

export const toggleStepInputSchema = z.object({
  completed: z.boolean(),
  stepId: z
    .string()
    .trim()
    .min(1, "Step ID is required")
    .max(MAX_STEP_ID_LENGTH, "Step ID is too long"),
});

export type GetCurriculumPageInput = z.infer<typeof getCurriculumPageInputSchema>;
export type ToggleStepInput = z.infer<typeof toggleStepInputSchema>;
