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

  it("accepts only the supported representative Practice Step", () => {
    expect.assertions(1);

    // Arrange
    const input = {
      attemptId: "018f47ad-9d72-7a31-a50b-a55555555555",
      outcome: "success",
      stepId: "level-1/zen:step-2",
      target: "Dog stays away from the treat for five seconds",
    };

    // Act
    const parsed = recordPracticeAttemptInputSchema.safeParse(input);

    // Assert
    expect(parsed.success).toBe(false);
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
