import { QueryClient } from "@tanstack/react-query";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderToString } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vite-plus/test";

import type { CurriculumSyllabus } from "@/shared/curriculum-data";
import {
  TEST_BEHAVIOR_PAGE,
  TEST_SYLLABUS,
  createBehaviorPageFixture,
  createBehaviorStepFixture,
  createProsePageFixture,
} from "@test/vitest/fixtures/curriculum";
import { createTestingWrapper, renderWithProviders } from "@test/vitest/wrappers/testing-wrapper";

import {
  curriculumPageQueryOptions,
  curriculumSyllabusQueryOptions,
} from "../../api/curriculum-query-options";
import { trainingOverviewQueryOptions } from "../../api/recommendation-query-options";
import type { TrainingOverview } from "../../api/recommendation-service";
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

function createEmptyOverview(overrides: Partial<TrainingOverview> = {}): TrainingOverview {
  return {
    curriculumProgress: [],
    practiceAttempts: [],
    practiceTotals: [],
    stepDecisions: [],
    stepTests: [],
    ...overrides,
  };
}

function createTrainingQueryClient({
  decisionRecord = null,
  history = [],
  overview = createEmptyOverview(),
  page = TEST_BEHAVIOR_PAGE,
  stepId = PRACTICE_STEP_ID,
  syllabus = TEST_SYLLABUS,
  totals = [],
}: {
  decisionRecord?: {
    decidedAt: Date;
    decision: "keep_practicing" | "recommend_test";
    stepId: string;
  } | null;
  history?: {
    attemptId: string;
    createdAt: Date;
    outcome: "success" | "not_yet";
    stepId: string;
    target: string;
    undoneAt: Date | null;
  }[];
  overview?: TrainingOverview;
  page?: typeof TEST_BEHAVIOR_PAGE | null;
  stepId?: string;
  syllabus?: CurriculumSyllabus;
  totals?: {
    createdAt: Date;
    notYetCount: number;
    recordId: string;
    stepId: string;
    successCount: number;
    target: string;
  }[];
} = {}) {
  vi.mocked(getPracticeHistoryFn).mockResolvedValue(history);
  vi.mocked(getPracticeTotalsFn).mockResolvedValue(totals);
  vi.mocked(getPracticeStepDecisionFn).mockResolvedValue(decisionRecord);
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false }, queries: { retry: false, staleTime: Infinity } },
  });
  queryClient.setQueryData(trainingOverviewQueryOptions().queryKey, overview);
  queryClient.setQueryData(curriculumSyllabusQueryOptions().queryKey, syllabus);
  queryClient.setQueryData(curriculumPageQueryOptions("level-1/zen").queryKey, page);
  queryClient.setQueryData(practiceHistoryQueryOptions(stepId).queryKey, history);
  queryClient.setQueryData(practiceTotalsQueryOptions(stepId).queryKey, totals);
  queryClient.setQueryData(practiceStepDecisionQueryOptions(stepId).queryKey, decisionRecord);
  queryClient.setQueryData(stepTestHistoryQueryOptions(stepId).queryKey, []);
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
        onSelectionChange={vi.fn<() => void>()}
      />,
      { queryClient, routePaths: ["/", "/levels/$section/$page"] },
    );

    // Assert
    expect(screen.getByText("Training instructions are unavailable.")).toBeDefined();
  });

  it("navigates between prep, practice, and break views and records attempts", async () => {
    expect.hasAssertions();

    // Arrange
    const user = userEvent.setup();
    const onSelectionChange = vi.fn<() => void>();
    vi.mocked(recordPracticeAttemptFn).mockResolvedValueOnce({
      attemptId: "a1",
      dogId: "dog-1",
      outcome: "success",
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
    expect(screen.getByRole("heading", { name: "Current target" })).toBeDefined();

    // Act
    await user.click(screen.getByRole("button", { name: "Success" }));

    // Assert
    await waitFor(() => {
      expect(recordPracticeAttemptFn).toHaveBeenCalledOnce();
    });

    // Act
    await user.click(screen.getByRole("button", { name: "Take a break" }));

    // Assert
    expect(screen.getByRole("heading", { name: "Take a break" })).toBeDefined();

    // Act
    await user.click(screen.getByRole("button", { name: "Continue" }));

    // Assert
    expect(screen.getByRole("heading", { name: "Current target" })).toBeDefined();
  });

  it("handles step selection change, undo, correct, totals, and readiness decision", async () => {
    expect.hasAssertions();

    // Arrange
    const user = userEvent.setup();
    const onSelectionChange = vi.fn<() => void>();
    vi.mocked(undoPracticeAttemptFn).mockResolvedValueOnce({
      attemptId: "a1",
      undone: true,
    });
    vi.mocked(correctPracticeAttemptFn).mockResolvedValueOnce({
      attemptId: "a1",
      outcome: "not_yet",
    });
    vi.mocked(recordPracticeTotalsFn).mockResolvedValueOnce({
      notYetCount: 1,
      recordId: "t1",
      stepId: PRACTICE_STEP_ID,
      successCount: 2,
      target: "Target",
    });
    vi.mocked(correctPracticeTotalsFn).mockResolvedValueOnce({
      notYetCount: 0,
      recordId: "t1",
      successCount: 3,
    });
    vi.mocked(savePracticeStepDecisionFn).mockResolvedValueOnce({
      decision: "keep_practicing",
      stepId: PRACTICE_STEP_ID,
    });

    const queryClient = createTrainingQueryClient({
      history: [
        {
          attemptId: "a1",
          createdAt: new Date("2026-01-01T00:00:00.000Z"),
          outcome: "success",
          stepId: PRACTICE_STEP_ID,
          target: "10 seconds",
          undoneAt: null,
        },
        {
          attemptId: "a2",
          createdAt: new Date("2026-01-01T00:01:00.000Z"),
          outcome: "success",
          stepId: PRACTICE_STEP_ID,
          target: "10 seconds",
          undoneAt: null,
        },
        {
          attemptId: "a3",
          createdAt: new Date("2026-01-01T00:02:00.000Z"),
          outcome: "success",
          stepId: PRACTICE_STEP_ID,
          target: "10 seconds",
          undoneAt: null,
        },
      ],
    });
    const [, secondOption] = PRACTICE_STEP_OPTIONS;
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
    expect(onSelectionChange).toHaveBeenCalledWith(secondOption.stepId);
  });

  it("handles undo and correct in practice view", async () => {
    expect.hasAssertions();

    // Arrange
    const user = userEvent.setup();
    vi.mocked(undoPracticeAttemptFn).mockResolvedValueOnce({
      attemptId: "a1",
      undone: true,
    });
    vi.mocked(correctPracticeAttemptFn).mockResolvedValueOnce({
      attemptId: "a1",
      outcome: "not_yet",
    });
    const queryClient = createTrainingQueryClient({
      history: [
        {
          attemptId: "a1",
          createdAt: new Date("2026-01-01T00:00:00.000Z"),
          outcome: "success",
          stepId: PRACTICE_STEP_ID,
          target: "10 seconds",
          undoneAt: null,
        },
        {
          attemptId: "a2",
          createdAt: new Date("2026-01-01T00:01:00.000Z"),
          outcome: "success",
          stepId: PRACTICE_STEP_ID,
          target: "10 seconds",
          undoneAt: null,
        },
        {
          attemptId: "a3",
          createdAt: new Date("2026-01-01T00:02:00.000Z"),
          outcome: "success",
          stepId: PRACTICE_STEP_ID,
          target: "10 seconds",
          undoneAt: null,
        },
      ],
    });
    renderWithProviders(
      <CurriculumTrainingPage
        selectedStepId={PRACTICE_STEP_ID}
        selectedTarget={undefined}
        onSelectionChange={vi.fn<() => void>()}
      />,
      { queryClient, routePaths: ["/", "/levels/$section/$page"] },
    );

    // Act
    await user.click(screen.getByRole("button", { name: /^(?:Start|Resume) Practice$/u }));
    await user.click(screen.getByRole("button", { name: "Undo" }));

    // Assert
    await waitFor(() => {
      expect(undoPracticeAttemptFn).toHaveBeenCalledOnce();
    });
  });

  it("handles break view, attempt correction, totals submission, and save retry", async () => {
    expect.hasAssertions();

    // Arrange
    const user = userEvent.setup();
    vi.mocked(correctPracticeAttemptFn).mockResolvedValueOnce({
      attemptId: "a1",
      outcome: "not_yet",
    });
    vi.mocked(recordPracticeTotalsFn).mockResolvedValueOnce({
      notYetCount: 0,
      recordId: "t1",
      stepId: PRACTICE_STEP_ID,
      successCount: 2,
      target: "Target",
    });
    vi.mocked(recordPracticeAttemptFn)
      .mockRejectedValueOnce(new Error("Network down"))
      .mockResolvedValueOnce({
        attemptId: "a2",
        dogId: "dog-1",
        outcome: "success",
      });

    const queryClient = createTrainingQueryClient({
      history: [
        {
          attemptId: "a1",
          createdAt: new Date("2026-01-01T00:00:00.000Z"),
          outcome: "success",
          stepId: PRACTICE_STEP_ID,
          target: "10 seconds",
          undoneAt: null,
        },
        {
          attemptId: "a2",
          createdAt: new Date("2026-01-01T00:01:00.000Z"),
          outcome: "success",
          stepId: PRACTICE_STEP_ID,
          target: "10 seconds",
          undoneAt: null,
        },
        {
          attemptId: "a3",
          createdAt: new Date("2026-01-01T00:02:00.000Z"),
          outcome: "success",
          stepId: PRACTICE_STEP_ID,
          target: "10 seconds",
          undoneAt: null,
        },
      ],
    });
    renderWithProviders(
      <CurriculumTrainingPage
        selectedStepId={PRACTICE_STEP_ID}
        selectedTarget={undefined}
        onSelectionChange={vi.fn<() => void>()}
      />,
      { queryClient, routePaths: ["/", "/levels/$section/$page"] },
    );

    // Act: enter practice
    await user.click(screen.getByRole("button", { name: /^(?:Start|Resume) Practice$/u }));

    // Act: take a break and continue
    await user.click(screen.getByRole("button", { name: "Take a break" }));
    expect(screen.getByRole("heading", { name: "Take a break" })).toBeDefined();
    await user.click(screen.getByRole("button", { name: "Continue" }));
    expect(screen.getByRole("heading", { name: "Current target" })).toBeDefined();

    // Act: correct attempt
    const [firstCorrectButton] = screen.getAllByRole("button", { name: "Correct" });
    // oxlint-disable-next-line vitest/no-conditional-in-test -- Narrow array destructure without non-null assertion
    await user.click(firstCorrectButton ?? document.body);
    await waitFor(() => {
      expect(correctPracticeAttemptFn).toHaveBeenCalledOnce();
    });

    // Act: save totals
    await user.type(screen.getByLabelText("Success count"), "2");
    await user.click(screen.getByRole("button", { name: "Save totals" }));
    await waitFor(() => {
      expect(recordPracticeTotalsFn).toHaveBeenCalledOnce();
    });

    // Act: fail attempt and retry
    await user.click(screen.getByRole("button", { name: "Success" }));
    await waitFor(() => {
      expect(screen.getByText(/Could not save this attempt/u)).toBeDefined();
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
    const onSelectionChange = vi.fn<() => void>();
    vi.mocked(correctPracticeAttemptFn).mockResolvedValueOnce({
      attemptId: "a2",
      outcome: "success",
    });
    const queryClient = createTrainingQueryClient({
      history: [
        {
          attemptId: "a1",
          createdAt: new Date("2026-01-01T00:00:00.000Z"),
          outcome: "success",
          stepId: PRACTICE_STEP_ID,
          target: "Target",
          undoneAt: new Date("2026-01-01T00:01:00.000Z"),
        },
        {
          attemptId: "a2",
          createdAt: new Date("2026-01-01T00:02:00.000Z"),
          outcome: "not_yet",
          stepId: PRACTICE_STEP_ID,
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

    // Act: enter practice
    await user.click(screen.getByRole("button", { name: /^(?:Start|Resume) Practice$/u }));

    // Act: correct not_yet attempt
    await user.click(screen.getByRole("button", { name: "Correct" }));
    await waitFor(() => {
      expect(correctPracticeAttemptFn).toHaveBeenCalledOnce();
    });
  });

  it("renders unavailable message when curriculum page is not a behavior", () => {
    expect.hasAssertions();

    const queryClient = createTrainingQueryClient();
    queryClient.setQueryData(
      curriculumPageQueryOptions("level-1/zen").queryKey,
      createProsePageFixture({
        href: "/levels/level-1/zen",
        pageSlug: "level-1/zen",
        title: "Zen",
      }),
    );

    renderWithProviders(
      <CurriculumTrainingPage
        selectedStepId={PRACTICE_STEP_ID}
        selectedTarget={undefined}
        onSelectionChange={vi.fn<() => void>()}
      />,
      { queryClient, routePaths: ["/", "/levels/$section/$page"] },
    );

    expect(screen.getByText("Training instructions are unavailable.")).toBeDefined();
  });

  it("saves a practice decision and corrects totals", async () => {
    expect.hasAssertions();

    const user = userEvent.setup();
    vi.mocked(savePracticeStepDecisionFn).mockResolvedValueOnce({
      decision: "keep_practicing",
      stepId: PRACTICE_STEP_ID,
    });
    vi.mocked(correctPracticeTotalsFn).mockResolvedValueOnce({
      notYetCount: 1,
      recordId: "t1",
      successCount: 4,
    });

    const queryClient = createTrainingQueryClient({
      history: [
        {
          attemptId: "a1",
          createdAt: new Date("2026-01-01T00:00:00.000Z"),
          outcome: "success",
          stepId: PRACTICE_STEP_ID,
          target: "10 seconds",
          undoneAt: null,
        },
        {
          attemptId: "a2",
          createdAt: new Date("2026-01-01T00:01:00.000Z"),
          outcome: "success",
          stepId: PRACTICE_STEP_ID,
          target: "10 seconds",
          undoneAt: null,
        },
        {
          attemptId: "a3",
          createdAt: new Date("2026-01-01T00:02:00.000Z"),
          outcome: "success",
          stepId: PRACTICE_STEP_ID,
          target: "10 seconds",
          undoneAt: null,
        },
      ],
      totals: [
        {
          createdAt: new Date("2026-01-01T00:00:00.000Z"),
          notYetCount: 1,
          recordId: "t1",
          stepId: PRACTICE_STEP_ID,
          successCount: 3,
          target: "Target",
        },
      ],
    });

    renderWithProviders(
      <CurriculumTrainingPage
        selectedStepId={PRACTICE_STEP_ID}
        selectedTarget={undefined}
        onSelectionChange={vi.fn<() => void>()}
      />,
      { queryClient, routePaths: ["/", "/levels/$section/$page"] },
    );

    await user.click(screen.getByRole("button", { name: /^(?:Start|Resume) Practice$/u }));
    await user.click(screen.getByRole("button", { name: "Correct totals" }));
    await waitFor(() => {
      expect(correctPracticeTotalsFn).toHaveBeenCalledOnce();
    });

    await user.click(screen.getByRole("button", { name: "Keep practicing" }));
    await waitFor(() => {
      expect(savePracticeStepDecisionFn).toHaveBeenCalledWith({
        data: { decision: "keep_practicing", stepId: PRACTICE_STEP_ID },
      });
    });
  });

  it("defaults to the first practice step when selectedStepId is undefined", () => {
    expect.hasAssertions();

    // Arrange
    const queryClient = createTrainingQueryClient();

    // Act
    renderWithProviders(
      <CurriculumTrainingPage
        selectedStepId={undefined}
        selectedTarget={undefined}
        onSelectionChange={vi.fn<() => void>()}
      />,
      { queryClient, routePaths: ["/", "/levels/$section/$page"] },
    );

    // Assert
    expect(screen.getByText(/Practice · Level 1 Zen · Step 1/u)).toBeDefined();
  });

  it("falls back to selected step label when curriculum page omits the selected step", () => {
    expect.hasAssertions();

    // Arrange
    const queryClient = createTrainingQueryClient({
      page: createBehaviorPageFixture({ steps: [] }),
    });

    // Act
    renderWithProviders(
      <CurriculumTrainingPage
        selectedStepId={PRACTICE_STEP_ID}
        selectedTarget={undefined}
        onSelectionChange={vi.fn<() => void>()}
      />,
      { queryClient, routePaths: ["/", "/levels/$section/$page"] },
    );

    // Assert
    expect(screen.getByText(/full criterion: Level 1 Zen · Step 1/u)).toBeDefined();
  });

  it("switches to Guided Test view when starting a recommended test", async () => {
    expect.hasAssertions();

    // Arrange
    const user = userEvent.setup();
    const queryClient = createTrainingQueryClient({
      decisionRecord: {
        decidedAt: new Date("2026-01-01T00:00:00.000Z"),
        decision: "recommend_test",
        stepId: PRACTICE_STEP_ID,
      },
    });

    renderWithProviders(
      <CurriculumTrainingPage
        selectedStepId={PRACTICE_STEP_ID}
        selectedTarget={undefined}
        onSelectionChange={vi.fn<() => void>()}
      />,
      { queryClient, routePaths: ["/", "/levels/$section/$page"] },
    );

    // Act
    await user.click(screen.getByRole("button", { name: "Start Test" }));

    // Assert
    expect(screen.getByRole("heading", { name: "Guided Test" })).toBeDefined();
  });

  it("routes non-zen cold tests using the selected stepId and links Finish Test to its page", async () => {
    expect.hasAssertions();

    // Arrange
    const user = userEvent.setup();
    const stepId = "level-2/come:step-3";
    const queryClient = createTrainingQueryClient({
      decisionRecord: {
        decidedAt: new Date("2026-01-01T00:00:00.000Z"),
        decision: "recommend_test",
        stepId,
      },
      stepId,
    });
    queryClient.setQueryData(
      curriculumPageQueryOptions("level-2/come").queryKey,
      createBehaviorPageFixture({
        pageSlug: "level-2/come",
        steps: [
          createBehaviorStepFixture({
            heading: "Step 3: Call from 10 feet",
            stepId,
            stepNumber: 3,
          }),
        ],
        title: "Come",
      }),
    );

    renderWithProviders(
      <CurriculumTrainingPage
        selectedStepId={stepId}
        selectedTarget={undefined}
        onSelectionChange={vi.fn<() => void>()}
      />,
      { queryClient, routePaths: ["/", "/levels/$section/$page"] },
    );

    // Act
    await user.click(screen.getByRole("button", { name: "Start Test" }));

    // Assert
    expect(screen.getByRole("heading", { name: "Guided Test" })).toBeDefined();
    expect(screen.getByRole("link", { name: "Finish Test" }).getAttribute("href")).toBe(
      "/levels/level-2/come",
    );
  });

  it("uses ladder plan target options when selected step has a practice ladder", () => {
    expect.hasAssertions();

    // Arrange
    const stepId = "level-3/crate:step-2";
    const queryClient = createTrainingQueryClient({ stepId });
    queryClient.setQueryData(
      curriculumPageQueryOptions("level-3/crate").queryKey,
      createBehaviorPageFixture({ pageSlug: "level-3/crate", title: "Crate" }),
    );

    // Act
    renderWithProviders(
      <CurriculumTrainingPage
        selectedStepId={stepId}
        selectedTarget={undefined}
        onSelectionChange={vi.fn<() => void>()}
      />,
      { queryClient, routePaths: ["/", "/levels/$section/$page"] },
    );

    // Assert
    expect(screen.getByLabelText("Current practice target").textContent).toBe("2 feet · 0 seconds");
  });

  it("skips undone attempts when counting trailing successes", () => {
    expect.hasAssertions();

    // Arrange
    const stepId = "level-1/zen:step-2";
    const queryClient = createTrainingQueryClient({
      history: [
        {
          attemptId: "a1",
          createdAt: new Date("2026-01-01T00:00:00.000Z"),
          outcome: "success",
          stepId,
          target: "Dog stays away from the treat in your closed fist for 1 second.",
          undoneAt: null,
        },
        {
          attemptId: "a2",
          createdAt: new Date("2026-01-01T00:01:00.000Z"),
          outcome: "success",
          stepId,
          target: "2 seconds",
          undoneAt: new Date("2026-01-01T00:02:00.000Z"),
        },
      ],
      stepId,
    });

    // Act
    renderWithProviders(
      <CurriculumTrainingPage
        selectedStepId={stepId}
        selectedTarget={undefined}
        onSelectionChange={vi.fn<() => void>()}
      />,
      { queryClient, routePaths: ["/", "/levels/$section/$page"] },
    );

    // Assert
    expect(screen.getByLabelText("Current practice target").textContent).toBe(
      "Dog stays away from the treat in your closed fist for 2 seconds.",
    );
  });

  it("selects guidance target when progression is unavailable", () => {
    expect.hasAssertions();

    // Arrange
    const stepId = "level-1/sit:step-1";
    const queryClient = createTrainingQueryClient({ stepId });
    queryClient.setQueryData(
      curriculumPageQueryOptions("level-1/sit").queryKey,
      createBehaviorPageFixture({
        pageSlug: "level-1/sit",
        steps: [
          createBehaviorStepFixture({
            heading: "Step 1: Capture offered sit",
            stepId,
            stepNumber: 1,
          }),
        ],
        title: "Sit",
      }),
    );

    // Act
    renderWithProviders(
      <CurriculumTrainingPage
        selectedStepId={stepId}
        selectedTarget={undefined}
        onSelectionChange={vi.fn<() => void>()}
      />,
      { queryClient, routePaths: ["/", "/levels/$section/$page"] },
    );

    // Assert
    expect(screen.getByLabelText("Current practice target").textContent).toBe(
      "Step 1: Capture offered sit",
    );
  });

  it("falls back to default target when plan, guidance, and progression are unavailable", () => {
    expect.hasAssertions();

    // Arrange
    const stepId = "level-1/sit:step-1";
    const queryClient = createTrainingQueryClient({ stepId });
    queryClient.setQueryData(
      curriculumPageQueryOptions("level-1/sit").queryKey,
      createBehaviorPageFixture({
        pageSlug: "level-1/sit",
        steps: [
          createBehaviorStepFixture({
            heading: " ",
            stepId,
            stepNumber: 1,
          }),
        ],
        title: "Sit",
      }),
    );

    // Act
    renderWithProviders(
      <CurriculumTrainingPage
        selectedStepId={stepId}
        selectedTarget={undefined}
        onSelectionChange={vi.fn<() => void>()}
      />,
      { queryClient, routePaths: ["/", "/levels/$section/$page"] },
    );

    // Assert
    expect(screen.getByLabelText("Current practice target").textContent).toBe(
      "Level 1 Sit · Step 1",
    );
  });

  it("defers cold test eligibility on SSR and updates mode and exclusions", async () => {
    expect.hasAssertions();

    const user = userEvent.setup();
    const onModeChange = vi.fn<() => void>();
    const onSelectionChange = vi.fn<() => void>();
    const readyOverview = createEmptyOverview({
      stepDecisions: [
        {
          decidedAt: new Date("2020-01-01T00:00:00.000Z"),
          decision: "recommend_test",
          stepId: PRACTICE_STEP_ID,
        },
      ],
    });
    const singleBehaviorSyllabus: CurriculumSyllabus = {
      sections: [
        {
          href: "/curriculum/level-1",
          levelNumber: 1,
          pages: [
            {
              href: "/curriculum/level-1/zen",
              kind: "behavior",
              levelNumber: 1,
              order: 1,
              pageSlug: "level-1/zen",
              sectionSlug: "level-1",
              stepIds: [PRACTICE_STEP_ID],
              title: "Zen",
            },
          ],
          sectionSlug: "level-1",
          title: "Level 1",
        },
      ],
      totalBehaviors: 1,
      totalPages: 1,
      totalSteps: 1,
    };

    const ssrClient = createTrainingQueryClient({
      overview: readyOverview,
      syllabus: singleBehaviorSyllabus,
    });
    const { wrapper: SsrWrapper } = createTestingWrapper({
      queryClient: ssrClient,
      routePaths: ["/", "/levels/$section/$page"],
    });
    const view = renderToString(
      <SsrWrapper>
        <CurriculumTrainingPage
          selectedStepId={undefined}
          selectedTarget={undefined}
          onSelectionChange={onSelectionChange}
        />
      </SsrWrapper>,
    );
    expect(view).toContain("Recommended next: Practice");

    const client = createTrainingQueryClient({
      overview: readyOverview,
      syllabus: singleBehaviorSyllabus,
    });
    renderWithProviders(
      <CurriculumTrainingPage
        selectedStepId={undefined}
        selectedTarget={undefined}
        onModeChange={onModeChange}
        onSelectionChange={onSelectionChange}
      />,
      { queryClient: client, routePaths: ["/", "/levels/$section/$page"] },
    );

    expect(screen.getByText(/Recommended next: Cold Test/u)).toBeDefined();

    await user.click(screen.getByRole("button", { name: "Practice" }));
    expect(onModeChange).toHaveBeenCalledWith("practice");

    await user.click(screen.getByRole("button", { name: "Practice" }));
    expect(onModeChange).toHaveBeenCalledWith();

    await user.click(screen.getByRole("button", { name: "Suggest another activity" }));
    await user.click(screen.getByRole("button", { name: "Suggest another activity" }));
    await user.click(screen.getByRole("button", { name: "Reset suggestions" }));
    expect(onSelectionChange).toHaveBeenCalledWith();
  });

  it("opens waiting test step from waitingTestNotice callout", async () => {
    expect.hasAssertions();

    const user = userEvent.setup();
    const onSelectionChange = vi.fn<() => void>();
    const waitingOverview = createEmptyOverview({
      practiceAttempts: [
        {
          attemptId: "a-today",
          createdAt: new Date(),
          outcome: "success",
          stepId: PRACTICE_STEP_ID,
          target: "10 seconds",
          undoneAt: null,
        },
      ],
      stepDecisions: [
        {
          decidedAt: new Date("2020-01-01T00:00:00.000Z"),
          decision: "recommend_test",
          stepId: PRACTICE_STEP_ID,
        },
      ],
    });
    const client = createTrainingQueryClient({
      overview: waitingOverview,
      stepId: "level-1/zen:step-2",
    });

    renderWithProviders(
      <CurriculumTrainingPage
        selectedStepId={undefined}
        selectedTarget={undefined}
        onSelectionChange={onSelectionChange}
      />,
      { queryClient: client, routePaths: ["/", "/levels/$section/$page"] },
    );

    await user.click(screen.getByRole("button", { name: "Open waiting Test" }));
    expect(onSelectionChange).toHaveBeenCalledWith(PRACTICE_STEP_ID);
  });

  it("blocks later-level training until temporary override checkbox is confirmed and keeps active step locked mid-session", async () => {
    expect.hasAssertions();

    const user = userEvent.setup();
    const stepId = "level-2/zen:step-1";
    const queryClient = createTrainingQueryClient({ stepId });
    queryClient.setQueryData(
      curriculumPageQueryOptions("level-2/zen").queryKey,
      createBehaviorPageFixture({
        levelNumber: 2,
        pageSlug: "level-2/zen",
        steps: [createBehaviorStepFixture({ stepId, stepNumber: 1 })],
        title: "Zen",
      }),
    );

    renderWithProviders(
      <CurriculumTrainingPage
        selectedStepId={stepId}
        selectedTarget={undefined}
        onSelectionChange={vi.fn<() => void>()}
      />,
      { queryClient, routePaths: ["/", "/levels/$section/$page"] },
    );

    const startButton = screen.getByRole("button", { name: "Start Practice" });
    expect(startButton).toHaveProperty("disabled", true);

    await user.click(
      screen.getByRole("checkbox", {
        name: "Train this Level 2 Behavior for this Training only (keeps Level 1 as your current Level goal)",
      }),
    );
    expect(startButton).toHaveProperty("disabled", false);

    await user.click(startButton);
    expect(screen.getByRole("heading", { name: "Current target" })).toBeDefined();

    queryClient.setQueryData(
      trainingOverviewQueryOptions().queryKey,
      createEmptyOverview({
        curriculumProgress: [{ completedAt: new Date("2026-01-01T00:00:00Z"), stepId }],
      }),
    );
    expect(screen.getByText(/Practice · Level 2 Zen · Step 1/u)).toBeDefined();
  });

  it("renders the Cold Test offer in Prep when selectedMode is test even if recommendation mode is practice", async () => {
    expect.hasAssertions();

    const user = userEvent.setup();
    const stepId = "level-2/zen:step-1";
    const queryClient = createTrainingQueryClient({ stepId });
    queryClient.setQueryData(
      curriculumPageQueryOptions("level-2/zen").queryKey,
      createBehaviorPageFixture({
        levelNumber: 2,
        pageSlug: "level-2/zen",
        steps: [createBehaviorStepFixture({ stepId, stepNumber: 1 })],
        title: "Zen",
      }),
    );

    renderWithProviders(
      <CurriculumTrainingPage
        selectedMode="test"
        selectedStepId={stepId}
        selectedTarget={undefined}
        onSelectionChange={vi.fn<() => void>()}
      />,
      { queryClient, routePaths: ["/", "/levels/$section/$page"] },
    );

    expect(screen.getByRole("heading", { name: "Test this Step cold" })).toBeDefined();
    const startTestButton = screen.getByRole("button", { name: "Start Test" });
    expect(startTestButton).toHaveProperty("disabled", true);

    await user.click(
      screen.getByRole("checkbox", {
        name: "Train this Level 2 Behavior for this Training only (keeps Level 1 as your current Level goal)",
      }),
    );
    expect(startTestButton).toHaveProperty("disabled", false);
  });

  it("renders unavailable message when resolved stepId is not in main quest options", () => {
    expect.hasAssertions();

    const customSyllabus: CurriculumSyllabus = {
      sections: [
        {
          href: "/curriculum/level-1",
          levelNumber: 1,
          pages: [
            {
              href: "/curriculum/level-1/zen",
              kind: "behavior",
              levelNumber: 1,
              order: 1,
              pageSlug: "level-1/zen",
              sectionSlug: "level-1",
              stepIds: ["unknown-step-id"],
              title: "Zen",
            },
          ],
          sectionSlug: "level-1",
          title: "Level 1",
        },
      ],
      totalBehaviors: 1,
      totalPages: 1,
      totalSteps: 1,
    };
    const queryClient = createTrainingQueryClient({ syllabus: customSyllabus });

    renderWithProviders(
      <CurriculumTrainingPage
        selectedStepId={undefined}
        selectedTarget={undefined}
        onSelectionChange={vi.fn<() => void>()}
      />,
      { queryClient, routePaths: ["/", "/levels/$section/$page"] },
    );

    expect(screen.getByText("Training instructions are unavailable.")).toBeDefined();
  });

  it("honors valid selectedTarget, curriculumProgress completions, and target ladder changes", async () => {
    expect.hasAssertions();

    const user = userEvent.setup();
    const onSelectionChange = vi.fn<() => void>();
    const stepId = "level-1/zen:step-2";
    const queryClient = createTrainingQueryClient({
      overview: createEmptyOverview({
        curriculumProgress: [
          { completedAt: new Date("2026-01-01T00:00:00.000Z"), stepId: PRACTICE_STEP_ID },
        ],
      }),
      stepId,
    });

    renderWithProviders(
      <CurriculumTrainingPage
        selectedStepId={undefined}
        selectedTarget="Dog stays away from the treat in your closed fist for 2 seconds."
        onSelectionChange={onSelectionChange}
      />,
      { queryClient, routePaths: ["/", "/levels/$section/$page"] },
    );

    expect(screen.getByLabelText("Current practice target").textContent).toBe(
      "Dog stays away from the treat in your closed fist for 2 seconds.",
    );

    await user.click(screen.getByRole("button", { name: /^(?:Start|Resume) Practice$/u }));
    await user.click(screen.getByRole("button", { name: "Next ladder target" }));
    expect(onSelectionChange).toHaveBeenCalledWith(
      stepId,
      "Dog stays away from the treat in your closed fist for 3 seconds.",
    );
  });

  it("switches to test-override view when starting a cold test after same-day practice", async () => {
    expect.hasAssertions();

    const user = userEvent.setup();
    const queryClient = createTrainingQueryClient({
      decisionRecord: {
        decidedAt: new Date(),
        decision: "recommend_test",
        stepId: PRACTICE_STEP_ID,
      },
      history: [
        {
          attemptId: "a-today",
          createdAt: new Date(),
          outcome: "success",
          stepId: PRACTICE_STEP_ID,
          target: "Target",
          undoneAt: null,
        },
      ],
    });

    renderWithProviders(
      <CurriculumTrainingPage
        selectedStepId={PRACTICE_STEP_ID}
        selectedTarget={undefined}
        onSelectionChange={vi.fn<() => void>()}
      />,
      { queryClient, routePaths: ["/", "/levels/$section/$page"] },
    );

    await user.click(
      screen.getByRole("checkbox", {
        name: "I confirm I can test this Behavior cold without warming it up now.",
      }),
    );
    await user.click(screen.getByRole("button", { name: "Start Test" }));
    expect(screen.getByText("You confirmed this Test is cold today.")).toBeDefined();
  });
});
