import { queryOptions, type QueryClient } from "@tanstack/react-query";
import { notFound } from "@tanstack/react-router";

import type { CurriculumPage, ProseCurriculumPage, SectionSlug } from "@/shared/curriculum-data";

import { getCurriculumPageInputSchema } from "./curriculum-schema";
import { getCurriculumPageFn, getCurriculumSyllabusFn } from "./curriculum.functions";

type ArticleSectionSlug = Extract<SectionSlug, "theory" | "appendices">;

interface LoadCurriculumArticleOptions {
  page: string;
  queryClient: QueryClient;
  sectionSlug: ArticleSectionSlug;
}

const curriculumArticleKeys = {
  all: ["curriculum"] as const,
  page: (pageSlug: string) => [...curriculumArticleKeys.all, "page", pageSlug] as const,
  syllabus: () => [...curriculumArticleKeys.all, "syllabus"] as const,
};

function curriculumSyllabusQueryOptions() {
  return queryOptions({
    queryFn: async () => await getCurriculumSyllabusFn(),
    queryKey: curriculumArticleKeys.syllabus(),
  });
}

function curriculumPageQueryOptions(pageSlug: string) {
  return queryOptions({
    queryFn: async () => await getCurriculumPageFn({ data: { pageSlug } }),
    queryKey: curriculumArticleKeys.page(pageSlug),
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
  sectionSlug: ArticleSectionSlug,
): curriculumPage is ProseCurriculumPage {
  return curriculumPage?.sectionSlug === sectionSlug;
}

function createNotFoundError(): Error {
  return Object.assign(new Error("Not Found"), notFound());
}

export type { ArticleSectionSlug, LoadCurriculumArticleOptions };
export {
  curriculumArticleKeys,
  curriculumPageQueryOptions,
  curriculumSyllabusQueryOptions,
  loadCurriculumArticle,
};
