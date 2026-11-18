import type {
  CurriculumSyllabus,
  LevelNumber,
  StepNumber,
  SyllabusPageEntry,
  SyllabusSection,
} from "@/shared/curriculum-data";

import type {
  TrainingOverview,
  TrainingOverviewAttempt,
  TrainingOverviewDecision,
  TrainingOverviewStepTest,
  TrainingOverviewTotal,
} from "../api/recommendation-service";
import { getLevelSections } from "./curriculum-levels";
import { getPracticeGuidance } from "./practice-guidance";
import { getPracticePlan, hasPracticeLadder } from "./practice-ladders";

const LAST_INDEX = -1;
const SORT_AFTER = 1;
const SORT_BEFORE = -1;
const STEP_FIVE: StepNumber = 5;
const STEP_FOUR: StepNumber = 4;
const STEP_ONE: StepNumber = 1;
const STEP_THREE: StepNumber = 3;
const STEP_TWO: StepNumber = 2;
const STEP_NUMBERS: readonly StepNumber[] = [STEP_ONE, STEP_TWO, STEP_THREE, STEP_FOUR, STEP_FIVE];

interface BehaviorStepCandidate {
  behaviorTitle: string;
  criterion: string;
  levelNumber: LevelNumber;
  pageOrder: number;
  pageSlug: string;
  stepId: string;
  stepLabel: string;
  stepNumber: StepNumber;
}

interface BehaviorPageRecord {
  levelNumber: LevelNumber;
  pageSlug: string;
  stepIds: readonly string[];
  steps: readonly BehaviorStepCandidate[];
  title: string;
}

interface ActivityIndex {
  activeAttempts: ReadonlyMap<string, readonly TrainingOverviewAttempt[]>;
  decisions: ReadonlyMap<string, readonly TrainingOverviewDecision[]>;
  tests: ReadonlyMap<string, readonly TrainingOverviewStepTest[]>;
  totals: ReadonlyMap<string, readonly TrainingOverviewTotal[]>;
}

type TestReadinessSource = "decision" | "practice";

function buildBehaviorStepCandidates(
  page: SyllabusPageEntry,
  levelNumber: LevelNumber,
  stepIds: readonly string[],
): BehaviorStepCandidate[] {
  return stepIds.map((stepId) => {
    const summary = page.stepSummaries?.find((item) => item.stepId === stepId);
    const stepNumber =
      summary?.stepNumber ??
      STEP_NUMBERS.find((candidate) => stepId.endsWith(`:step-${String(candidate)}`)) ??
      STEP_ONE;
    const criterion =
      summary?.label ?? `Level ${String(levelNumber)} ${page.title} · Step ${String(stepNumber)}`;
    return {
      behaviorTitle: page.title,
      criterion,
      levelNumber,
      pageOrder: page.order,
      pageSlug: page.pageSlug,
      stepId,
      stepLabel:
        summary === undefined
          ? `Step ${String(stepNumber)}`
          : `Step ${String(stepNumber)}: ${summary.label}`,
      stepNumber,
    };
  });
}

function collectLevelBehaviors(syllabus: CurriculumSyllabus): BehaviorPageRecord[] {
  const sections = getLevelSections(syllabus)
    .filter(
      (section): section is SyllabusSection & { levelNumber: LevelNumber } =>
        section.levelNumber !== undefined,
    )
    .toSorted((left, right) => left.levelNumber - right.levelNumber);

  return sections.flatMap((section) =>
    section.pages
      .filter(
        (page): page is SyllabusPageEntry & { stepIds: string[] } =>
          page.kind === "behavior" && page.stepIds !== undefined,
      )
      .map((page) => ({
        levelNumber: section.levelNumber,
        pageSlug: page.pageSlug,
        stepIds: page.stepIds,
        steps: buildBehaviorStepCandidates(page, section.levelNumber, page.stepIds),
        title: page.title,
      })),
  );
}

function groupByStep<TItem>(
  items: readonly TItem[],
  getStepId: (item: TItem) => string,
  getTime: (item: TItem) => number,
): ReadonlyMap<string, readonly TItem[]> {
  const grouped = new Map<string, TItem[]>();
  for (const item of items) {
    const bucket = grouped.get(getStepId(item)) ?? [];
    bucket.push(item);
    grouped.set(getStepId(item), bucket);
  }
  return new Map(
    [...grouped].map(([id, list]) => [
      id,
      list.toSorted((left, right) => getTime(left) - getTime(right)),
    ]),
  );
}

