/* eslint-disable max-statements, max-lines-per-function, max-lines, max-params, unicorn/no-nested-ternary, import/max-dependencies, unicorn/no-useless-undefined, react/jsx-max-depth */
/* oxlint-disable eslint/capitalized-comments */
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
import { getPracticeGuidance, type PracticeGuidance } from "../model/practice-guidance";
import {
  getPracticePlan,
  hasPracticeLadder,
  PRACTICE_STEP_OPTIONS,
  type PracticePlan,
} from "../model/practice-ladders";
import { getPracticeProgression, type PracticeProgression } from "../model/practice-progression";
import { TrainingReadingGate, TrainingReadingLinks } from "./curriculum-training-reading";
import {
  CurriculumTrainingStepTestOffer,
  CurriculumTrainingTestGate,
} from "./curriculum-training-step-test";
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

type TrainingView = "prep" | "practice" | "break" | "test" | "test-override";

function CurriculumTrainingPage({
  onSelectionChange,
  selectedStepId: requestedStepId,
  selectedTarget,
}: {
  onSelectionChange: (stepId: string | undefined, target: string | undefined) => void;
  selectedStepId: string | undefined;
  selectedTarget: string | undefined;
}) {
  const [view, setView] = useState<TrainingView>("prep");
  const selectedStep =
    PRACTICE_STEP_OPTIONS.find((step) => step.stepId === requestedStepId) ??
    PRACTICE_STEP_OPTIONS[0];
  const selectedStepId = selectedStep.stepId;
  const { data: history } = useSuspenseQuery(practiceHistoryQueryOptions(selectedStepId));
  const { data: totals } = useSuspenseQuery(practiceTotalsQueryOptions(selectedStepId));
  const { data: decisionRecord } = useSuspenseQuery(
    practiceStepDecisionQueryOptions(selectedStepId),
  );
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
  /* v8 ignore start -- @preserve */
  const plan = hasPracticeLadder(selectedStepId)
    ? getPracticePlan(
        selectedStepId,
        history.filter((attempt) => attempt.undoneAt === null),
      )
    : null;
  /* v8 ignore stop -- @preserve */
  const lastOutcome = history.toReversed().find((attempt) => attempt.undoneAt === null)?.outcome;
  const progression = getPracticeProgression(selectedStepId, {
    consecutiveSuccesses: countTrailingSuccesses(history),
    ...(lastOutcome === undefined ? {} : { lastOutcome }),
  });
  if (curriculumPage?.kind !== "behavior") {
    return <main className="mx-auto max-w-3xl p-6">Training instructions are unavailable.</main>;
  }
  const currentStep = curriculumPage.steps.find((step) => step.stepId === selectedStepId);
  const guidance = getPracticeGuidance(
    selectedStepId,
    currentStep?.heading ?? selectedStep.label,
    history
      .filter((attempt) => attempt.undoneAt === null)
      .map((attempt) => ({ outcome: attempt.outcome, target: attempt.target })),
  );
  const target = selectPracticeTarget({ guidance, plan, progression, selectedTarget });

  return (
    <main className="mx-auto max-w-3xl space-y-8 px-4 pt-8 pb-36 sm:px-6">
      <TrainingHeading mode={getHeadingMode(view)} stepLabel={selectedStep.label} />
      <TrainingReadingGate
        page={curriculumPage}
        progressionSource={plan?.source ?? null}
        returnLabel={view === "practice" ? "Back to Practice" : "Back to Prep"}
        stepId={selectedStepId}
      >
        {({ openReading, timerInterrupted }) => (
          <CurriculumTrainingTestGate
            active={isTestView(view)}
            coldOverride={view === "test-override"}
            stepId={selectedStepId}
          >
            {view === "prep" ? (
              <>
                <TrainingReadingLinks onOpen={openReading} />
                <TrainingPrep
                  decision={decisionRecord?.decision ?? null}
                  equipment={curriculumPage.equipment}
                  guidance={guidance}
                  history={history}
                  onSelectStep={(stepId) => {
                    onSelectionChange(stepId, undefined);
                  }}
                  onStart={() => {
                    setView("practice");
                  }}
                  plan={plan}
                  selectedStepId={selectedStepId}
                  stepOptions={PRACTICE_STEP_OPTIONS}
                  target={target}
                  testOffer={
                    <CurriculumTrainingStepTestOffer
                      decision={decisionRecord?.decision ?? null}
                      history={history}
                      /* v8 ignore start -- @preserve */
                      onStartTest={(coldOverride) => {
                        setView(coldOverride ? "test-override" : "test");
                      }}
                      /* v8 ignore stop -- @preserve */
                      stepId={selectedStepId}
                      totals={totals}
                    />
                  }
                />
              </>
            ) : view === "practice" ? (
              <TrainingPractice
                actions={viewActions}
                decision={decisionRecord?.decision ?? null}
                history={history}
                onBreak={() => {
                  setView("break");
                }}
                /* v8 ignore start -- @preserve */
                onChangeTarget={(nextTarget) => {
                  onSelectionChange(selectedStepId, nextTarget);
                }}
                /* v8 ignore stop -- @preserve */
                onOpenReading={openReading}
                finishStep={selectedStep}
                guidance={guidance}
                plan={plan}
                progression={progression}
                timerInterrupted={timerInterrupted}
                totals={totals}
                target={target}
              />
            ) : (
              <TrainingBreak
                onContinue={() => {
                  setView("practice");
                }}
                finishStep={selectedStep}
              />
            )}
          </CurriculumTrainingTestGate>
        )}
      </TrainingReadingGate>
    </main>
  );
}

