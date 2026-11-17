import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
  type QueryClient,
} from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState, type Dispatch, type SetStateAction } from "react";

import { curriculumPageQueryOptions } from "../api/curriculum-query-options";
import { PRACTICE_STEP_ID, practiceHistoryQueryOptions } from "../api/training-query-options";
import {
  correctPracticeAttemptFn,
  recordPracticeAttemptFn,
  undoPracticeAttemptFn,
} from "../api/training.functions";
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
  const { data: curriculumPage } = useSuspenseQuery(curriculumPageQueryOptions("level-1/zen"));
  const [view, setView] = useState<"prep" | "practice">("prep");
  const actions = usePracticeActions();

  if (curriculumPage === null || curriculumPage.kind !== "behavior") {
    return <main className="mx-auto max-w-3xl p-6">Training instructions are unavailable.</main>;
  }

  return (
    <main className="mx-auto max-w-3xl space-y-8 px-4 pt-8 pb-36 sm:px-6">
      <TrainingHeading />
      {view === "prep" ? (
        <TrainingPrep
          equipment={curriculumPage.equipment}
          history={history}
          onStart={() => setView("practice")}
        />
      ) : (
        <TrainingPractice actions={actions} history={history} />
      )}
    </main>
  );
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
    },
  };
}

function usePracticeActions(): PracticeActions {
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

export { CurriculumTrainingPage };
