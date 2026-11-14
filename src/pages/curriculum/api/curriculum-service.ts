import { and, asc, eq } from "drizzle-orm";

import type { CurriculumPage, CurriculumSyllabus } from "@/shared/curriculum-data";
import {
  getCurriculumPage,
  getCurriculumSyllabus,
  isValidStepId,
} from "@/shared/curriculum-data/index.server";
import { dogs, stepCompletions } from "@/shared/db";
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

async function findPrimaryDogId(db: Database, userId: string): Promise<string | null> {
  const [dog] = await db
    .select({ id: dogs.id })
    .from(dogs)
    .where(eq(dogs.userId, userId))
    .orderBy(asc(dogs.createdAt), asc(dogs.id))
    .limit(1);

  return dog?.id ?? null;
}

interface MarkStepCompletedParams {
  db: Database;
  existingDogId: string | null;
  stepId: string;
  userId: string;
}

async function markStepCompleted({
  db,
  existingDogId,
  stepId,
  userId,
}: MarkStepCompletedParams): Promise<ToggleStepResult> {
  let dogId = existingDogId;
  if (dogId === null) {
    dogId = crypto.randomUUID();
    await db.insert(dogs).values({ id: dogId, name: DEFAULT_DOG_NAME, userId });
  }

  await db
    .insert(stepCompletions)
    .values({ dogId, stepId })
    .onConflictDoNothing({ target: [stepCompletions.dogId, stepCompletions.stepId] });

  return { completed: true, stepId };
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

  const existingDogId = await findPrimaryDogId(db, userId);
  if (input.completed) {
    return await markStepCompleted({ db, existingDogId, stepId: input.stepId, userId });
  }

  if (existingDogId !== null) {
    await db
      .delete(stepCompletions)
      .where(
        and(eq(stepCompletions.dogId, existingDogId), eq(stepCompletions.stepId, input.stepId)),
      );
  }

  return { completed: false, stepId: input.stepId };
}
