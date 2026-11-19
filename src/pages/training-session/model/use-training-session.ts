import { useCallback, useMemo, useState } from "react";

import { TRAINING_SESSION_STUB } from "./stub-data";
import type {
  AttemptOutcome,
  AutomaticReadiness,
  PracticeAttempt,
  SessionMode,
  SessionRep,
  StepTest,
  TrainingStep,
} from "./types";

const STREAK_THRESHOLD = 2;
const RECOMMENDED_REPS = 10;
const MAX_PERCENT = 100;

interface SessionSnapshot {
  steps: TrainingStep[];
  mode: SessionMode;
  selectedTarget: string;
  consecutiveSuccess: number;
  consecutiveNotYet: number;
  masteredTopTarget: boolean;
  stepPassed: boolean;
  statusNotice: string | null;
  attempts: PracticeAttempt[];
  sessionReps: SessionRep[];
  coldSessionTally: { success: number; notYet: number };
  lastActionLabel: string | null;
}

interface SessionState extends SessionSnapshot {
  history: SessionSnapshot[];
}

function createInitialState(): SessionState {
  const initialSteps = TRAINING_SESSION_STUB.steps;
  const activeStep =
    initialSteps.find((step) => step.stepNumber === TRAINING_SESSION_STUB.activeStepNumber) ??
    initialSteps[0]!;
  const initialAttempts = TRAINING_SESSION_STUB.initialAttempts;
  const initialSessionReps: SessionRep[] = initialAttempts
    .filter((attempt) => attempt.stepNumber === activeStep.stepNumber && attempt.undoneAt === null)
    .map((attempt) => ({
      id: attempt.id,
      outcome: attempt.outcome,
      target: attempt.target,
      mode: "practice",
    }));
  const hasTestedToday = activeStep.step_tests.length > 0;
  const startingMode: SessionMode = hasTestedToday ? "practice" : "try_it_cold";

  return {
    steps: initialSteps,
    mode: startingMode,
    selectedTarget: activeStep.defaultTarget,
    consecutiveSuccess: 0,
    consecutiveNotYet: 0,
    masteredTopTarget: false,
    stepPassed: activeStep.status === "passed",
    statusNotice: null,
    attempts: initialAttempts,
    sessionReps: initialSessionReps,
    coldSessionTally: { success: 0, notYet: 0 },
    lastActionLabel: null,
    history: [],
  };
}

function toSnapshot(state: SessionState): SessionSnapshot {
  return {
    steps: state.steps,
    mode: state.mode,
    selectedTarget: state.selectedTarget,
    consecutiveSuccess: state.consecutiveSuccess,
    consecutiveNotYet: state.consecutiveNotYet,
    masteredTopTarget: state.masteredTopTarget,
    stepPassed: state.stepPassed,
    statusNotice: state.statusNotice,
    attempts: state.attempts,
    sessionReps: state.sessionReps,
    coldSessionTally: state.coldSessionTally,
    lastActionLabel: state.lastActionLabel,
  };
}

