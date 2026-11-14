import { createFileRoute } from "@tanstack/react-router";

import { CurriculumArticlePage, loadCurriculumArticle } from "@/pages/curriculum";
import { NotFoundPage } from "@/pages/not-found";

const Route = createFileRoute("/_authenticated/appendices/$page")({
  loader: async ({ context, params }) => {
    await loadCurriculumArticle({
      page: params.page,
      queryClient: context.queryClient,
      sectionSlug: "appendices",
    });
  },
  headers: () => ({ "Cache-Control": "private, no-store" }),
  component: AppendicesPageRoute,
  notFoundComponent: NotFoundPage,
});

function AppendicesPageRoute() {
  const { page } = Route.useParams();
  return <CurriculumArticlePage page={page} sectionSlug="appendices" />;
}

export { Route };
