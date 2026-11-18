import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";

import { curriculumSyllabusQueryOptions } from "../api/curriculum-query-options";
import { trainingOverviewQueryOptions } from "../api/recommendation-query-options";
import { PRACTICE_STEP_OPTIONS } from "../model/practice-ladders";
import {
  recommendNextTrainingActivity,
  type TrainingRecommendationMode,
} from "../model/training-recommendation";
import { TrainingStepContent } from "./curriculum-training-step-content";
import { useHydratedNow } from "./use-hydrated-now";

interface CurriculumTrainingPageProps {
  onModeChange?: ((mode?: TrainingRecommendationMode) => void) | undefined;
  onSelectionChange: (stepId?: string, target?: string) => void;
  selectedMode?: TrainingRecommendationMode | undefined;
  selectedStepId: string | undefined;
  selectedTarget: string | undefined;
}

function useTrainingPageResolution({
  requestedStepId,
  selectedMode,
}: {
  requestedStepId: string | undefined;
  selectedMode: TrainingRecommendationMode | undefined;
}) {
  const [excludedStepIds, setExcludedStepIds] = useState<string[]>([]);
  const [preferredMode, setPreferredMode] = useState<TrainingRecommendationMode | undefined>(
    selectedMode,
  );
  const [lockedStepId, setLockedStepId] = useState<string | null>(null);
  const { data: overview } = useSuspenseQuery(trainingOverviewQueryOptions());
  const { data: syllabus } = useSuspenseQuery(curriculumSyllabusQueryOptions());
  const effectiveNow = useHydratedNow();
  const recommendation = recommendNextTrainingActivity({
    excludedStepIds,
    now: effectiveNow,
    overview,
    preferredMode,
    syllabus,
  });
  const requestedStep =
    requestedStepId === undefined
      ? undefined
      : PRACTICE_STEP_OPTIONS.find((step) => step.stepId === requestedStepId);
  const resolvedStepId = lockedStepId ?? requestedStep?.stepId ?? recommendation.stepId;

  return {
    activeStep: PRACTICE_STEP_OPTIONS.find((step) => step.stepId === resolvedStepId),
    completedStepIds: new Set(overview.curriculumProgress.map((item) => item.stepId)),
    excludedCount: excludedStepIds.length,
    isManualOverride: requestedStep !== undefined && requestedStep.stepId !== recommendation.stepId,
    preferredMode,
    recommendation,
    setExcludedStepIds,
    setLockedStepId,
    setPreferredMode,
    syllabus,
  };
}

function CurriculumTrainingPage({
  onModeChange,
  onSelectionChange,
  selectedMode,
  selectedStepId,
  selectedTarget,
}: CurriculumTrainingPageProps) {
  const state = useTrainingPageResolution({ requestedStepId: selectedStepId, selectedMode });
  if (state.activeStep === undefined) {
    return <main className="mx-auto max-w-3xl p-6">Training instructions are unavailable.</main>;
  }

  return (
    <TrainingStepContent
      activeStep={state.activeStep}
      completedStepIds={state.completedStepIds}
      excludedCount={state.excludedCount}
      isManualOverride={state.isManualOverride}
      preferredMode={state.preferredMode}
      recommendation={state.recommendation}
      selectedTarget={selectedTarget}
      syllabus={state.syllabus}
      onChangeMode={(nextMode) => {
        state.setPreferredMode(nextMode);
        if (nextMode === undefined) {
          onModeChange?.();
          return;
        }
        onModeChange?.(nextMode);
      }}
      onExcludeStep={(stepId) => {
        state.setExcludedStepIds((current) =>
          current.includes(stepId) ? current : [...current, stepId],
        );
      }}
      onLockStep={(stepId) => {
        state.setLockedStepId(stepId);
      }}
      onResetExclusions={() => {
        state.setExcludedStepIds([]);
      }}
      onSelectionChange={onSelectionChange}
    />
  );
}

export { CurriculumTrainingPage };
