import { createFileRoute } from "@tanstack/react-router";

import { CurriculumSectionIndexPage, curriculumSyllabusQueryOptions } from "@/pages/curriculum";

const Route = createFileRoute("/_authenticated/appendices/")({
  loader: async ({ context }) => {
    await context.queryClient.query(curriculumSyllabusQueryOptions());
  },
  headers: () => ({ "Cache-Control": "private, no-store" }),
  component: AppendicesIndexRoute,
});

function AppendicesIndexRoute() {
  return <CurriculumSectionIndexPage sectionSlug="appendices" />;
}

export { Route };
