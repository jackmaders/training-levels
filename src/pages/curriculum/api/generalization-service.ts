import { and, asc, eq, inArray, sql } from "drizzle-orm";

import { getCurriculumPage, isValidStepId } from "@/shared/curriculum-data/index.server";
import { comeafterRecords, dogs, homeworkReflections, stepTests } from "@/shared/db";
import { getDb, type Database, type DbContext } from "@/shared/db/index.server";
import { ApplicationError } from "@/shared/errors";

import type { StepTestOutcome } from "../model/step-provenance";
import type {
  ComeafterStatus,
  SaveComeafterInput,
  SaveHomeworkInput,
} from "./generalization-schema";

const DEFAULT_DOG_NAME = "My Dog";

export type GeneralizationUserContext = DbContext & {
  userId: string;
};

export interface ComeafterRecordState {
  note: string;
  status: ComeafterStatus;
  stepId: string;
  updatedAt: Date;
}

export interface HomeworkReflectionState {
  pageSlug: string;
  reflection: string;
  updatedAt: Date;
}

export interface PageGeneralizationState {
  comeafters: Record<string, ComeafterRecordState>;
  homeworkReflection: HomeworkReflectionState | null;
  latestStepTests: Record<string, StepTestOutcome>;
}

function createEmptyGeneralizationState(): PageGeneralizationState {
  return {
    comeafters: {},
    homeworkReflection: null,
    latestStepTests: {},
  };
}

/** Loads Comeafter records, Homework reflection, and latest Step Test outcomes for a page. */
export async function getPageGeneralization(
  pageSlug: string,
  { db = getDb(), userId }: GeneralizationUserContext,
): Promise<PageGeneralizationState> {
  const page = getCurriculumPage(pageSlug);
  if (page === null) {
    throw new ApplicationError("CURRICULUM_STEP_NOT_FOUND", { details: { pageSlug } });
  }

  const dogId = await findPrimaryDogId(db, userId);
  if (dogId === null) {
    return createEmptyGeneralizationState();
  }

  return await loadGeneralizationForPage(page, dogId, db);
}

async function loadGeneralizationForPage(
  page: NonNullable<ReturnType<typeof getCurriculumPage>>,
  dogId: string,
  db: Database,
): Promise<PageGeneralizationState> {
  if (page.kind === "behavior") {
    return await getBehaviorGeneralization(
      page.steps.map((step) => step.stepId),
      dogId,
      db,
    );
  }

  if (page.kind === "homework") {
    return await getHomeworkGeneralization(page.pageSlug, dogId, db);
  }

  return createEmptyGeneralizationState();
}

/** Upserts Comeafter practice status and notes for a valid step without touching completions. */
export async function saveComeafterRecord(
  input: SaveComeafterInput,
  { db = getDb(), userId }: GeneralizationUserContext,
): Promise<ComeafterRecordState> {
  if (!isValidStepId(input.stepId)) {
    throw new ApplicationError("CURRICULUM_STEP_NOT_FOUND", {
      details: { stepId: input.stepId },
    });
  }

  const dogId = await ensurePrimaryDogId(db, userId);
  const updatedAt = new Date();

  await db
    .insert(comeafterRecords)
    .values({
      dogId,
      id: crypto.randomUUID(),
      note: input.note,
      status: input.status,
      stepId: input.stepId,
      updatedAt,
    })
    .onConflictDoUpdate({
      set: {
        note: input.note,
        status: input.status,
        updatedAt,
      },
      target: [comeafterRecords.dogId, comeafterRecords.stepId],
    });

  return {
    note: input.note,
    status: input.status,
    stepId: input.stepId,
    updatedAt,
  };
}

/** Upserts a Level Homework reflection without gating step or level completion. */
export async function saveHomeworkReflection(
  input: SaveHomeworkInput,
  { db = getDb(), userId }: GeneralizationUserContext,
): Promise<HomeworkReflectionState> {
  const page = getCurriculumPage(input.pageSlug);
  if (page?.kind !== "homework") {
    throw new ApplicationError("CURRICULUM_STEP_NOT_FOUND", {
      details: { pageSlug: input.pageSlug },
    });
  }

  const dogId = await ensurePrimaryDogId(db, userId);
  const updatedAt = new Date();

  await db
    .insert(homeworkReflections)
    .values({
      dogId,
      id: crypto.randomUUID(),
      pageSlug: input.pageSlug,
      reflection: input.reflection,
      updatedAt,
    })
    .onConflictDoUpdate({
      set: {
        reflection: input.reflection,
        updatedAt,
      },
      target: [homeworkReflections.dogId, homeworkReflections.pageSlug],
    });

  return {
    pageSlug: input.pageSlug,
    reflection: input.reflection,
    updatedAt,
  };
}

async function getBehaviorGeneralization(
  stepIds: readonly string[],
  dogId: string,
  db: Database,
): Promise<PageGeneralizationState> {
  const comeafterFilter = and(
    eq(comeafterRecords.dogId, dogId),
    inArray(comeafterRecords.stepId, stepIds),
  );
  const stepTestFilter = and(eq(stepTests.dogId, dogId), inArray(stepTests.stepId, stepIds));

  const [comeafterRows, testRows] = await Promise.all([
    db
      .select({
        note: comeafterRecords.note,
        status: comeafterRecords.status,
        stepId: comeafterRecords.stepId,
        updatedAt: comeafterRecords.updatedAt,
      })
      .from(comeafterRecords)
      .where(comeafterFilter),
    db
      .select({
        outcome: stepTests.outcome,
        stepId: stepTests.stepId,
      })
      .from(stepTests)
      .where(stepTestFilter)
      .orderBy(asc(stepTests.testedAt), asc(stepTests.testId)),
  ]);

  const comeafters: Record<string, ComeafterRecordState> = {};
  for (const row of comeafterRows) {
    comeafters[row.stepId] = row;
  }

  const latestStepTests: Record<string, StepTestOutcome> = {};
  for (const row of testRows) {
    latestStepTests[row.stepId] = row.outcome;
  }

  return {
    comeafters,
    homeworkReflection: null,
    latestStepTests,
  };
}

async function getHomeworkGeneralization(
  pageSlug: string,
  dogId: string,
  db: Database,
): Promise<PageGeneralizationState> {
  const [reflectionRow] = await db
    .select({
      pageSlug: homeworkReflections.pageSlug,
      reflection: homeworkReflections.reflection,
      updatedAt: homeworkReflections.updatedAt,
    })
    .from(homeworkReflections)
    .where(and(eq(homeworkReflections.dogId, dogId), eq(homeworkReflections.pageSlug, pageSlug)))
    .limit(1);

  return {
    comeafters: {},
    homeworkReflection: reflectionRow ?? null,
    latestStepTests: {},
  };
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
