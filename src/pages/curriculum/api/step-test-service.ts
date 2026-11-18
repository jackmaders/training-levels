import { and, asc, eq, sql } from "drizzle-orm";

import { dogs, stepCompletions, stepTests } from "@/shared/db";
import { getDb, type Database, type DbContext } from "@/shared/db/index.server";
import { ApplicationError } from "@/shared/errors";

import type { RecordStepTestInput } from "./training-schema";

const DEFAULT_DOG_NAME = "My Dog";
type TrainingUserContext = DbContext & { userId: string };

async function getStepTestHistory(stepId: string, { db = getDb(), userId }: TrainingUserContext) {
  const dogId = await findPrimaryDogId(db, userId);
  if (dogId === null) {
    return [];
  }

  return await db
    .select({
      coldOverride: stepTests.coldOverride,
      outcome: stepTests.outcome,
      stepId: stepTests.stepId,
      testId: stepTests.testId,
      testedAt: stepTests.testedAt,
    })
    .from(stepTests)
    .where(and(eq(stepTests.dogId, dogId), eq(stepTests.stepId, stepId)))
    .orderBy(asc(stepTests.testedAt), asc(stepTests.testId));
}

async function recordStepTest(
  input: RecordStepTestInput,
  { db = getDb(), userId }: TrainingUserContext,
) {
  if (input.stepId !== "level-1/zen:step-1") {
    throw new ApplicationError("CURRICULUM_STEP_NOT_FOUND", { details: { stepId: input.stepId } });
  }
  const dogId = await ensurePrimaryDogId(db, userId);
  await persistStepTest(input, dogId, db);
  const test = await findStepTest(input.testId, dogId, db);
  if (test === undefined) {
    throw new ApplicationError("INTERNAL_SERVER_ERROR");
  }
  return test;
}

async function persistStepTest(input: RecordStepTestInput, dogId: string, db: Database) {
  const now = new Date();
  const queries = [
    db
      .insert(stepTests)
      .values({
        coldOverride: input.coldOverride,
        dogId,
        outcome: input.outcome,
        stepId: input.stepId,
        testId: input.testId,
        testedAt: now,
      })
      .onConflictDoNothing({ target: stepTests.testId }),
  ];
  if (input.outcome === "success") {
    queries.push(
      db
        .insert(stepCompletions)
        .values({ completedAt: now, dogId, id: crypto.randomUUID(), stepId: input.stepId })
        .onConflictDoNothing({ target: [stepCompletions.dogId, stepCompletions.stepId] }),
    );
  }
  await db.batch(queries);
}

async function findStepTest(testId: string, dogId: string, db: Database) {
  const [test] = await db
    .select({
      coldOverride: stepTests.coldOverride,
      outcome: stepTests.outcome,
      stepId: stepTests.stepId,
      testId: stepTests.testId,
      testedAt: stepTests.testedAt,
    })
    .from(stepTests)
    .where(and(eq(stepTests.dogId, dogId), eq(stepTests.testId, testId)));
  return test;
}

async function ensurePrimaryDogId(db: Database, userId: string): Promise<string> {
  const nowMs = Date.now();
  const newDogId = crypto.randomUUID();
  await db
    .insert(dogs, "createdAt", "id", "name", "updatedAt", "userId")
    .select(
      sql`SELECT ${nowMs}, ${newDogId}, ${DEFAULT_DOG_NAME}, ${nowMs}, ${userId} WHERE NOT EXISTS (SELECT 1 FROM ${dogs} WHERE ${dogs.userId} = ${userId})`,
    );
  const dogId = await findPrimaryDogId(db, userId);
  if (dogId === null) {
    throw new ApplicationError("INTERNAL_SERVER_ERROR");
  }
  return dogId;
}

async function findPrimaryDogId(db: Database, userId: string): Promise<string | null> {
  const [dog] = await db
    .select({ id: dogs.id })
    .from(dogs)
    .where(eq(dogs.userId, userId))
    .orderBy(asc(dogs.createdAt), asc(dogs.id))
    .limit(1);
  return dog?.id ?? null;
}

export { getStepTestHistory, recordStepTest };
