import { describe, expect, it } from "vite-plus/test";

import {
  getPracticePlan,
  hasPracticeLadder,
  PRACTICE_STEP_OPTIONS,
  recordLadderOutcome,
} from "../practice-ladders";

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

  it("handles ladder availability, unknown steps, restarts, and target clamping", () => {
    expect.assertions(3);

    expect(hasPracticeLadder("level-3/crate:step-2")).toBe(true);
    expect(hasPracticeLadder("level-1/zen:step-1")).toBe(false);
    expect(() => getPracticePlan("level-1/zen:step-1", [])).toThrow(
      "No source-backed Practice ladder is available for level-1/zen:step-1.",
    );
  });

  it("handles restarts, unknown targets, and clamping at the end of a ladder", () => {
    expect.hasAssertions();

    const restarted = getPracticePlan("level-3/crate:step-2", [
      { outcome: "not_yet", target: "3 feet · 30 seconds" },
    ]);
    expect(restarted.target).toBe("2 feet · 0 seconds");

    const unknownTarget = getPracticePlan("level-3/crate:step-2", [
      { outcome: "success", target: "unknown target" },
    ]);
    expect(unknownTarget.target).toBe("2 feet · 0 seconds");

    const clamped = getPracticePlan("level-3/crate:step-2", [
      { outcome: "success", target: "5 feet · 60 seconds" },
    ]);
    expect(clamped.nextTarget).toBeNull();

    const durationRestart = getPracticePlan("level-3/crate:step-3", [
      { outcome: "not_yet", target: "5 feet · 300 seconds" },
    ]);
    expect(durationRestart.restartReason).toBe("Restart the distance ladder at 5 ft with no time.");
    expect(durationRestart.target).toBe("5 feet · 0 seconds");
  });

  it("exposes unique Practice step options without duplicate Crate ladder entries", () => {
    expect.assertions(3);

    const stepIds = PRACTICE_STEP_OPTIONS.map((step) => step.stepId);

    expect(new Set(stepIds).size).toBe(stepIds.length);
    expect(stepIds).toContain("level-3/crate:step-2");
    expect(stepIds).toContain("level-3/crate:step-3");
  });
});
