import { z } from "zod";

import { HEADING_LEVELS, STEP_NUMBERS } from "./curriculum.constants";
import type {
  BehaviorCurriculumPage,
  BehaviorStep,
  BehaviorStepSummary,
  BehaviorThinkAboutSection,
  BlockquoteBlock,
  CalloutBlock,
  CurriculumPage,
  CurriculumSyllabus,
  InlineNode,
  ListBlock,
  ListItem,
  ParagraphBlock,
  ProseCurriculumPage,
  SyllabusPageEntry,
  SyllabusSection,
  SyllabusStepSummary,
} from "./curriculum.types";
import rawPages from "./data/pages.json";
import rawSyllabus from "./data/syllabus.json";

const [LEVEL_ONE, LEVEL_TWO, LEVEL_THREE, LEVEL_FOUR, STEP_FIVE] = STEP_NUMBERS;
const [HEADING_TWO, HEADING_THREE, HEADING_FOUR] = HEADING_LEVELS;

const sectionSlugSchema = z.enum([
  "theory",
  "level-1",
  "level-2",
  "level-3",
  "level-4",
  "appendices",
]);
const levelSectionSlugSchema = z.enum(["level-1", "level-2", "level-3", "level-4"]);
const levelNumberSchema = z.union([
  z.literal(LEVEL_ONE),
  z.literal(LEVEL_TWO),
  z.literal(LEVEL_THREE),
  z.literal(LEVEL_FOUR),
]);
const stepNumberSchema = z.union([
  z.literal(LEVEL_ONE),
  z.literal(LEVEL_TWO),
  z.literal(LEVEL_THREE),
  z.literal(LEVEL_FOUR),
  z.literal(STEP_FIVE),
]);
const headingLevelSchema = z.union([
  z.literal(HEADING_TWO),
  z.literal(HEADING_THREE),
  z.literal(HEADING_FOUR),
]);
const pageKindSchema = z.enum(["theory", "overview", "behavior", "homework", "appendix"]);
const calloutVariantSchema = z.enum(["note", "tip", "warning"]);

const inlineNodeSchema: z.ZodType<InlineNode> = z.lazy(() => {
  const inlineChildrenSchema = z.array(inlineNodeSchema);
  return z.discriminatedUnion("type", [
    z.object({ text: z.string(), type: z.literal("text") }),
    z.object({ children: inlineChildrenSchema, type: z.literal("strong") }),
    z.object({ children: inlineChildrenSchema, type: z.literal("em") }),
    z.object({ text: z.string(), type: z.literal("code") }),
    z.object({
      children: inlineChildrenSchema,
      external: z.boolean(),
      href: z.string(),
      type: z.literal("link"),
    }),
  ]);
});

const inlineArraySchema = z.array(inlineNodeSchema);

const paragraphBlockSchema: z.ZodType<ParagraphBlock> = z.object({
  content: inlineArraySchema,
  type: z.literal("paragraph"),
});

const listItemSchema: z.ZodType<ListItem> = z.object({
  checked: z.boolean().exactOptional(),
  children: z.lazy(() => z.array(listBlockSchema)).exactOptional(),
  content: inlineArraySchema,
});

const listBlockSchema: z.ZodType<ListBlock> = z.object({
  items: z.array(listItemSchema),
  ordered: z.boolean(),
  style: z.enum(["decimal", "lower-roman"]).exactOptional(),
  type: z.literal("list"),
});

const innerBlockSchema = z.union([paragraphBlockSchema, listBlockSchema]);
const innerBlockArraySchema = z.array(innerBlockSchema);

const blockquoteBlockSchema: z.ZodType<BlockquoteBlock> = z.object({
  blocks: innerBlockArraySchema,
  type: z.literal("blockquote"),
});

const calloutBlockSchema: z.ZodType<CalloutBlock> = z.object({
  blocks: innerBlockArraySchema,
  title: inlineArraySchema.exactOptional(),
  type: z.literal("callout"),
  variant: calloutVariantSchema,
});

const contentBlockSchema = z.union([
  paragraphBlockSchema,
  listBlockSchema,
  blockquoteBlockSchema,
  calloutBlockSchema,
]);
const contentBlockArraySchema = z.array(contentBlockSchema);

const headingBlockSchema = z.object({
  id: z.string(),
  level: headingLevelSchema,
  text: z.string(),
  type: z.literal("heading"),
});

const proseBlockSchema = z.union([
  paragraphBlockSchema,
  listBlockSchema,
  blockquoteBlockSchema,
  calloutBlockSchema,
  headingBlockSchema,
]);

const pageNavigationRefSchema = z.object({
  href: z.string(),
  kind: pageKindSchema,
  pageSlug: z.string(),
  sectionSlug: sectionSlugSchema,
  title: z.string(),
});

