import { createFileRoute } from "@tanstack/react-router";

import { TheoryAppendicesPage } from "@/pages/theory-hub";

const Route = createFileRoute("/_authenticated/theory/appendices")({
  component: TheoryAppendicesRoute,
});

function TheoryAppendicesRoute() {
  return <TheoryAppendicesPage />;
}

export { Route };
