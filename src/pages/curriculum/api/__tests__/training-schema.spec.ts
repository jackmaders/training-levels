import { describe, expect, it } from "vite-plus/test";

import {
  correctPracticeTotalsInputSchema,
  recordPracticeTotalsInputSchema,
  recordPracticeAttemptInputSchema,
  recordStepTestInputSchema,
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

  it("accepts totals and readiness choices for guided Level 2 Steps", () => {
    expect.assertions(2);
    // Arrange
    const totals = {
      notYetCount: 1,
      recordId: "018f47ad-9d72-7a31-a50b-a88888888888",
      stepId: "level-2/come:step-3",
      successCount: 2,
      target: "Call her from 10 feet away, without your real Come cue.",
    };

    // Act
    const parsedTotals = recordPracticeTotalsInputSchema.safeParse(totals);
    const parsedDecision = savePracticeStepDecisionInputSchema.safeParse({
      decision: "recommend_test",
      stepId: "level-2/handling:step-1",
    });

    // Assert
    expect(parsedTotals.success).toBe(true);
    expect(parsedDecision.success).toBe(true);
  });

  it("accepts totals and readiness choices for guided Level 3 Steps", () => {
    expect.assertions(2);

    const parsedTotals = recordPracticeTotalsInputSchema.safeParse({
      notYetCount: 0,
      recordId: "018f47ad-9d72-7a31-a50b-a99999999999",
      stepId: "level-3/relax:step-1",
      successCount: 1,
      target: "Settle and remain truly relaxed for 1 minute.",
    });
    const parsedDecision = savePracticeStepDecisionInputSchema.safeParse({
      decision: "recommend_test",
      stepId: "level-3/zen:step-2",
    });

    expect(parsedTotals.success).toBe(true);
    expect(parsedDecision.success).toBe(true);
  });

  it("rejects readiness choices for Steps without guided Practice", () => {
    expect.assertions(1);

    // Act
    const parsedDecision = savePracticeStepDecisionInputSchema.safeParse({
      decision: "recommend_test",
      stepId: "level-9/unknown:step-1",
    });

    // Assert
    expect(parsedDecision.success).toBe(false);
  });
});

describe("step Test inputs", () => {
  it("requires a valid Test identity, outcome, Step, and coldness confirmation", () => {
    expect.assertions(2);
    const input = {
      coldOverride: true,
      outcome: "not_yet",
      stepId: "level-1/zen:step-1",
      testId: "018f47ad-9d72-7a31-a50b-b11111111111",
    };

    const valid = recordStepTestInputSchema.safeParse(input);
    const invalid = recordStepTestInputSchema.safeParse({ ...input, outcome: "maybe" });

    expect(valid.success).toBe(true);
    expect(invalid.success).toBe(false);
  });

  it("requires at least one result when correcting practice totals", () => {
    expect.assertions(2);

    const valid = correctPracticeTotalsInputSchema.safeParse({
      notYetCount: 1,
      recordId: "018f47ad-9d72-7a31-a50b-a77777777777",
      successCount: 0,
    });
    const invalid = correctPracticeTotalsInputSchema.safeParse({
      notYetCount: 0,
      recordId: "018f47ad-9d72-7a31-a50b-a77777777777",
      successCount: 0,
    });

    expect(valid.success).toBe(true);
    expect(invalid.success).toBe(false);
  });
});
