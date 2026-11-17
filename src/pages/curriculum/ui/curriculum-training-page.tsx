import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
  type QueryClient,
} from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState, type Dispatch, type SetStateAction } from "react";

import { curriculumPageQueryOptions } from "../api/curriculum-query-options";
import { practiceHistoryQueryOptions } from "../api/training-query-options";
import {
  correctPracticeAttemptFn,
  recordPracticeAttemptFn,
  undoPracticeAttemptFn,
} from "../api/training.functions";
import { getPracticePlan, PRACTICE_STEP_OPTIONS } from "../model/practice-ladders";
import {
  STEP_TARGET,
  TrainingBreak,
  TrainingHeading,
  TrainingPractice,
  TrainingPrep,
  type Outcome,
  type PracticeActions,
  type PracticeRecord,
} from "./curriculum-training-views";

function CurriculumTrainingPage({
  onSelectionChange,
  selectedStepId: requestedStepId,
  selectedTarget,
}: {
  onSelectionChange: (stepId: string | undefined, target: string | undefined) => void;
  selectedStepId: string | undefined;
  selectedTarget: string | undefined;
}) {
  const [view, setView] = useState<"prep" | "practice" | "break">("prep");
  const selectedStep =
    PRACTICE_STEP_OPTIONS.find((step) => step.stepId === requestedStepId) ??
    PRACTICE_STEP_OPTIONS[0];
  const selectedStepId = selectedStep.stepId;
  const { data: history } = useSuspenseQuery(practiceHistoryQueryOptions(selectedStepId));
  const { data: curriculumPage } = useSuspenseQuery(
    curriculumPageQueryOptions(selectedStep.pageSlug),
  );
  const actions = usePracticeActions(selectedStepId);
  const viewActions: PracticeActions = {
    ...actions,
    record: (outcome, currentTarget) => {
      onSelectionChange(selectedStepId, undefined);
      actions.record(outcome, currentTarget);
    },
  };
  const plan =
    selectedStepId === PRACTICE_STEP_OPTIONS[0].stepId
      ? null
      : getPracticePlan(
          selectedStepId,
          history.filter((attempt) => attempt.undoneAt === null),
        );
  const target =
    plan?.targetOptions.some((option) => option.label === selectedTarget) === true
      ? (selectedTarget ?? STEP_TARGET)
      : (plan?.target ?? STEP_TARGET);

  if (curriculumPage === null || curriculumPage.kind !== "behavior") {
    return <main className="mx-auto max-w-3xl p-6">Training instructions are unavailable.</main>;
  }

  return (
    <main className="mx-auto max-w-3xl space-y-8 px-4 pt-8 pb-36 sm:px-6">
      <TrainingHeading stepLabel={selectedStep.label} />
      {view === "prep" ? (
        <TrainingPrep
          equipment={curriculumPage.equipment}
          history={history}
          onSelectStep={(stepId) => onSelectionChange(stepId, undefined)}
          onStart={() => setView("practice")}
          plan={plan}
          selectedStepId={selectedStepId}
          stepOptions={PRACTICE_STEP_OPTIONS}
          target={target}
        />
      ) : view === "practice" ? (
        <TrainingPractice
          actions={viewActions}
          history={history}
          onBreak={() => setView("break")}
          onChangeTarget={(nextTarget) => onSelectionChange(selectedStepId, nextTarget)}
          finishStep={selectedStep}
          plan={plan}
          target={target}
        />
      ) : (
        <TrainingBreak onContinue={() => setView("practice")} finishStep={selectedStep} />
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
  stepId: string,
  setPendingAttempt: Dispatch<
    SetStateAction<{ attemptId: string; outcome: Outcome; target: string } | null>
  >,
  setErrorMessage: Dispatch<SetStateAction<string | null>>,
) {
  return {
    onError: (error: Error) => setErrorMessage(error.message),
    onSuccess: async () => {
      setPendingAttempt(null);
      setErrorMessage(null);
      await queryClient.invalidateQueries({
        queryKey: practiceHistoryQueryOptions(stepId).queryKey,
      });
    },
  };
}

function usePracticeActions(stepId: string): PracticeActions {
  const queryClient = useQueryClient();
  const serverFunctions = usePracticePageFunctions();
  const [pendingAttempt, setPendingAttempt] = useState<{
    attemptId: string;
    outcome: Outcome;
    target: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const callbacks = createMutationCallbacks(
    queryClient,
    stepId,
    setPendingAttempt,
    setErrorMessage,
  );
  const recordMutation = useMutation({
    mutationFn: async ({
      attemptId,
      outcome,
      target,
    }: {
      attemptId: string;
      outcome: Outcome;
      target: string;
    }) =>
      await serverFunctions.recordAttempt({
        data: { attemptId, outcome, stepId, target },
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
    record: (outcome: Outcome, target: string) => {
      const nextAttempt = pendingAttempt ?? { attemptId: crypto.randomUUID(), outcome, target };
      setPendingAttempt(nextAttempt);
      recordMutation.mutate(nextAttempt);
    },
    saving: recordMutation.isPending || correctMutation.isPending || undoMutation.isPending,
    undo: (attemptId: string) => undoMutation.mutate(attemptId),
  };
}

export { CurriculumTrainingPage };
