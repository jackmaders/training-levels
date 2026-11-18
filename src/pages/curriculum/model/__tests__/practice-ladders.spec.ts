import { describe, expect, it } from "vite-plus/test";

import { getPracticePlan, recordLadderOutcome } from "../practice-ladders";

describe("source-backed Practice ladders", () => {
  it("starts Crate Step 3 at five feet with no duration", () => {
    expect.hasAssertions();
    // Arrange
    const attempts: Parameters<typeof getPracticePlan>[1] = [];

    // Act
    const plan = getPracticePlan("level-3/crate:step-3", attempts);

    // Assert
    expect(plan).toMatchObject({
      appDefaultPracticeLimit: 5,
      appDefaultRepetitions: 1,
      distanceFeet: 5,
      durationSeconds: 0,
      priorAchievement: null,
    });
    expect(plan.source).toContain("Level 3 Crate, Step 3");
  });

  it("keeps the prior achievement visible and restarts the harder axis from its source baseline", () => {
    expect.hasAssertions();
    // Arrange
    const attempts = [
      { outcome: "success" as const, target: "5 feet · 120 seconds" },
      { outcome: "not_yet" as const, target: "5 feet · 120 seconds" },
    ];

    // Act
    const plan = getPracticePlan("level-3/crate:step-3", attempts);

    // Assert
    expect(plan).toMatchObject({
      distanceFeet: 5,
      durationSeconds: 60,
      priorAchievement: "5 feet · 120 seconds",
    });
    expect(plan.restartReason).toContain("5 ft/1 min");
  });

  it("increases distance one foot at a time across the longer Step 3 ladder", () => {
    expect.hasAssertions();
    // Arrange
    const attempts = [
      { outcome: "success" as const, target: "5 feet · 0 seconds" },
      { outcome: "success" as const, target: "6 feet · 0 seconds" },
      { outcome: "success" as const, target: "7 feet · 0 seconds" },
    ];

    // Act
    const plan = getPracticePlan("level-3/crate:step-3", attempts);

    // Assert
    expect(plan.target).toBe("8 feet · 0 seconds");
  });

  it("keeps a selected target's timer duration with that target", () => {
    expect.hasAssertions();
    // Arrange
    const plan = getPracticePlan("level-3/crate:step-2", []);

    // Act
    const timedTarget = plan.targetOptions.find((target) => target.label === "2 feet · 15 seconds");

    // Assert
    expect(timedTarget).toMatchObject({ durationSeconds: 15 });
  });

  it("requires handler confirmation after a timed target completes", () => {
    expect.hasAssertions();
    // Arrange
    const plan = getPracticePlan("level-3/crate:step-3", []);

    // Act
    const completed = recordLadderOutcome(plan, "success");

    // Assert
    expect(completed.outcome).toBe("success");
    expect(completed.target).toBe("5 feet · 0 seconds");
  });
});
