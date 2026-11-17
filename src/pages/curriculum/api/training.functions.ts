import { createServerFn } from "@tanstack/react-start";

import { permissionMiddleware } from "@/shared/auth";

import {
  correctPracticeAttemptInputSchema,
  practiceHistoryInputSchema,
  recordPracticeAttemptInputSchema,
  undoPracticeAttemptInputSchema,
} from "./training-schema";
import {
  correctPracticeAttempt,
  getPracticeHistory,
  recordPracticeAttempt,
  undoPracticeAttempt,
} from "./training-service";

export const getPracticeHistoryFn = createServerFn({ method: "GET" })
  .middleware([permissionMiddleware("curriculum:read")])
  .validator(practiceHistoryInputSchema)
  .handler(
    async ({ context, data }) => await getPracticeHistory(data.stepId, { userId: context.user.id }),
  );

export const recordPracticeAttemptFn = createServerFn({ method: "POST" })
  .middleware([permissionMiddleware("progress:update")])
  .validator(recordPracticeAttemptInputSchema)
  .handler(
    async ({ context, data }) => await recordPracticeAttempt(data, { userId: context.user.id }),
  );

export const correctPracticeAttemptFn = createServerFn({ method: "POST" })
  .middleware([permissionMiddleware("progress:update")])
  .validator(correctPracticeAttemptInputSchema)
  .handler(
    async ({ context, data }) => await correctPracticeAttempt(data, { userId: context.user.id }),
  );

export const undoPracticeAttemptFn = createServerFn({ method: "POST" })
  .middleware([permissionMiddleware("progress:update")])
  .validator(undoPracticeAttemptInputSchema)
  .handler(
    async ({ context, data }) =>
      await undoPracticeAttempt(data.attemptId, { userId: context.user.id }),
  );
