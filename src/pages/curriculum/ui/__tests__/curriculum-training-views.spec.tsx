import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";

import { renderWithProviders } from "@test/vitest/wrappers/testing-wrapper";

import { PRACTICE_STEP_OPTIONS } from "../../model/practice-ladders";
import {
  STEP_TARGET,
  TrainingBreak,
  TrainingHeading,
  TrainingPractice,
  TrainingPrep,
  type PracticeActions,
  type PracticeRecord,
} from "../curriculum-training-views";

afterEach(() => {
  vi.useRealTimers();
});

const [FINISH_STEP] = PRACTICE_STEP_OPTIONS;

function createPracticeHistoryItem(index: number): PracticeRecord {
  return {
    attemptId: `a-${index}`,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    outcome: index % 2 === 0 ? "success" : "not_yet",
    target: "1 second",
    undoneAt: index === 0 ? new Date("2026-01-01T00:01:00.000Z") : null,
  };
}

function createActions(overrides?: Partial<PracticeActions>): PracticeActions {
  const base: PracticeActions = {
    correct: vi.fn<() => void>(),
    correctTotals: vi.fn<() => void>(),
    errorMessage: null,
    handleRetry: vi.fn<() => void>(),
    pendingAttempt: null,
    record: vi.fn<() => void>(),
    recordTotals: vi.fn<() => void>(),
    saveDecision: vi.fn<() => void>(),
    saving: false,
    undo: vi.fn<() => void>(),
  };
  return overrides ? Object.assign(base, overrides) : base;
}

