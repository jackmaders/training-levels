import type { CurriculumSyllabus, LevelNumber } from "@/shared/curriculum-data";

import type { TrainingOverview } from "../api/recommendation-service";
import {
  resolveSingleBehaviorState,
  type CurriculumBehaviorTrainingState,
} from "./curriculum-training-behavior-state";
import { normalizeTrainingOverview } from "./curriculum-training-step-state";
import { getPrerequisiteChain } from "./dependency-relationships";
import {
  getCurrentLevelNumber,
  recommendNextTrainingActivity,
  type TrainingRecommendation,
  type TrainingRecommendationMode,
} from "./training-recommendation";
import {
  buildActivityIndex,
  collectLevelBehaviors,
  type BehaviorPageRecord,
} from "./training-recommendation-helpers";

interface CurriculumTrainingState {
  behaviors: readonly CurriculumBehaviorTrainingState[];
  behaviorsBySlug: ReadonlyMap<string, CurriculumBehaviorTrainingState>;
  currentLevelNumber: LevelNumber;
  recommendation: TrainingRecommendation | null;
}

interface ResolveCurriculumTrainingStateInput {
  completedStepIds?: Iterable<string> | undefined;
  now?: Date | null | undefined;
  overview?: TrainingOverview | undefined;
  selectedPageSlug?: string | null | undefined;
  syllabus: CurriculumSyllabus;
}

function resolveCurriculumRecommendationAndLevel({
  behaviorRecords,
  completedSet,
  normalizedOverview,
  now,
  syllabus,
}: {
  behaviorRecords: readonly BehaviorPageRecord[];
  completedSet: ReadonlySet<string>;
  normalizedOverview: TrainingOverview;
  now: Date | null;
  syllabus: CurriculumSyllabus;
}) {
  const hasAnySteps = behaviorRecords.some((behavior) => behavior.stepIds.length > 0);
  const recommendation = hasAnySteps
    ? recommendNextTrainingActivity({ now, overview: normalizedOverview, syllabus })
    : null;
  const currentLevelNumber =
    recommendation?.currentLevelNumber ?? getCurrentLevelNumber(syllabus, completedSet);
  return { currentLevelNumber, recommendation };
}

function resolveCurriculumTrainingState({
  completedStepIds,
  now = null,
  overview,
  selectedPageSlug,
  syllabus,
}: ResolveCurriculumTrainingStateInput): CurriculumTrainingState {
  const normalizedOverview = normalizeTrainingOverview(overview, completedStepIds);
  const completedSet = new Set(normalizedOverview.curriculumProgress.map((item) => item.stepId));
  const behaviorRecords = collectLevelBehaviors(syllabus);
  const { currentLevelNumber, recommendation } = resolveCurriculumRecommendationAndLevel({
    behaviorRecords,
    completedSet,
    normalizedOverview,
    now,
    syllabus,
  });
  const activityIndex = buildActivityIndex(normalizedOverview);
  const hasSelectedSlug =
    selectedPageSlug !== undefined && selectedPageSlug !== null && selectedPageSlug !== "";
  const prerequisiteChain = new Set(hasSelectedSlug ? getPrerequisiteChain(selectedPageSlug) : []);
  const behaviors = behaviorRecords.map((behavior) =>
    resolveSingleBehaviorState({
      activityIndex,
      behavior,
      completedStepIds: completedSet,
      currentLevelNumber,
      now,
      prerequisiteChain,
      recommendation,
      syllabus,
    }),
  );

  return {
    behaviors,
    behaviorsBySlug: new Map(behaviors.map((behavior) => [behavior.pageSlug, behavior])),
    currentLevelNumber,
    recommendation,
  };
}

function toTrainingLaunchSearch(
  stepId: string,
  mode: TrainingRecommendationMode,
): { mode?: TrainingRecommendationMode; stepId: string } {
  return mode === "practice" ? { stepId } : { mode, stepId };
}

export {
  type CurriculumBehaviorTrainingState,
  type CurriculumTrainingLaunchAction,
} from "./curriculum-training-behavior-state";
export {
  EMPTY_TRAINING_OVERVIEW,
  normalizeTrainingOverview,
  resolveCurriculumStepTrainingState,
  type CurriculumBehaviorStateKind,
  type CurriculumStepStateKind,
  type CurriculumStepTrainingState,
  type ResolveCurriculumStepTrainingStateInput,
} from "./curriculum-training-step-state";
export {
  resolveCurriculumTrainingState,
  toTrainingLaunchSearch,
  type CurriculumTrainingState,
  type ResolveCurriculumTrainingStateInput,
};
