import { describe, expect, it } from "vite-plus/test";

import { recordPracticeAttemptInputSchema } from "../training-schema";

describe("practice attempt inputs", () => {
  it("rejects attempt IDs that cannot safely identify a retry", () => {
    expect.assertions(1);

    // Arrange
    const input = {
      attemptId: "not-an-id",
      outcome: "success",
      stepId: "level-1/zen:step-1",
      target: "Dog moves away from the hand",
    };

    // Act
    const parsed = recordPracticeAttemptInputSchema.safeParse(input);

    // Assert
    expect(parsed.success).toBe(false);
  });

  it("accepts source-backed duration and distance Steps", () => {
    expect.assertions(1);

    // Arrange
    const input = {
      attemptId: "018f47ad-9d72-7a31-a50b-a55555555555",
      outcome: "success",
      stepId: "level-3/crate:step-2",
      target: "2 feet · 15 seconds",
    };

    // Act
    const parsed = recordPracticeAttemptInputSchema.safeParse(input);

    // Assert
    expect(parsed.success).toBe(true);
  });

  it("requires an observable target", () => {
    expect.assertions(1);

    // Arrange
    const input = {
      attemptId: "018f47ad-9d72-7a31-a50b-a66666666666",
      outcome: "success",
      stepId: "level-1/zen:step-1",
      target: "   ",
    };

    // Act
    const parsed = recordPracticeAttemptInputSchema.safeParse(input);

    // Assert
    expect(parsed.success).toBe(false);
  });
});
