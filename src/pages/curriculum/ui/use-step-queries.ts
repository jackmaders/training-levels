import { useSuspenseQuery } from "@tanstack/react-query";

import { curriculumPageQueryOptions } from "../api/curriculum-query-options";
import {
  practiceHistoryQueryOptions,
  practiceStepDecisionQueryOptions,
  practiceTotalsQueryOptions,
} from "../api/training-query-options";
import type { PracticeStepOption } from "../model/step-practice-state";

function useStepQueries(activeStep: PracticeStepOption) {
  const { data: history } = useSuspenseQuery(practiceHistoryQueryOptions(activeStep.stepId));
  const { data: totals } = useSuspenseQuery(practiceTotalsQueryOptions(activeStep.stepId));
  const { data: decisionRecord } = useSuspenseQuery(
    practiceStepDecisionQueryOptions(activeStep.stepId),
  );
  const { data: curriculumPage } = useSuspenseQuery(
    curriculumPageQueryOptions(activeStep.pageSlug),
  );
  return {
    behaviorPage: curriculumPage?.kind === "behavior" ? curriculumPage : null,
    decision: decisionRecord?.decision ?? null,
    history,
    totals,
  };
}

export { useStepQueries };
