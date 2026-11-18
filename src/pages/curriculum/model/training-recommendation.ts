import {
  isValidMainQuestStepId,
  type CurriculumSyllabus,
  type LevelNumber,
} from "@/shared/curriculum-data";

import type { TrainingOverview } from "../api/recommendation-service";
import { formatStepSummary } from "./curriculum-levels";
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

interface InspectManualStepSelectionInput {
  completedStepIds: ReadonlySet<string>;
  currentLevelNumber: LevelNumber;
  pageSlug: string;
  syllabus: CurriculumSyllabus;
}

interface UnmetPrerequisite {
  pageSlug: string;
  title: string;
}

interface ManualStepSelectionInspection {
  hasWarning: boolean;
  isLaterLevel: boolean;
  selectedLevelNumber: LevelNumber | null;
  unmetPrerequisites: readonly UnmetPrerequisite[];
}

interface RecommendNextTrainingActivityInput {
  now?: Date;
  overview: TrainingOverview;
  syllabus: CurriculumSyllabus;
}

type TrainingRecommendationMode = "practice" | "test";

interface WaitingTestNotice {
  behaviorTitle: string;
  pageSlug: string;
  reason: string;
  stepId: string;
  stepLabel: string;
}

interface TrainingRecommendation extends WaitingTestNotice {
  currentLevelNumber: LevelNumber;
  levelNumber: LevelNumber;
  mode: TrainingRecommendationMode;
  waitingTestNotice: WaitingTestNotice | null;
}

type PracticeFallbackMode = "all_blocked" | "all_complete" | "none";

interface PracticeContext {
  activityIndex: ActivityIndex;
  allSteps: readonly BehaviorStepCandidate[];
  completedStepIds: ReadonlySet<string>;
  currentLevelNumber: LevelNumber;
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

function getTrainingFallbackGuidance(
  step: { heading?: string; label?: string } | undefined,
  fallbackLabel: string,
): string {
  const headingText = step?.heading === undefined ? "" : formatStepSummary(step.heading);
  if (headingText !== "") {
    return headingText;
  }
  const labelText = step?.label?.trim() ?? "";
  return labelText === "" ? fallbackLabel : labelText;
}

function inspectManualStepSelection({
  completedStepIds,
  currentLevelNumber,
  pageSlug,
  syllabus,
}: InspectManualStepSelectionInput): ManualStepSelectionInspection {
  const behaviors = collectLevelBehaviors(syllabus);
  const selectedBehavior = behaviors.find((behavior) => behavior.pageSlug === pageSlug);
  const selectedLevelNumber = selectedBehavior === undefined ? null : selectedBehavior.levelNumber;
  const prerequisiteSlugs = new Set(getPrerequisiteChain(pageSlug));
  const unmetPrerequisites = behaviors
    .filter(
      (behavior) =>
        prerequisiteSlugs.has(behavior.pageSlug) &&
        behavior.stepIds.some((stepId) => !completedStepIds.has(stepId)),
    )
    .map((behavior) => ({ pageSlug: behavior.pageSlug, title: behavior.title }));
  const isLaterLevel = selectedLevelNumber !== null && selectedLevelNumber > currentLevelNumber;
  return {
    hasWarning: unmetPrerequisites.length > 0 || isLaterLevel,
    isLaterLevel,
    selectedLevelNumber,
    unmetPrerequisites,
  };
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

function findPendingTestRecommendation({
  activityIndex,
  currentLevelNumber,
  incompleteSteps,
  now,
}: PracticeContext & { now: Date }): {
  recommendation: TrainingRecommendation | null;
  waitingTestNotice: WaitingTestNotice | null;
} {
  const readyCandidates = incompleteSteps
    .filter((step) => isStepTestable(step.stepId))
    .flatMap((step) => {
      const source = getTestReadinessSource(step.stepId, step.criterion, activityIndex);
      return source === null ? [] : [{ source, step }];
    });
  const testableNow = readyCandidates.find(({ step }) =>
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
  incompleteSteps,
  stepIdsByPage,
}: PracticeContext): {
  fallbackMode: PracticeFallbackMode;
  pool: readonly BehaviorStepCandidate[];
} {
  const levelIncomplete = incompleteSteps.filter((step) => step.levelNumber === currentLevelNumber);
  if (levelIncomplete.length === 0) {
    return { fallbackMode: "all_complete", pool: allSteps };
  }
  const unblocked = levelIncomplete.filter((step) =>
    getPrerequisiteChain(step.pageSlug).every((prereqSlug) => {
      const prereqSteps = stepIdsByPage.get(prereqSlug);
      return prereqSteps === undefined || prereqSteps.every((id) => completedStepIds.has(id));
    }),
  );
  return unblocked.length > 0
    ? { fallbackMode: "none", pool: unblocked }
    : { fallbackMode: "all_blocked", pool: levelIncomplete };
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
    levelNumber: selected.step.levelNumber,
    mode: "practice",
    waitingTestNotice,
  };
}

function recommendNextTrainingActivity({
  now = new Date(),
  overview,
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
    incompleteSteps: allSteps.filter((step) => !completedStepIds.has(step.stepId)),
    stepIdsByPage: new Map(behaviors.map((behavior) => [behavior.pageSlug, behavior.stepIds])),
  };
  const pendingTest = findPendingTestRecommendation({ ...context, now });
  if (pendingTest.recommendation !== null) {
    return pendingTest.recommendation;
  }
  return buildPracticeRecommendation({
    ...context,
    waitingTestNotice: pendingTest.waitingTestNotice,
  });
}

export {
  getCurrentLevelNumber,
  getTrainingFallbackGuidance,
  inspectManualStepSelection,
  isStepTestable,
  recommendNextTrainingActivity,
  type InspectManualStepSelectionInput,
  type ManualStepSelectionInspection,
  type RecommendNextTrainingActivityInput,
  type TrainingRecommendation,
  type TrainingRecommendationMode,
  type UnmetPrerequisite,
  type WaitingTestNotice,
};
