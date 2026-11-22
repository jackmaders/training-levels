import type { StepNumber } from "@/shared/curriculum-data";

import type { TrainingOverview, TrainingOverviewCompletion } from "../api/recommendation-service";
import { resolveStepProvenance, type StepProvenance } from "./step-provenance";
import { canTestToday } from "./test-eligibility";
import {
  isStepTestable,
  type TrainingRecommendation,
  type TrainingRecommendationMode,
} from "./training-recommendation";
import {
  buildActivityIndex,
  getStepActivityDates,
  getTestReadinessSource,
  type ActivityIndex,
} from "./training-recommendation-helpers";

const EPOCH_MS = 0;
const LAST_INDEX = -1;

type CurriculumStepStateKind =
  | "unfinished"
  | "in_practice"
  | "cold_test_waiting"
  | "test_ready"
  | "previously_recorded"
  | "test_passed"
  | "needs_practice";

type CurriculumBehaviorStateKind = CurriculumStepStateKind;

interface CurriculumStepTrainingState {
  canTest: boolean;
  hasHistoricalCompletion: boolean;
  isCompleted: boolean;
  isRecommendedNext: boolean;
  provenance: StepProvenance;
  recommendedMode: TrainingRecommendationMode;
  stateKind: CurriculumStepStateKind;
  stateLabel: string;
  stepId: string;
  stepLabel: string;
  stepNumber: StepNumber;
}

interface ResolveCurriculumStepTrainingStateInput {
  completedStepIds?: Iterable<string> | undefined;
  criterion: string;
  now?: Date | null | undefined;
  overview?: TrainingOverview | undefined;
  recommendation?: Pick<TrainingRecommendation, "mode" | "stepId"> | null | undefined;
  stepId: string;
  stepLabel?: string | undefined;
  stepNumber: StepNumber;
}

const EMPTY_TRAINING_OVERVIEW: TrainingOverview = {
  activeDog: null,
  curriculumProgress: [],
  practiceAttempts: [],
  practiceTotals: [],
  stepDecisions: [],
  stepTests: [],
};

function normalizeTrainingOverview(
  overview: TrainingOverview | undefined,
  completedStepIds?: Iterable<string>,
): TrainingOverview {
  const base = overview ?? EMPTY_TRAINING_OVERVIEW;
  if (completedStepIds === undefined) {
    return base;
  }

  const existingStepIds = new Set(base.curriculumProgress.map((item) => item.stepId));
  const missingCompletions: TrainingOverviewCompletion[] = [];
  for (const stepId of completedStepIds) {
    if (!existingStepIds.has(stepId)) {
      existingStepIds.add(stepId);
      missingCompletions.push({ completedAt: new Date(EPOCH_MS), stepId });
    }
  }

  return missingCompletions.length === 0
    ? base
    : {
        ...base,
        curriculumProgress: [...base.curriculumProgress, ...missingCompletions],
      };
}

function resolveProvenanceStateKindAndLabel(
  provenance: StepProvenance,
  hasHistoricalCompletion: boolean,
): { stateKind: CurriculumStepStateKind; stateLabel: string } | null {
  if (provenance === "needs_practice") {
    return {
      stateKind: "needs_practice",
      stateLabel: hasHistoricalCompletion
        ? "Needs practice (Previously recorded)"
        : "Needs practice",
    };
  }
  if (provenance === "test_passed") {
    return { stateKind: "test_passed", stateLabel: "Passed Cold Test" };
  }
  if (provenance === "previously_recorded") {
    return { stateKind: "previously_recorded", stateLabel: "Previously recorded" };
  }
  return null;
}

function hasStepPracticeActivity(activityIndex: ActivityIndex, stepId: string): boolean {
  return (
    (activityIndex.activeAttempts.get(stepId)?.length ?? 0) > 0 ||
    (activityIndex.totals.get(stepId)?.length ?? 0) > 0 ||
    (activityIndex.decisions.get(stepId)?.length ?? 0) > 0
  );
}

