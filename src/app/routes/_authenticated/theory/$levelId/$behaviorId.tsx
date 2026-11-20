import { createFileRoute } from "@tanstack/react-router";

import { TheoryBehaviorPage } from "@/pages/theory-hub";

const Route = createFileRoute("/_authenticated/theory/$levelId/$behaviorId")({
  component: TheoryBehaviorRoute,
});

function TheoryBehaviorRoute() {
  const { levelId, behaviorId } = Route.useParams();
  return <TheoryBehaviorPage behaviorId={behaviorId} levelId={levelId} />;
}

export { Route };
