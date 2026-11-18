import { act, fireEvent, screen } from "@testing-library/react";
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

const FINISH_STEP = PRACTICE_STEP_OPTIONS[0];

function createActions(overrides: Partial<PracticeActions> = {}): PracticeActions {
  return {
    correct: vi.fn(),
    errorMessage: null,
    record: vi.fn(),
    retry: vi.fn(),
    saving: false,
    undo: vi.fn(),
    ...overrides,
  };
}

describe("curriculum training views", () => {
  it("renders TrainingHeading for all modes", () => {
    expect.hasAssertions();

    const { rerender } = renderWithProviders(
      <TrainingHeading mode="prep" stepLabel="Level 1 Zen, Step 1" />,
      { routePaths: ["/"] },
    );
    expect(screen.getByRole("heading", { name: "Guided prep" })).toBe(true);

    rerender(<TrainingHeading mode="practice" stepLabel="Level 1 Zen, Step 1" />);
    expect(screen.getByRole("heading", { name: "Guided practice" })).toBe(true);

    rerender(<TrainingHeading mode="break" stepLabel="Level 1 Zen, Step 1" />);
    expect(screen.getByRole("heading", { name: "Guided break" })).toBe(true);

    rerender(<TrainingHeading mode="test" stepLabel="Level 1 Zen, Step 1" />);
    expect(screen.getByRole("heading", { name: "Guided test" })).toBe(true);
  });

  it("renders TrainingPractice with limit notice, save error, and attempt history", async () => {
    expect.hasAssertions();

    const user = userEvent.setup();
    const actions = createActions({ errorMessage: "Save failed" });
    const history: PracticeRecord[] = Array.from({ length: 10 }, (_, index) => ({
      attemptId: `a-${index}`,
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      outcome: index % 2 === 0 ? "success" : "not_yet",
      target: "1 second",
      undoneAt: index === 0 ? new Date("2026-01-01T00:01:00.000Z") : null,
    }));

    renderWithProviders(
      <TrainingPractice
        actions={actions}
        decision="recommend_test"
        finishStep={FINISH_STEP}
        guidance={null}
        history={history}
        onBreak={vi.fn()}
        onChangeTarget={vi.fn()}
        onOpenReading={vi.fn()}
        plan={null}
        progression={null}
        target="1 second"
        timerInterrupted={false}
        totals={[]}
      />,
      { routePaths: ["/", "/levels/$section/$page"] },
    );

    expect(screen.getByText(/Could not save this attempt/)).toBe(true);
    expect(
      screen.getByText(
        "App-default practice limit reached. Take a break, then choose Continue or Finish.",
      ),
    ).toBe(true);

    await user.click(screen.getByRole("button", { name: "Retry save" }));

    expect((screen.getByRole("button", { name: "Success" }) as HTMLButtonElement).disabled).toBe(
      true,
    );

    await user.click(screen.getByRole("button", { name: "Undo" }));
    expect(actions.undo).toHaveBeenCalledWith();
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
        onBreak={vi.fn()}
        onChangeTarget={vi.fn()}
        onOpenReading={vi.fn()}
        plan={{
          durationSeconds: 1,
          focusSummary: "1s hold",
          mode: "timed",
          nextFocusSummary: null,
          nextTargetLabel: null,
          readyForTest: false,
          source: "Zen ladder",
          targetLabel: "1 second",
          targetOptions: [{ durationSeconds: 1, label: "1 second" }],
        }}
        progression={null}
        target="1 second"
        timerInterrupted={false}
        totals={[]}
      />,
      { routePaths: ["/", "/levels/$section/$page"] },
    );

    fireEvent.click(screen.getByRole("button", { name: "Start timer" }));
    act(() => {
      vi.advanceTimersByTime(1100);
    });
    expect(screen.getByRole("button", { name: "Success" })).toBe(true);
  });

  it("renders TrainingBreak and handles continue", async () => {
    expect.hasAssertions();

    const user = userEvent.setup();
    const onContinue = vi.fn();

    renderWithProviders(<TrainingBreak finishStep={FINISH_STEP} onContinue={onContinue} />, {
      routePaths: ["/", "/levels/$section/$page"],
    });

    await user.click(screen.getByRole("button", { name: "Continue" }));
    expect(onContinue).toHaveBeenCalledOnce();
  });

  it("renders TrainingPrep with decision notice, target selection, and start practice", async () => {
    expect.hasAssertions();

    const user = userEvent.setup();
    const onSelectStep = vi.fn();
    const onSelectTarget = vi.fn();
    const onStartPractice = vi.fn();

    renderWithProviders(
      <TrainingPrep
        decision="recommend_test"
        equipment={[]}
        guidance={null}
        history={[]}
        onSelectStep={onSelectStep}
        onStart={onStartPractice}
        plan={null}
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
    const onChangeTarget = vi.fn();
    const onOpenReading = vi.fn();

    renderWithProviders(
      <TrainingPractice
        actions={createActions()}
        decision="keep_practicing"
        finishStep={FINISH_STEP}
        guidance={{
          advancementRule: { kind: "consecutive", required: 3 },
          currentTargetIndex: 0,
          notes: ["Keep calm"],
          readyToAdvance: true,
          stepDownSuggestion: "Try 1 second",
          target: "3 seconds",
          targetOptions: ["1 second", "3 seconds", "5 seconds"],
        }}
        history={[]}
        onBreak={vi.fn()}
        onChangeTarget={onChangeTarget}
        onOpenReading={onOpenReading}
        plan={null}
        progression={{
          appDefault: "App default",
          method: "consecutive_successes",
          nextTarget: "5 seconds",
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
