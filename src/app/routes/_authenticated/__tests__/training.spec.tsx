import type { QueryClient } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ComponentType } from "react";
import { beforeEach, describe, expect, it, vi } from "vite-plus/test";

import { Route as TrainingRoute } from "@/app/routes/_authenticated/training";
import { recommendNextTrainingActivity, type TrainingRecommendationMode } from "@/pages/curriculum";
import { TEST_SYLLABUS } from "@test/vitest/fixtures/curriculum";
import { getRouteOption } from "@test/vitest/helpers/route";
import { createTestingWrapper } from "@test/vitest/wrappers/testing-wrapper";

const { mockNavigate, mockSearch } = vi.hoisted(() => ({
  mockNavigate: vi.fn<() => Promise<void>>(),
  mockSearch: vi.fn<
    () => {
      level?: "level-1" | "level-2" | "level-3" | "level-4";
      mode?: TrainingRecommendationMode;
      stepId?: string;
      target?: string;
    }
  >(() => ({
    stepId: "level-1/zen:step-1",
    target: "3 seconds",
  })),
}));

const BASE_QUERY_COUNT = 2;
const QUERIES_PER_STEP = 5;
const DISTINCT_STEP_COUNT = 3;
const INVALID_NUMERIC_STEP_ID = 123;

vi.mock(import("@/pages/curriculum"), async (importOriginal) => {
  const actual: object = await importOriginal();
  return {
    ...actual,
    CurriculumTrainingHubPage: ({ levelId }: { levelId?: string }) => (
      <div data-level={levelId}>Training Hub</div>
    ),
    CurriculumTrainingPage: ({
      onModeChange,
      onSelectionChange,
      selectedMode,
      selectedStepId,
      selectedTarget,
    }: {
      onModeChange?: (mode: TrainingRecommendationMode | undefined) => void;
      onSelectionChange: (stepId: string | undefined, target?: string) => void;
      selectedMode?: TrainingRecommendationMode;
      selectedStepId?: string;
      selectedTarget?: string;
    }) => (
      <div>
        <button
          data-mode={selectedMode}
          data-step={selectedStepId}
          data-target={selectedTarget}
          type="button"
          onClick={() => {
            onSelectionChange("level-1/zen:step-2", "5 seconds");
          }}
        >
          Trigger
        </button>
        <button
          type="button"
          onClick={() => {
            onModeChange?.("practice");
          }}
        >
          Mode
        </button>
      </div>
    ),
    recommendNextTrainingActivity: vi.fn<typeof recommendNextTrainingActivity>(),
  } as never;
});

type ValidateSearchFn = (search: Record<string, unknown>) => {
  mode: TrainingRecommendationMode | undefined;
  stepId: string | undefined;
  target: string | undefined;
};

type LoaderDepsFn = (ctx: { search: { mode?: TrainingRecommendationMode; stepId?: string } }) => {
  mode: TrainingRecommendationMode | undefined;
  stepId: string | undefined;
};

type TrainingLoader = (ctx: {
  context: { queryClient: QueryClient };
  deps: { mode: TrainingRecommendationMode | undefined; stepId: string | undefined };
}) => Promise<unknown>;

beforeEach(() => {
  vi.clearAllMocks();
});

