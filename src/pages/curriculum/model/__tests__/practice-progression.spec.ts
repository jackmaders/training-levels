import { describe, expect, it } from "vite-plus/test";

import { getPracticeProgression } from "../practice-progression";

describe("practice progression rules", () => {
  it("uses an observable readiness judgment for Zen Step 1 before changing the setup", () => {
    expect.assertions(1);
    // Arrange
    const stepId = "level-1/zen:step-1";

    // Act
    const progression = getPracticeProgression(stepId);

    // Assert
    expect(progression).toMatchObject({
      method: "shape_approximation",
      nextTarget: "Dog moves her nose away from the protected treat while you sit.",
      readinessQuestion: "Does your Dog move her nose away promptly on several tries while seated?",
      source: "Level 1 Zen, Step 1",
    });
  });

  it("adds one second after a success and restarts at one second after a miss for Zen Step 2", () => {
    expect.assertions(4);
    // Arrange
    const stepId = "level-1/zen:step-2";

    // Act
    const afterSuccess = getPracticeProgression(stepId, { consecutiveSuccesses: 2 });
    const afterMiss = getPracticeProgression(stepId, {
      consecutiveSuccesses: 2,
      lastOutcome: "not_yet",
    });

    // Assert
    expect(afterSuccess?.nextTarget).toBe(
      "Dog stays away from the treat in your closed fist for 3 seconds.",
    );
    expect(afterMiss?.nextTarget).toBe(
      "Dog stays away from the treat in your closed fist for 1 second.",
    );
    expect(afterSuccess?.readyForTest).toBe(false);
    expect(getPracticeProgression(stepId, { consecutiveSuccesses: 5 })?.readyForTest).toBe(true);
  });

  it("describes Zen Step 3 as an assistance change followed by a duration ladder", () => {
    expect.assertions(1);
    // Arrange
    const stepId = "level-1/zen:step-3";

    // Act
    const progression = getPracticeProgression(stepId);

    // Assert
    expect(progression).toMatchObject({
      method: "change_assistance_then_duration",
      nextTarget: "Dog stays away from the treat in your open hand for 1 second.",
      readinessQuestion:
        "Can your Dog keep her nose away when the treat is visible in your open hand?",
    });
  });

  it("uses shaping and repetition changes for the different Retrieve Steps", () => {
    expect.assertions(5);
    // Arrange
    const approximationStep = "level-3/retrieve:step-1";
    const repetitionStep = "level-3/retrieve:step-2";

    // Act
    const approximation = getPracticeProgression(approximationStep);
    const repetition = getPracticeProgression(repetitionStep, {
      consecutiveSuccesses: 2,
      lastOutcome: "not_yet",
    });

    // Assert
    expect(approximation?.method).toBe("shape_approximation");
    expect(approximation?.nextTarget).toContain("pencil");
    expect(repetition?.method).toBe("repeat_then_duration");
    expect(repetition?.nextTarget).toContain("3 grabs");
    expect(repetition?.readyForTest).toBe(false);
  });

  it("rejects Steps that have no authored Practice progression", () => {
    expect.assertions(1);
    // Arrange
    const stepId = "level-2/sit:step-1";

    // Act
    const progression = getPracticeProgression(stepId);

    // Assert
    expect(progression).toBeNull();
  });

  it("advances Retrieve Step 1 after a success and ladders Retrieve Step 2 grabs and duration", () => {
    expect.assertions(4);

    const step1 = getPracticeProgression("level-3/retrieve:step-1", { consecutiveSuccesses: 1 });
    const step2TwoGrabs = getPracticeProgression("level-3/retrieve:step-2", {
      consecutiveSuccesses: 2,
      lastOutcome: "success",
    });
    const step2ThreeGrabs = getPracticeProgression("level-3/retrieve:step-2", {
      consecutiveSuccesses: 3,
      lastOutcome: "success",
    });

    expect(step1?.nextTarget).toContain("spoon");
    expect(step2TwoGrabs?.nextTarget).toContain("2 grabs");
    expect(step2TwoGrabs?.nextTarget).toContain("1 seconds");
    expect(step2ThreeGrabs?.nextTarget).toContain("3 grabs");
  });
});
