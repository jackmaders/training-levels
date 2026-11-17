import { queryOptions } from "@tanstack/react-query";

import {
  getPracticeHistoryFn,
  getPracticeStepDecisionFn,
  getPracticeTotalsFn,
} from "./training.functions";

const PRACTICE_STEP_ID = "level-1/zen:step-1";

function practiceHistoryQueryOptions(stepId = PRACTICE_STEP_ID) {
  return queryOptions({
    queryFn: () => getPracticeHistoryFn({ data: { stepId } }),
    queryKey: ["training", "practice-history", stepId],
  });
}

function practiceTotalsQueryOptions(stepId = PRACTICE_STEP_ID) {
  return queryOptions({
    queryFn: () => getPracticeTotalsFn({ data: { stepId } }),
    queryKey: ["training", "practice-totals", stepId],
  });
}

function practiceStepDecisionQueryOptions(stepId = PRACTICE_STEP_ID) {
  return queryOptions({
    queryFn: () => getPracticeStepDecisionFn({ data: { stepId } }),
    queryKey: ["training", "practice-step-decision", stepId],
  });
}

export {
  PRACTICE_STEP_ID,
  practiceHistoryQueryOptions,
  practiceStepDecisionQueryOptions,
  practiceTotalsQueryOptions,
};
