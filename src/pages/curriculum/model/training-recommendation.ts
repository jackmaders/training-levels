import {
  isValidMainQuestStepId,
  type CurriculumSyllabus,
  type LevelNumber,
} from "@/shared/curriculum-data";

import type { TrainingOverview } from "../api/recommendation-service";
import { getPrerequisiteChain } from "./dependency-relationships";
import { canTestToday } from "./test-eligibility";
import {
  buildActivityIndex,
  collectLevelBehaviors,
  comparePracticeCandidates,
  getLatestActivityTimestamp,
  getStepActivityDates,
  getTestReadinessSource,
  type ActivityIndex,
  type BehaviorStepCandidate,
} from "./training-recommendation-helpers";

const FINAL_LEVEL_NUMBER: LevelNumber = 4;
const NON_TESTABLE_STEP_SUFFIX = ":step-5";
const TRICKS_PAGE_PREFIX = "level-2/tricks:";

interface RecommendNextTrainingActivityInput {
  excludedStepIds?: ReadonlySet<string> | readonly string[];
  now?: Date | null;
  overview: TrainingOverview;
  preferredMode?: TrainingRecommendationMode | undefined;
  syllabus: CurriculumSyllabus;
}

type TrainingRecommendationMode = "practice" | "test";
type PracticeFallbackMode = "all_blocked" | "all_complete" | "none";

interface WaitingTestNotice {
  behaviorTitle: string;
  pageSlug: string;
  reason: string;
  stepId: string;
  stepLabel: string;
}

interface TrainingRecommendation extends WaitingTestNotice {
  currentLevelNumber: LevelNumber;
  fallbackMode: PracticeFallbackMode;
  levelNumber: LevelNumber;
  mode: TrainingRecommendationMode;
  waitingTestNotice: WaitingTestNotice | null;
}

interface PracticeContext {
  activityIndex: ActivityIndex;
  allSteps: readonly BehaviorStepCandidate[];
  completedStepIds: ReadonlySet<string>;
  currentLevelNumber: LevelNumber;
  excludedSet: ReadonlySet<string>;
  incompleteSteps: readonly BehaviorStepCandidate[];
  stepIdsByPage: ReadonlyMap<string, readonly string[]>;
}

function getCurrentLevelNumber(
  syllabus: CurriculumSyllabus,
  completedStepIds: ReadonlySet<string>,
): LevelNumber {
  const firstIncomplete = collectLevelBehaviors(syllabus).find((behavior) =>
    behavior.stepIds.some((stepId) => !completedStepIds.has(stepId)),
  );
  return firstIncomplete === undefined ? FINAL_LEVEL_NUMBER : firstIncomplete.levelNumber;
}

function isStepTestable(stepId: string): boolean {
  return (
    isValidMainQuestStepId(stepId) &&
    !stepId.endsWith(NON_TESTABLE_STEP_SUFFIX) &&
    !stepId.startsWith(TRICKS_PAGE_PREFIX)
  );
}

function toWaitingNotice(step: BehaviorStepCandidate, reason: string): WaitingTestNotice {
  return {
    behaviorTitle: step.behaviorTitle,
    pageSlug: step.pageSlug,
    reason,
    stepId: step.stepId,
    stepLabel: step.stepLabel,
  };
}

function findReadyTestCandidates(
  incompleteSteps: readonly BehaviorStepCandidate[],
  excludedSet: ReadonlySet<string>,
  activityIndex: ActivityIndex,
) {
  return incompleteSteps
    .filter((step) => isStepTestable(step.stepId) && !excludedSet.has(step.stepId))
    .flatMap((step) => {
      const source = getTestReadinessSource(step.stepId, step.criterion, activityIndex);
      return source === null ? [] : [{ source, step }];
    });
}

function findPendingTestRecommendation({
  activityIndex,
  currentLevelNumber,
  excludedSet,
  incompleteSteps,
  now,
}: PracticeContext & { now: Date | null }): {
  recommendation: TrainingRecommendation | null;
  waitingTestNotice: WaitingTestNotice | null;
} {
  const readyCandidates = findReadyTestCandidates(incompleteSteps, excludedSet, activityIndex);
  const testableNow =
    now === null
      ? undefined
      : readyCandidates.find(({ step }) =>
          canTestToday(getStepActivityDates(activityIndex, step.stepId), now),
        );
  if (testableNow !== undefined) {
    const reason =
      testableNow.source === "decision"
        ? "You marked this step ready for a cold Test, and no practice or test has happened today."
        : "Recent Practice reached the readiness target on an earlier day, so this step is ready for a cold Test today.";
    return {
      recommendation: {
        ...toWaitingNotice(testableNow.step, reason),
        currentLevelNumber,
        fallbackMode: "none",
        levelNumber: testableNow.step.levelNumber,
        mode: "test",
        waitingTestNotice: null,
      },
      waitingTestNotice: null,
    };
  }
  const [firstWaiting] = readyCandidates;
  return {
    recommendation: null,
    waitingTestNotice:
      firstWaiting === undefined
        ? null
        : toWaitingNotice(
            firstWaiting.step,
            "This step is ready for a cold Test, but Practice or a Test already happened today—wait for a fresh day before testing cold.",
          ),
  };
}