function buildActivityIndex(overview: TrainingOverview): ActivityIndex {
  return {
    activeAttempts: groupByStep(
      overview.practiceAttempts.filter((attempt) => attempt.undoneAt === null),
      (attempt) => attempt.stepId,
      (attempt) => attempt.createdAt.getTime(),
    ),
    decisions: groupByStep(
      overview.stepDecisions,
      (decision) => decision.stepId,
      (decision) => decision.decidedAt.getTime(),
    ),
    tests: groupByStep(
      overview.stepTests,
      (stepTest) => stepTest.stepId,
      (stepTest) => stepTest.testedAt.getTime(),
    ),
    totals: groupByStep(
      overview.practiceTotals,
      (total) => total.stepId,
      (total) => total.createdAt.getTime(),
    ),
  };
}

function isPracticeReadyForTest(
  stepId: string,
  criterion: string,
  attempts: readonly TrainingOverviewAttempt[],
): boolean {
  if (hasPracticeLadder(stepId)) {
    const plan = getPracticePlan(stepId, attempts);
    const lastTargetAttempt = attempts.filter((attempt) => attempt.target !== "").at(LAST_INDEX);
    return (
      lastTargetAttempt?.outcome === "success" &&
      plan.nextTarget === null &&
      lastTargetAttempt.target === plan.target
    );
  }
  return getPracticeGuidance(stepId, criterion, attempts)?.readyForTest ?? false;
}

function isAttemptReadinessActive({
  attempts,
  criterion,
  latestDecision,
  latestNotYetAt,
  stepId,
}: {
  attempts: readonly TrainingOverviewAttempt[];
  criterion: string;
  latestDecision: TrainingOverviewDecision | undefined;
  latestNotYetAt: number | null;
  stepId: string;
}): boolean {
  const latestAttempt = attempts.at(LAST_INDEX);
  if (
    latestAttempt === undefined ||
    (latestDecision?.decision === "keep_practicing" &&
      latestDecision.decidedAt.getTime() >= latestAttempt.createdAt.getTime())
  ) {
    return false;
  }
  const qualifying =
    latestNotYetAt === null
      ? attempts
      : attempts.filter((attempt) => attempt.createdAt.getTime() > latestNotYetAt);
  return isPracticeReadyForTest(stepId, criterion, qualifying);
}

function getTestReadinessSource(
  stepId: string,
  criterion: string,
  index: ActivityIndex,
): TestReadinessSource | null {
  const stepTests = index.tests.get(stepId) ?? [];
  const latestNotYet = stepTests.filter((item) => item.outcome === "not_yet").at(LAST_INDEX);
  const latestNotYetAt = latestNotYet?.testedAt.getTime() ?? null;
  const latestDecision = (index.decisions.get(stepId) ?? []).at(LAST_INDEX);
  if (
    latestDecision?.decision === "recommend_test" &&
    (latestNotYetAt === null || latestDecision.decidedAt.getTime() > latestNotYetAt)
  ) {
    return "decision";
  }
  const attempts = index.activeAttempts.get(stepId) ?? [];
  return isAttemptReadinessActive({
    attempts,
    criterion,
    latestDecision,
    latestNotYetAt,
    stepId,
  })
    ? "practice"
    : null;
}

function getStepActivityDates(index: ActivityIndex, stepId: string): Date[] {
  return [
    ...(index.activeAttempts.get(stepId) ?? []).map((attempt) => attempt.createdAt),
    ...(index.totals.get(stepId) ?? []).map((total) => total.createdAt),
    ...(index.tests.get(stepId) ?? []).map((stepTest) => stepTest.testedAt),
  ];
}

function getLatestActivityTimestamp(index: ActivityIndex, stepId: string): number | null {
  const timestamps = [
    ...getStepActivityDates(index, stepId).map((date) => date.getTime()),
    ...(index.decisions.get(stepId) ?? []).map((decision) => decision.decidedAt.getTime()),
  ];
  return timestamps.length === 0 ? null : Math.max(...timestamps);
}

function comparePracticeCandidates(
  left: { latestActivityAt: number | null; step: BehaviorStepCandidate },
  right: { latestActivityAt: number | null; step: BehaviorStepCandidate },
): number {
  if (left.latestActivityAt !== right.latestActivityAt) {
    if (left.latestActivityAt === null) {
      return SORT_BEFORE;
    }
    return right.latestActivityAt === null
      ? SORT_AFTER
      : left.latestActivityAt - right.latestActivityAt;
  }
  if (left.step.levelNumber !== right.step.levelNumber) {
    return left.step.levelNumber - right.step.levelNumber;
  }
  return left.step.pageOrder === right.step.pageOrder
    ? left.step.stepNumber - right.step.stepNumber
    : left.step.pageOrder - right.step.pageOrder;
}

export {
  buildActivityIndex,
  collectLevelBehaviors,
  comparePracticeCandidates,
  getLatestActivityTimestamp,
  getStepActivityDates,
  getTestReadinessSource,
  type ActivityIndex,
  type BehaviorPageRecord,
  type BehaviorStepCandidate,
  type TestReadinessSource,
};
