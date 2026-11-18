import { describe, expect, it } from "vite-plus/test";

import type { SyllabusSection } from "@/shared/curriculum-data";

import { getLevelAdvancementReadiness, resolveStepProvenance } from "../step-provenance";

function createLevelSectionFixture(overrides: Partial<SyllabusSection> = {}): SyllabusSection {
  return {
    href: "/levels/level-1",
    levelNumber: 1,
    pages: [
      {
        href: "/levels/level-1/00-overview",
        kind: "overview",
        levelNumber: 1,
        order: 0,
        pageSlug: "level-1/00-overview",
        sectionSlug: "level-1",
        title: "Level 1 Overview",
      },
      {
        behaviorFamily: "Impulse Control",
        href: "/levels/level-1/zen",
        kind: "behavior",
        levelNumber: 1,
        order: 1,
        pageSlug: "level-1/zen",
        sectionSlug: "level-1",
        stepIds: ["level-1/zen:step-1", "level-1/zen:step-2"],
        title: "Zen",
      },
      {
        behaviorFamily: "Recall",
        href: "/levels/level-1/come",
        kind: "behavior",
        levelNumber: 1,
        order: 2,
        pageSlug: "level-1/come",
        sectionSlug: "level-1",
        stepIds: ["level-1/come:step-1"],
        title: "Come",
      },
      {
        href: "/levels/level-1/homework",
        kind: "homework",
        levelNumber: 1,
        order: 3,
        pageSlug: "level-1/homework",
        sectionSlug: "level-1",
        stepIds: ["level-1/homework:ignored"],
        title: "Level 1 Homework",
      },
    ],
    sectionSlug: "level-1",
    title: "Level 1",
    ...overrides,
  };
}

describe("step provenance resolution", () => {
  it("returns unfinished without historical completion when step is incomplete and untested", () => {
    expect.assertions(1);

    // Act
    const result = resolveStepProvenance({
      isCompleted: false,
      latestTestOutcome: null,
    });

    // Assert
    expect(result).toStrictEqual({
      hasHistoricalCompletion: false,
      provenance: "unfinished",
    });
  });

  it("returns previously_recorded when step is completed with no test records", () => {
    expect.assertions(1);

    // Act
    const result = resolveStepProvenance({
      isCompleted: true,
      latestTestOutcome: null,
    });

    // Assert
    expect(result).toStrictEqual({
      hasHistoricalCompletion: true,
      provenance: "previously_recorded",
    });
  });

  it("returns test_passed when step is completed and latest test passed", () => {
    expect.assertions(1);

    // Act
    const result = resolveStepProvenance({
      isCompleted: true,
      latestTestOutcome: "success",
    });

    // Assert
    expect(result).toStrictEqual({
      hasHistoricalCompletion: true,
      provenance: "test_passed",
    });
  });

  it("returns needs_practice while preserving historical completion on a failed retest", () => {
    expect.assertions(1);

    // Act
    const result = resolveStepProvenance({
      isCompleted: true,
      latestTestOutcome: "not_yet",
    });

    // Assert
    expect(result).toStrictEqual({
      hasHistoricalCompletion: true,
      provenance: "needs_practice",
    });
  });

  it("returns needs_practice without historical completion when a cold test fails before completion", () => {
    expect.assertions(1);

    // Act
    const result = resolveStepProvenance({
      isCompleted: false,
      latestTestOutcome: "not_yet",
    });

    // Assert
    expect(result).toStrictEqual({
      hasHistoricalCompletion: false,
      provenance: "needs_practice",
    });
  });

  it("returns unfinished when an explicit uncheck cleared completion despite an older passing test", () => {
    expect.assertions(1);

    // Act
    const result = resolveStepProvenance({
      isCompleted: false,
      latestTestOutcome: "success",
    });

    // Assert
    expect(result).toStrictEqual({
      hasHistoricalCompletion: false,
      provenance: "unfinished",
    });
  });
});

describe("level advancement readiness", () => {
  it("counts only behavior page stepIds and ignores homework or comeafter state", () => {
    expect.assertions(1);

    // Arrange
    const section = createLevelSectionFixture();
    const completedStepIds = new Set([
      "level-1/zen:step-1",
      "level-1/zen:step-2",
      "level-1/come:step-1",
    ]);

    // Act
    const readiness = getLevelAdvancementReadiness(section, completedStepIds);

    // Assert
    expect(readiness).toStrictEqual({
      completedStepCount: 3,
      isReadyToAdvance: true,
      remainingStepCount: 0,
      totalStepCount: 3,
    });
  });

  it("marks level not ready to advance when any behavior step remains incomplete", () => {
    expect.assertions(1);

    // Arrange
    const section = createLevelSectionFixture();
    const completedStepIds = new Set(["level-1/zen:step-1"]);

    // Act
    const readiness = getLevelAdvancementReadiness(section, completedStepIds);

    // Assert
    expect(readiness).toStrictEqual({
      completedStepCount: 1,
      isReadyToAdvance: false,
      remainingStepCount: 2,
      totalStepCount: 3,
    });
  });

  it("handles behavior pages without stepIds and sections with zero behavior steps", () => {
    expect.assertions(2);

    // Arrange
    const sparseSection = createLevelSectionFixture({
      pages: [
        {
          behaviorFamily: "Empty",
          href: "/levels/level-1/empty",
          kind: "behavior",
          levelNumber: 1,
          order: 0,
          pageSlug: "level-1/empty",
          sectionSlug: "level-1",
          title: "Empty",
        },
        {
          href: "/levels/level-1/homework",
          kind: "homework",
          levelNumber: 1,
          order: 1,
          pageSlug: "level-1/homework",
          sectionSlug: "level-1",
          title: "Level 1 Homework",
        },
      ],
    });

    // Act
    const readiness = getLevelAdvancementReadiness(sparseSection, new Set());

    // Assert
    expect(readiness.totalStepCount).toBe(0);
    expect(readiness.isReadyToAdvance).toBe(false);
  });
});
