import { describe, expect, it } from "vite-plus/test";

import {
  recordPracticeTotalsInputSchema,
  recordPracticeAttemptInputSchema,
  savePracticeStepDecisionInputSchema,
} from "../training-schema";

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

describe("practice totals and readiness decisions", () => {
  it("accepts aggregate totals without requiring a per-attempt order", () => {
    expect.assertions(1);
    // Arrange
    const input = {
      notYetCount: 4,
      recordId: "018f47ad-9d72-7a31-a50b-a77777777777",
      stepId: "level-1/zen:step-1",
      successCount: 7,
      target: "Dog moves away from the protected treat while seated.",
    };

    // Act
    const parsed = recordPracticeTotalsInputSchema.safeParse(input);

    // Assert
    expect(parsed.success).toBe(true);
  });

  it("requires at least one result in totals and validates the saved readiness choice", () => {
    expect.assertions(2);
    // Arrange
    const emptyTotals = {
      notYetCount: 0,
      recordId: "018f47ad-9d72-7a31-a50b-a77777777777",
      stepId: "level-1/zen:step-1",
      successCount: 0,
      target: "Dog moves away from the protected treat while seated.",
    };

    // Act
    const parsedTotals = recordPracticeTotalsInputSchema.safeParse(emptyTotals);
    const parsedDecision = savePracticeStepDecisionInputSchema.safeParse({
      decision: "recommend_test",
      stepId: "level-1/zen:step-1",
    });

    // Assert
    expect(parsedTotals.success).toBe(false);
    expect(parsedDecision.success).toBe(true);
  });
});
