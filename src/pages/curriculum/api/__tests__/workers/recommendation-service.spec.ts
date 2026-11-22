import { env } from "cloudflare:workers";
import { eq } from "drizzle-orm";
import { describe, expect, it } from "vite-plus/test";

import {
  dogs,
  practiceAttempts,
  practiceStepDecisions,
  practiceTotals,
  stepCompletions,
  stepTests,
} from "@/shared/db";
import { getDb, type Database } from "@/shared/db/index.server";
import { user } from "@/shared/db/schema";

import {
  getTrainingOverview,
  type TrainingOverviewAttempt,
  type TrainingOverviewCompletion,
  type TrainingOverviewDecision,
  type TrainingOverviewStepTest,
  type TrainingOverviewTotal,
} from "../../recommendation-service";

const T1 = new Date("2026-01-01T00:00:00.000Z");
const T2 = new Date("2026-01-02T00:00:00.000Z");
const T3 = new Date("2026-01-03T00:00:00.000Z");

const PRIMARY_COMPLETIONS: TrainingOverviewCompletion[] = [
  { completedAt: T1, stepId: "level-1/zen:step-1" },
  { completedAt: T2, stepId: "level-2/wait:step-1" },
];

const PRIMARY_ATTEMPTS: TrainingOverviewAttempt[] = [
  {
    attemptId: "attempt-1",
    createdAt: T1,
    outcome: "success",
    stepId: "level-1/zen:step-2",
    target: "Target A",
    undoneAt: null,
  },
  {
    attemptId: "attempt-2",
    createdAt: T2,
    outcome: "not_yet",
    stepId: "level-2/wait:step-2",
    target: "Target B",
    undoneAt: T3,
  },
];

const PRIMARY_TOTALS: TrainingOverviewTotal[] = [
  {
    createdAt: T1,
    notYetCount: 1,
    recordId: "total-1",
    stepId: "level-1/zen:step-2",
    successCount: 3,
    target: "Target A",
  },
  {
    createdAt: T2,
    notYetCount: 2,
    recordId: "total-2",
    stepId: "level-2/wait:step-2",
    successCount: 4,
    target: "Target B",
  },
];

const PRIMARY_DECISIONS: TrainingOverviewDecision[] = [
  { decidedAt: T1, decision: "recommend_test", stepId: "level-1/zen:step-2" },
  { decidedAt: T2, decision: "keep_practicing", stepId: "level-2/wait:step-2" },
];

const PRIMARY_TESTS: TrainingOverviewStepTest[] = [
  {
    coldOverride: false,
    outcome: "not_yet",
    stepId: "level-1/zen:step-2",
    testId: "test-1",
    testedAt: T1,
  },
  {
    coldOverride: true,
    outcome: "success",
    stepId: "level-2/wait:step-2",
    testId: "test-2",
    testedAt: T2,
  },
];

async function seedUsersAndDogs(db: Database): Promise<void> {
  await db.insert(user).values([
    { email: "primary@example.com", id: "user-primary", name: "Primary Owner" },
    { email: "other@example.com", id: "user-other", name: "Other Owner" },
  ]);
  await db.insert(dogs).values([
    {
      createdAt: T1,
      id: "dog-primary",
      name: "Primary Dog",
      updatedAt: T1,
      userId: "user-primary",
    },
    {
      createdAt: T2,
      id: "dog-secondary",
      name: "Secondary Dog",
      updatedAt: T2,
      userId: "user-primary",
    },
    { createdAt: T1, id: "dog-other", name: "Other Dog", updatedAt: T1, userId: "user-other" },
  ]);
}

async function seedPrimaryDogData(db: Database): Promise<void> {
  await db.insert(stepCompletions).values(
    PRIMARY_COMPLETIONS.map((row, index) => ({
      ...row,
      dogId: "dog-primary",
      id: `comp-${index + 1}`,
    })),
  );
  await db
    .insert(practiceAttempts)
    .values(PRIMARY_ATTEMPTS.map((row) => ({ ...row, dogId: "dog-primary" })));
  await db
    .insert(practiceTotals)
    .values(PRIMARY_TOTALS.map((row) => ({ ...row, dogId: "dog-primary" })));
  await db
    .insert(practiceStepDecisions)
    .values(PRIMARY_DECISIONS.map((row) => ({ ...row, dogId: "dog-primary" })));
  await db.insert(stepTests).values(PRIMARY_TESTS.map((row) => ({ ...row, dogId: "dog-primary" })));
}

async function seedIgnoredDogProgress(db: Database, dogId: string, suffix: string): Promise<void> {
  await db.insert(stepCompletions).values({
    completedAt: T3,
    dogId,
    id: `comp-${suffix}`,
    stepId: "level-3/recall:step-1",
  });
  await db.insert(practiceAttempts).values({
    attemptId: `attempt-${suffix}`,
    createdAt: T3,
    dogId,
    outcome: "success",
    stepId: "level-3/recall:step-2",
    target: "Ignored Target",
    undoneAt: null,
  });
  await db.insert(practiceTotals).values({
    createdAt: T3,
    dogId,
    notYetCount: 0,
    recordId: `total-${suffix}`,
    stepId: "level-3/recall:step-2",
    successCount: 5,
    target: "Ignored Target",
  });
  await db.insert(practiceStepDecisions).values({
    decidedAt: T3,
    decision: "recommend_test",
    dogId,
    stepId: "level-3/recall:step-2",
  });
  await db.insert(stepTests).values({
    coldOverride: false,
    dogId,
    outcome: "success",
    stepId: "level-3/recall:step-2",
    testId: `test-${suffix}`,
    testedAt: T3,
  });
}

describe("recommendation-service (workers D1)", () => {
  it("returns empty overview with zero DB writes when the user has no dog", async () => {
    expect.assertions(2);

    const db = getDb(env.DB);
    await db.insert(user).values({ email: "nodog@example.com", id: "user-nodog", name: "No Dog" });

    const overview = await getTrainingOverview({ userId: "user-nodog" });
    const dogRows = await db.select().from(dogs).where(eq(dogs.userId, "user-nodog"));

    expect(overview).toStrictEqual({
      activeDog: null,
      curriculumProgress: [],
      practiceAttempts: [],
      practiceTotals: [],
      stepDecisions: [],
      stepTests: [],
    });
    expect(dogRows).toHaveLength(0);
  });

  it("returns dog-wide training data scoped strictly to the user primary dog", async () => {
    expect.assertions(5);

    const db = getDb(env.DB);
    await seedUsersAndDogs(db);
    await seedPrimaryDogData(db);
    await seedIgnoredDogProgress(db, "dog-secondary", "secondary");
    await seedIgnoredDogProgress(db, "dog-other", "other");

    const overview = await getTrainingOverview({ db, userId: "user-primary" });

    expect(overview.curriculumProgress).toStrictEqual(PRIMARY_COMPLETIONS);
    expect(overview.practiceAttempts).toStrictEqual(PRIMARY_ATTEMPTS);
    expect(overview.practiceTotals).toStrictEqual(PRIMARY_TOTALS);
    expect(overview.stepDecisions).toStrictEqual(PRIMARY_DECISIONS);
    expect(overview.stepTests).toStrictEqual(PRIMARY_TESTS);
  });
});
