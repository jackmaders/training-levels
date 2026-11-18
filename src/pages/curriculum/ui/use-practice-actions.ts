import { useMutation, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState, type Dispatch, type SetStateAction } from "react";

import { trainingOverviewQueryOptions } from "../api/recommendation-query-options";
import {
  practiceHistoryQueryOptions,
  practiceStepDecisionQueryOptions,
  practiceTotalsQueryOptions,
} from "../api/training-query-options";
import {
  correctPracticeAttemptFn,
  correctPracticeTotalsFn,
  recordPracticeAttemptFn,
  recordPracticeTotalsFn,
  savePracticeStepDecisionFn,
  undoPracticeAttemptFn,
} from "../api/training.functions";
import type { Outcome, PracticeActions, PracticeRecord } from "./curriculum-training-views";

interface PendingAttempt {
  attemptId: string;
  outcome: Outcome;
  target: string;
}

function createAttemptMutationCallbacks({
  queryClient,
  setErrorMessage,
  setPendingAttempt,
  stepId,
}: {
  queryClient: QueryClient;
  setErrorMessage: Dispatch<SetStateAction<string | null>>;
  setPendingAttempt: Dispatch<SetStateAction<PendingAttempt | null>>;
  stepId: string;
}) {
  return {
    onError: (error: Error) => {
      setErrorMessage(error.message);
    },
    onSuccess: async () => {
      setPendingAttempt(null);
      setErrorMessage(null);
      await queryClient.invalidateQueries({
        queryKey: practiceHistoryQueryOptions(stepId).queryKey,
      });
      await queryClient.invalidateQueries({
        queryKey: practiceTotalsQueryOptions(stepId).queryKey,
      });
      await queryClient.invalidateQueries({
        queryKey: practiceStepDecisionQueryOptions(stepId).queryKey,
      });
      await queryClient.invalidateQueries({
        queryKey: trainingOverviewQueryOptions().queryKey,
      });
    },
  };
}

function createPracticeProgressCallbacks(queryClient: QueryClient, stepId: string) {
  return {
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: practiceTotalsQueryOptions(stepId).queryKey,
      });
      await queryClient.invalidateQueries({
        queryKey: practiceStepDecisionQueryOptions(stepId).queryKey,
      });
      await queryClient.invalidateQueries({
        queryKey: trainingOverviewQueryOptions().queryKey,
      });
    },
  };
}

function useAttemptMutations(
  stepId: string,
  callbacks: ReturnType<typeof createAttemptMutationCallbacks>,
) {
  const correctAttempt = useServerFn(correctPracticeAttemptFn);
  const recordAttempt = useServerFn(recordPracticeAttemptFn);
  const undoAttempt = useServerFn(undoPracticeAttemptFn);

  return {
    correctMutation: useMutation({
      mutationFn: async ({ attemptId, outcome }: { attemptId: string; outcome: Outcome }) =>
        await correctAttempt({ data: { attemptId, outcome } }),
      ...callbacks,
    }),
    recordMutation: useMutation({
      mutationFn: async ({ attemptId, outcome, target }: PendingAttempt) =>
        await recordAttempt({ data: { attemptId, outcome, stepId, target } }),
      ...callbacks,
    }),
    undoMutation: useMutation({
      mutationFn: async (attemptId: string) => await undoAttempt({ data: { attemptId } }),
      ...callbacks,
    }),
  };
}

function usePracticeAttemptActions(stepId: string) {
  const queryClient = useQueryClient();
  const [pendingAttempt, setPendingAttempt] = useState<PendingAttempt | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const callbacks = createAttemptMutationCallbacks({
    queryClient,
    setErrorMessage,
    setPendingAttempt,
    stepId,
  });
  const { correctMutation, recordMutation, undoMutation } = useAttemptMutations(stepId, callbacks);

  return {
    correct: (attempt: PracticeRecord) => {
      correctMutation.mutate({
        attemptId: attempt.attemptId,
        outcome: attempt.outcome === "success" ? "not_yet" : "success",
      });
    },
    errorMessage,
    handleRetry:
      pendingAttempt === null
        ? undefined
        : () => {
            recordMutation.mutate(pendingAttempt);
          },
    pendingAttempt,
    record: (outcome: Outcome, target: string) => {
      const nextAttempt = pendingAttempt ?? { attemptId: crypto.randomUUID(), outcome, target };
      setPendingAttempt(nextAttempt);
      recordMutation.mutate(nextAttempt);
    },
    saving: recordMutation.isPending || correctMutation.isPending || undoMutation.isPending,
    undo: (attemptId: string) => {
      undoMutation.mutate(attemptId);
    },
  };
}

function usePracticeProgressActions(stepId: string, target: string) {
  const queryClient = useQueryClient();
  const callbacks = createPracticeProgressCallbacks(queryClient, stepId);
  const recordTotals = useServerFn(recordPracticeTotalsFn);
  const correctTotals = useServerFn(correctPracticeTotalsFn);
  const saveDecision = useServerFn(savePracticeStepDecisionFn);

  const recordTotalsMutation = useMutation({
    mutationFn: async ({
      notYetCount,
      successCount,
    }: {
      notYetCount: number;
      successCount: number;
    }) =>
      await recordTotals({
        data: { notYetCount, recordId: crypto.randomUUID(), stepId, successCount, target },
      }),
    ...callbacks,
  });
  const correctTotalsMutation = useMutation({
    mutationFn: async (input: { notYetCount: number; recordId: string; successCount: number }) =>
      await correctTotals({ data: input }),
    ...callbacks,
  });
  const decisionMutation = useMutation({
    mutationFn: async (decision: "keep_practicing" | "recommend_test") =>
      await saveDecision({ data: { decision, stepId } }),
    ...callbacks,
  });

  return {
    correctTotals: (recordId: string, successCount: number, notYetCount: number) => {
      correctTotalsMutation.mutate({ notYetCount, recordId, successCount });
    },
    recordTotals: (successCount: number, notYetCount: number) => {
      recordTotalsMutation.mutate({ notYetCount, successCount });
    },
    saveDecision: (decision: "keep_practicing" | "recommend_test") => {
      decisionMutation.mutate(decision);
    },
    saving:
      recordTotalsMutation.isPending ||
      correctTotalsMutation.isPending ||
      decisionMutation.isPending,
  };
}

function usePracticeActions(stepId: string, target: string): PracticeActions {
  const attemptActions = usePracticeAttemptActions(stepId);
  const progressActions = usePracticeProgressActions(stepId, target);

  return {
    ...attemptActions,
    ...progressActions,
    saving: attemptActions.saving || progressActions.saving,
  };
}

export { usePracticeActions };
