import { createFileRoute, notFound } from "@tanstack/react-router";

import {
  CurriculumLevelPage,
  curriculumPageQueryOptions,
  curriculumSyllabusQueryOptions,
  parseLevelRouteParams,
  stepProgressQueryOptions,
} from "@/pages/curriculum";
import { NotFoundPage } from "@/pages/not-found";

const Route = createFileRoute("/_authenticated/levels/$section/$page")({
  loader: async ({ context, params }) => {
    const target = parseLevelRouteParams(params.section, params.page);
    if (target === null) {
      throw Object.assign(new Error("Not Found"), notFound());
    }

    const [, page] = await Promise.all([
      context.queryClient.query(curriculumSyllabusQueryOptions()),
      context.queryClient.query(curriculumPageQueryOptions(target.pageSlug)),
      context.queryClient.query(stepProgressQueryOptions()),
    ]);

    if (page === null) {
      throw Object.assign(new Error("Not Found"), notFound());
    }
  },
  headers: () => ({ "Cache-Control": "private, no-store" }),
  notFoundComponent: NotFoundPage,
  component: CurriculumLevelPage,
});

export { Route };
