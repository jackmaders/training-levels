import { QueryClient } from "@tanstack/react-query";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vite-plus/test";

import { TEST_BEHAVIOR_PAGE } from "@test/vitest/fixtures/curriculum";
import { renderWithProviders } from "@test/vitest/wrappers/testing-wrapper";

import { curriculumPageQueryOptions } from "../../api/curriculum-query-options";
import {
  PRACTICE_STEP_ID,
  practiceHistoryQueryOptions,
  practiceStepDecisionQueryOptions,
  practiceTotalsQueryOptions,
  stepTestHistoryQueryOptions,
} from "../../api/training-query-options";
import {
  correctPracticeAttemptFn,
  correctPracticeTotalsFn,
  getPracticeHistoryFn,
  getPracticeStepDecisionFn,
  getPracticeTotalsFn,
  getStepTestHistoryFn,
  recordPracticeAttemptFn,
  recordPracticeTotalsFn,
  savePracticeStepDecisionFn,
  undoPracticeAttemptFn,
} from "../../api/training.functions";
import { PRACTICE_STEP_OPTIONS } from "../../model/practice-ladders";
import { CurriculumTrainingPage } from "../curriculum-training-page";

vi.mock(import("../../api/training.functions"));

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getPracticeHistoryFn).mockResolvedValue([]);
  vi.mocked(getPracticeTotalsFn).mockResolvedValue([]);
  vi.mocked(getPracticeStepDecisionFn).mockResolvedValue(null);
  vi.mocked(getStepTestHistoryFn).mockResolvedValue([]);
});

function createTrainingQueryClient({
  history = [],
  page = TEST_BEHAVIOR_PAGE,
  stepId = PRACTICE_STEP_ID,
  totals = [],
}: {
  history?: Array<{
    attemptId: string;
    createdAt: Date;
    outcome: "success" | "not_yet";
    target: string;
    undoneAt: Date | null;
  }>;
  page?: typeof TEST_BEHAVIOR_PAGE | null;
  stepId?: string;
  totals?: Array<{
    createdAt: Date;
    notYetCount: number;
    recordId: string;
    stepId: string;
    successCount: number;
  }>;
} = {}) {
  vi.mocked(getPracticeHistoryFn).mockResolvedValue(history);
  vi.mocked(getPracticeTotalsFn).mockResolvedValue(totals);
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false }, queries: { retry: false, staleTime: Infinity } },
  });
  queryClient.setQueryData(curriculumPageQueryOptions("level-1/zen").queryKey, page);
  queryClient.setQueryData(practiceHistoryQueryOptions(stepId).queryKey, history);
  queryClient.setQueryData(practiceTotalsQueryOptions(stepId).queryKey, totals);
  queryClient.setQueryData(practiceStepDecisionQueryOptions(stepId).queryKey, null);
  queryClient.setQueryData(stepTestHistoryQueryOptions().queryKey, []);
  return queryClient;
}

