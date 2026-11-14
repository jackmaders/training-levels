import { useMutation, useQueryClient, type UseMutationOptions } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { stepProgressQueryOptions } from "./curriculum-query-options";
import type { ToggleStepInput } from "./curriculum-schema";
import type { ToggleStepResult } from "./curriculum-service";
import { toggleStepFn } from "./curriculum.functions";

interface ToggleStepContext {
  operationId: number;
  operation: StepOperation;
  state: StepOperationState;
}

interface StepOperation {
  completed: boolean;
  status: "pending" | "succeeded";
}

interface StepOperationState {
  baseCompleted: boolean;
  operations: Map<number, StepOperation>;
}

interface ProgressOperationRegistry {
  byStep: Map<string, StepOperationState>;
  nextOperationId: number;
}

interface StepOperationSettlement {
  operationId: number;
  operation: StepOperation;
  state: StepOperationState;
  stepId: string;
  succeeded: boolean;
}

interface ProgressQueryCache {
  operationRegistry: ProgressOperationRegistry;
  queryClient: ReturnType<typeof useQueryClient>;
  queryKey: readonly unknown[];
}

const toggleStepMutationKey = ["curriculum", "toggle-step"] as const;
const progressOperationRegistries = new WeakMap<object, ProgressOperationRegistry>();

function useToggleStep() {
  const queryClient = useQueryClient();
  const operationRegistry = getProgressOperationRegistry(queryClient);
  const progressCache = {
    operationRegistry,
    queryClient,
    queryKey: stepProgressQueryOptions().queryKey,
  };
  const toggleStep = useServerFn(toggleStepFn);
  const settlementCallbacks = createSettlementCallbacks(progressCache);

  return useMutation({
    mutationFn: async (data: ToggleStepInput) => await toggleStep({ data }),
    mutationKey: toggleStepMutationKey,
    onMutate: async (variables): Promise<ToggleStepContext> => {
      const context = beginStepOperation(
        operationRegistry,
        variables,
        queryClient.getQueryData<string[]>(progressCache.queryKey) ?? [],
      );

      try {
        await queryClient.cancelQueries({ queryKey: progressCache.queryKey });
      } catch (error) {
        removeStepOperation(operationRegistry, variables.stepId, context);
        throw error;
      }

      queryClient.setQueryData<string[]>(progressCache.queryKey, (current) =>
        applyOptimisticStepToggle(current, variables),
      );

      return context;
    },
    ...settlementCallbacks,
  });
}

function createSettlementCallbacks(
  cache: ProgressQueryCache,
): Pick<
  UseMutationOptions<ToggleStepResult, Error, ToggleStepInput, ToggleStepContext>,
  "onError" | "onSettled" | "onSuccess"
> {
  return {
    onError: (_error, variables, context) => {
      if (context !== undefined) {
        settleStepOperation({
          operation: context.operation,
          operationId: context.operationId,
          state: context.state,
          stepId: variables.stepId,
          succeeded: false,
        });
        syncStepCompletion(cache, context.state, variables.stepId);
      }
    },
    onSettled: async () => {
      if (cache.queryClient.isMutating({ mutationKey: toggleStepMutationKey }) === 1) {
        await cache.queryClient.invalidateQueries({ queryKey: cache.queryKey });
      }
    },
    onSuccess: (_result, variables, context) => {
      settleStepOperation({
        operation: context.operation,
        operationId: context.operationId,
        state: context.state,
        stepId: variables.stepId,
        succeeded: true,
      });
      syncStepCompletion(cache, context.state, variables.stepId);
    },
  };
}

function getProgressOperationRegistry(queryClient: object): ProgressOperationRegistry {
  const existingRegistry = progressOperationRegistries.get(queryClient);

  if (existingRegistry !== undefined) {
    return existingRegistry;
  }

  const registry = { byStep: new Map<string, StepOperationState>(), nextOperationId: 0 };
  progressOperationRegistries.set(queryClient, registry);
  return registry;
}

function beginStepOperation(
  registry: ProgressOperationRegistry,
  input: ToggleStepInput,
  currentStepIds: readonly string[],
): ToggleStepContext {
  registry.nextOperationId += 1;
  const operationId = registry.nextOperationId;
  const stepState = registry.byStep.get(input.stepId) ?? {
    baseCompleted: currentStepIds.includes(input.stepId),
    operations: new Map<number, StepOperation>(),
  };

  const operation = { completed: input.completed, status: "pending" as const };
  stepState.operations.set(operationId, operation);
  registry.byStep.set(input.stepId, stepState);
  return { operation, operationId, state: stepState };
}

function removeStepOperation(
  registry: ProgressOperationRegistry,
  stepId: string,
  context: ToggleStepContext,
): void {
  settleStepOperation({ ...context, stepId, succeeded: false });

  if (context.state.operations.size === 0) {
    registry.byStep.delete(stepId);
  }
}

function settleStepOperation(settlement: StepOperationSettlement): void {
  updateStepOperation(settlement);

  if (hasPendingStepOperations(settlement.state)) {
    return;
  }

  finalizeStepOperations(settlement.state);
}

function updateStepOperation(settlement: StepOperationSettlement): void {
  const { operation, state: stepState } = settlement;
  if (settlement.succeeded) {
    operation.status = "succeeded";
  } else {
    stepState.operations.delete(settlement.operationId);
  }
}

function hasPendingStepOperations(stepState: StepOperationState): boolean {
  return [...stepState.operations.values()].some(({ status }) => status === "pending");
}

function finalizeStepOperations(stepState: StepOperationState): void {
  const latestOperation = [...stepState.operations.values()].pop();
  stepState.baseCompleted = latestOperation?.completed ?? stepState.baseCompleted;
  stepState.operations.clear();
}

function syncStepCompletion(
  cache: ProgressQueryCache,
  stepState: StepOperationState,
  stepId: string,
): void {
  const latestOperation = [...stepState.operations.values()].pop();
  const completed = latestOperation?.completed ?? stepState.baseCompleted;

  cache.queryClient.setQueryData<string[]>(cache.queryKey, (current) => {
    const stepIds = current ?? [];
    if (completed) {
      return stepIds.includes(stepId) ? [...stepIds] : [...stepIds, stepId];
    }

    return stepIds.filter((currentStepId) => currentStepId !== stepId);
  });

  if (stepState.operations.size === 0) {
    cache.operationRegistry.byStep.delete(stepId);
  }
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
