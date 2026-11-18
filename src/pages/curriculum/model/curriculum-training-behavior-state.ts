import type { CurriculumSyllabus, LevelNumber, StepNumber } from "@/shared/curriculum-data";

import {
  resolveStepWithIndex,
  type CurriculumBehaviorStateKind,
  type CurriculumStepTrainingState,
} from "./curriculum-training-step-state";
import {
  inspectManualStepSelection,
  type ManualStepSelectionInspection,
} from "./training-manual-selection";
import type { TrainingRecommendation, TrainingRecommendationMode } from "./training-recommendation";
import type {
  ActivityIndex,
  BehaviorPageRecord,
  BehaviorStepCandidate,
} from "./training-recommendation-helpers";

interface CurriculumTrainingLaunchAction {
  label: string;
  mode: TrainingRecommendationMode;
  stepId: string;
  stepNumber: StepNumber;
}

interface CurriculumBehaviorTrainingState {
  activeStep: CurriculumStepTrainingState | undefined;
  completedStepCount: number;
  hasHistoricalCompletion: boolean;
  inspection: ManualStepSelectionInspection;
  isEligibleNextOption: boolean;
  isInSelectedPrerequisiteChain: boolean;
  isRecommendedNext: boolean;
  levelNumber: LevelNumber;
  pageSlug: string;
  primaryLaunch: CurriculumTrainingLaunchAction | null;
  secondaryTestLaunch: CurriculumTrainingLaunchAction | null;
  stateKind: CurriculumBehaviorStateKind;
  stateLabel: string;
  steps: readonly CurriculumStepTrainingState[];
  stepsById: ReadonlyMap<string, CurriculumStepTrainingState>;
  title: string;
  totalStepCount: number;
}

function resolveCompletedBehaviorState(steps: readonly CurriculumStepTrainingState[]): {
  stateKind: CurriculumBehaviorStateKind;
  stateLabel: string;
} {
  const hasTestPassed = steps.some((step) => step.stateKind === "test_passed");
  const hasPreviouslyRecorded = steps.some((step) => step.stateKind === "previously_recorded");
  return hasTestPassed && !hasPreviouslyRecorded
    ? { stateKind: "test_passed", stateLabel: "Completed · Passed Cold Test" }
    : { stateKind: "previously_recorded", stateLabel: "Completed · Previously recorded" };
}

function resolveIncompleteBehaviorState(
  steps: readonly CurriculumStepTrainingState[],
  completedStepCount: number,
): { stateKind: CurriculumBehaviorStateKind; stateLabel: string } {
  if (steps.some((step) => step.stateKind === "test_ready")) {
    return { stateKind: "test_ready", stateLabel: "Test ready" };
  }
  if (steps.some((step) => step.stateKind === "cold_test_waiting")) {
    return { stateKind: "cold_test_waiting", stateLabel: "Cold Test waiting" };
  }
  if (completedStepCount > 0 || steps.some((step) => step.stateKind === "in_practice")) {
    return { stateKind: "in_practice", stateLabel: "In practice" };
  }
  return { stateKind: "unfinished", stateLabel: "Unfinished" };
}

function resolveBehaviorStateKindAndLabel(
  steps: readonly CurriculumStepTrainingState[],
  completedStepCount: number,
  hasHistoricalCompletion: boolean,
): { stateKind: CurriculumBehaviorStateKind; stateLabel: string } {
  if (steps.some((step) => step.stateKind === "needs_practice")) {
    return {
      stateKind: "needs_practice",
      stateLabel: hasHistoricalCompletion
        ? "Needs practice · Completion retained"
        : "Needs practice",
    };
  }
  if (hasHistoricalCompletion) {
    return resolveCompletedBehaviorState(steps);
  }
  return resolveIncompleteBehaviorState(steps, completedStepCount);
}

function selectActiveBehaviorStep(
  steps: readonly CurriculumStepTrainingState[],
  recommendation: TrainingRecommendation | null,
  pageSlug: string,
): CurriculumStepTrainingState | undefined {
  const recommendedStep =
    recommendation?.pageSlug === pageSlug
      ? steps.find((step) => step.stepId === recommendation.stepId)
      : undefined;

  return (
    recommendedStep ??
    steps.find((step) => step.stateKind === "needs_practice") ??
    steps.find((step) => !step.isCompleted) ??
    steps[0]
  );
}

