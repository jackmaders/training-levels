import { and, asc, eq, sql } from "drizzle-orm";

import type { CurriculumPage, CurriculumSyllabus } from "@/shared/curriculum-data";
import {
  getCurriculumPage,
  getCurriculumSyllabus,
  isValidStepId,
} from "@/shared/curriculum-data/index.server";
import { dogs, stepCompletions, stepTests } from "@/shared/db";
import { getDb, type Database, type DbContext } from "@/shared/db/index.server";
import { ApplicationError } from "@/shared/errors";

import type { ToggleStepInput } from "./curriculum-schema";

const DEFAULT_DOG_NAME = "My Dog";

export type CurriculumUserContext = DbContext & {
  userId: string;
};

export interface ToggleStepResult {
  completed: boolean;
  stepId: string;
}

export function getSyllabus(): CurriculumSyllabus {
  return getCurriculumSyllabus();
}

export function getPage(pageSlug: string): CurriculumPage | null {
  return getCurriculumPage(pageSlug);
}

export async function getStepProgress({
  db = getDb(),
  userId,
}: CurriculumUserContext): Promise<string[]> {
  const dogId = await findPrimaryDogId(db, userId);
  if (dogId === null) {
    return [];
  }

  const rows = await db
    .select({ stepId: stepCompletions.stepId })
    .from(stepCompletions)
    .where(eq(stepCompletions.dogId, dogId))
    .orderBy(asc(stepCompletions.stepId));

  return rows.map((row) => row.stepId);
}

export async function toggleStep(
  input: ToggleStepInput,
  { db = getDb(), userId }: CurriculumUserContext,
): Promise<ToggleStepResult> {
  if (!isValidStepId(input.stepId)) {
    throw new ApplicationError("CURRICULUM_STEP_NOT_FOUND", {
      details: { stepId: input.stepId },
    });
  }

  if (input.completed) {
    await requirePassingStepTest(input.stepId, db, userId);
    return await markStepCompleted({ db, stepId: input.stepId, userId });
  }

  return await unmarkStepCompleted({ db, stepId: input.stepId, userId });
}

async function requirePassingStepTest(stepId: string, db: Database, userId: string): Promise<void> {
  if (stepId !== "level-1/zen:step-1") {
    return;
  }

  const dogId = await findPrimaryDogId(db, userId);
  if (dogId === null) {
    throw new ApplicationError("CURRICULUM_STEP_TEST_REQUIRED", { details: { stepId } });
  }
  if (await hasStepCompletion(stepId, dogId, db)) {
    return;
  }
  const [passingTest] = await db
    .select({ testId: stepTests.testId })
    .from(stepTests)
    .where(
      and(
        eq(stepTests.dogId, dogId),
        eq(stepTests.stepId, stepId),
        eq(stepTests.outcome, "success"),
      ),
    )
    .limit(1);
  if (passingTest === undefined) {
    throw new ApplicationError("CURRICULUM_STEP_TEST_REQUIRED", { details: { stepId } });
  }
}

async function hasStepCompletion(stepId: string, dogId: string, db: Database): Promise<boolean> {
  const [completion] = await db
    .select({ stepId: stepCompletions.stepId })
    .from(stepCompletions)
    .where(and(eq(stepCompletions.dogId, dogId), eq(stepCompletions.stepId, stepId)));
  return completion !== undefined;
}

interface StepMutationParams {
  db: Database;
  stepId: string;
  userId: string;
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

async function markStepCompleted({
  db,
  stepId,
  userId,
}: StepMutationParams): Promise<ToggleStepResult> {
  const nowMs = Date.now();
  const newDogId = crypto.randomUUID();
  const newCompletionId = crypto.randomUUID();

  await db.batch([
    db
      .insert(dogs, "createdAt", "id", "name", "updatedAt", "userId")
      .select(
        sql`SELECT ${nowMs}, ${newDogId}, ${DEFAULT_DOG_NAME}, ${nowMs}, ${userId} WHERE NOT EXISTS (SELECT 1 FROM ${dogs} WHERE ${dogs.userId} = ${userId})`,
      ),
    db
      .insert(stepCompletions)
      .select((qb) =>
        qb
          .select({
            completedAt: sql<Date>`${nowMs}`.as("completed_at"),
            dogId: dogs.id,
            id: sql<string>`${newCompletionId}`.as("id"),
            stepId: sql<string>`${stepId}`.as("step_id"),
          })
          .from(dogs)
          .where(eq(dogs.userId, userId))
          .orderBy(asc(dogs.createdAt), asc(dogs.id))
          .limit(1),
      )
      .onConflictDoNothing({ target: [stepCompletions.dogId, stepCompletions.stepId] }),
  ]);

  return { completed: true, stepId };
}

async function unmarkStepCompleted({
  db,
  stepId,
  userId,
}: StepMutationParams): Promise<ToggleStepResult> {
  const existingDogId = await findPrimaryDogId(db, userId);
  if (existingDogId !== null) {
    await db
      .delete(stepCompletions)
      .where(and(eq(stepCompletions.dogId, existingDogId), eq(stepCompletions.stepId, stepId)));
  }

  return { completed: false, stepId };
}
