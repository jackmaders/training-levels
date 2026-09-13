import { z } from "zod";
/**
 * Callout schema for tips, warnings, notes, quotes, etc.
 */
export const CalloutTypeSchema = z.enum([
    "tip",
    "warning",
    "note",
    "quote",
    "important",
    "caution",
]);
export const CalloutSchema = z.object({
    type: CalloutTypeSchema,
    title: z.string(),
    rawType: z.string(),
    contentMarkdown: z.string(),
});
/**
 * Pages field schema (range string, single number, or array of page numbers)
 */
export const PagesSchema = z.union([
    z.string(),
    z.number(),
    z.array(z.number()),
]);
/**
 * Criteria Table Row schema
 */
export const CriteriaTableRowSchema = z.object({
    step: z.number().int().min(1).max(5),
    criteria: z.string(),
});
/**
 * Step schema
 */
export const StepDataSchema = z.object({
    id: z.string(), // e.g. "level-1-zen-step-1"
    stepNumber: z.number().int().min(1).max(5),
    title: z.string(),
    criterionSummary: z.string(),
    instructionsMarkdown: z.string(),
    tryItCold: z.string().nullable(),
    comeafters: z.string().nullable(),
    callouts: z.array(CalloutSchema),
});
/**
 * Behavior schema
 */
export const BehaviorDataSchema = z.object({
    id: z.string(), // e.g. "level-1-zen"
    level: z.number().int().min(1).max(4),
    behaviorKey: z.string(), // e.g. "zen"
    title: z.string(),
    order: z.number().int().min(1),
    pages: PagesSchema,
    comebefores: z.string().nullable(),
    equipment: z.string().nullable(),
    thinkAbout: z.string().nullable(),
    aboutCues: z.string().nullable(),
    introMarkdown: z.string(),
    criteriaTable: z.array(CriteriaTableRowSchema),
    callouts: z.array(CalloutSchema),
    steps: z.array(StepDataSchema).length(5),
});
/**
 * Level Overview schema
 */
export const LevelOverviewSchema = z.object({
    level: z.number().int().min(1).max(4),
    title: z.string(),
    pages: PagesSchema,
    contentMarkdown: z.string(),
    callouts: z.array(CalloutSchema),
});
/**
 * Homework schema
 */
export const HomeworkSchema = z.object({
    level: z.number().int().min(1).max(4),
    title: z.string(),
    pages: PagesSchema,
    contentMarkdown: z.string(),
    callouts: z.array(CalloutSchema),
});
/**
 * Level Data schema
 */
export const LevelDataSchema = z.object({
    level: z.number().int().min(1).max(4),
    title: z.string(),
    overview: LevelOverviewSchema,
    behaviors: z.array(BehaviorDataSchema),
    homework: HomeworkSchema,
});
/**
 * Foundation Item schema
 */
export const FoundationItemSchema = z.object({
    id: z.string(),
    title: z.string(),
    order: z.number().int().min(1),
    section: z.string(),
    volume: z.number().int().min(1).max(2).default(1),
    pages: PagesSchema,
    contentMarkdown: z.string(),
    callouts: z.array(CalloutSchema),
});
/**
 * Appendix Item schema
 */
export const AppendixItemSchema = z.object({
    id: z.string(),
    title: z.string(),
    order: z.number().int().min(1),
    section: z.string(),
    volume: z.number().int().min(1).max(2).default(1),
    pages: PagesSchema,
    contentMarkdown: z.string(),
    callouts: z.array(CalloutSchema),
});
/**
 * Consolidated Training Levels Dataset schema
 */
export const TrainingLevelsDataSchema = z.object({
    version: z.string(),
    generatedAt: z.string(),
    foundations: z.array(FoundationItemSchema),
    levels: z.array(LevelDataSchema).length(4),
    appendices: z.array(AppendixItemSchema),
});
