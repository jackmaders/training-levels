import { QueryClient } from "@tanstack/react-query";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vite-plus/test";

import {
  TEST_BEHAVIOR_PAGE,
  TEST_THEORY_PAGE,
  createBehaviorPageFixture,
} from "@test/vitest/fixtures/curriculum";
import { renderWithProviders } from "@test/vitest/wrappers/testing-wrapper";

import { curriculumPageQueryOptions } from "../../api/curriculum-query-options";
import { PRACTICE_STEP_ID, stepTestHistoryQueryOptions } from "../../api/training-query-options";
import {
  CurriculumTrainingStepTestOffer,
  CurriculumTrainingTestGate,
} from "../curriculum-training-step-test";

vi.mock(import("../../api/training.functions"));

const [FIRST_STEP] = TEST_BEHAVIOR_PAGE.steps;
if (!FIRST_STEP) {
  throw new Error("Missing fixture step");
}

function createStepTestQueryClient({
  page = createBehaviorPageFixture({
    ...TEST_BEHAVIOR_PAGE,
    steps: [
      {
        ...FIRST_STEP,
        anchor: "step-1",
        comeafters: null,
        heading: "Step 1",
        instructions: [
          {
            type: "paragraph" as const,
            content: [{ text: "Step instructions", type: "text" as const }],
          },
        ],
        stepId: PRACTICE_STEP_ID,
        stepNumber: 1,
        tryItCold: [
          {
            type: "paragraph" as const,
            content: [{ text: "Cold instructions", type: "text" as const }],
          },
        ],
      },
    ],
  }),
  pageSlug = "level-1/zen",
  stepId = PRACTICE_STEP_ID,
  testHistory = [],
}: {
  page?: ReturnType<typeof createBehaviorPageFixture> | typeof TEST_THEORY_PAGE | null;
  pageSlug?: string;
  stepId?: string;
  testHistory?: {
    coldOverride: boolean;
    outcome: "success" | "not_yet";
    stepId: string;
    testId: string;
    testedAt: Date;
  }[];
} = {}) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  });
  queryClient.setQueryData(curriculumPageQueryOptions(pageSlug).queryKey, page);
  queryClient.setQueryData(stepTestHistoryQueryOptions(stepId).queryKey, testHistory);
  return queryClient;
}

