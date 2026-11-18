import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vite-plus/test";

import { TEST_SYLLABUS, createSyllabusFixture } from "@test/vitest/fixtures/curriculum";

import { CurriculumLevelReadiness } from "../curriculum-level-readiness";

describe("curriculum level readiness", () => {
  it("renders nothing when section is undefined or has zero behavior steps", () => {
    expect.assertions(2);

    // Act undefined section
    const { container, rerender } = render(
      <CurriculumLevelReadiness completedStepIds={new Set()} section={undefined} />,
    );
    expect(container.textContent).toBe("");

    // Act theory section with zero behavior steps
    const [theorySection] = TEST_SYLLABUS.sections;
    rerender(<CurriculumLevelReadiness completedStepIds={new Set()} section={theorySection} />);
    expect(container.textContent).toBe("");
  });

  it("renders remaining behavior step count and non-gating guidance before completion", () => {
    expect.assertions(2);

    // Arrange
    const [, levelOne] = TEST_SYLLABUS.sections;

    // Act
    render(
      <CurriculumLevelReadiness
        completedStepIds={new Set(["level-1/zen:step-1", "level-1/zen:step-2"])}
        section={levelOne}
      />,
    );

    // Assert
    expect(screen.getByText(/2 of 10 Behavior steps completed \(8 remaining\)\./u)).toBeDefined();
    expect(
      screen.getByText(
        "Only Main Quest Behavior steps gate Level advancement; Comeafters and Homework do not.",
      ),
    ).toBeDefined();
  });

  it("renders Ready to advance badge once all level behavior steps are completed", () => {
    expect.assertions(2);

    // Arrange
    const singleBehaviorSection = createSyllabusFixture().sections.at(2);
    const allStepIds = new Set([
      "level-2/zen:step-1",
      "level-2/zen:step-2",
      "level-2/zen:step-3",
      "level-2/zen:step-4",
      "level-2/zen:step-5",
    ]);

    // Act
    render(
      <CurriculumLevelReadiness completedStepIds={allStepIds} section={singleBehaviorSection} />,
    );

    // Assert
    expect(screen.getByText("Ready to advance")).toBeDefined();
    expect(screen.getByText("All 5 Main Quest Behavior steps completed.")).toBeDefined();
  });
});