function buildPracticeReason(
  fallbackMode: PracticeFallbackMode,
  levelNumber: LevelNumber,
  latestActivityAt: number | null,
): string {
  if (fallbackMode === "all_complete") {
    return "All Main Quest levels are complete; revisit this step to maintain fluency.";
  }
  if (fallbackMode === "all_blocked") {
    return `All remaining steps in Level ${String(levelNumber)} have unmet prerequisites, so Practice rotates to the least recently trained step.`;
  }
  if (latestActivityAt === null) {
    return `Recommended next in Level ${String(levelNumber)} because its prerequisites are complete and it has not been practiced yet.`;
  }
  return `Recommended next in Level ${String(levelNumber)} to rotate Practice across Behaviors using the least recently trained eligible step.`;
}

function resolvePracticePool({
  allSteps,
  completedStepIds,
  currentLevelNumber,
  excludedSet,
  incompleteSteps,
  stepIdsByPage,
}: PracticeContext): {
  fallbackMode: PracticeFallbackMode;
  pool: readonly BehaviorStepCandidate[];
} {
  const levelIncomplete = incompleteSteps.filter((step) => step.levelNumber === currentLevelNumber);
  if (levelIncomplete.length === 0) {
    const remainingAll = allSteps.filter((step) => !excludedSet.has(step.stepId));
    return {
      fallbackMode: "all_complete",
      pool: remainingAll.length > 0 ? remainingAll : allSteps,
    };
  }
  const remainingLevel = levelIncomplete.filter((step) => !excludedSet.has(step.stepId));
  const candidatePool = remainingLevel.length > 0 ? remainingLevel : levelIncomplete;
  const unblocked = candidatePool.filter((step) =>
    getPrerequisiteChain(step.pageSlug).every((prereqSlug) => {
      const prereqSteps = stepIdsByPage.get(prereqSlug);
      return prereqSteps === undefined || prereqSteps.every((id) => completedStepIds.has(id));
    }),
  );
  return unblocked.length > 0
    ? { fallbackMode: "none", pool: unblocked }
    : { fallbackMode: "all_blocked", pool: candidatePool };
}

function buildPracticeRecommendation({
  waitingTestNotice,
  ...context
}: PracticeContext & { waitingTestNotice: WaitingTestNotice | null }): TrainingRecommendation {
  const { fallbackMode, pool } = resolvePracticePool(context);
  const [selected] = pool
    .map((step) => ({
      latestActivityAt: getLatestActivityTimestamp(context.activityIndex, step.stepId),
      step,
    }))
    .toSorted(comparePracticeCandidates);
  if (selected === undefined) {
    throw new Error("No Main Quest Behavior steps are available to recommend.");
  }
  return {
    ...toWaitingNotice(
      selected.step,
      buildPracticeReason(fallbackMode, selected.step.levelNumber, selected.latestActivityAt),
    ),
    currentLevelNumber: context.currentLevelNumber,
    fallbackMode,
    levelNumber: selected.step.levelNumber,
    mode: "practice",
    waitingTestNotice,
  };
}

function recommendNextTrainingActivity({
  excludedStepIds = [],
  now = new Date(),
  overview,
  preferredMode,
  syllabus,
}: RecommendNextTrainingActivityInput): TrainingRecommendation {
  const completedStepIds = new Set(overview.curriculumProgress.map((item) => item.stepId));
  const behaviors = collectLevelBehaviors(syllabus);
  const allSteps = behaviors.flatMap((behavior) => behavior.steps);
  const context: PracticeContext = {
    activityIndex: buildActivityIndex(overview),
    allSteps,
    completedStepIds,
    currentLevelNumber: getCurrentLevelNumber(syllabus, completedStepIds),
    excludedSet: new Set(excludedStepIds),
    incompleteSteps: allSteps.filter((step) => !completedStepIds.has(step.stepId)),
    stepIdsByPage: new Map(behaviors.map((behavior) => [behavior.pageSlug, behavior.stepIds])),
  };
  const pendingTest = findPendingTestRecommendation({ ...context, now });
  if (preferredMode !== "practice" && pendingTest.recommendation !== null) {
    return pendingTest.recommendation;
  }
  return buildPracticeRecommendation({
    ...context,
    waitingTestNotice: pendingTest.waitingTestNotice,
  });
}

export {
  getTrainingFallbackGuidance,
  inspectManualStepSelection,
  type InspectManualStepSelectionInput,
  type ManualStepSelectionInspection,
  type UnmetPrerequisite,
} from "./training-manual-selection";

export {
  getCurrentLevelNumber,
  isStepTestable,
  recommendNextTrainingActivity,
  type PracticeFallbackMode,
  type RecommendNextTrainingActivityInput,
  type TrainingRecommendation,
  type TrainingRecommendationMode,
  type WaitingTestNotice,
};
