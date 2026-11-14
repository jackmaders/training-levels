import { createFileRoute, notFound, redirect } from "@tanstack/react-router";

import {
  curriculumSyllabusQueryOptions,
  getLevelSections,
  getSectionFirstBehavior,
  toLevelRouteParams,
} from "@/pages/curriculum";
import { NotFoundPage } from "@/pages/not-found";

const Route = createFileRoute("/_authenticated/levels/")({
  loader: async ({ context }) => {
    const syllabus = await context.queryClient.query(curriculumSyllabusQueryOptions());
    const levelOne = getLevelSections(syllabus).find(
      (section) => section.sectionSlug === "level-1",
    );
    const firstBehavior = levelOne === undefined ? null : getSectionFirstBehavior(levelOne);
    const params = firstBehavior === null ? null : toLevelRouteParams(firstBehavior.pageSlug);

    if (params === null) {
      throw Object.assign(new Error("Not Found"), notFound());
    }

    throw redirect({
      params,
      to: "/levels/$section/$page",
    });
  },
  headers: () => ({ "Cache-Control": "private, no-store" }),
  notFoundComponent: NotFoundPage,
});

export { Route };
