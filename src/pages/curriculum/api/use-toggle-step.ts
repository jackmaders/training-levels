import { useMutation, useQueryClient, type UseMutationOptions } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { stepProgressQueryOptions } from "./curriculum-query-options";
import type { ToggleStepInput } from "./curriculum-schema";
import type { ToggleStepResult } from "./curriculum-service";
import { toggleStepFn } from "./curriculum.functions";

interface ToggleStepContext {
  previousStepIds: string[] | undefined;
}

function useToggleStep() {
  const queryClient = useQueryClient();
  const toggleStep = useServerFn(toggleStepFn);
  const progressQueryKey = stepProgressQueryOptions().queryKey;
  const settlementCallbacks: Pick<
    UseMutationOptions<ToggleStepResult, Error, ToggleStepInput, ToggleStepContext>,
    "onError" | "onSettled"
  > = {
    onError: (_error, _variables, context) => {
      if (context !== undefined) {
        queryClient.setQueryData<string[]>(progressQueryKey, context.previousStepIds);
      }
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: progressQueryKey });
    },
  };

  return useMutation({
    mutationFn: async (data: ToggleStepInput) => await toggleStep({ data }),
    onMutate: async (variables): Promise<ToggleStepContext> => {
      await queryClient.cancelQueries({ queryKey: progressQueryKey });
      const previousStepIds = queryClient.getQueryData<string[]>(progressQueryKey);

      queryClient.setQueryData<string[]>(progressQueryKey, (current) =>
        applyOptimisticStepToggle(current, variables),
      );

      return { previousStepIds };
    },
    ...settlementCallbacks,
  });
}

function applyOptimisticStepToggle(
  previousSteps: readonly string[] | undefined,
  input: ToggleStepInput,
): string[] {
  const currentSteps = previousSteps ?? [];

  if (!input.completed) {
    return currentSteps.filter((stepId) => stepId !== input.stepId);
  }

  if (currentSteps.includes(input.stepId)) {
    return [...currentSteps];
  }

  return [...currentSteps, input.stepId];
}

export { useToggleStep };
