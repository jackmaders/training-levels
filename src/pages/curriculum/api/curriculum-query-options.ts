import { queryOptions, type QueryClient } from "@tanstack/react-query";
import { notFound } from "@tanstack/react-router";

import type { CurriculumPage, ProseCurriculumPage, SectionSlug } from "@/shared/curriculum-data";

import { getCurriculumPageInputSchema } from "./curriculum-schema";
import {
  getCurriculumPageFn,
  getCurriculumSyllabusFn,
  getStepProgressFn,
} from "./curriculum.functions";

type ArticleSectionSlug = Extract<SectionSlug, "theory" | "appendices">;

interface LoadCurriculumArticleOptions {
  page: string;
  queryClient: QueryClient;
  sectionSlug: ArticleSectionSlug;
}

const curriculumKeys = {
  all: ["curriculum"] as const,
  page: (pageSlug: string) => [...curriculumKeys.all, "page", pageSlug] as const,
  stepProgress: () => [...curriculumKeys.all, "step-progress"] as const,
  syllabus: () => [...curriculumKeys.all, "syllabus"] as const,
};

function normalizeCurriculumPageSlug(pageSlug: string): string {
  const parsed = getCurriculumPageInputSchema.safeParse({ pageSlug });
  return parsed.success ? parsed.data.pageSlug : pageSlug.trim();
}

function curriculumSyllabusQueryOptions() {
  return queryOptions({
    queryFn: async () => await getCurriculumSyllabusFn(),
    queryKey: curriculumKeys.syllabus(),
    staleTime: Infinity,
  });
}

function curriculumPageQueryOptions(pageSlug: string) {
  const normalizedPageSlug = normalizeCurriculumPageSlug(pageSlug);

  return queryOptions({
    queryFn: async () => await getCurriculumPageFn({ data: { pageSlug: normalizedPageSlug } }),
    queryKey: curriculumKeys.page(normalizedPageSlug),
    staleTime: Infinity,
  });
}

function stepProgressQueryOptions() {
  return queryOptions({
    queryFn: async () => await getStepProgressFn(),
    queryKey: curriculumKeys.stepProgress(),
  });
}

async function loadCurriculumArticle({
  page,
  queryClient,
  sectionSlug,
}: LoadCurriculumArticleOptions): Promise<ProseCurriculumPage> {
  const pageSlug = buildCurriculumArticleSlug(sectionSlug, page);
  if (pageSlug === null) {
    throw createNotFoundError();
  }

  const curriculumPage = await queryClient.query(curriculumPageQueryOptions(pageSlug));
  if (!isMatchingProseArticle(curriculumPage, sectionSlug)) {
    throw createNotFoundError();
  }

  return curriculumPage;
}

function buildCurriculumArticleSlug(sectionSlug: ArticleSectionSlug, page: string): string | null {
  const parsed = getCurriculumPageInputSchema.safeParse({
    pageSlug: `${sectionSlug}/${page}`,
  });

  if (!parsed.success) {
    return null;
  }

  return parsed.data.pageSlug;
}

function isMatchingProseArticle(
  curriculumPage: CurriculumPage | null,
  sectionSlug: SectionSlug,
): curriculumPage is ProseCurriculumPage {
  return (
    curriculumPage !== null &&
    curriculumPage.kind !== "behavior" &&
    curriculumPage.sectionSlug === sectionSlug
  );
}

function createNotFoundError(): Error {
  return Object.assign(new Error("Not Found"), notFound());
}

export type { ArticleSectionSlug, LoadCurriculumArticleOptions };
export {
  curriculumKeys,
  curriculumPageQueryOptions,
  curriculumSyllabusQueryOptions,
  isMatchingProseArticle,
  loadCurriculumArticle,
  normalizeCurriculumPageSlug,
  stepProgressQueryOptions,
};