describe("curriculum training step test", () => {
  it("renders nothing when step is missing, page is non-behavior, or tryItCold is absent", () => {
    expect.hasAssertions();

    // Arrange
    const queryClient = createStepTestQueryClient();
    queryClient.setQueryData(curriculumPageQueryOptions("other-step").queryKey, null);
    queryClient.setQueryData(
      curriculumPageQueryOptions("theory/01-foreword").queryKey,
      TEST_THEORY_PAGE,
    );
    queryClient.setQueryData(
      curriculumPageQueryOptions("level-1/come").queryKey,
      createBehaviorPageFixture({
        pageSlug: "level-1/come",
        steps: [{ ...FIRST_STEP, stepId: "level-1/come:step-5", tryItCold: null }],
      }),
    );

    // Act
    const { rerender } = renderWithProviders(
      <CurriculumTrainingStepTestOffer
        decision="recommend_test"
        history={[]}
        onStartTest={vi.fn<() => void>()}
        stepId="other-step"
        totals={[]}
      />,
      { queryClient, routePaths: ["/"] },
    );

    // Assert
    expect(screen.queryByText("Test this Step cold")).toBeNull();

    // Act
    rerender(
      <CurriculumTrainingStepTestOffer
        decision="recommend_test"
        history={[]}
        onStartTest={vi.fn<() => void>()}
        stepId="theory/01-foreword:step-1"
        totals={[]}
      />,
    );

    // Assert
    expect(screen.queryByText("Test this Step cold")).toBeNull();

    // Act
    rerender(
      <CurriculumTrainingStepTestOffer
        decision="recommend_test"
        history={[]}
        onStartTest={vi.fn<() => void>()}
        stepId="level-1/come:step-5"
        totals={[]}
      />,
    );

    // Assert
    expect(screen.queryByText("Test this Step cold")).toBeNull();

    // Act
    rerender(
      <CurriculumTrainingStepTestOffer
        decision="recommend_test"
        history={[]}
        onStartTest={vi.fn<() => void>()}
        stepId="level-1/zen:step-99"
        totals={[]}
      />,
    );

    // Assert
    expect(screen.queryByText("Test this Step cold")).toBeNull();
  });

  it("renders test offer and calls onStartTest when eligible", async () => {
    expect.hasAssertions();

    // Arrange
    const user = userEvent.setup();
    const onStartTest = vi.fn<() => void>();
    const stepId = "level-2/come:step-3";
    const queryClient = createStepTestQueryClient({
      page: createBehaviorPageFixture({
        pageSlug: "level-2/come",
        steps: [
          {
            ...FIRST_STEP,
            stepId,
            tryItCold: [
              {
                type: "paragraph" as const,
                content: [{ text: "Come Step 3 cold instructions", type: "text" as const }],
              },
            ],
          },
        ],
      }),
      pageSlug: "level-2/come",
      stepId,
    });
    renderWithProviders(
      <CurriculumTrainingStepTestOffer
        decision="recommend_test"
        history={[
          {
            attemptId: "a1",
            createdAt: new Date("2020-01-01T00:00:00.000Z"),
            outcome: "success",
            target: "First target",
            undoneAt: null,
          },
          {
            attemptId: "a2",
            createdAt: new Date(),
            outcome: "not_yet",
            target: "Undone attempt today",
            undoneAt: new Date(),
          },
        ]}
        onStartTest={onStartTest}
        stepId={stepId}
        totals={[{ createdAt: new Date("2020-01-02T00:00:00.000Z") }]}
      />,
      { queryClient, routePaths: ["/"] },
    );

    // Act
    await user.click(screen.getByRole("button", { name: "Start Test" }));

    // Assert
    expect(onStartTest).toHaveBeenCalledWith(false);
  });

  it("renders children when gate is inactive and renders test or fallback when active", () => {
    expect.hasAssertions();

    // Arrange
    const inactiveClient = createStepTestQueryClient();
    const missingClient = createStepTestQueryClient({ page: null });

    // Act
    const { unmount } = renderWithProviders(
      <CurriculumTrainingTestGate active={false} coldOverride={false} stepId={PRACTICE_STEP_ID}>
        <p>Practice view</p>
      </CurriculumTrainingTestGate>,
      { queryClient: inactiveClient, routePaths: ["/"] },
    );

    // Assert
    expect(screen.getByText("Practice view")).toBeDefined();
    unmount();

    // Act
    renderWithProviders(
      <CurriculumTrainingTestGate active coldOverride={false} stepId={PRACTICE_STEP_ID}>
        <p>Practice view</p>
      </CurriculumTrainingTestGate>,
      { queryClient: missingClient, routePaths: ["/"] },
    );

    // Assert
    expect(screen.getByText("Cold Test instructions are unavailable.")).toBeDefined();
  });

  it("renders TrainingTest when gate is active for any cold-testable step", () => {
    expect.hasAssertions();

    // Arrange
    const stepId = "level-2/come:step-3";
    const queryClient = createStepTestQueryClient({
      page: createBehaviorPageFixture({
        pageSlug: "level-2/come",
        steps: [
          {
            ...FIRST_STEP,
            stepId,
            tryItCold: [
              {
                type: "paragraph" as const,
                content: [{ text: "Cold instructions for Come Step 3", type: "text" as const }],
              },
            ],
          },
        ],
      }),
      pageSlug: "level-2/come",
      stepId,
    });

    // Act
    renderWithProviders(
      <CurriculumTrainingTestGate active coldOverride={false} stepId={stepId}>
        <p>Practice view</p>
      </CurriculumTrainingTestGate>,
      { queryClient, routePaths: ["/", "/levels/$section/$page"] },
    );

    // Assert
    expect(screen.getByText("Cold instructions for Come Step 3")).toBeDefined();
    expect(screen.getByRole("link", { name: "Finish Test" }).getAttribute("href")).toBe(
      "/levels/level-2/come",
    );
  });

  it("forwards recommendedMode and blockedByOverride to CurriculumTrainingTestOffer", () => {
    expect.hasAssertions();

    const stepId = "level-1/zen:step-1";
    const queryClient = createStepTestQueryClient({ stepId });

    renderWithProviders(
      <CurriculumTrainingStepTestOffer
        blockedByOverride
        decision={null}
        history={[]}
        onStartTest={vi.fn<() => void>()}
        recommendedMode="test"
        stepId={stepId}
        totals={[]}
      />,
      { queryClient, routePaths: ["/"] },
    );

    expect(screen.getByRole("button", { name: "Start Test" })).toHaveProperty("disabled", true);
  });
});
