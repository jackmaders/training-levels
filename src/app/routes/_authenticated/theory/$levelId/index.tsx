import { createFileRoute } from "@tanstack/react-router";

import { TheoryLevelPage } from "@/pages/theory-hub";

const Route = createFileRoute("/_authenticated/theory/$levelId/")({
  component: TheoryLevelRoute,
});

function TheoryLevelRoute() {
  const { levelId } = Route.useParams();
  return <TheoryLevelPage levelId={levelId} />;
}

export { Route };
