import { createFileRoute } from "@tanstack/react-router";

import { CurriculumArticlePage, loadCurriculumArticle } from "@/pages/curriculum";
import { NotFoundPage } from "@/pages/not-found";

const Route = createFileRoute("/_authenticated/theory/$page")({
  loader: async ({ context, params }) => {
    await loadCurriculumArticle({
      page: params.page,
      queryClient: context.queryClient,
      sectionSlug: "theory",
    });
  },
  headers: () => ({ "Cache-Control": "private, no-store" }),
  component: TheoryPageRoute,
  notFoundComponent: NotFoundPage,
});

function TheoryPageRoute() {
  const { page } = Route.useParams();
  return <CurriculumArticlePage page={page} sectionSlug="theory" />;
}

export { Route };
