import { asc, eq } from "drizzle-orm";

import {
  dogs,
  practiceAttempts,
  practiceStepDecisions,
  practiceTotals,
  stepCompletions,
  stepTests,
} from "@/shared/db";
import { getDb, type Database, type DbContext } from "@/shared/db/index.server";

type TrainingUserContext = DbContext & { userId: string };

interface TrainingOverviewAttempt {
  attemptId: string;
  createdAt: Date;
  outcome: "success" | "not_yet";
  stepId: string;
  target: string;
  undoneAt: Date | null;
}

interface TrainingOverviewCompletion {
  completedAt: Date;
  stepId: string;
}

interface TrainingOverviewDecision {
  decidedAt: Date;
  decision: "keep_practicing" | "recommend_test";
  stepId: string;
}

interface TrainingOverviewStepTest {
  coldOverride: boolean;
  outcome: "success" | "not_yet";
  stepId: string;
  testId: string;
  testedAt: Date;
}

interface TrainingOverviewTotal {
  createdAt: Date;
  notYetCount: number;
  recordId: string;
  stepId: string;
  successCount: number;
  target: string;
}

interface TrainingOverview {
  curriculumProgress: TrainingOverviewCompletion[];
  practiceAttempts: TrainingOverviewAttempt[];
  practiceTotals: TrainingOverviewTotal[];
  stepDecisions: TrainingOverviewDecision[];
  stepTests: TrainingOverviewStepTest[];
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

async function findCurriculumProgress(
  db: Database,
  dogId: string,
): Promise<TrainingOverviewCompletion[]> {
  return await db
    .select({
      completedAt: stepCompletions.completedAt,
      stepId: stepCompletions.stepId,
    })
    .from(stepCompletions)
    .where(eq(stepCompletions.dogId, dogId))
    .orderBy(asc(stepCompletions.completedAt), asc(stepCompletions.stepId));
}

async function findPracticeAttempts(
  db: Database,
  dogId: string,
): Promise<TrainingOverviewAttempt[]> {
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
    .where(eq(practiceAttempts.dogId, dogId))
    .orderBy(asc(practiceAttempts.createdAt), asc(practiceAttempts.attemptId));
}

async function findPracticeTotals(db: Database, dogId: string): Promise<TrainingOverviewTotal[]> {
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
    .where(eq(practiceTotals.dogId, dogId))
    .orderBy(asc(practiceTotals.createdAt), asc(practiceTotals.recordId));
}

async function findStepDecisions(db: Database, dogId: string): Promise<TrainingOverviewDecision[]> {
  return await db
    .select({
      decidedAt: practiceStepDecisions.decidedAt,
      decision: practiceStepDecisions.decision,
      stepId: practiceStepDecisions.stepId,
    })
    .from(practiceStepDecisions)
    .where(eq(practiceStepDecisions.dogId, dogId))
    .orderBy(asc(practiceStepDecisions.decidedAt), asc(practiceStepDecisions.stepId));
}

async function findStepTests(db: Database, dogId: string): Promise<TrainingOverviewStepTest[]> {
  return await db
    .select({
      coldOverride: stepTests.coldOverride,
      outcome: stepTests.outcome,
      stepId: stepTests.stepId,
      testId: stepTests.testId,
      testedAt: stepTests.testedAt,
    })
    .from(stepTests)
    .where(eq(stepTests.dogId, dogId))
    .orderBy(asc(stepTests.testedAt), asc(stepTests.testId));
}

async function getTrainingOverview({
  db = getDb(),
  userId,
}: TrainingUserContext): Promise<TrainingOverview> {
  const dogId = await findPrimaryDogId(db, userId);
  if (dogId === null) {
    return {
      curriculumProgress: [],
      practiceAttempts: [],
      practiceTotals: [],
      stepDecisions: [],
      stepTests: [],
    };
  }

  const [
    curriculumProgressRows,
    practiceAttemptRows,
    practiceTotalRows,
    stepDecisionRows,
    stepTestRows,
  ] = await Promise.all([
    findCurriculumProgress(db, dogId),
    findPracticeAttempts(db, dogId),
    findPracticeTotals(db, dogId),
    findStepDecisions(db, dogId),
    findStepTests(db, dogId),
  ]);

  return {
    curriculumProgress: curriculumProgressRows,
    practiceAttempts: practiceAttemptRows,
    practiceTotals: practiceTotalRows,
    stepDecisions: stepDecisionRows,
    stepTests: stepTestRows,
  };
}

export {
  getTrainingOverview,
  type TrainingOverview,
  type TrainingOverviewAttempt,
  type TrainingOverviewCompletion,
  type TrainingOverviewDecision,
  type TrainingOverviewStepTest,
  type TrainingOverviewTotal,
};