export function useTrainingSession() {
  const [state, setState] = useState<SessionState>(createInitialState);

  const activeStep = useMemo(
    () =>
      state.steps.find((step) => step.stepNumber === TRAINING_SESSION_STUB.activeStepNumber) ??
      state.steps[0]!,
    [state.steps],
  );

  const activeStepAttempts = useMemo(
    () =>
      state.attempts.filter(
        (attempt) => attempt.stepNumber === activeStep.stepNumber && attempt.undoneAt === null,
      ),
    [state.attempts, activeStep.stepNumber],
  );

  const hasPracticedToday = activeStepAttempts.length > 0;

  const sessionTally = useMemo(() => {
    let success = state.coldSessionTally.success;
    let notYet = state.coldSessionTally.notYet;
    for (const attempt of activeStepAttempts) {
      if (attempt.outcome === "success") {
        success += 1;
      } else {
        notYet += 1;
      }
    }
    return {
      success,
      notYet,
      total: success + notYet,
    };
  }, [activeStepAttempts, state.coldSessionTally]);

  const readiness: AutomaticReadiness = useMemo(() => {
    if (state.stepPassed) {
      return "step_complete";
    }
    if (state.masteredTopTarget) {
      return "ready_for_cold_test";
    }
    return state.mode === "try_it_cold" ? "try_it_cold" : "practicing";
  }, [state.masteredTopTarget, state.mode, state.stepPassed]);

  const logOutcome = useCallback((outcome: AttemptOutcome) => {
    setState((prev) => {
      const currentStep =
        prev.steps.find((step) => step.stepNumber === TRAINING_SESSION_STUB.activeStepNumber) ??
        prev.steps[0]!;
      const snapshot = toSnapshot(prev);
      const nextHistory = [...prev.history, snapshot];
      const actionLabel = `${outcome === "success" ? "Success" : "Not Yet"} · ${prev.selectedTarget}`;

      if (prev.mode === "try_it_cold") {
        const testOutcome = outcome === "success" ? "passed" : "not_yet";
        const practicedBefore = prev.attempts.some(
          (attempt) => attempt.stepNumber === currentStep.stepNumber && attempt.undoneAt === null,
        );
        const testRecord: StepTest = {
          id: `test-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          stepNumber: currentStep.stepNumber,
          outcome: testOutcome,
          target: prev.selectedTarget,
          coldOverride: practicedBefore,
          testedAt: "Just now",
        };

        const nextSteps = prev.steps.map((step) => {
          if (step.stepNumber !== currentStep.stepNumber) {
            return step;
          }
          return {
            ...step,
            status: outcome === "success" ? ("passed" as const) : step.status,
            step_tests: [testRecord, ...step.step_tests],
          };
        });

        const nextColdTally = {
          success: prev.coldSessionTally.success + (outcome === "success" ? 1 : 0),
          notYet: prev.coldSessionTally.notYet + (outcome === "not_yet" ? 1 : 0),
        };
        const coldRep: SessionRep = {
          id: testRecord.id,
          outcome,
          target: prev.selectedTarget,
          mode: "try_it_cold",
        };
        const nextSessionReps = [...prev.sessionReps, coldRep];

        if (outcome === "success") {
          return {
            ...prev,
            steps: nextSteps,
            stepPassed: true,
            statusNotice: `Cold test passed at ${prev.selectedTarget} — Step ${currentStep.stepNumber} complete`,
            sessionReps: nextSessionReps,
            coldSessionTally: nextColdTally,
            lastActionLabel: actionLabel,
            history: nextHistory,
          };
        }

        return {
          ...prev,
          steps: nextSteps,
          mode: "practice",
          selectedTarget: currentStep.defaultTarget,
          consecutiveSuccess: 0,
          consecutiveNotYet: 0,
          masteredTopTarget: false,
          statusNotice: `Cold test not yet — switched to Practice (${currentStep.defaultTarget})`,
          sessionReps: nextSessionReps,
          coldSessionTally: nextColdTally,
          lastActionLabel: actionLabel,
          history: nextHistory,
        };
      }

      const attemptId = `attempt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const timestamp = new Date().toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      });
      const nextAttempt: PracticeAttempt = {
        id: attemptId,
        stepNumber: currentStep.stepNumber,
        outcome,
        target: prev.selectedTarget,
        loggedAt: `Just now (${timestamp})`,
        undoneAt: null,
      };
      const practiceRep: SessionRep = {
        id: attemptId,
        outcome,
        target: prev.selectedTarget,
        mode: "practice",
      };

      const nextSteps = prev.steps.map((step) => {
        if (step.stepNumber !== currentStep.stepNumber) {
          return step;
        }
        return {
          ...step,
          practice_totals: {
            success: step.practice_totals.success + (outcome === "success" ? 1 : 0),
            notYet: step.practice_totals.notYet + (outcome === "not_yet" ? 1 : 0),
          },
        };
      });

      const targetIndex = currentStep.targets.indexOf(prev.selectedTarget);
      let nextTarget = prev.selectedTarget;
      let nextSuccess = 0;
      let nextNotYet = 0;
      let nextMastered = false;
      let nextNotice: string | null = null;

      if (outcome === "success") {
        const streak = prev.consecutiveSuccess + 1;
        if (streak >= STREAK_THRESHOLD) {
          const higherTarget =
            targetIndex !== -1 ? currentStep.targets[targetIndex + 1] : undefined;
          if (higherTarget) {
            nextTarget = higherTarget;
            nextSuccess = 0;
            nextNotice = `2 in a row! Target automatically moved to ${higherTarget}`;
          } else {
            nextSuccess = STREAK_THRESHOLD;
            nextMastered = true;
            nextNotice = `${prev.selectedTarget} mastered! Ready for next Try It Cold`;
          }
        } else {
          nextSuccess = streak;
        }
      } else {
        const missStreak = prev.consecutiveNotYet + 1;
        if (missStreak >= STREAK_THRESHOLD) {
          const lowerTarget = targetIndex > 0 ? currentStep.targets[targetIndex - 1] : undefined;
          if (lowerTarget) {
            nextTarget = lowerTarget;
            nextNotYet = 0;
            nextNotice = `2 not yets — target stepped back to ${lowerTarget}`;
          } else {
            nextNotYet = 0;
            nextNotice = `Staying at ${prev.selectedTarget} — keep practicing`;
          }
        } else {
          nextNotYet = missStreak;
        }
      }

      return {
        ...prev,
        steps: nextSteps,
        selectedTarget: nextTarget,
        consecutiveSuccess: nextSuccess,
        consecutiveNotYet: nextNotYet,
        masteredTopTarget: nextMastered,
        statusNotice: nextNotice,
        attempts: [...prev.attempts, nextAttempt],
        sessionReps: [...prev.sessionReps, practiceRep],
        lastActionLabel: actionLabel,
        history: nextHistory,
      };
    });
  }, []);

  const undoAttempt = useCallback(() => {
    setState((prev) => {
      const previousSnapshot = prev.history[prev.history.length - 1];
      if (!previousSnapshot) {
        return prev;
      }
      return {
        ...previousSnapshot,
        history: prev.history.slice(0, -1),
      };
    });
  }, []);

  const recommendedCompleted = Math.min(RECOMMENDED_REPS, sessionTally.total);
  const extraReps = Math.max(0, sessionTally.total - RECOMMENDED_REPS);
  const recommendedProgressPercent = Math.min(
    MAX_PERCENT,
    Math.round((sessionTally.total / RECOMMENDED_REPS) * MAX_PERCENT),
  );

  return {
    dogName: TRAINING_SESSION_STUB.dogName,
    levelNumber: TRAINING_SESSION_STUB.levelNumber,
    levelName: TRAINING_SESSION_STUB.levelName,
    activeStep,
    mode: state.mode,
    selectedTarget: state.selectedTarget,
    consecutiveSuccess: state.consecutiveSuccess,
    streakThreshold: STREAK_THRESHOLD,
    masteredTopTarget: state.masteredTopTarget,
    stepPassed: state.stepPassed,
    readiness,
    statusNotice: state.statusNotice,
    sessionTally,
    sessionReps: state.sessionReps,
    recommendedReps: RECOMMENDED_REPS,
    recommendedCompleted,
    extraReps,
    recommendedProgressPercent,
    hasPracticedToday,
    canUndo: state.history.length > 0,
    lastActionLabel: state.lastActionLabel,
    logOutcome,
    undoAttempt,
  };
}

export type TrainingSessionController = ReturnType<typeof useTrainingSession>;
