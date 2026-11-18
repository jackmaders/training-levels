import { queryOptions } from "@tanstack/react-query";

import { getPageGeneralizationInputSchema } from "./generalization-schema";
import type { PageGeneralizationState } from "./generalization-service";
import { getPageGeneralizationFn } from "./generalization.functions";

const EMPTY_PAGE_GENERALIZATION: PageGeneralizationState = {
  comeafters: {},
  homeworkReflection: null,
  latestStepTests: {},
};

const generalizationKeys = {
  all: ["curriculum", "generalization"] as const,
  page: (pageSlug: string) => [...generalizationKeys.all, pageSlug] as const,
};

function normalizeGeneralizationPageSlug(pageSlug: string): string {
  const parsed = getPageGeneralizationInputSchema.safeParse({ pageSlug });
  return parsed.success ? parsed.data.pageSlug : pageSlug.trim();
}

function pageGeneralizationQueryOptions(pageSlug: string) {
  const normalizedPageSlug = normalizeGeneralizationPageSlug(pageSlug);

  return queryOptions({
    queryFn: async () => await getPageGeneralizationFn({ data: { pageSlug: normalizedPageSlug } }),
    queryKey: generalizationKeys.page(normalizedPageSlug),
  });
}

export { EMPTY_PAGE_GENERALIZATION, generalizationKeys, pageGeneralizationQueryOptions };
