import { screen } from "@testing-library/react";
import { describe, expect, it } from "vite-plus/test";

import { renderWithProviders } from "@test/vitest/wrappers/testing-wrapper";

import type {
  CurriculumBehaviorTrainingState,
  CurriculumStepTrainingState,
} from "../../model/curriculum-training-state";
import {
  CurriculumBehaviorTrainingSummary,
  StepActiveTrainingBadge,
  StepTrainingLinks,
  TrainingStateBadge,
} from "../curriculum-training-status-summary";

const LEVEL_ONE = 1;
const LEVEL_TWO = 2;
const STEP_ONE = 1;
const STEP_FIVE = 5;

function createStepState(
  overrides: Partial<CurriculumStepTrainingState> = {},
): CurriculumStepTrainingState {
  return {
    canTest: true,
    hasHistoricalCompletion: false,
    isCompleted: false,
    isRecommendedNext: false,
    provenance: "unfinished",
    recommendedMode: "practice",
    stateKind: "in_practice",
    stateLabel: "In practice",
    stepId: "level-1/zen:step-1",
    stepLabel: "Step 1",
    stepNumber: STEP_ONE,
    ...overrides,
  };
}

function createBehaviorState(
  overrides: Partial<CurriculumBehaviorTrainingState> = {},
): CurriculumBehaviorTrainingState {
  const step = createStepState();
  return {
    activeStep: step,
    completedStepCount: 0,
    hasHistoricalCompletion: false,
    inspection: {
      hasWarning: false,
      isLaterLevel: false,
      selectedLevelNumber: LEVEL_ONE,
      unmetPrerequisites: [],
    },
    isEligibleNextOption: false,
    isInSelectedPrerequisiteChain: false,
    isRecommendedNext: false,
    levelNumber: LEVEL_ONE,
    pageSlug: "level-1/zen",
    primaryLaunch: {
      label: "Practice Step 1",
      mode: "practice",
      stepId: "level-1/zen:step-1",
      stepNumber: STEP_ONE,
    },
    secondaryTestLaunch: {
      label: "Test Step 1",
      mode: "test",
      stepId: "level-1/zen:step-1",
      stepNumber: STEP_ONE,
    },
    stateKind: "in_practice",
    stateLabel: "In practice",
    steps: [step],
    stepsById: new Map([[step.stepId, step]]),
    title: "Zen",
    totalStepCount: 1,
    ...overrides,
  };
}

