import { createFileRoute } from "@tanstack/react-router";

import { TheoryFoundationsPage } from "@/pages/theory-hub";

const Route = createFileRoute("/_authenticated/theory/foundations")({
  component: TheoryFoundationsRoute,
});

function TheoryFoundationsRoute() {
  return <TheoryFoundationsPage />;
}

export { Route };
