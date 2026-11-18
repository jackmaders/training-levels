import { z } from "zod";

const COMEAFTER_STATUSES = ["not_started", "practicing", "completed"] as const;
const MAX_COMEAFTER_NOTE_LENGTH = 2000;
const MAX_HOMEWORK_REFLECTION_LENGTH = 4000;
const MAX_PAGE_SLUG_LENGTH = 128;
const MAX_STEP_ID_LENGTH = 160;
const PAGE_SLUG_PATTERN = /^(?:theory|level-[1-4]|appendices)\/[a-zA-Z0-9_-]+$/u;
const HOMEWORK_PAGE_SLUG_PATTERN = /^level-[1-4]\/homework$/u;

const getPageGeneralizationInputSchema = z.object({
  pageSlug: z
    .string()
    .trim()
    .min(1, "Page slug is required")
    .max(MAX_PAGE_SLUG_LENGTH, "Page slug is too long")
    .regex(PAGE_SLUG_PATTERN, "Invalid curriculum page slug"),
});

const saveComeafterInputSchema = z.object({
  note: z.string().trim().max(MAX_COMEAFTER_NOTE_LENGTH, "Comeafter note is too long"),
  status: z.enum(COMEAFTER_STATUSES),
  stepId: z
    .string()
    .trim()
    .min(1, "Step ID is required")
    .max(MAX_STEP_ID_LENGTH, "Step ID is too long"),
});

const saveHomeworkInputSchema = z.object({
  pageSlug: z
    .string()
    .trim()
    .min(1, "Page slug is required")
    .max(MAX_PAGE_SLUG_LENGTH, "Page slug is too long")
    .regex(HOMEWORK_PAGE_SLUG_PATTERN, "Invalid homework page slug"),
  reflection: z
    .string()
    .trim()
    .min(1, "Reflection is required")
    .max(MAX_HOMEWORK_REFLECTION_LENGTH, "Reflection is too long"),
});

type ComeafterStatus = (typeof COMEAFTER_STATUSES)[number];
type GetPageGeneralizationInput = z.infer<typeof getPageGeneralizationInputSchema>;
type SaveComeafterInput = z.infer<typeof saveComeafterInputSchema>;
type SaveHomeworkInput = z.infer<typeof saveHomeworkInputSchema>;

export {
  COMEAFTER_STATUSES,
  MAX_COMEAFTER_NOTE_LENGTH,
  MAX_HOMEWORK_REFLECTION_LENGTH,
  getPageGeneralizationInputSchema,
  saveComeafterInputSchema,
  saveHomeworkInputSchema,
  type ComeafterStatus,
  type GetPageGeneralizationInput,
  type SaveComeafterInput,
  type SaveHomeworkInput,
};
