import type {
  CurriculumSyllabus,
  LevelSectionSlug,
  SyllabusPageEntry,
  SyllabusSection,
} from "@/shared/curriculum-data";

import { getCurriculumPageInputSchema } from "../api/curriculum-schema";

const LEVEL_SECTION_SLUGS: ReadonlySet<string> = new Set<LevelSectionSlug>([
  "level-1",
  "level-2",
  "level-3",
  "level-4",
]);

const LEVELS_PATH_PREFIX = "/levels/";
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

export interface ParsedInternalLevelHref {
  hash?: string;
  params: LevelRouteParams;
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

export function parseInternalLevelHref(href: string): ParsedInternalLevelHref | null {
  const hashIndex = href.indexOf("#");
  const pathname = hashIndex === NOT_FOUND_INDEX ? href : href.slice(0, hashIndex);
  const hash = hashIndex === NOT_FOUND_INDEX ? "" : href.slice(hashIndex + 1);

  if (!pathname.startsWith(LEVELS_PATH_PREFIX)) {
    return null;
  }

  const params = toLevelRouteParams(pathname.slice(LEVELS_PATH_PREFIX.length));
  if (params === null) {
    return null;
  }

  return hash.length > 0 ? { hash, params } : { params };
}

export function getLevelSections(syllabus: CurriculumSyllabus): SyllabusSection[] {
  return syllabus.sections.filter((section) => isLevelSectionSlug(section.sectionSlug));
}

export function formatStepSummary(heading: string): string {
  return heading.replace(STEP_PREFIX_PATTERN, "").trim();
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
