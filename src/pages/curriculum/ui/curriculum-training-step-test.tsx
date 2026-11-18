import { useSuspenseQuery } from "@tanstack/react-query";
import type { ReactElement } from "react";

import type { BehaviorStep } from "@/shared/curriculum-data";

import { curriculumPageQueryOptions } from "../api/curriculum-query-options";
import { stepTestHistoryQueryOptions } from "../api/training-query-options";
import type { TrainingRecommendationMode } from "../model/training-recommendation";
import {
  CurriculumTrainingTestOffer,
  TrainingTest,
  type StepTestActions,
} from "./curriculum-training-test-views";
import type { PracticeDecision, PracticeRecord } from "./curriculum-training-views";
import { useStepTestActions } from "./use-step-test-actions";

const NOT_FOUND_INDEX = -1;

function extractPageSlug(stepId: string): string {
  const separatorIndex = stepId.indexOf(":");
  return separatorIndex === NOT_FOUND_INDEX ? stepId : stepId.slice(0, separatorIndex);
}

function hasColdTest(step: BehaviorStep | undefined): step is BehaviorStep {
  return (step?.tryItCold?.length ?? 0) > 0;
}

function useTestedStep(stepId: string): BehaviorStep | undefined {
  const { data: curriculumPage } = useSuspenseQuery(
    curriculumPageQueryOptions(extractPageSlug(stepId)),
  );
  return curriculumPage?.kind === "behavior"
    ? curriculumPage.steps.find((candidate) => candidate.stepId === stepId)
    : undefined;
}

function StepTestOfferContent({
  blockedByOverride,
  decision,
  history,
  onStartTest,
  recommendedMode,
  step,
  totals,
}: {
  blockedByOverride?: boolean | undefined;
  decision: PracticeDecision | null;
  history: readonly PracticeRecord[];
  onStartTest: (coldOverride: boolean) => void;
  recommendedMode?: TrainingRecommendationMode | undefined;
  step: BehaviorStep;
  totals: readonly { createdAt: Date }[];
}) {
  const { data: testHistory } = useSuspenseQuery(stepTestHistoryQueryOptions(step.stepId));
  const practiceDates = [
    ...history.filter((attempt) => attempt.undoneAt === null).map(({ createdAt }) => createdAt),
    ...totals.map(({ createdAt }) => createdAt),
  ];

  return (
    <CurriculumTrainingTestOffer
      blockedByOverride={blockedByOverride}
      decision={decision}
      onStartTest={onStartTest}
      practiceDates={practiceDates}
      recommendedMode={recommendedMode}
      step={step}
      testHistory={testHistory}
    />
  );
}

function CurriculumTrainingStepTestOffer({
  blockedByOverride,
  decision,
  history,
  onStartTest,
  recommendedMode,
  stepId,
  totals,
}: {
  blockedByOverride?: boolean | undefined;
  decision: PracticeDecision | null;
  history: readonly PracticeRecord[];
  onStartTest: (coldOverride: boolean) => void;
  recommendedMode?: TrainingRecommendationMode | undefined;
  stepId: string;
  totals: readonly { createdAt: Date }[];
}) {
  const step = useTestedStep(stepId);
  if (!hasColdTest(step)) {
    return null;
  }

  return (
    <StepTestOfferContent
      blockedByOverride={blockedByOverride}
      decision={decision}
      history={history}
      onStartTest={onStartTest}
      recommendedMode={recommendedMode}
      step={step}
      totals={totals}
    />
  );
}

function StepTestContent({
  actions,
  coldOverride,
  step,
}: {
  actions: StepTestActions;
  coldOverride: boolean;
  step: BehaviorStep;
}) {
  const { data: testHistory } = useSuspenseQuery(stepTestHistoryQueryOptions(step.stepId));

  return (
    <TrainingTest actions={actions} coldOverride={coldOverride} history={testHistory} step={step} />
  );
}

function CurriculumTrainingStepTest({
  coldOverride,
  stepId,
}: {
  coldOverride: boolean;
  stepId: string;
}) {
  const step = useTestedStep(stepId);
  const actions = useStepTestActions(stepId);
  if (!hasColdTest(step)) {
    return <p>Cold Test instructions are unavailable.</p>;
  }

  return <StepTestContent actions={actions} coldOverride={coldOverride} step={step} />;
}

function CurriculumTrainingTestGate({
  active,
  children,
  coldOverride,
  stepId,
}: {
  active: boolean;
  children: ReactElement;
  coldOverride: boolean;
  stepId: string;
}): ReactElement {
  return active ? (
    <CurriculumTrainingStepTest coldOverride={coldOverride} stepId={stepId} />
  ) : (
    children
  );
}

export { CurriculumTrainingStepTestOffer, CurriculumTrainingTestGate };