describe("curriculum training status summary components", () => {
  it("renders nothing when behaviorState is undefined", () => {
    expect.assertions(2);

    const missingState: { value?: CurriculumBehaviorTrainingState | undefined } = {};
    renderWithProviders(
      <CurriculumBehaviorTrainingSummary
        behaviorState={missingState.value}
        currentLevelNumber={LEVEL_ONE}
      />,
      { routePaths: ["/"] },
    );

    expect(screen.queryByRole("link")).toBeNull();
    expect(screen.queryByText(/./u)).toBeNull();
  });

  it("renders recommended badge and practice + test links without notices", () => {
    expect.assertions(5);

    renderWithProviders(
      <CurriculumBehaviorTrainingSummary
        behaviorState={createBehaviorState({ isRecommendedNext: true })}
        currentLevelNumber={LEVEL_ONE}
      />,
      { routePaths: ["/", "/training"] },
    );

    expect(screen.getByText("In practice")).toBeDefined();
    expect(screen.getByText("Recommended next")).toBeDefined();
    expect(screen.getByRole("link", { name: "Practice Step 1" }).getAttribute("href")).toBe(
      "/training?stepId=level-1%2Fzen%3Astep-1",
    );
    expect(screen.getByRole("link", { name: "Test Step 1" }).getAttribute("href")).toBe(
      "/training?mode=test&stepId=level-1%2Fzen%3Astep-1",
    );
    expect(screen.queryByText(/Unmet Comebefores|Later-Level selection/u)).toBeNull();
  });

  it("renders eligible option, retained notice, unmet Comebefores, and later-Level notices", () => {
    expect.assertions(5);

    renderWithProviders(
      <CurriculumBehaviorTrainingSummary
        behaviorState={createBehaviorState({
          hasHistoricalCompletion: true,
          inspection: {
            hasWarning: true,
            isLaterLevel: true,
            selectedLevelNumber: LEVEL_TWO,
            unmetPrerequisites: [{ pageSlug: "level-1/down", title: "Down" }],
          },
          isEligibleNextOption: true,
          isRecommendedNext: false,
          primaryLaunch: null,
          secondaryTestLaunch: {
            label: "Test Step 1",
            mode: "test",
            stepId: "level-1/zen:step-1",
            stepNumber: STEP_ONE,
          },
          stateKind: "needs_practice",
          stateLabel: "Needs practice · Completion retained",
        })}
        currentLevelNumber={LEVEL_ONE}
      />,
      { routePaths: ["/", "/training"] },
    );

    expect(screen.getByText("Eligible next option")).toBeDefined();
    expect(
      screen.getByText(
        "Downstream achievements intact: completed Steps still satisfy Comebefores.",
      ),
    ).toBeDefined();
    expect(
      screen.getByText(
        "Unmet Comebefores: Down. Launching opens Prep with a manual override option.",
      ),
    ).toBeDefined();
    expect(
      screen.getByText(
        "Later-Level selection (Current goal: Level 1). Launching into Prep does not change your Level goal.",
      ),
    ).toBeDefined();
    expect(screen.queryByRole("link", { name: "Practice Step 1" })).toBeNull();
  });

  it("renders no launch links when both primary and secondary launches are null", () => {
    expect.assertions(2);

    renderWithProviders(
      <CurriculumBehaviorTrainingSummary
        behaviorState={createBehaviorState({
          primaryLaunch: null,
          secondaryTestLaunch: null,
        })}
        currentLevelNumber={LEVEL_ONE}
      />,
      { routePaths: ["/"] },
    );

    expect(screen.getByText("In practice")).toBeDefined();
    expect(screen.queryAllByRole("link")).toHaveLength(0);
  });

  it("renders StepActiveTrainingBadge only for active non-unfinished step states", () => {
    expect.assertions(4);

    const missingStepState: { value?: CurriculumStepTrainingState | undefined } = {};
    const { rerender } = renderWithProviders(
      <StepActiveTrainingBadge stepState={missingStepState.value} />,
      { routePaths: ["/"] },
    );
    expect(screen.queryByText(/./u)).toBeNull();

    rerender(
      <StepActiveTrainingBadge
        stepState={createStepState({ stateKind: "unfinished", stateLabel: "Unfinished" })}
      />,
    );
    expect(screen.queryByText("Unfinished")).toBeNull();

    rerender(
      <StepActiveTrainingBadge
        stepState={createStepState({ stateKind: "test_ready", stateLabel: "Test ready" })}
      />,
    );
    expect(screen.getByText("Test ready")).toBeDefined();

    rerender(<TrainingStateBadge label="Passed Cold Test" stateKind="test_passed" />);
    expect(screen.getByText("Passed Cold Test")).toBeDefined();
  });

  it("renders StepTrainingLinks appropriately for invalid, non-testable, and testable steps", () => {
    expect.assertions(5);

    const { rerender } = renderWithProviders(
      <StepTrainingLinks stepId="level-1/zen#step-1" stepNumber={STEP_ONE} />,
      { routePaths: ["/", "/training"] },
    );
    expect(screen.queryAllByRole("link")).toHaveLength(0);

    rerender(<StepTrainingLinks stepId="level-1/zen:step-5" stepNumber={STEP_FIVE} />);
    expect(screen.getByRole("link", { name: "Open Step 5 in Practice" }).getAttribute("href")).toBe(
      "/training?mode=practice&stepId=level-1%2Fzen%3Astep-5",
    );
    expect(screen.queryByRole("link", { name: "Open Step 5 in Test" })).toBeNull();

    rerender(
      <StepTrainingLinks
        stepId="level-1/zen:step-1"
        stepNumber={STEP_ONE}
        stepState={createStepState({ canTest: true })}
      />,
    );
    expect(screen.getByRole("link", { name: "Open Step 1 in Practice" })).toBeDefined();
    expect(screen.getByRole("link", { name: "Open Step 1 in Test" }).getAttribute("href")).toBe(
      "/training?mode=test&stepId=level-1%2Fzen%3Astep-1",
    );
  });
});
