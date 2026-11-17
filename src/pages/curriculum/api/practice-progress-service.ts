import { and, asc, eq, sql } from "drizzle-orm";

import { dogs, practiceStepDecisions, practiceTotalCorrections, practiceTotals } from "@/shared/db";
import { getDb, type Database, type DbContext } from "@/shared/db/index.server";
import { ApplicationError } from "@/shared/errors";

import type {
  CorrectPracticeTotalsInput,
  RecordPracticeTotalsInput,
  SavePracticeStepDecisionInput,
} from "./training-schema";

const DEFAULT_DOG_NAME = "My Dog";

type TrainingUserContext = DbContext & { userId: string };

async function getPracticeTotals(stepId: string, { db = getDb(), userId }: TrainingUserContext) {
  const dogId = await findPrimaryDogId(db, userId);
  if (dogId === null) {
    return [];
  }

  return await db
    .select({
      createdAt: practiceTotals.createdAt,
      notYetCount: practiceTotals.notYetCount,
      recordId: practiceTotals.recordId,
      stepId: practiceTotals.stepId,
      successCount: practiceTotals.successCount,
      target: practiceTotals.target,
    })
    .from(practiceTotals)
    .where(and(eq(practiceTotals.dogId, dogId), eq(practiceTotals.stepId, stepId)))
    .orderBy(asc(practiceTotals.createdAt), asc(practiceTotals.recordId));
}

async function recordPracticeTotals(
  input: RecordPracticeTotalsInput,
  { db = getDb(), userId }: TrainingUserContext,
) {
  const dogId = await ensurePrimaryDogId(db, userId);
  await db.insert(practiceTotals).values({ ...input, createdAt: new Date(), dogId });
  return input;
}

async function correctPracticeTotals(
  input: CorrectPracticeTotalsInput,
  { db = getDb(), userId }: TrainingUserContext,
) {
  const dogId = await findPrimaryDogId(db, userId);
  if (dogId === null) {
    throw new ApplicationError("INTERNAL_SERVER_ERROR");
  }

  const correctedAt = new Date();
  const correctionId = crypto.randomUUID();
  const corrected = await db
    .update(practiceTotals)
    .set({ notYetCount: input.notYetCount, successCount: input.successCount })
    .where(and(eq(practiceTotals.dogId, dogId), eq(practiceTotals.recordId, input.recordId)))
    .returning({ recordId: practiceTotals.recordId });

  if (corrected[0] === undefined) {
    throw new ApplicationError("INTERNAL_SERVER_ERROR");
  }

  await db.insert(practiceTotalCorrections).values({
    correctedAt,
    correctionId,
    dogId,
    notYetCount: input.notYetCount,
    recordId: input.recordId,
    successCount: input.successCount,
  });
  return input;
}

async function getPracticeStepDecision(
  stepId: string,
  { db = getDb(), userId }: TrainingUserContext,
) {
  const dogId = await findPrimaryDogId(db, userId);
  if (dogId === null) {
    return null;
  }

  const [decision] = await db
    .select({
      decidedAt: practiceStepDecisions.decidedAt,
      decision: practiceStepDecisions.decision,
      stepId: practiceStepDecisions.stepId,
    })
    .from(practiceStepDecisions)
    .where(and(eq(practiceStepDecisions.dogId, dogId), eq(practiceStepDecisions.stepId, stepId)));

  return decision ?? null;
}

async function savePracticeStepDecision(
  input: SavePracticeStepDecisionInput,
  { db = getDb(), userId }: TrainingUserContext,
) {
  const dogId = await ensurePrimaryDogId(db, userId);
  const [decision] = await db
    .insert(practiceStepDecisions)
    .values({ ...input, decidedAt: new Date(), dogId })
    .onConflictDoUpdate({
      set: { decidedAt: new Date(), decision: input.decision },
      target: [practiceStepDecisions.dogId, practiceStepDecisions.stepId],
    })
    .returning({ decision: practiceStepDecisions.decision, stepId: practiceStepDecisions.stepId });

  return decision;
}

async function ensurePrimaryDogId(db: Database, userId: string): Promise<string> {
  const nowMs = Date.now();
  const dogId = crypto.randomUUID();
  await db
    .insert(dogs, "createdAt", "id", "name", "updatedAt", "userId")
    .select(
      sql`SELECT ${nowMs}, ${dogId}, ${DEFAULT_DOG_NAME}, ${nowMs}, ${userId} WHERE NOT EXISTS (SELECT 1 FROM ${dogs} WHERE ${dogs.userId} = ${userId})`,
    );
  const selectedDogId = await findPrimaryDogId(db, userId);
  if (selectedDogId === null) {
    throw new ApplicationError("INTERNAL_SERVER_ERROR");
  }

  return selectedDogId;
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

export {
  correctPracticeTotals,
  getPracticeStepDecision,
  getPracticeTotals,
  recordPracticeTotals,
  savePracticeStepDecision,
};
