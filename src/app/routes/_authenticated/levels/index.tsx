import { createFileRoute, redirect } from "@tanstack/react-router";

import { loadFirstLevelBehaviorParams } from "@/pages/curriculum";
import { NotFoundPage } from "@/pages/not-found";

const Route = createFileRoute("/_authenticated/levels/")({
  loader: async ({ context }) => {
    const params = await loadFirstLevelBehaviorParams(context.queryClient);

    throw redirect({
      params,
      to: "/levels/$section/$page",
    });
  },
  headers: () => ({ "Cache-Control": "private, no-store" }),
  notFoundComponent: NotFoundPage,
});

export { Route };
