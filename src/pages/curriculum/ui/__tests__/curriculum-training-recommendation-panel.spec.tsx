import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vite-plus/test";

import { renderWithProviders } from "@test/vitest/wrappers/testing-wrapper";

import type { TrainingRecommendation } from "../../model/training-recommendation";
import { CurriculumTrainingRecommendationPanel } from "../curriculum-training-recommendation-panel";

function createRecommendation(
  overrides: Partial<TrainingRecommendation> = {},
): TrainingRecommendation {
  return {
    behaviorTitle: "Zen",
    currentLevelNumber: 1,
    fallbackMode: "none",
    levelNumber: 1,
    mode: "practice",
    pageSlug: "level-1/zen",
    reason: "Not practiced yet.",
    stepId: "level-1/zen:step-1",
    stepLabel: "Step 1: Look at trainer",
    waitingTestNotice: null,
    ...overrides,
  };
}

describe("curriculum training recommendation panel", () => {
  it("renders test mode, manual override label, waiting test action, and all_blocked notice", async () => {
    expect.hasAssertions();

    const user = userEvent.setup();
    const onOpenWaitingTest = vi.fn<() => void>();
    const onSuggestAnother = vi.fn<() => void>();
    const onResetExclusions = vi.fn<() => void>();

    renderWithProviders(
      <CurriculumTrainingRecommendationPanel
        isManualOverride
        activeStepLabel="Level 1 Come · Step 1"
        excludedCount={1}
        fallbackSummary="Look at trainer"
        inspection={null}
        laterLevelOverrideConfirmed={false}
        preferredMode={undefined}
        recommendation={createRecommendation({
          fallbackMode: "all_blocked",
          mode: "test",
          waitingTestNotice: {
            behaviorTitle: "Sit",
            pageSlug: "level-1/sit",
            reason: "Wait for a fresh day.",
            stepId: "level-1/sit:step-1",
            stepLabel: "Step 1: Sit",
          },
        })}
        onChangeMode={vi.fn<() => void>()}
        onLaterLevelOverrideChange={vi.fn<() => void>()}
        onOpenWaitingTest={onOpenWaitingTest}
        onResetExclusions={onResetExclusions}
        onSuggestAnother={onSuggestAnother}
      />,
      { routePaths: ["/", "/levels/$section/$page"] },
    );

    expect(screen.getByText("Current goal: Level 1")).toBeDefined();
    expect(screen.getByText(/Recommended next: Cold Test/u)).toBeDefined();
    expect(screen.getByText("Manual selection: Level 1 Come · Step 1")).toBeDefined();
    expect(
      screen.getByText(/All remaining steps in Level 1 have unmet Comebefores/u),
    ).toBeDefined();

    await user.click(screen.getByRole("button", { name: "Open waiting Test" }));
    await user.click(screen.getByRole("button", { name: "Suggest another activity" }));
    await user.click(screen.getByRole("button", { name: "Reset suggestions" }));

    expect(onOpenWaitingTest).toHaveBeenCalledWith("level-1/sit:step-1");
  });

  it("toggles mode preferences and renders all_complete summary", async () => {
    expect.hasAssertions();

    const user = userEvent.setup();
    const onChangeMode = vi.fn<() => void>();

    const { rerender } = renderWithProviders(
      <CurriculumTrainingRecommendationPanel
        activeStepLabel="Level 1 Zen · Step 1"
        excludedCount={0}
        fallbackSummary="Maintenance step"
        inspection={null}
        isManualOverride={false}
        laterLevelOverrideConfirmed={false}
        preferredMode="practice"
        recommendation={createRecommendation({ fallbackMode: "all_complete" })}
        onChangeMode={onChangeMode}
        onLaterLevelOverrideChange={vi.fn<() => void>()}
        onOpenWaitingTest={vi.fn<() => void>()}
        onResetExclusions={vi.fn<() => void>()}
        onSuggestAnother={vi.fn<() => void>()}
      />,
      { routePaths: ["/"] },
    );

    expect(screen.getByText(/All Main Quest levels are complete/u)).toBeDefined();
    expect(screen.queryByRole("button", { name: "Reset suggestions" })).toBeNull();
    await user.click(screen.getByRole("button", { name: "Practice" }));
    expect(onChangeMode).toHaveBeenLastCalledWith();

    await user.click(screen.getByRole("button", { name: "Cold Test" }));
    expect(onChangeMode).toHaveBeenLastCalledWith("test");

    rerender(
      <CurriculumTrainingRecommendationPanel
        activeStepLabel="Level 1 Zen · Step 1"
        excludedCount={0}
        fallbackSummary="Maintenance step"
        inspection={null}
        isManualOverride={false}
        laterLevelOverrideConfirmed={false}
        preferredMode="test"
        recommendation={createRecommendation()}
        onChangeMode={onChangeMode}
        onLaterLevelOverrideChange={vi.fn<() => void>()}
        onOpenWaitingTest={vi.fn<() => void>()}
        onResetExclusions={vi.fn<() => void>()}
        onSuggestAnother={vi.fn<() => void>()}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Cold Test" }));
    expect(onChangeMode).toHaveBeenLastCalledWith();
  });

  it("renders unmet Comebefores links, unlinked fallback titles, and later-level override checkbox", async () => {
    expect.hasAssertions();

    const user = userEvent.setup();
    const onLaterLevelOverrideChange = vi.fn<() => void>();

    renderWithProviders(
      <CurriculumTrainingRecommendationPanel
        activeStepLabel="Level 2 Zen · Step 1"
        excludedCount={0}
        fallbackSummary="Wait calmly"
        inspection={{
          hasWarning: true,
          isLaterLevel: true,
          selectedLevelNumber: 2,
          unmetPrerequisites: [
            { pageSlug: "level-1/zen", title: "Zen" },
            { pageSlug: "invalid/slug/here", title: "Custom" },
          ],
        }}
        isManualOverride={false}
        laterLevelOverrideConfirmed={false}
        preferredMode={undefined}
        recommendation={createRecommendation()}
        onChangeMode={vi.fn<() => void>()}
        onLaterLevelOverrideChange={onLaterLevelOverrideChange}
        onOpenWaitingTest={vi.fn<() => void>()}
        onResetExclusions={vi.fn<() => void>()}
        onSuggestAnother={vi.fn<() => void>()}
      />,
      { routePaths: ["/", "/levels/$section/$page"] },
    );

    expect(screen.getByText("Unmet Comebefores")).toBeDefined();
    expect(screen.getByRole("link", { name: "Zen" }).getAttribute("href")).toBe(
      "/levels/level-1/zen",
    );
    expect(screen.getByText("Custom")).toBeDefined();

    await user.click(
      screen.getByRole("checkbox", {
        name: "Train this Level 2 Behavior for this Training only (keeps Level 1 as your current Level goal)",
      }),
    );
    expect(onLaterLevelOverrideChange).toHaveBeenCalledWith(true);
  });

  it("hides unmet Comebefores and checkbox when inspection has no warnings", () => {
    expect.hasAssertions();

    const { rerender } = renderWithProviders(
      <CurriculumTrainingRecommendationPanel
        activeStepLabel="Level 1 Zen · Step 1"
        excludedCount={0}
        fallbackSummary="Wait calmly"
        inspection={{
          hasWarning: false,
          isLaterLevel: false,
          selectedLevelNumber: null,
          unmetPrerequisites: [],
        }}
        isManualOverride={false}
        laterLevelOverrideConfirmed={false}
        preferredMode={undefined}
        recommendation={createRecommendation()}
        onChangeMode={vi.fn<() => void>()}
        onLaterLevelOverrideChange={vi.fn<() => void>()}
        onOpenWaitingTest={vi.fn<() => void>()}
        onResetExclusions={vi.fn<() => void>()}
        onSuggestAnother={vi.fn<() => void>()}
      />,
      { routePaths: ["/"] },
    );

    expect(screen.queryByText("Unmet Comebefores")).toBeNull();
    expect(screen.queryByRole("checkbox")).toBeNull();

    rerender(
      <CurriculumTrainingRecommendationPanel
        activeStepLabel="Level 1 Zen · Step 1"
        excludedCount={0}
        fallbackSummary="Wait calmly"
        inspection={{
          hasWarning: false,
          isLaterLevel: false,
          selectedLevelNumber: 1,
          unmetPrerequisites: [],
        }}
        isManualOverride={false}
        laterLevelOverrideConfirmed={false}
        preferredMode={undefined}
        recommendation={createRecommendation()}
        onChangeMode={vi.fn<() => void>()}
        onLaterLevelOverrideChange={vi.fn<() => void>()}
        onOpenWaitingTest={vi.fn<() => void>()}
        onResetExclusions={vi.fn<() => void>()}
        onSuggestAnother={vi.fn<() => void>()}
      />,
    );

    expect(screen.queryByRole("checkbox")).toBeNull();
  });
});
