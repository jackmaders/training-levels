import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
  type QueryClient,
} from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState, type Dispatch, type SetStateAction } from "react";

import { curriculumPageQueryOptions } from "../api/curriculum-query-options";
import {
  PRACTICE_STEP_ID,
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
import { getPracticeProgression } from "../model/practice-progression";
import {
  STEP_TARGET,
  TrainingHeading,
  TrainingPractice,
  TrainingPrep,
  type Outcome,
  type PracticeActions,
  type PracticeRecord,
} from "./curriculum-training-views";

function CurriculumTrainingPage() {
  const { data: history } = useSuspenseQuery(practiceHistoryQueryOptions());
  const { data: totals } = useSuspenseQuery(practiceTotalsQueryOptions());
  const { data: decisionRecord } = useSuspenseQuery(practiceStepDecisionQueryOptions());
  const { data: curriculumPage } = useSuspenseQuery(curriculumPageQueryOptions("level-1/zen"));
  const [view, setView] = useState<"prep" | "practice">("prep");
  const actions = usePracticeActions();
  const progression = getPracticeProgression(PRACTICE_STEP_ID, {
    consecutiveSuccesses: countTrailingSuccesses(history),
    lastOutcome: history.toReversed().find((attempt) => attempt.undoneAt === null)?.outcome,
  });

  if (curriculumPage === null || curriculumPage.kind !== "behavior" || progression === null) {
    return <main className="mx-auto max-w-3xl p-6">Training instructions are unavailable.</main>;
  }

  return (
    <main className="mx-auto max-w-3xl space-y-8 px-4 pt-8 pb-36 sm:px-6">
      <TrainingHeading />
      {view === "prep" ? (
        <TrainingPrep
          decision={decisionRecord?.decision ?? null}
          equipment={curriculumPage.equipment}
          history={history}
          onStart={() => setView("practice")}
        />
      ) : (
        <TrainingPractice
          actions={actions}
          decision={decisionRecord?.decision ?? null}
          history={history}
          progression={progression}
          totals={totals}
        />
      )}
    </main>
  );
}

function countTrailingSuccesses(history: readonly PracticeRecord[]): number {
  let count = 0;
  for (const attempt of history.toReversed()) {
    if (attempt.undoneAt === null) {
      if (attempt.outcome !== "success") {
        return count;
      }
      count += 1;
    }
  }

  return count;
}

function usePracticePageFunctions() {
  return {
    correctAttempt: useServerFn(correctPracticeAttemptFn),
    recordAttempt: useServerFn(recordPracticeAttemptFn),
    undoAttempt: useServerFn(undoPracticeAttemptFn),
  };
}

function createMutationCallbacks(
  queryClient: QueryClient,
  setPendingAttempt: Dispatch<SetStateAction<{ attemptId: string; outcome: Outcome } | null>>,
  setErrorMessage: Dispatch<SetStateAction<string | null>>,
) {
  return {
    onError: (error: Error) => setErrorMessage(error.message),
    onSuccess: async () => {
      setPendingAttempt(null);
      setErrorMessage(null);
      await queryClient.invalidateQueries({ queryKey: practiceHistoryQueryOptions().queryKey });
      await queryClient.invalidateQueries({ queryKey: practiceTotalsQueryOptions().queryKey });
      await queryClient.invalidateQueries({
        queryKey: practiceStepDecisionQueryOptions().queryKey,
      });
    },
  };
}

function usePracticeActions(): PracticeActions {
  const attemptActions = usePracticeAttemptActions();
  const progressActions = usePracticeProgressActions();

  return {
    ...attemptActions,
    ...progressActions,
    saving: attemptActions.saving || progressActions.saving,
  };
}

function usePracticeAttemptActions() {
  const queryClient = useQueryClient();
  const serverFunctions = usePracticePageFunctions();
  const [pendingAttempt, setPendingAttempt] = useState<{
    attemptId: string;
    outcome: Outcome;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const callbacks = createMutationCallbacks(queryClient, setPendingAttempt, setErrorMessage);
  const recordMutation = useMutation({
    mutationFn: async ({ attemptId, outcome }: { attemptId: string; outcome: Outcome }) =>
      await serverFunctions.recordAttempt({
        data: { attemptId, outcome, stepId: PRACTICE_STEP_ID, target: STEP_TARGET },
      }),
    ...callbacks,
  });
  const correctMutation = useMutation({
    mutationFn: async ({ attemptId, outcome }: { attemptId: string; outcome: Outcome }) =>
      await serverFunctions.correctAttempt({ data: { attemptId, outcome } }),
    ...callbacks,
  });
  const undoMutation = useMutation({
    mutationFn: async (attemptId: string) =>
      await serverFunctions.undoAttempt({ data: { attemptId } }),
    ...callbacks,
  });
  return {
    correct: (attempt: PracticeRecord) =>
      correctMutation.mutate({
        attemptId: attempt.attemptId,
        outcome: attempt.outcome === "success" ? "not_yet" : "success",
      }),
    errorMessage,
    handleRetry: () => {
      if (pendingAttempt !== null) {
        recordMutation.mutate(pendingAttempt);
      }
    },
    pendingAttempt,
    record: (outcome: Outcome) => {
      const nextAttempt = pendingAttempt ?? { attemptId: crypto.randomUUID(), outcome };
      setPendingAttempt(nextAttempt);
      recordMutation.mutate(nextAttempt);
    },
    saving: recordMutation.isPending || correctMutation.isPending || undoMutation.isPending,
    undo: (attemptId: string) => undoMutation.mutate(attemptId),
  };
}

function usePracticeProgressActions() {
  const queryClient = useQueryClient();
  const callbacks = createPracticeProgressCallbacks(queryClient);
  const totalsActions = usePracticeTotalsMutations(callbacks);
  const decisionActions = usePracticeDecisionMutation(callbacks);

  return {
    ...totalsActions,
    ...decisionActions,
    saving: totalsActions.saving || decisionActions.saving,
  };
}

function createPracticeProgressCallbacks(queryClient: QueryClient) {
  return {
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: practiceTotalsQueryOptions().queryKey });
      await queryClient.invalidateQueries({
        queryKey: practiceStepDecisionQueryOptions().queryKey,
      });
    },
  };
}