const syllabusStepSummarySchema: z.ZodType<SyllabusStepSummary> = z.object({
  label: z.string(),
  stepId: z.string(),
  stepNumber: stepNumberSchema,
});

const syllabusPageEntrySchema: z.ZodType<SyllabusPageEntry> = z.object({
  behaviorFamily: z.string().exactOptional(),
  href: z.string(),
  kind: pageKindSchema,
  levelNumber: levelNumberSchema.exactOptional(),
  order: z.number(),
  pageSlug: z.string(),
  sectionSlug: sectionSlugSchema,
  stepIds: z.array(z.string()).exactOptional(),
  stepSummaries: z.array(syllabusStepSummarySchema).exactOptional(),
  title: z.string(),
});

const syllabusSectionSchema: z.ZodType<SyllabusSection> = z.object({
  href: z.string(),
  levelNumber: levelNumberSchema.exactOptional(),
  pages: z.array(syllabusPageEntrySchema),
  sectionSlug: sectionSlugSchema,
  title: z.string(),
});

const syllabusSchema: z.ZodType<CurriculumSyllabus> = z.object({
  sections: z.array(syllabusSectionSchema),
  totalBehaviors: z.number(),
  totalPages: z.number(),
  totalSteps: z.number(),
});

const prosePageSchema: z.ZodType<ProseCurriculumPage> = z.object({
  blocks: z.array(proseBlockSchema),
  href: z.string(),
  kind: z.enum(["theory", "overview", "homework", "appendix"]),
  levelNumber: levelNumberSchema.exactOptional(),
  nextPage: pageNavigationRefSchema.nullable(),
  pageSlug: z.string(),
  previousPage: pageNavigationRefSchema.nullable(),
  sectionSlug: sectionSlugSchema,
  title: z.string(),
});

const behaviorStepSchema: z.ZodType<BehaviorStep> = z.object({
  anchor: z.string(),
  comeafters: contentBlockArraySchema.nullable(),
  heading: z.string(),
  instructions: contentBlockArraySchema,
  stepId: z.string(),
  stepNumber: stepNumberSchema,
  tryItCold: contentBlockArraySchema.nullable(),
});

const behaviorThinkAboutSchema: z.ZodType<BehaviorThinkAboutSection> = z.object({
  blocks: contentBlockArraySchema,
  heading: z.string(),
  id: z.string(),
});

const behaviorStepSummarySchema: z.ZodType<BehaviorStepSummary> = z.object({
  anchor: z.string(),
  content: inlineArraySchema,
  stepId: z.string(),
  stepNumber: stepNumberSchema,
});

const whereWeAreGoingSchema = z.object({
  extraBlocks: contentBlockArraySchema,
  steps: z.array(behaviorStepSummarySchema),
});

const behaviorPageSchema: z.ZodType<BehaviorCurriculumPage> = z.object({
  aboutTheCues: contentBlockArraySchema.nullable(),
  behaviorFamily: z.string(),
  comebefores: contentBlockArraySchema,
  equipment: contentBlockArraySchema,
  href: z.string(),
  introBlocks: contentBlockArraySchema,
  kind: z.literal("behavior"),
  levelNumber: levelNumberSchema,
  nextPage: pageNavigationRefSchema.nullable(),
  pageSlug: z.string(),
  previousPage: pageNavigationRefSchema.nullable(),
  sectionSlug: levelSectionSlugSchema,
  steps: z.array(behaviorStepSchema),
  stepsIntroBlocks: contentBlockArraySchema,
  thinkAbout: z.array(behaviorThinkAboutSchema),
  title: z.string(),
  whereWeAreGoing: whereWeAreGoingSchema,
});

const pagesRecordSchema: z.ZodType<Record<string, CurriculumPage>> = z.record(
  z.string(),
  z.union([prosePageSchema, behaviorPageSchema]),
);

const curriculumSyllabus: CurriculumSyllabus = syllabusSchema.parse(rawSyllabus);
const pagesBySlug = new Map<string, CurriculumPage>(
  Object.entries(pagesRecordSchema.parse(rawPages)),
);

const validStepIds: ReadonlySet<string> = new Set(
  curriculumSyllabus.sections.flatMap((section) =>
    section.pages.flatMap((page) => page.stepIds ?? []),
  ),
);

export function getCurriculumSyllabus(): CurriculumSyllabus {
  return curriculumSyllabus;
}

export function getCurriculumPage(pageSlug: string): CurriculumPage | null {
  return pagesBySlug.get(pageSlug) ?? null;
}

export function isValidPageSlug(pageSlug: string): boolean {
  return pagesBySlug.has(pageSlug);
}

export function isValidStepId(stepId: string): boolean {
  return validStepIds.has(stepId);
}
