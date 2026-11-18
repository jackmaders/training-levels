import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vite-plus/test";

import { TEST_BEHAVIOR_PAGE } from "@test/vitest/fixtures/curriculum";
import { renderWithProviders } from "@test/vitest/wrappers/testing-wrapper";

import { CurriculumTrainingTestOffer, TrainingTest } from "../curriculum-training-test-views";

const [FIRST_STEP] = TEST_BEHAVIOR_PAGE.steps;
if (!FIRST_STEP) {
  throw new Error("Missing fixture step");
}

const STEP_WITH_COLD = {
  ...FIRST_STEP,
  comeafters: null,
  instructions: [
    { type: "paragraph" as const, content: [{ text: "Step instructions", type: "text" as const }] },
  ],
  tryItCold: [
    { type: "paragraph" as const, content: [{ text: "Cold instructions", type: "text" as const }] },
  ],
};

describe("curriculum training test views", () => {
  it("renders nothing when test is not recommended and history is empty", () => {
    expect.hasAssertions();

    // Arrange & Act
    renderWithProviders(
      <CurriculumTrainingTestOffer
        decision="keep_practicing"
        onStartTest={vi.fn<(coldOverride: boolean) => void>()}
        practiceDates={[]}
        step={STEP_WITH_COLD}
        testHistory={[]}
      />,
      { routePaths: ["/"] },
    );

    // Assert
    expect(screen.queryByText("Test this Step cold")).toBeNull();
  });

  it("requires cold override checkbox when practiced today and shows missing cold instructions", async () => {
    expect.hasAssertions();

    // Arrange
    const user = userEvent.setup();
    const onStartTest = vi.fn<(coldOverride: boolean) => void>();
    renderWithProviders(
      <CurriculumTrainingTestOffer
        decision="recommend_test"
        onStartTest={onStartTest}
        practiceDates={[new Date()]}
        step={{ ...FIRST_STEP, tryItCold: [] }}
        testHistory={[
          {
            coldOverride: false,
            outcome: "not_yet",
            stepId: "level-1/zen#step-1",
            testId: "t1",
            testedAt: new Date("2026-01-01T00:00:00.000Z"),
          },
        ]}
      />,
      { routePaths: ["/"] },
    );

    // Assert
    expect(screen.getByText("Latest Test: Not yet — Needs practice.")).toBeDefined();
    expect(screen.getByText("Cold Test instructions are unavailable.")).toBeDefined();
    expect(screen.getByRole("button", { name: "Start Test" })).toHaveProperty("disabled", true);

    // Act
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: "Start Test" }));

    // Assert
    expect(onStartTest).toHaveBeenCalledWith(true);
  });

  it("renders TrainingTest, records outcomes, and shows error messages", async () => {
    expect.hasAssertions();

    // Arrange
    const user = userEvent.setup();
    const record = vi.fn<(outcome: "success" | "not_yet", coldOverride: boolean) => void>();
    renderWithProviders(
      <TrainingTest
        actions={{ errorMessage: "Network error", record, saving: false }}
        coldOverride
        history={[
          {
            coldOverride: true,
            outcome: "success",
            stepId: "level-1/zen#step-1",
            testId: "t1",
            testedAt: new Date("2026-01-01T00:00:00.000Z"),
          },
        ]}
        step={STEP_WITH_COLD}
      />,
      { routePaths: ["/", "/levels/$section/$page"] },
    );

    // Act
    await user.click(screen.getByRole("button", { name: "Test passed" }));
    await user.click(screen.getByRole("button", { name: "Not yet" }));

    // Assert
    expect(record).toHaveBeenCalledWith("success", true);
    expect(record).toHaveBeenCalledWith("not_yet", true);
    expect(screen.getByText("Could not save this Test. Network error")).toBeDefined();
    expect(screen.getByText("Test passed. This Step is complete.")).toBeDefined();
  });

  it("allows starting test without cold override when eligible by day and handles null tryItCold", async () => {
    expect.hasAssertions();

    // Arrange
    const user = userEvent.setup();
    const onStartTest = vi.fn<(coldOverride: boolean) => void>();
    renderWithProviders(
      <CurriculumTrainingTestOffer
        decision="recommend_test"
        onStartTest={onStartTest}
        practiceDates={[]}
        step={{ ...STEP_WITH_COLD, tryItCold: null }}
        testHistory={[]}
      />,
      { routePaths: ["/"] },
    );

    // Assert
    expect(
      screen.getByText(
        "The last recorded Practice or Test was on another day. Start without warming up this Behavior.",
      ),
    ).toBeDefined();
    expect(screen.getByText("Cold Test instructions are unavailable.")).toBeDefined();

    // Act
    await user.click(screen.getByRole("button", { name: "Start Test" }));

    // Assert
    expect(onStartTest).toHaveBeenCalledWith(false);
  });

  it("renders TrainingTest without cold override, empty history, and not_yet outcome", () => {
    expect.hasAssertions();

    // Arrange & Act
    const { rerender } = renderWithProviders(
      <TrainingTest
        actions={{
          errorMessage: null,
          record: vi.fn<(outcome: "success" | "not_yet", coldOverride: boolean) => void>(),
          saving: true,
        }}
        coldOverride={false}
        history={[]}
        step={{ ...STEP_WITH_COLD, tryItCold: null }}
      />,
      { routePaths: ["/", "/levels/$section/$page"] },
    );

    // Assert
    expect(screen.queryByText("You confirmed this Test is cold today.")).toBeNull();
    expect(screen.getByRole("button", { name: "Test passed" })).toHaveProperty("disabled", true);

    // Act
    rerender(
      <TrainingTest
        actions={{
          errorMessage: null,
          record: vi.fn<(outcome: "success" | "not_yet", coldOverride: boolean) => void>(),
          saving: false,
        }}
        coldOverride={false}
        history={[
          {
            coldOverride: false,
            outcome: "not_yet",
            stepId: "level-1/zen#step-1",
            testId: "t2",
            testedAt: new Date("2026-01-01T00:00:00.000Z"),
          },
        ]}
        step={STEP_WITH_COLD}
      />,
    );

    // Assert
    expect(screen.getByText("Not yet. Needs practice; Practice is recommended.")).toBeDefined();
  });

  it("renders LatestTestStatus when latestTest outcome is success", () => {
    expect.hasAssertions();

    // Arrange & Act
    renderWithProviders(
      <CurriculumTrainingTestOffer
        decision={null}
        onStartTest={vi.fn<(coldOverride: boolean) => void>()}
        practiceDates={[]}
        step={STEP_WITH_COLD}
        testHistory={[
          {
            coldOverride: true,
            outcome: "success",
            stepId: "level-1/zen#step-1",
            testId: "t1",
            testedAt: new Date("2026-01-01T00:00:00.000Z"),
          },
        ]}
      />,
      { routePaths: ["/"] },
    );

    // Assert
    expect(screen.getByText("Latest Test: Passed — Step complete.")).toBeDefined();
  });
});
