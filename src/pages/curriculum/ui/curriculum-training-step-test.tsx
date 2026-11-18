import { useSuspenseQuery } from "@tanstack/react-query";
import type { ReactElement } from "react";

import type { BehaviorStep } from "@/shared/curriculum-data";

import { curriculumPageQueryOptions } from "../api/curriculum-query-options";
import { PRACTICE_STEP_ID, stepTestHistoryQueryOptions } from "../api/training-query-options";
import { CurriculumTrainingTestOffer, TrainingTest } from "./curriculum-training-test-views";
import type { PracticeDecision, PracticeRecord } from "./curriculum-training-views";
import { useStepTestActions } from "./use-step-test-actions";

const TESTED_PAGE_SLUG = "level-1/zen";

function useTestedStep(): BehaviorStep | undefined {
  const { data: curriculumPage } = useSuspenseQuery(curriculumPageQueryOptions(TESTED_PAGE_SLUG));
  return curriculumPage?.kind === "behavior"
    ? curriculumPage.steps.find((candidate) => candidate.stepId === PRACTICE_STEP_ID)
    : undefined;
}

function CurriculumTrainingStepTestOffer({
  decision,
  history,
  onStartTest,
  stepId,
  totals,
}: {
  decision: PracticeDecision | null;
  history: readonly PracticeRecord[];
  onStartTest: (coldOverride: boolean) => void;
  stepId: string;
  totals: readonly { createdAt: Date }[];
}) {
  const { data: testHistory } = useSuspenseQuery(stepTestHistoryQueryOptions());
  const step = useTestedStep();
  if (step === undefined || stepId !== PRACTICE_STEP_ID) {
    return null;
  }
  const practiceDates = [
    ...history.filter((attempt) => attempt.undoneAt === null).map(({ createdAt }) => createdAt),
    ...totals.map(({ createdAt }) => createdAt),
  ];

  return (
    <CurriculumTrainingTestOffer
      decision={decision}
      onStartTest={onStartTest}
      practiceDates={practiceDates}
      step={step}
      testHistory={testHistory}
    />
  );
}

function CurriculumTrainingStepTest({ coldOverride }: { coldOverride: boolean }) {
  const { data: testHistory } = useSuspenseQuery(stepTestHistoryQueryOptions());
  const step = useTestedStep();
  const actions = useStepTestActions();
  if (step === undefined) {
    return <p>Cold Test instructions are unavailable.</p>;
  }

  return (
    <TrainingTest actions={actions} coldOverride={coldOverride} history={testHistory} step={step} />
  );
}

function CurriculumTrainingTestGate({
  active,
  children,
  coldOverride,
}: {
  active: boolean;
  children: ReactElement;
  coldOverride: boolean;
}): ReactElement {
  return active ? <CurriculumTrainingStepTest coldOverride={coldOverride} /> : children;
}

export { CurriculumTrainingStepTestOffer, CurriculumTrainingTestGate };
