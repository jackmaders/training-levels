import { and, asc, eq, sql } from "drizzle-orm";

import { getCurriculumPage, isValidStepId } from "@/shared/curriculum-data/index.server";
import { dogs, practiceAttempts, practiceAttemptCorrections } from "@/shared/db";
import { getDb, type Database, type DbContext } from "@/shared/db/index.server";
import { ApplicationError } from "@/shared/errors";

import type { CorrectPracticeAttemptInput, RecordPracticeAttemptInput } from "./training-schema";

const DEFAULT_DOG_NAME = "My Dog";

type TrainingUserContext = DbContext & { userId: string };

export async function getPracticeHistory(
  stepId: string,
  { db = getDb(), userId }: TrainingUserContext,
) {
  if (!isValidStepId(stepId)) {
    throw new ApplicationError("CURRICULUM_STEP_NOT_FOUND", { details: { stepId } });
  }

  const dogId = await findPrimaryDogId(db, userId);
  if (dogId === null) {
    return [];
  }

  return await db
    .select({
      attemptId: practiceAttempts.attemptId,
      createdAt: practiceAttempts.createdAt,
      outcome: practiceAttempts.outcome,
      stepId: practiceAttempts.stepId,
      target: practiceAttempts.target,
      undoneAt: practiceAttempts.undoneAt,
    })
    .from(practiceAttempts)
    .where(and(eq(practiceAttempts.dogId, dogId), eq(practiceAttempts.stepId, stepId)))
    .orderBy(asc(practiceAttempts.createdAt), asc(practiceAttempts.attemptId));
}

export async function recordPracticeAttempt(
  input: RecordPracticeAttemptInput,
  { db = getDb(), userId }: TrainingUserContext,
) {
  validatePracticeStep(input.stepId);
  await insertPracticeAttempt(input, db, userId);
  const attempt = await findPracticeAttempt(input.attemptId, db, userId);
  if (attempt === undefined) {
    throw new ApplicationError("INTERNAL_SERVER_ERROR");
  }

  return attempt;
}

export async function correctPracticeAttempt(
  input: CorrectPracticeAttemptInput,
  { db = getDb(), userId }: TrainingUserContext,
) {
  const dogId = await findPrimaryDogId(db, userId);
  if (dogId === null) {
    throw new ApplicationError("INTERNAL_SERVER_ERROR");
  }

  const correctedAt = Date.now();
  const correctionId = crypto.randomUUID();
  const corrected = await db
    .update(practiceAttempts)
    .set({ outcome: input.outcome })
    .where(and(eq(practiceAttempts.dogId, dogId), eq(practiceAttempts.attemptId, input.attemptId)))
    .returning({ attemptId: practiceAttempts.attemptId, outcome: practiceAttempts.outcome });

  if (corrected[0] === undefined) {
    throw new ApplicationError("INTERNAL_SERVER_ERROR");
  }

  await db
    .insert(practiceAttemptCorrections)
    .values({
      attemptId: input.attemptId,
      correctedAt: new Date(correctedAt),
      correctionId,
      dogId,
      outcome: input.outcome,
    })
    .onConflictDoNothing({ target: practiceAttemptCorrections.correctionId });

  return corrected[0];
}

export async function undoPracticeAttempt(
  attemptId: string,
  { db = getDb(), userId }: TrainingUserContext,
) {
  const dogId = await findPrimaryDogId(db, userId);
  if (dogId === null) {
    throw new ApplicationError("INTERNAL_SERVER_ERROR");
  }

  const [attempt] = await db
    .select({ outcome: practiceAttempts.outcome })
    .from(practiceAttempts)
    .where(and(eq(practiceAttempts.dogId, dogId), eq(practiceAttempts.attemptId, attemptId)));

  if (attempt === undefined) {
    throw new ApplicationError("INTERNAL_SERVER_ERROR");
  }

  const correctedAt = Date.now();
  const correctionId = crypto.randomUUID();
  await markAttemptUndone(
    { attemptId, correctedAt, correctionId, dogId, outcome: attempt.outcome },
    db,
  );

  return { attemptId, undone: true };
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

function validatePracticeStep(stepId: string): void {
  const [pageSlug] = stepId.split(":");
  const page = isValidStepId(stepId) && pageSlug !== undefined ? getCurriculumPage(pageSlug) : null;
  const validPage = page?.kind === "behavior" && page.steps.some((step) => step.stepId === stepId);

  if (!validPage) {
    throw new ApplicationError("CURRICULUM_STEP_NOT_FOUND", { details: { stepId } });
  }
}

async function insertPracticeAttempt(
  input: RecordPracticeAttemptInput,
  db: Database,
  userId: string,
): Promise<void> {
  const nowMs = Date.now();
  const newDogId = crypto.randomUUID();

  await db.batch([
    db
      .insert(dogs, "createdAt", "id", "name", "updatedAt", "userId")
      .select(
        sql`SELECT ${nowMs}, ${newDogId}, ${DEFAULT_DOG_NAME}, ${nowMs}, ${userId} WHERE NOT EXISTS (SELECT 1 FROM ${dogs} WHERE ${dogs.userId} = ${userId})`,
      ),
    db
      .insert(practiceAttempts)
      .select((qb) =>
        qb
          .select({
            attemptId: sql<string>`${input.attemptId}`.as("attempt_id"),
            createdAt: sql<Date>`${nowMs}`.as("created_at"),
            dogId: dogs.id,
            outcome: sql<"success" | "not_yet">`${input.outcome}`.as("outcome"),
            stepId: sql<string>`${input.stepId}`.as("step_id"),
            target: sql<string>`${input.target}`.as("target"),
          })
          .from(dogs)
          .where(eq(dogs.userId, userId))
          .orderBy(asc(dogs.createdAt), asc(dogs.id))
          .limit(1),
      )
      .onConflictDoNothing({ target: practiceAttempts.attemptId }),
  ]);
}

async function findPracticeAttempt(attemptId: string, db: Database, userId: string) {
  const dogId = await findPrimaryDogId(db, userId);
  const [attempt] =
    dogId === null
      ? []
      : await db
          .select({
            attemptId: practiceAttempts.attemptId,
            dogId: practiceAttempts.dogId,
            outcome: practiceAttempts.outcome,
          })
          .from(practiceAttempts)
          .where(and(eq(practiceAttempts.dogId, dogId), eq(practiceAttempts.attemptId, attemptId)));

  return attempt;
}

async function markAttemptUndone(
  {
    attemptId,
    correctedAt,
    correctionId,
    dogId,
    outcome,
  }: {
    attemptId: string;
    correctedAt: number;
    correctionId: string;
    dogId: string;
    outcome: "success" | "not_yet";
  },
  db: Database,
): Promise<void> {
  const attemptFilter = and(
    eq(practiceAttempts.dogId, dogId),
    eq(practiceAttempts.attemptId, attemptId),
  );
  await db.batch([
    db
      .update(practiceAttempts)
      .set({ undoneAt: new Date(correctedAt) })
      .where(attemptFilter),
    db.insert(practiceAttemptCorrections).values({
      attemptId,
      correctedAt: new Date(correctedAt),
      correctionId,
      dogId,
      isUndo: true,
      outcome,
    }),
  ]);
}
