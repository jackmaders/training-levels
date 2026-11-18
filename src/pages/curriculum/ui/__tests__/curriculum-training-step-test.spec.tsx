import { QueryClient } from "@tanstack/react-query";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vite-plus/test";

import { TEST_BEHAVIOR_PAGE, createBehaviorPageFixture } from "@test/vitest/fixtures/curriculum";
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
  testHistory = [],
}: {
  page?: ReturnType<typeof createBehaviorPageFixture> | null;
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
  queryClient.setQueryData(curriculumPageQueryOptions("level-1/zen").queryKey, page);
  queryClient.setQueryData(stepTestHistoryQueryOptions().queryKey, testHistory);
  return queryClient;
}

describe("curriculum training step test", () => {
  it("renders nothing when stepId does not match or step is missing", () => {
    expect.hasAssertions();

    // Arrange
    const queryClient = createStepTestQueryClient();

    // Act
    renderWithProviders(
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
  });

  it("renders test offer and calls onStartTest when eligible", async () => {
    expect.hasAssertions();

    // Arrange
    const user = userEvent.setup();
    const onStartTest = vi.fn<() => void>();
    const queryClient = createStepTestQueryClient();
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
        ]}
        onStartTest={onStartTest}
        stepId={PRACTICE_STEP_ID}
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
      <CurriculumTrainingTestGate active={false} coldOverride={false}>
        <p>Practice view</p>
      </CurriculumTrainingTestGate>,
      { queryClient: inactiveClient, routePaths: ["/"] },
    );

    // Assert
    expect(screen.getByText("Practice view")).toBe(true);
    unmount();

    // Act
    renderWithProviders(
      <CurriculumTrainingTestGate active coldOverride={false}>
        <p>Practice view</p>
      </CurriculumTrainingTestGate>,
      { queryClient: missingClient, routePaths: ["/"] },
    );

    // Assert
    expect(screen.getByText("Cold Test instructions are unavailable.")).toBe(true);
  });

  it("renders TrainingTest when gate is active and step is present", () => {
    expect.hasAssertions();

    // Arrange
    const queryClient = createStepTestQueryClient();

    // Act
    renderWithProviders(
      <CurriculumTrainingTestGate active coldOverride={false}>
        <p>Practice view</p>
      </CurriculumTrainingTestGate>,
      { queryClient, routePaths: ["/"] },
    );

    // Assert
    expect(screen.getByText("Cold instructions")).toBe(true);
  });
});
