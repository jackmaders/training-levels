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

  it("runs timed hold countdown in TrainingPractice", async () => {
    expect.hasAssertions();

    vi.useFakeTimers({ shouldAdvanceTime: true });
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

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Start timer" }));
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

  it("renders timer completion actions, practice limit notice, and omits invalid finish link", async () => {
    expect.hasAssertions();

    vi.useFakeTimers({ shouldAdvanceTime: true });
    const onConfirm = vi.fn<(outcome: "not_yet" | "success") => void>();
    const actions = { ...createActions(), record: onConfirm };

    renderWithProviders(
      <TrainingPractice
        actions={actions}
        decision={null}
        finishStep={{ ...FINISH_STEP, pageSlug: "zen" }}
        guidance={null}
        history={[
          {
            attemptId: "a1",
            createdAt: new Date("2026-01-01T00:00:00.000Z"),
            outcome: "success",
            target: "1 second",
            undoneAt: null,
          },
        ]}
        onBreak={vi.fn<() => void>()}
        onChangeTarget={vi.fn<() => void>()}
        onOpenReading={vi.fn<() => void>()}
        plan={{
          appDefaultPracticeLimit: 1,
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
          targetOptions: [],
        }}
        progression={null}
        target="1 second"
        timerInterrupted={false}
        totals={[]}
      />,
      { routePaths: ["/", "/levels/$section/$page"] },
    );

    expect(
      screen.getByText(
        "App-default practice limit reached. Take a break, then choose Continue or Finish.",
      ),
    ).toBeDefined();
    expect(screen.queryByRole("link", { name: "Finish Practice" })).toBeNull();

    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    await user.click(screen.getByRole("button", { name: "Start timer" }));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1100);
    });
    await user.click(screen.getByRole("button", { name: "Confirm Success" }));
    expect(onConfirm).toHaveBeenCalledWith("success", "1 second");

    await user.click(screen.getByRole("button", { name: "Start timer" }));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1100);
    });

    await user.click(screen.getByRole("button", { name: "Record Not yet" }));
    expect(onConfirm).toHaveBeenCalledWith("not_yet", "1 second");
  });

  it("supports source ladder advancement, stepping to an easier target, and saving readiness decisions", async () => {
    expect.hasAssertions();

    const user = userEvent.setup();
    const onChangeTarget = vi.fn<(nextTarget: string) => void>();
    const saveDecision = vi.fn<(decision: "keep_practicing" | "recommend_test") => void>();
    const actions = { ...createActions(), saveDecision };

    renderWithProviders(
      <TrainingPractice
        actions={actions}
        decision={null}
        finishStep={FINISH_STEP}
        guidance={{
          conditions: "Quiet room",
          criterion: "Hold for 2 seconds",
          progression: "1s -> 2s",
          readiness: "3 clean reps",
          readinessBasis: "Ladder",
          readyForTest: true,
          restart: "Drop back to 1s",
          setup: "Have treats ready",
          source: "Level 1 Zen",
          success: "Dog stays",
          suggestedLimit: "10 repetitions",
          target: "2 seconds",
          targetAdvancement: "source",
          targetOptions: ["1 second", "2 seconds"],
        }}
        history={[]}
        onBreak={vi.fn<() => void>()}
        onChangeTarget={onChangeTarget}
        onOpenReading={vi.fn<() => void>()}
        plan={null}
        progression={null}
        target="2 seconds"
        timerInterrupted={false}
        totals={[]}
      />,
      { routePaths: ["/", "/levels/$section/$page"] },
    );

    expect(
      screen.getByText(
        "Source ladder: a success advances one rung; a miss returns to the restart target.",
      ),
    ).toBeDefined();

    await user.click(screen.getByRole("button", { name: "Easier target" }));
    expect(onChangeTarget).toHaveBeenCalledWith("1 second");

    await user.click(screen.getByRole("button", { name: "Keep practicing" }));
    expect(saveDecision).toHaveBeenCalledWith("keep_practicing");
  });

  it("renders TrainingPrep with guidance target ladder and app-default advancement", () => {
    expect.hasAssertions();

    // Arrange & Act
    renderWithProviders(
      <TrainingPrep
        decision={null}
        equipment={[]}
        guidance={{
          conditions: "Quiet room",
          criterion: "Stand 4 feet apart",
          progression: "Increase distance gradually",
          readiness: "Dog runs happily",
          readinessBasis: "Ladder",
          readyForTest: false,
          restart: "Move closer",
          setup: "Have treats ready",
          source: "Level 1 Come, Step 2",
          success: "Dog comes reliably",
          suggestedLimit: "5 attempts",
          target: "3 feet",
          targetAdvancement: "app default",
          targetOptions: ["3 feet", "4 feet"],
        }}
        history={[]}
        onSelectStep={vi.fn<() => void>()}
        onStart={vi.fn<() => void>()}
        plan={null}
        selectedStepId={FINISH_STEP.stepId}
        stepOptions={PRACTICE_STEP_OPTIONS}
        target="3 feet"
      />,
      { routePaths: ["/", "/levels/$section/$page"] },
    );

    // Assert
    expect(screen.getByRole("heading", { name: "Practice target ladder" })).toBeDefined();
    expect(screen.getAllByText("3 feet")).toHaveLength(2);
    expect(screen.getByText("4 feet")).toBeDefined();
    expect(
      screen.getByText(
        "App default rungs: the curriculum does not set these intermediate targets. A success advances one rung; a miss returns to the restart target.",
      ),
    ).toBeDefined();
  });

  it("renders TrainingPrep with ladder prior achievement and restart suggestion", () => {
    expect.hasAssertions();

    // Arrange & Act
    renderWithProviders(
      <TrainingPrep
        decision={null}
        equipment={[]}
        guidance={null}
        history={[]}
        onSelectStep={vi.fn<() => void>()}
        onStart={vi.fn<() => void>()}
        plan={{
          appDefaultPracticeLimit: 10,
          appDefaultRepetitions: 1,
          distanceFeet: 0,
          durationSeconds: 3,
          easierTarget: null,
          nextTarget: "5 seconds",
          priorAchievement: "3 seconds",
          restartReason: "Missed target",
          source: "Zen ladder",
          stepId: "level-1/zen:step-1",
          target: "3 seconds",
          targetOptions: [{ distanceFeet: 0, durationSeconds: 3, label: "3 seconds" }],
        }}
        selectedStepId={FINISH_STEP.stepId}
        stepOptions={PRACTICE_STEP_OPTIONS}
        target="3 seconds"
      />,
      { routePaths: ["/", "/levels/$section/$page"] },
    );

    // Assert
    expect(screen.getByText(/3 seconds\. Missed target/u)).toBeDefined();
    expect(screen.getAllByText("3 seconds")).toHaveLength(2);
  });

  it("renders TrainingPractice with null plan and guidance, and save error without retry", () => {
    expect.hasAssertions();

    // Arrange & Act
    renderWithProviders(
      <TrainingPractice
        actions={createActions({ errorMessage: "Undo failed", pendingAttempt: null })}
        decision={null}
        finishStep={FINISH_STEP}
        guidance={null}
        history={[]}
        onBreak={vi.fn<() => void>()}
        onChangeTarget={vi.fn<() => void>()}
        onOpenReading={vi.fn<() => void>()}
        plan={null}
        progression={null}
        target={STEP_TARGET}
        timerInterrupted={false}
        totals={[]}
      />,
      { routePaths: ["/", "/levels/$section/$page"] },
    );

    // Assert
    expect(screen.getByText(/Undo failed/u)).toBeDefined();
    expect(screen.queryByRole("button", { name: "Retry save" })).toBeNull();
    expect(screen.queryByLabelText("Choose target")).toBeNull();
  });

  it("renders TrainingPractice with plan prior achievement, restart suggestion, and zero timer", () => {
    expect.hasAssertions();

    // Arrange & Act
    renderWithProviders(
      <TrainingPractice
        actions={createActions()}
        decision={null}
        finishStep={FINISH_STEP}
        guidance={null}
        history={[]}
        onBreak={vi.fn<() => void>()}
        onChangeTarget={vi.fn<() => void>()}
        onOpenReading={vi.fn<() => void>()}
        plan={{
          appDefaultPracticeLimit: 5,
          appDefaultRepetitions: 1,
          distanceFeet: 2,
          durationSeconds: 0,
          easierTarget: null,
          nextTarget: null,
          priorAchievement: "3 seconds",
          restartReason: "Restart at 2 seconds",
          source: "Crate ladder",
          stepId: "level-3/crate:step-2",
          target: "2 feet · 0 seconds",
          targetOptions: [],
        }}
        progression={null}
        target="2 feet · 0 seconds"
        timerInterrupted={false}
        totals={[]}
      />,
      { routePaths: ["/", "/levels/$section/$page"] },
    );

    // Assert
    expect(screen.getByText("Prior achievement: 3 seconds")).toBeDefined();
    expect(
      screen.getByText("Restart suggestion: 2 feet · 0 seconds. Restart at 2 seconds"),
    ).toBeDefined();
    expect(screen.queryByRole("button", { name: "Start timer" })).toBeNull();
  });
});
