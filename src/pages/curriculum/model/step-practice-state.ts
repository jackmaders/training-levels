import type { BehaviorCurriculumPage, CurriculumSyllabus } from "@/shared/curriculum-data";

import { getPracticeGuidance, type PracticeGuidance } from "./practice-guidance";
import {
  getPracticePlan,
  hasPracticeLadder,
  type PRACTICE_STEP_OPTIONS,
  type PracticePlan,
} from "./practice-ladders";
import {
  countTrailingSuccesses,
  getPracticeProgression,
  type PracticeProgression,
} from "./practice-progression";
import {
  getTrainingFallbackGuidance,
  inspectManualStepSelection,
  type TrainingRecommendation,
} from "./training-recommendation";

const LAST_ITEM_INDEX = -1;
type PracticeStepOption = (typeof PRACTICE_STEP_OPTIONS)[number];

interface StepPracticeAttempt {
  outcome: "success" | "not_yet";
  target: string;
  undoneAt: Date | null;
}

function selectPracticeTarget({
  fallbackTarget,
  guidance,
  plan,
  progression,
  selectedTarget,
}: {
  fallbackTarget: string;
  guidance: PracticeGuidance | null;
  plan: PracticePlan | null;
  progression: PracticeProgression | null;
  selectedTarget: string | undefined;
}): string {
  const options =
    plan?.targetOptions.map((option) => option.label) ?? guidance?.targetOptions ?? [];
  if (selectedTarget !== undefined && options.includes(selectedTarget)) {
    return selectedTarget;
  }
  if (plan !== null) {
    return plan.target;
  }
  if (guidance !== null && guidance.targetOptions.length > 0) {
    return guidance.target;
  }
  return progression?.nextTarget ?? guidance?.target ?? fallbackTarget;
}

function deriveStepPracticeState({
  activeStep,
  curriculumPage,
  history,
  selectedTarget,
}: {
  activeStep: PracticeStepOption;
  curriculumPage: BehaviorCurriculumPage | null;
  history: readonly StepPracticeAttempt[];
  selectedTarget: string | undefined;
}) {
  const currentStep = curriculumPage?.steps.find((step) => step.stepId === activeStep.stepId);
  const fallbackSummary = getTrainingFallbackGuidance(currentStep, activeStep.label);
  const activeAttempts = history.filter((attempt) => attempt.undoneAt === null);
  const plan = hasPracticeLadder(activeStep.stepId)
    ? getPracticePlan(activeStep.stepId, activeAttempts)
    : null;
  const lastOutcome = activeAttempts.at(LAST_ITEM_INDEX)?.outcome;
  const progression = getPracticeProgression(activeStep.stepId, {
    consecutiveSuccesses: countTrailingSuccesses(activeAttempts),
    ...(lastOutcome === undefined ? {} : { lastOutcome }),
  });
  const guidance = getPracticeGuidance(
    activeStep.stepId,
    currentStep?.heading ?? activeStep.label,
    activeAttempts.map((attempt) => ({ outcome: attempt.outcome, target: attempt.target })),
  );
  const target = selectPracticeTarget({
    fallbackTarget: fallbackSummary,
    guidance,
    plan,
    progression,
    selectedTarget,
  });
  return { fallbackSummary, guidance, plan, progression, target };
}

function resolveStepSelectionInspection({
  activeStep,
  completedStepIds,
  recommendation,
  syllabus,
}: {
  activeStep: PracticeStepOption;
  completedStepIds: ReadonlySet<string>;
  recommendation: TrainingRecommendation;
  syllabus: CurriculumSyllabus;
}) {
  if (activeStep.stepId === recommendation.stepId && recommendation.fallbackMode === "none") {
    return null;
  }
  return inspectManualStepSelection({
    completedStepIds,
    currentLevelNumber: recommendation.currentLevelNumber,
    pageSlug: activeStep.pageSlug,
    syllabus,
  });
}

export { deriveStepPracticeState, resolveStepSelectionInspection };
export type { PracticeStepOption };
