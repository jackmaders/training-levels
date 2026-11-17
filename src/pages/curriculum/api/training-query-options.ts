import { queryOptions } from "@tanstack/react-query";

import { getPracticeHistoryFn } from "./training.functions";

const PRACTICE_STEP_ID = "level-1/zen:step-1";

function practiceHistoryQueryOptions(stepId = PRACTICE_STEP_ID) {
  return queryOptions({
    queryFn: () => getPracticeHistoryFn({ data: { stepId } }),
    queryKey: ["training", "practice-history", stepId],
  });
}

export { PRACTICE_STEP_ID, practiceHistoryQueryOptions };
