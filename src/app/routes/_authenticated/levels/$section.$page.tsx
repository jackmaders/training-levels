import { createFileRoute } from "@tanstack/react-router";

import { CurriculumLevelPage, loadLevelPage } from "@/pages/curriculum";
import { NotFoundPage } from "@/pages/not-found";

const Route = createFileRoute("/_authenticated/levels/$section/$page")({
  loader: async ({ context, params }) => {
    await loadLevelPage({
      page: params.page,
      queryClient: context.queryClient,
      section: params.section,
    });
  },
  headers: () => ({ "Cache-Control": "private, no-store" }),
  component: CurriculumLevelRoute,
  notFoundComponent: NotFoundPage,
});

function CurriculumLevelRoute() {
  const { page, section } = Route.useParams();
  return <CurriculumLevelPage pageSlug={`${section}/${page}`} />;
}

export { Route };