describe("training route", () => {
  it("validates search params without defaulting omitted stepId", () => {
    expect.assertions(4);

    const validateSearch = getRouteOption(TrainingRoute, "validateSearch") as ValidateSearchFn;

    expect(
      validateSearch({
        level: "level-2",
        mode: "practice",
        stepId: "level-1/zen:step-1",
        target: "3 seconds",
      }),
    ).toStrictEqual({
      level: "level-2",
      mode: "practice",
      stepId: "level-1/zen:step-1",
      target: "3 seconds",
    });
    expect(validateSearch({ mode: "test", stepId: "level-4/communication:step-5" })).toStrictEqual({
      mode: "test",
      stepId: "level-4/communication:step-5",
      target: undefined,
    });
    expect(validateSearch({ mode: "other", stepId: "invalid-step", target: null })).toStrictEqual({
      mode: undefined,
      stepId: undefined,
      target: undefined,
    });
    expect(validateSearch({ stepId: INVALID_NUMERIC_STEP_ID })).toStrictEqual({
      mode: undefined,
      stepId: undefined,
      target: undefined,
    });
  });

  it("extracts loaderDeps and prefetches overview, syllabus, recommended steps, and explicit stepId", async () => {
    expect.assertions(4);

    const loaderDeps = getRouteOption(TrainingRoute, "loaderDeps") as LoaderDepsFn;
    expect(
      loaderDeps({ search: { mode: "practice", stepId: "level-2/zen:step-1" } }),
    ).toStrictEqual({
      mode: "practice",
      stepId: "level-2/zen:step-1",
    });

    const overview = {
      curriculumProgress: [],
      practiceAttempts: [],
      practiceTotals: [],
      stepDecisions: [],
      stepTests: [],
    };
    const query = vi
      .fn<(options: { queryKey: readonly unknown[] }) => Promise<unknown>>()
      .mockResolvedValueOnce(overview)
      .mockResolvedValueOnce(TEST_SYLLABUS)
      .mockResolvedValue(null);
    const queryClient = { query } as unknown as QueryClient;
    const loader = getRouteOption(TrainingRoute, "loader") as TrainingLoader;

    vi.mocked(recommendNextTrainingActivity)
      .mockReturnValueOnce({
        behaviorTitle: "Zen",
        currentLevelNumber: 1,
        fallbackMode: "none",
        levelNumber: 1,
        mode: "practice",
        pageSlug: "level-1/zen",
        reason: "SSR practice",
        stepId: "level-1/zen:step-1",
        stepLabel: "Step 1",
        waitingTestNotice: null,
      })
      .mockReturnValueOnce({
        behaviorTitle: "Come",
        currentLevelNumber: 1,
        fallbackMode: "none",
        levelNumber: 1,
        mode: "test",
        pageSlug: "level-1/come",
        reason: "Client test",
        stepId: "level-1/come:step-1",
        stepLabel: "Step 1",
        waitingTestNotice: null,
      });

    await loader({
      context: { queryClient },
      deps: { mode: undefined, stepId: "level-2/zen:step-1" },
    });

    expect(recommendNextTrainingActivity).toHaveBeenCalledTimes(BASE_QUERY_COUNT);
    expect(query).toHaveBeenCalledTimes(BASE_QUERY_COUNT + DISTINCT_STEP_COUNT * QUERIES_PER_STEP);

    vi.mocked(recommendNextTrainingActivity).mockReturnValue({
      behaviorTitle: "Zen",
      currentLevelNumber: 1,
      fallbackMode: "none",
      levelNumber: 1,
      mode: "practice",
      pageSlug: "level-1/zen",
      reason: "Practice",
      stepId: "level-1/zen:step-1",
      stepLabel: "Step 1",
      waitingTestNotice: null,
    });
    query
      .mockClear()
      .mockResolvedValueOnce(overview)
      .mockResolvedValueOnce(TEST_SYLLABUS)
      .mockResolvedValue(null);

    await loader({
      context: { queryClient },
      deps: { mode: "practice", stepId: undefined },
    });

    expect(query).toHaveBeenCalledTimes(BASE_QUERY_COUNT);
  });

  it("renders CurriculumTrainingPage and navigates on selection and mode changes", async () => {
    expect.assertions(3);

    const user = userEvent.setup();
    vi.spyOn(TrainingRoute, "useSearch").mockImplementation(mockSearch);
    vi.spyOn(TrainingRoute, "useNavigate").mockReturnValue(mockNavigate);

    const Component = getRouteOption(TrainingRoute, "component") as ComponentType;
    const { wrapper } = createTestingWrapper();
    const { rerender } = render(<Component />, { wrapper });

    await user.click(screen.getByRole("button", { name: "Trigger" }));
    expect(mockNavigate).toHaveBeenCalledWith({
      replace: true,
      search: { stepId: "level-1/zen:step-2", target: "5 seconds" },
    });

    await user.click(screen.getByRole("button", { name: "Mode" }));
    expect(mockNavigate).toHaveBeenCalledWith({
      replace: true,
      search: { mode: "practice", stepId: "level-1/zen:step-1" },
    });

    mockSearch.mockReturnValue({ mode: "practice", stepId: "level-1/zen:step-1" });
    rerender(<Component />);
    await user.click(screen.getByRole("button", { name: "Trigger" }));
    expect(mockNavigate).toHaveBeenCalledWith({
      replace: true,
      search: { mode: "practice", stepId: "level-1/zen:step-2", target: "5 seconds" },
    });
  });

  it("renders CurriculumTrainingHubPage when stepId is undefined and runner with Back to Training when stepId is set", () => {
    expect.assertions(5);

    vi.spyOn(TrainingRoute, "useSearch").mockImplementation(mockSearch);
    vi.spyOn(TrainingRoute, "useNavigate").mockReturnValue(mockNavigate);

    mockSearch.mockReturnValue({ level: "level-2" });
    const Component = getRouteOption(TrainingRoute, "component") as ComponentType;
    const { wrapper } = createTestingWrapper();
    const { rerender } = render(<Component />, { wrapper });

    expect(screen.getByText("Training Hub").dataset["level"]).toBe("level-2");
    expect(screen.queryByRole("button", { name: "Back to Training" })).toBeNull();

    mockSearch.mockReturnValue({ level: "level-2", stepId: "level-1/zen:step-1" });
    rerender(<Component />);

    expect(screen.queryByText("Training Hub")).toBeNull();
    expect(screen.getByRole("button", { name: "Back to Training" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Trigger" }).dataset["step"]).toBe(
      "level-1/zen:step-1",
    );
  });
});