function resolveBehaviorLaunchActions(activeStep: CurriculumStepTrainingState | undefined): {
  primaryLaunch: CurriculumTrainingLaunchAction | null;
  secondaryTestLaunch: CurriculumTrainingLaunchAction | null;
} {
  if (activeStep === undefined) {
    return { primaryLaunch: null, secondaryTestLaunch: null };
  }

  const primaryLaunch: CurriculumTrainingLaunchAction = {
    label: `${activeStep.recommendedMode === "test" ? "Test" : "Practice"} Step ${String(activeStep.stepNumber)}`,
    mode: activeStep.recommendedMode,
    stepId: activeStep.stepId,
    stepNumber: activeStep.stepNumber,
  };
  const secondaryTestLaunch: CurriculumTrainingLaunchAction | null =
    activeStep.canTest && primaryLaunch.mode === "practice"
      ? {
          label: `Test Step ${String(activeStep.stepNumber)}`,
          mode: "test",
          stepId: activeStep.stepId,
          stepNumber: activeStep.stepNumber,
        }
      : null;

  return { primaryLaunch, secondaryTestLaunch };
}

function buildBehaviorSteps({
  activityIndex,
  behavior,
  completedStepIds,
  now,
  recommendation,
}: {
  activityIndex: ActivityIndex;
  behavior: BehaviorPageRecord;
  completedStepIds: ReadonlySet<string>;
  now: Date | null;
  recommendation: TrainingRecommendation | null;
}): CurriculumStepTrainingState[] {
  return behavior.steps.map((step: BehaviorStepCandidate) =>
    resolveStepWithIndex({
      activityIndex,
      completedStepIds,
      criterion: step.criterion,
      now,
      recommendation,
      stepId: step.stepId,
      stepLabel: step.stepLabel,
      stepNumber: step.stepNumber,
    }),
  );
}

function resolveBehaviorStatusMeta({
  behavior,
  completedStepIds,
  currentLevelNumber,
  recommendation,
  steps,
  syllabus,
}: {
  behavior: BehaviorPageRecord;
  completedStepIds: ReadonlySet<string>;
  currentLevelNumber: LevelNumber;
  recommendation: TrainingRecommendation | null;
  steps: readonly CurriculumStepTrainingState[];
  syllabus: CurriculumSyllabus;
}) {
  const completedStepCount = steps.filter((step) => step.isCompleted).length;
  const totalStepCount = steps.length;
  const hasHistoricalCompletion = totalStepCount > 0 && completedStepCount === totalStepCount;
  const { stateKind, stateLabel } = resolveBehaviorStateKindAndLabel(
    steps,
    completedStepCount,
    hasHistoricalCompletion,
  );
  const inspection = inspectManualStepSelection({
    completedStepIds,
    currentLevelNumber,
    pageSlug: behavior.pageSlug,
    syllabus,
  });
  const activeStep = selectActiveBehaviorStep(steps, recommendation, behavior.pageSlug);
  const { primaryLaunch, secondaryTestLaunch } = resolveBehaviorLaunchActions(activeStep);

  return {
    activeStep,
    completedStepCount,
    hasHistoricalCompletion,
    inspection,
    isEligibleNextOption:
      behavior.levelNumber === currentLevelNumber &&
      inspection.unmetPrerequisites.length === 0 &&
      (!hasHistoricalCompletion || stateKind === "needs_practice"),
    primaryLaunch,
    secondaryTestLaunch,
    stateKind,
    stateLabel,
    totalStepCount,
  };
}

function resolveSingleBehaviorState({
  activityIndex,
  behavior,
  completedStepIds,
  currentLevelNumber,
  now,
  prerequisiteChain,
  recommendation,
  syllabus,
}: {
  activityIndex: ActivityIndex;
  behavior: BehaviorPageRecord;
  completedStepIds: ReadonlySet<string>;
  currentLevelNumber: LevelNumber;
  now: Date | null;
  prerequisiteChain: ReadonlySet<string>;
  recommendation: TrainingRecommendation | null;
  syllabus: CurriculumSyllabus;
}): CurriculumBehaviorTrainingState {
  const steps = buildBehaviorSteps({
    activityIndex,
    behavior,
    completedStepIds,
    now,
    recommendation,
  });
  const meta = resolveBehaviorStatusMeta({
    behavior,
    completedStepIds,
    currentLevelNumber,
    recommendation,
    steps,
    syllabus,
  });

  return {
    ...meta,
    isInSelectedPrerequisiteChain: prerequisiteChain.has(behavior.pageSlug),
    isRecommendedNext: recommendation?.pageSlug === behavior.pageSlug,
    levelNumber: behavior.levelNumber,
    pageSlug: behavior.pageSlug,
    steps,
    stepsById: new Map(steps.map((step) => [step.stepId, step])),
    title: behavior.title,
  };
}

export {
  resolveSingleBehaviorState,
  type CurriculumBehaviorTrainingState,
  type CurriculumTrainingLaunchAction,
};