function usePracticeTotalsMutations(callbacks: ReturnType<typeof createPracticeProgressCallbacks>) {
  const recordTotals = useServerFn(recordPracticeTotalsFn);
  const recordTotalsMutation = useMutation({
    mutationFn: async ({
      successCount,
      notYetCount,
    }: {
      successCount: number;
      notYetCount: number;
    }) =>
      await recordTotals({
        data: {
          notYetCount,
          recordId: crypto.randomUUID(),
          stepId: PRACTICE_STEP_ID,
          successCount,
          target: STEP_TARGET,
        },
      }),
    ...callbacks,
  });
  const correctTotals = useServerFn(correctPracticeTotalsFn);
  const correctTotalsMutation = useMutation({
    mutationFn: async ({
      recordId,
      successCount,
      notYetCount,
    }: {
      recordId: string;
      successCount: number;
      notYetCount: number;
    }) => await correctTotals({ data: { notYetCount, recordId, successCount } }),
    ...callbacks,
  });
  return {
    correctTotals: (recordId: string, successCount: number, notYetCount: number) =>
      correctTotalsMutation.mutate({ notYetCount, recordId, successCount }),
    recordTotals: (successCount: number, notYetCount: number) =>
      recordTotalsMutation.mutate({ notYetCount, successCount }),
    saving: recordTotalsMutation.isPending || correctTotalsMutation.isPending,
  };
}

function usePracticeDecisionMutation(
  callbacks: ReturnType<typeof createPracticeProgressCallbacks>,
) {
  const saveDecision = useServerFn(savePracticeStepDecisionFn);
  const decisionMutation = useMutation({
    mutationFn: async (decision: "keep_practicing" | "recommend_test") =>
      await saveDecision({ data: { decision, stepId: PRACTICE_STEP_ID } }),
    ...callbacks,
  });

  return {
    saveDecision: (decision: "keep_practicing" | "recommend_test") =>
      decisionMutation.mutate(decision),
    saving: decisionMutation.isPending,
  };
}

export { CurriculumTrainingPage };