function resolveStepStateKindAndLabel({
  activityIndex,
  canTest,
  criterion,
  isCompleted,
  now,
  stepId,
}: {
  activityIndex: ActivityIndex;
  canTest: boolean;
  criterion: string;
  isCompleted: boolean;
  now: Date | null;
  stepId: string;
}): {
  hasHistoricalCompletion: boolean;
  provenance: StepProvenance;
  stateKind: CurriculumStepStateKind;
  stateLabel: string;
} {
  const latestTestOutcome = activityIndex.tests.get(stepId)?.at(LAST_INDEX)?.outcome ?? null;
  const { hasHistoricalCompletion, provenance } = resolveStepProvenance({
    isCompleted,
    latestTestOutcome,
  });
  const provenanceState = resolveProvenanceStateKindAndLabel(provenance, hasHistoricalCompletion);
  if (provenanceState !== null) {
    return { hasHistoricalCompletion, provenance, ...provenanceState };
  }

  const readinessSource = canTest ? getTestReadinessSource(stepId, criterion, activityIndex) : null;
  if (readinessSource !== null) {
    const isColdEligible =
      now !== null && canTestToday(getStepActivityDates(activityIndex, stepId), now);
    return isColdEligible
      ? { hasHistoricalCompletion, provenance, stateKind: "test_ready", stateLabel: "Test ready" }
      : {
          hasHistoricalCompletion,
          provenance,
          stateKind: "cold_test_waiting",
          stateLabel: "Cold Test waiting",
        };
  }

  return hasStepPracticeActivity(activityIndex, stepId)
    ? { hasHistoricalCompletion, provenance, stateKind: "in_practice", stateLabel: "In practice" }
    : { hasHistoricalCompletion, provenance, stateKind: "unfinished", stateLabel: "Unfinished" };
}

function resolveStepWithIndex({
  activityIndex,
  completedStepIds,
  criterion,
  now,
  recommendation,
  stepId,
  stepLabel,
  stepNumber,
}: {
  activityIndex: ActivityIndex;
  completedStepIds: ReadonlySet<string>;
  criterion: string;
  now: Date | null;
  recommendation: Pick<TrainingRecommendation, "mode" | "stepId"> | null;
  stepId: string;
  stepLabel: string;
  stepNumber: StepNumber;
}): CurriculumStepTrainingState {
  const isCompleted = completedStepIds.has(stepId);
  const canTest = isStepTestable(stepId);
  const resolved = resolveStepStateKindAndLabel({
    activityIndex,
    canTest,
    criterion,
    isCompleted,
    now,
    stepId,
  });
  const isRecommendedNext = recommendation?.stepId === stepId;
  const isRecommendedTest = recommendation?.stepId === stepId && recommendation.mode === "test";
  const recommendedMode: TrainingRecommendationMode =
    canTest && (resolved.stateKind === "test_ready" || isRecommendedTest) ? "test" : "practice";

  return {
    canTest,
    hasHistoricalCompletion: resolved.hasHistoricalCompletion,
    isCompleted,
    isRecommendedNext,
    provenance: resolved.provenance,
    recommendedMode,
    stateKind: resolved.stateKind,
    stateLabel: resolved.stateLabel,
    stepId,
    stepLabel,
    stepNumber,
  };
}

function resolveCurriculumStepTrainingState({
  completedStepIds,
  criterion,
  now = null,
  overview,
  recommendation = null,
  stepId,
  stepLabel,
  stepNumber,
}: ResolveCurriculumStepTrainingStateInput): CurriculumStepTrainingState {
  const normalizedOverview = normalizeTrainingOverview(overview, completedStepIds);
  const completedSet = new Set(normalizedOverview.curriculumProgress.map((item) => item.stepId));

  return resolveStepWithIndex({
    activityIndex: buildActivityIndex(normalizedOverview),
    completedStepIds: completedSet,
    criterion,
    now,
    recommendation,
    stepId,
    stepLabel: stepLabel ?? `Step ${String(stepNumber)}`,
    stepNumber,
  });
}

export {
  EMPTY_TRAINING_OVERVIEW,
  normalizeTrainingOverview,
  resolveCurriculumStepTrainingState,
  resolveStepWithIndex,
  type CurriculumBehaviorStateKind,
  type CurriculumStepStateKind,
  type CurriculumStepTrainingState,
  type ResolveCurriculumStepTrainingStateInput,
};
