import {
  CURRICULUM_SECTIONS,
  type CurriculumSyllabus,
  type InlineNode,
  type LevelSectionSlug,
  type SyllabusPageEntry,
  type SyllabusSection,
} from "@/shared/curriculum-data";

import { getCurriculumPageInputSchema } from "../api/curriculum-schema";

const LEVEL_SECTION_SLUGS: ReadonlySet<string> = new Set(
  CURRICULUM_SECTIONS.filter((section) => section.levelNumber !== undefined).map(
    (section) => section.sectionSlug,
  ),
);

const NOT_FOUND_INDEX = -1;
const PERCENT_SCALE = 100;
const STEP_PREFIX_PATTERN = /^Step\s+\d+:\s*/u;

export interface LevelRouteParams {
  page: string;
  section: LevelSectionSlug;
}

export interface ParsedLevelRouteTarget extends LevelRouteParams {
  pageSlug: string;
}

export interface StepProgressSummary {
  completedCount: number;
  percent: number;
  totalCount: number;
}

export interface LevelAdjacentPages {
  nextPage: SyllabusPageEntry | null;
  previousPage: SyllabusPageEntry | null;
}

export function isLevelSectionSlug(value: string): value is LevelSectionSlug {
  return LEVEL_SECTION_SLUGS.has(value);
}

export function parseLevelRouteParams(
  section: string,
  page: string,
): ParsedLevelRouteTarget | null {
  if (!isLevelSectionSlug(section)) {
    return null;
  }

  const parsed = getCurriculumPageInputSchema.safeParse({
    pageSlug: `${section}/${page}`,
  });

  if (!parsed.success) {
    return null;
  }

  return {
    page,
    pageSlug: parsed.data.pageSlug,
    section,
  };
}

export function toLevelRouteParams(pageSlug: string): LevelRouteParams | null {
  const slashIndex = pageSlug.indexOf("/");
  if (slashIndex <= 0 || pageSlug.indexOf("/", slashIndex + 1) !== NOT_FOUND_INDEX) {
    return null;
  }

  const section = pageSlug.slice(0, slashIndex);
  const page = pageSlug.slice(slashIndex + 1);
  const parsed = parseLevelRouteParams(section, page);

  if (parsed === null) {
    return null;
  }

  return {
    page: parsed.page,
    section: parsed.section,
  };
}

export function getLevelSections(syllabus: CurriculumSyllabus): SyllabusSection[] {
  return syllabus.sections.filter((section) => isLevelSectionSlug(section.sectionSlug));
}

export function formatStepSummary(heading: string): string {
  return heading.replace(STEP_PREFIX_PATTERN, "").trim();
}

export function stripStepPrefixFromNodes(nodes: readonly InlineNode[]): readonly InlineNode[] {
  const [first, ...rest] = nodes;
  if (first?.type !== "text") {
    return nodes;
  }

  const strippedText = first.text.replace(STEP_PREFIX_PATTERN, "");
  if (strippedText === first.text) {
    return nodes;
  }

  return strippedText.length > 0 ? [{ ...first, text: strippedText }, ...rest] : rest;
}

export function getBehaviorProgress(
  stepIds: readonly string[],
  completedStepIds: ReadonlySet<string>,
): StepProgressSummary {
  const totalCount = stepIds.length;
  let completedCount = 0;

  for (const stepId of stepIds) {
    if (completedStepIds.has(stepId)) {
      completedCount += 1;
    }
  }

  const percent = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * PERCENT_SCALE);

  return {
    completedCount,
    percent,
    totalCount,
  };
}

export function getSectionProgress(
  section: SyllabusSection,
  completedStepIds: ReadonlySet<string>,
): StepProgressSummary {
  const sectionStepIds = section.pages.flatMap((entry) => entry.stepIds ?? []);
  return getBehaviorProgress(sectionStepIds, completedStepIds);
}

export function getLevelAdjacentPages(
  syllabus: CurriculumSyllabus,
  pageSlug: string,
): LevelAdjacentPages {
  const levelPages = getLevelSections(syllabus).flatMap((section) => section.pages);
  const currentIndex = levelPages.findIndex((entry) => entry.pageSlug === pageSlug);

  if (currentIndex === NOT_FOUND_INDEX) {
    return {
      nextPage: null,
      previousPage: null,
    };
  }

  const previousPage = levelPages.find((_entry, index) => index === currentIndex - 1) ?? null;
  const nextPage = levelPages.find((_entry, index) => index === currentIndex + 1) ?? null;

  return {
    nextPage,
    previousPage,
  };
}

export function getSectionFirstPage(section: SyllabusSection): SyllabusPageEntry | null {
  return section.pages[0] ?? null;
}

export function getSectionFirstBehavior(section: SyllabusSection): SyllabusPageEntry | null {
  return section.pages.find((entry) => entry.kind === "behavior") ?? null;
}
