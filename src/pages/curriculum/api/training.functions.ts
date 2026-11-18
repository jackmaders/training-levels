import { createServerFn } from "@tanstack/react-start";

import { permissionMiddleware } from "@/shared/auth";

import {
  correctPracticeTotals,
  getPracticeStepDecision,
  getPracticeTotals,
  recordPracticeTotals,
  savePracticeStepDecision,
} from "./practice-progress-service";
import { getStepTestHistory, recordStepTest } from "./step-test-service";
import {
  correctPracticeAttemptInputSchema,
  correctPracticeTotalsInputSchema,
  practiceHistoryInputSchema,
  recordStepTestInputSchema,
  savePracticeStepDecisionInputSchema,
  recordPracticeAttemptInputSchema,
  recordPracticeTotalsInputSchema,
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

export const getPracticeTotalsFn = createServerFn({ method: "GET" })
  .middleware([permissionMiddleware("curriculum:read")])
  .validator(practiceHistoryInputSchema)
  .handler(
    async ({ context, data }) => await getPracticeTotals(data.stepId, { userId: context.user.id }),
  );

export const recordPracticeTotalsFn = createServerFn({ method: "POST" })
  .middleware([permissionMiddleware("progress:update")])
  .validator(recordPracticeTotalsInputSchema)
  .handler(
    async ({ context, data }) => await recordPracticeTotals(data, { userId: context.user.id }),
  );

export const correctPracticeTotalsFn = createServerFn({ method: "POST" })
  .middleware([permissionMiddleware("progress:update")])
  .validator(correctPracticeTotalsInputSchema)
  .handler(
    async ({ context, data }) => await correctPracticeTotals(data, { userId: context.user.id }),
  );

export const getPracticeStepDecisionFn = createServerFn({ method: "GET" })
  .middleware([permissionMiddleware("curriculum:read")])
  .validator(practiceHistoryInputSchema)
  .handler(
    async ({ context, data }) =>
      await getPracticeStepDecision(data.stepId, { userId: context.user.id }),
  );

export const savePracticeStepDecisionFn = createServerFn({ method: "POST" })
  .middleware([permissionMiddleware("progress:update")])
  .validator(savePracticeStepDecisionInputSchema)
  .handler(
    async ({ context, data }) => await savePracticeStepDecision(data, { userId: context.user.id }),
  );

export const getStepTestHistoryFn = createServerFn({ method: "GET" })
  .middleware([permissionMiddleware("curriculum:read")])
  .validator(practiceHistoryInputSchema)
  .handler(
    async ({ context, data }) => await getStepTestHistory(data.stepId, { userId: context.user.id }),
  );

export const recordStepTestFn = createServerFn({ method: "POST" })
  .middleware([permissionMiddleware("progress:update")])
  .validator(recordStepTestInputSchema)
  .handler(async ({ context, data }) => await recordStepTest(data, { userId: context.user.id }));