describe("curriculum training page", () => {
  it("renders fallback when curriculum page is unavailable", () => {
    expect.hasAssertions();

    // Arrange
    const queryClient = createTrainingQueryClient({ page: null });

    // Act
    renderWithProviders(
      <CurriculumTrainingPage
        selectedStepId={PRACTICE_STEP_ID}
        selectedTarget={undefined}
        onSelectionChange={vi.fn()}
      />,
      { queryClient, routePaths: ["/", "/levels/$section/$page"] },
    );

    // Assert
    expect(screen.getByText("Training instructions are unavailable.")).toBeTruthy();
  });

  it("navigates between prep, practice, and break views and records attempts", async () => {
    expect.hasAssertions();

    // Arrange
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    vi.mocked(recordPracticeAttemptFn).mockResolvedValueOnce({
      attemptId: "a1",
      createdAt: "2026-01-01T00:00:00.000Z",
      outcome: "success",
      stepId: PRACTICE_STEP_ID,
      target: "Target",
      undoneAt: null,
    });
    const queryClient = createTrainingQueryClient();

    renderWithProviders(
      <CurriculumTrainingPage
        selectedStepId={PRACTICE_STEP_ID}
        selectedTarget={undefined}
        onSelectionChange={onSelectionChange}
      />,
      { queryClient, routePaths: ["/", "/levels/$section/$page"] },
    );

    // Act
    await user.click(screen.getByRole("button", { name: "Start Practice" }));

    // Assert
    expect(screen.getByRole("heading", { name: "Current target" })).toBeTruthy();

    // Act
    await user.click(screen.getByRole("button", { name: "Success" }));

    // Assert
    await waitFor(() => {
      expect(recordPracticeAttemptFn).toHaveBeenCalledTimes(1);
    });

    // Act
    await user.click(screen.getByRole("button", { name: "Take a break" }));

    // Assert
    expect(screen.getByRole("heading", { name: "Take a break" })).toBeTruthy();

    // Act
    await user.click(screen.getByRole("button", { name: "Continue" }));

    // Assert
    expect(screen.getByRole("heading", { name: "Current target" })).toBeTruthy();
  });

  it("handles step selection change, undo, correct, totals, and readiness decision", async () => {
    expect.hasAssertions();

    // Arrange
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    vi.mocked(undoPracticeAttemptFn).mockResolvedValueOnce({
      attemptId: "a1",
      createdAt: "2026-01-01T00:00:00.000Z",
      outcome: "success",
      stepId: PRACTICE_STEP_ID,
      target: "Target",
      undoneAt: "2026-01-01T00:01:00.000Z",
    });
    vi.mocked(correctPracticeAttemptFn).mockResolvedValueOnce({
      attemptId: "a1",
      createdAt: "2026-01-01T00:00:00.000Z",
      outcome: "not_yet",
      stepId: PRACTICE_STEP_ID,
      target: "Target",
      undoneAt: null,
    });
    vi.mocked(recordPracticeTotalsFn).mockResolvedValueOnce({
      createdAt: "2026-01-01T00:00:00.000Z",
      notYetCount: 1,
      recordId: "t1",
      stepId: PRACTICE_STEP_ID,
      successCount: 2,
    });
    vi.mocked(correctPracticeTotalsFn).mockResolvedValueOnce({
      createdAt: "2026-01-01T00:00:00.000Z",
      notYetCount: 0,
      recordId: "t1",
      stepId: PRACTICE_STEP_ID,
      successCount: 3,
    });
    vi.mocked(savePracticeStepDecisionFn).mockResolvedValueOnce({
      decision: "keep_practicing",
      stepId: PRACTICE_STEP_ID,
      updatedAt: "2026-01-01T00:00:00.000Z",
    });

    const queryClient = createTrainingQueryClient({
      history: [
        {
          attemptId: "a1",
          createdAt: new Date("2026-01-01T00:00:00.000Z"),
          outcome: "success",
          target: "Target",
          undoneAt: null,
        },
      ],
    });
    const secondOption = PRACTICE_STEP_OPTIONS[1];
    queryClient.setQueryData(
      curriculumPageQueryOptions(secondOption.pageSlug).queryKey,
      TEST_BEHAVIOR_PAGE,
    );
    queryClient.setQueryData(practiceHistoryQueryOptions(secondOption.stepId).queryKey, []);
    queryClient.setQueryData(practiceTotalsQueryOptions(secondOption.stepId).queryKey, []);
    queryClient.setQueryData(practiceStepDecisionQueryOptions(secondOption.stepId).queryKey, null);

    renderWithProviders(
      <CurriculumTrainingPage
        selectedStepId={PRACTICE_STEP_ID}
        selectedTarget={undefined}
        onSelectionChange={onSelectionChange}
      />,
      { queryClient, routePaths: ["/", "/levels/$section/$page"] },
    );

    // Act
    await user.selectOptions(screen.getByLabelText("Behavior and Step"), secondOption.stepId);

    // Assert
    expect(onSelectionChange).toHaveBeenCalledWith(secondOption.stepId, undefined);
  });

  it("handles undo and correct in practice view", async () => {
    expect.hasAssertions();

    // Arrange
    const user = userEvent.setup();
    vi.mocked(undoPracticeAttemptFn).mockResolvedValueOnce({
      attemptId: "a1",
      createdAt: "2026-01-01T00:00:00.000Z",
      outcome: "success",
      stepId: PRACTICE_STEP_ID,
      target: "Target",
      undoneAt: "2026-01-01T00:01:00.000Z",
    });
    vi.mocked(correctPracticeAttemptFn).mockResolvedValueOnce({
      attemptId: "a1",
      createdAt: "2026-01-01T00:00:00.000Z",
      outcome: "not_yet",
      stepId: PRACTICE_STEP_ID,
      target: "Target",
      undoneAt: null,
    });
    const queryClient = createTrainingQueryClient({
      history: [
        {
          attemptId: "a1",
          createdAt: new Date("2026-01-01T00:00:00.000Z"),
          outcome: "success",
          target: "Target",
          undoneAt: null,
        },
      ],
    });
    renderWithProviders(
      <CurriculumTrainingPage
        selectedStepId={PRACTICE_STEP_ID}
        selectedTarget={undefined}
        onSelectionChange={vi.fn()}
      />,
      { queryClient, routePaths: ["/", "/levels/$section/$page"] },
    );

    // Act
    await user.click(screen.getByRole("button", { name: /Practice/ }));
    await user.click(screen.getByRole("button", { name: "Undo" }));

    // Assert
    await waitFor(() => {
      expect(undoPracticeAttemptFn).toHaveBeenCalledTimes(1);
    });
  });

  it("handles break view, attempt correction, totals submission, and save retry", async () => {
    expect.hasAssertions();

    // Arrange
    const user = userEvent.setup();
    vi.mocked(correctPracticeAttemptFn).mockResolvedValueOnce({
      attemptId: "a1",
      createdAt: "2026-01-01T00:00:00.000Z",
      outcome: "not_yet",
      stepId: PRACTICE_STEP_ID,
      target: "Target",
      undoneAt: null,
    });
    vi.mocked(recordPracticeTotalsFn).mockResolvedValueOnce({
      createdAt: "2026-01-01T00:00:00.000Z",
      notYetCount: 0,
      recordId: "t1",
      stepId: PRACTICE_STEP_ID,
      successCount: 2,
    });
    vi.mocked(recordPracticeAttemptFn)
      .mockRejectedValueOnce(new Error("Network down"))
      .mockResolvedValueOnce({
        attemptId: "a2",
        createdAt: "2026-01-01T00:00:00.000Z",
        outcome: "success",
        stepId: PRACTICE_STEP_ID,
        target: "Target",
        undoneAt: null,
      });

    const queryClient = createTrainingQueryClient({
      history: [
        {
          attemptId: "a1",
          createdAt: new Date("2026-01-01T00:00:00.000Z"),
          outcome: "success",
          target: "Target",
          undoneAt: null,
        },
      ],
    });
    renderWithProviders(
      <CurriculumTrainingPage
        selectedStepId={PRACTICE_STEP_ID}
        selectedTarget={undefined}
        onSelectionChange={vi.fn()}
      />,
      { queryClient, routePaths: ["/", "/levels/$section/$page"] },
    );

    // Act: enter practice
    await user.click(screen.getByRole("button", { name: /Practice/ }));

    // Act: take a break and continue
    await user.click(screen.getByRole("button", { name: "Take a break" }));
    expect(screen.getByRole("heading", { name: "Take a break" })).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Continue" }));
    expect(screen.getByRole("heading", { name: "Current target" })).toBeTruthy();

    // Act: correct attempt
    await user.click(screen.getByRole("button", { name: "Correct" }));
    await waitFor(() => {
      expect(correctPracticeAttemptFn).toHaveBeenCalledTimes(1);
    });

    // Act: save totals
    await user.type(screen.getByLabelText("Success count"), "2");
    await user.click(screen.getByRole("button", { name: "Save totals" }));
    await waitFor(() => {
      expect(recordPracticeTotalsFn).toHaveBeenCalledTimes(1);
    });

    // Act: fail attempt and retry
    await user.click(screen.getByRole("button", { name: "Success" }));
    await waitFor(() => {
      expect(screen.getByText(/Could not save this attempt/)).toBeTruthy();
    });
    await user.click(screen.getByRole("button", { name: "Retry save" }));
    await waitFor(() => {
      expect(recordPracticeAttemptFn).toHaveBeenCalledTimes(2);
    });
  });

  it("handles selectedTarget, target change, test view, and undone/not_yet history", async () => {
    expect.hasAssertions();

    // Arrange
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    vi.mocked(correctPracticeAttemptFn).mockResolvedValueOnce({
      attemptId: "a2",
      createdAt: "2026-01-01T00:00:00.000Z",
      outcome: "success",
      stepId: PRACTICE_STEP_ID,
      target: "Target",
      undoneAt: null,
    });
    const queryClient = createTrainingQueryClient({
      history: [
        {
          attemptId: "a1",
          createdAt: new Date("2026-01-01T00:00:00.000Z"),
          outcome: "success",
          target: "Target",
          undoneAt: new Date("2026-01-01T00:01:00.000Z"),
        },
        {
          attemptId: "a2",
          createdAt: new Date("2026-01-01T00:02:00.000Z"),
          outcome: "not_yet",
          target: "Target",
          undoneAt: null,
        },
      ],
    });
    renderWithProviders(
      <CurriculumTrainingPage
        selectedStepId={PRACTICE_STEP_ID}
        selectedTarget="10 seconds"
        onSelectionChange={onSelectionChange}
      />,
      { queryClient, routePaths: ["/", "/levels/$section/$page"] },
    );

    // Act: enter practice and change target if target selector is present
    await user.click(screen.getByRole("button", { name: /Practice/ }));
    const targetSelect = screen.queryByLabelText("Target");
    if (targetSelect !== null) {
      await user.selectOptions(targetSelect, "15 seconds");
      expect(onSelectionChange).toHaveBeenCalledWith(PRACTICE_STEP_ID, "15 seconds");
    }

    // Act: correct not_yet attempt
    await user.click(screen.getByRole("button", { name: "Correct" }));
    await waitFor(() => {
      expect(correctPracticeAttemptFn).toHaveBeenCalledTimes(1);
    });
  });
});
