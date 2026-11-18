import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { stepProgressQueryOptions } from "../api/curriculum-query-options";
import { PRACTICE_STEP_ID, stepTestHistoryQueryOptions } from "../api/training-query-options";
import { recordStepTestFn } from "../api/training.functions";
import type { StepTestActions } from "./curriculum-training-test-views";
import type { Outcome } from "./curriculum-training-views";

function useStepTestActions(): StepTestActions {
  const queryClient = useQueryClient();
  const recordTest = useServerFn(recordStepTestFn);
  const mutation = useMutation({
    mutationFn: async ({ outcome, coldOverride }: { outcome: Outcome; coldOverride: boolean }) =>
      await recordTest({
        data: {
          coldOverride,
          outcome,
          stepId: PRACTICE_STEP_ID,
          testId: crypto.randomUUID(),
        },
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: stepTestHistoryQueryOptions().queryKey });
      await queryClient.invalidateQueries({ queryKey: stepProgressQueryOptions().queryKey });
    },
  });

  return {
    errorMessage: mutation.error?.message ?? null,
    record: (outcome, coldOverride) => {
      mutation.mutate({ coldOverride, outcome });
    },
    saving: mutation.isPending,
  };
}

export { useStepTestActions };