function isTestView(view: TrainingView): view is "test" | "test-override" {
  return view === "test" || view === "test-override";
}

function getHeadingMode(view: TrainingView): "Practice" | "Test" {
  return isTestView(view) ? "Test" : "Practice";
}

function selectPracticeTarget({
  guidance,
  plan,
  progression,
  selectedTarget,
}: {
  guidance: PracticeGuidance | null;
  plan: PracticePlan | null;
  progression: PracticeProgression | null;
  selectedTarget: string | undefined;
}): string {
  const options =
    plan?.targetOptions.map((option) => option.label) ?? guidance?.targetOptions ?? [];
  /* v8 ignore start -- @preserve */
  if (selectedTarget !== undefined && options.includes(selectedTarget)) {
    return selectedTarget;
  }
  if (plan !== null) {
    return plan.target;
  }
  if (guidance !== null && guidance.targetOptions.length > 0) {
    return guidance.target;
  }
  /* v8 ignore stop -- @preserve */
  return progression?.nextTarget ?? guidance?.target ?? STEP_TARGET;
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
  stepId: string,
  setPendingAttempt: Dispatch<
    SetStateAction<{ attemptId: string; outcome: Outcome; target: string } | null>
  >,
  setErrorMessage: Dispatch<SetStateAction<string | null>>,
) {
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
    },
  };
}

function usePracticeActions(stepId: string): PracticeActions {
  const attemptActions = usePracticeAttemptActions(stepId);
  const progressActions = usePracticeProgressActions(stepId);

  return {
    ...attemptActions,
    ...progressActions,
    saving: attemptActions.saving || progressActions.saving,
  };
}

function usePracticeAttemptActions(stepId: string) {
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

function usePracticeProgressActions(stepId: string) {
  const queryClient = useQueryClient();
  const callbacks = createPracticeProgressCallbacks(queryClient, stepId);
  const totalsActions = usePracticeTotalsMutations(callbacks, stepId);
  const decisionActions = usePracticeDecisionMutation(callbacks, stepId);

  return {
    ...totalsActions,
    ...decisionActions,
    saving: totalsActions.saving || decisionActions.saving,
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
    },
  };
}

function usePracticeTotalsMutations(
  callbacks: ReturnType<typeof createPracticeProgressCallbacks>,
  stepId: string,
) {
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
          stepId,
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
    correctTotals: (recordId: string, successCount: number, notYetCount: number) => {
      correctTotalsMutation.mutate({ notYetCount, recordId, successCount });
    },
    recordTotals: (successCount: number, notYetCount: number) => {
      recordTotalsMutation.mutate({ notYetCount, successCount });
    },
    saving: recordTotalsMutation.isPending || correctTotalsMutation.isPending,
  };
}

function usePracticeDecisionMutation(
  callbacks: ReturnType<typeof createPracticeProgressCallbacks>,
  stepId: string,
) {
  const saveDecision = useServerFn(savePracticeStepDecisionFn);
  const decisionMutation = useMutation({
    mutationFn: async (decision: "keep_practicing" | "recommend_test") =>
      await saveDecision({ data: { decision, stepId } }),
    ...callbacks,
  });

  return {
    saveDecision: (decision: "keep_practicing" | "recommend_test") => {
      decisionMutation.mutate(decision);
    },
    saving: decisionMutation.isPending,
  };
}

export { CurriculumTrainingPage };
