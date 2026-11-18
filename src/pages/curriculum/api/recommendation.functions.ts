import { createServerFn } from "@tanstack/react-start";

import { permissionMiddleware } from "@/shared/auth";

import { getTrainingOverview } from "./recommendation-service";

export const getTrainingOverviewFn = createServerFn({ method: "GET" })
  .middleware([permissionMiddleware("curriculum:read")])
  .handler(async ({ context }) => await getTrainingOverview({ userId: context.user.id }));