describe("curriculum training views", () => {
  it("renders TrainingHeading for all modes", () => {
    expect.hasAssertions();

    const { rerender } = renderWithProviders(
      <TrainingHeading mode="Practice" stepLabel="Level 1 Zen, Step 1" />,
      { routePaths: ["/"] },
    );
    expect(screen.getByRole("heading", { name: "Guided Practice" })).toBeDefined();

    rerender(<TrainingHeading mode="Test" stepLabel="Level 1 Zen, Step 1" />);
    expect(screen.getByRole("heading", { name: "Guided Test" })).toBeDefined();
  });

  it("renders TrainingPractice with limit notice, save error, and attempt history", async () => {
    expect.hasAssertions();

    const user = userEvent.setup();
    const actions = createActions({
      errorMessage: "Save failed",
      pendingAttempt: {
        attemptId: "attempt-1",
        outcome: "success",
        target: "3 seconds",
      },
    });
    const history: PracticeRecord[] = Array.from({ length: 10 }, (_item, index) =>
      createPracticeHistoryItem(index),
    );

    renderWithProviders(
      <TrainingPractice
        actions={actions}
        decision="recommend_test"
        finishStep={FINISH_STEP}
        guidance={null}
        history={history}
        onBreak={vi.fn<() => void>()}
        onChangeTarget={vi.fn<() => void>()}
        onOpenReading={vi.fn<() => void>()}
        plan={{
          appDefaultPracticeLimit: 10,
          appDefaultRepetitions: 1,
          distanceFeet: 0,
          durationSeconds: 3,
          easierTarget: null,
          nextTarget: "5 seconds",
          priorAchievement: null,
          restartReason: null,
          source: "Zen ladder",
          stepId: "level-1/zen:step-1",
          target: "3 seconds",
          targetOptions: [
            { distanceFeet: 0, durationSeconds: 3, label: "3 seconds" },
            { distanceFeet: 0, durationSeconds: 5, label: "5 seconds" },
          ],
        }}
        progression={null}
        target="1 second"
        timerInterrupted={false}
        totals={[]}
      />,
      { routePaths: ["/", "/levels/$section/$page"] },
    );

    expect(screen.getByText(/Could not save this attempt/u)).toBeDefined();

    await user.click(screen.getByRole("button", { name: "Retry save" }));

    expect(screen.getByRole("button", { name: "Success" })).toHaveProperty("disabled", true);

    await user.click(screen.getByRole("button", { name: "Undo" }));
    expect(actions.undo).toHaveBeenCalledWith("a-9");
  });

  it("runs timed hold countdown in TrainingPractice", () => {
    expect.hasAssertions();

    vi.useFakeTimers();
    const actions = createActions();

    renderWithProviders(
      <TrainingPractice
        actions={actions}
        decision={null}
        finishStep={FINISH_STEP}
        guidance={null}
        history={[]}
        onBreak={vi.fn<() => void>()}
        onChangeTarget={vi.fn<() => void>()}
        onOpenReading={vi.fn<() => void>()}
        plan={{
          appDefaultPracticeLimit: 10,
          appDefaultRepetitions: 1,
          distanceFeet: 0,
          durationSeconds: 1,
          easierTarget: null,
          nextTarget: null,
          priorAchievement: null,
          restartReason: null,
          source: "Zen ladder",
          stepId: "level-1/zen:step-1",
          target: "1 second",
          targetOptions: [{ distanceFeet: 0, durationSeconds: 1, label: "1 second" }],
        }}
        progression={null}
        target="1 second"
        timerInterrupted={false}
        totals={[]}
      />,
      { routePaths: ["/", "/levels/$section/$page"] },
    );

    act(() => {
      screen.getByRole("button", { name: "Start timer" }).click();
    });
    act(() => {
      vi.advanceTimersByTime(1100);
    });
    expect(screen.getByRole("button", { name: "Success" })).toBeDefined();
    vi.useRealTimers();
  });

  it("renders TrainingBreak and handles continue", async () => {
    expect.hasAssertions();

    const user = userEvent.setup();
    const onContinue = vi.fn<() => void>();

    renderWithProviders(<TrainingBreak finishStep={FINISH_STEP} onContinue={onContinue} />, {
      routePaths: ["/", "/levels/$section/$page"],
    });

    await user.click(screen.getByRole("button", { name: "Continue" }));
    expect(onContinue).toHaveBeenCalledOnce();
  });

  it("renders TrainingPrep with decision notice, target selection, and start practice", async () => {
    expect.hasAssertions();

    const user = userEvent.setup();
    const onSelectStep = vi.fn<() => void>();
    const onStartPractice = vi.fn<() => void>();

    renderWithProviders(
      <TrainingPrep
        decision="recommend_test"
        equipment={[]}
        guidance={null}
        history={[]}
        onSelectStep={onSelectStep}
        onStart={onStartPractice}
        plan={{
          appDefaultPracticeLimit: 10,
          appDefaultRepetitions: 1,
          distanceFeet: 0,
          durationSeconds: 3,
          easierTarget: null,
          nextTarget: "5 seconds",
          priorAchievement: null,
          restartReason: null,
          source: "Zen ladder",
          stepId: "level-1/zen:step-1",
          target: "3 seconds",
          targetOptions: [
            { distanceFeet: 0, durationSeconds: 3, label: "3 seconds" },
            { distanceFeet: 0, durationSeconds: 5, label: "5 seconds" },
          ],
        }}
        selectedStepId={FINISH_STEP.stepId}
        stepOptions={PRACTICE_STEP_OPTIONS}
        target={STEP_TARGET}
      />,
      { routePaths: ["/", "/levels/$section/$page"] },
    );

    await user.click(screen.getByRole("button", { name: "Start Practice" }));
    expect(onStartPractice).toHaveBeenCalledOnce();
  });

  it("renders TrainingPractice with guidance, progression, target choices, and reading button", async () => {
    expect.hasAssertions();

    const user = userEvent.setup();
    const onChangeTarget = vi.fn<() => void>();
    const onOpenReading = vi.fn<() => void>();

    renderWithProviders(
      <TrainingPractice
        actions={createActions()}
        decision="keep_practicing"
        finishStep={FINISH_STEP}
        guidance={null}
        history={[]}
        onBreak={vi.fn<() => void>()}
        onChangeTarget={onChangeTarget}
        onOpenReading={onOpenReading}
        plan={{
          appDefaultPracticeLimit: 10,
          appDefaultRepetitions: 1,
          distanceFeet: 0,
          durationSeconds: 3,
          easierTarget: null,
          nextTarget: "5 seconds",
          priorAchievement: null,
          restartReason: null,
          source: "Zen ladder",
          stepId: "level-1/zen:step-1",
          target: "3 seconds",
          targetOptions: [
            { distanceFeet: 0, durationSeconds: 3, label: "3 seconds" },
            { distanceFeet: 0, durationSeconds: 5, label: "5 seconds" },
          ],
        }}
        progression={{
          appDefault: "App default",
          method: "duration_ladder",
          nextTarget: "5 seconds",
          readinessQuestion: "Ready?",
          readyForTest: false,
          source: "Test source",
        }}
        target="3 seconds"
        timerInterrupted
        totals={[]}
      />,
      { routePaths: ["/", "/levels/$section/$page"] },
    );

    await user.selectOptions(screen.getByLabelText("Choose target"), "5 seconds");
    expect(onChangeTarget).toHaveBeenCalledWith("5 seconds");

    await user.click(screen.getByRole("button", { name: "Easier target" }));
    await user.click(screen.getByRole("button", { name: "Next ladder target" }));
    await user.click(screen.getByRole("button", { name: "Explanation" }));
    expect(onOpenReading).toHaveBeenCalledOnce();
  });
});
