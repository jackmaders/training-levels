import { createFileRoute } from "@tanstack/react-router";

import { CurriculumSectionIndexPage, curriculumSyllabusQueryOptions } from "@/pages/curriculum";

const Route = createFileRoute("/_authenticated/theory/")({
  loader: async ({ context }) => {
    await context.queryClient.query(curriculumSyllabusQueryOptions());
  },
  headers: () => ({ "Cache-Control": "private, no-store" }),
  component: TheoryIndexRoute,
});

function TheoryIndexRoute() {
  return <CurriculumSectionIndexPage sectionSlug="theory" />;
}

export { Route };
