import { describe, expect, it } from "vite-plus/test";

import { getCurriculumPageInputSchema, toggleStepInputSchema } from "../curriculum-schema";

const OVER_MAX_SLUG_LENGTH = 130;
const OVER_MAX_STEP_ID_LENGTH = 170;

describe("getCurriculumPageInputSchema validation", () => {
  it.each([
    ["  level-1/zen  ", "level-1/zen"],
    ["theory/01-foreword", "theory/01-foreword"],
    ["appendices/appendix-a-leading-the-dance", "appendices/appendix-a-leading-the-dance"],
    ["level-1/nonexistent", "level-1/nonexistent"],
  ] as const)(
    "accepts and trims valid curriculum page slug %j",
    (rawPageSlug, expectedPageSlug) => {
      expect.assertions(1);

      // Arrange
      const input = { pageSlug: rawPageSlug };

      // Act
      const parsed = getCurriculumPageInputSchema.parse(input);

      // Assert
      expect(parsed).toStrictEqual({ pageSlug: expectedPageSlug });
    },
  );

  it.each([
    ["blank whitespace", "   ", "Page slug is required"],
    ["missing section", "zen", "Invalid curriculum page slug"],
    ["unsupported level section", "level-5/zen", "Invalid curriculum page slug"],
    ["path traversal", "../theory/01-foreword", "Invalid curriculum page slug"],
    [
      "exceeding max length",
      `level-1/${"a".repeat(OVER_MAX_SLUG_LENGTH)}`,
      "Page slug is too long",
    ],
  ] as const)(
    "rejects malformed curriculum page slug (%s)",
    (_label, pageSlug, expectedMessage) => {
      expect.assertions(1);

      // Arrange
      const input = { pageSlug };

      // Act
      function parse() {
        getCurriculumPageInputSchema.parse(input);
      }

      // Assert
      expect(parse).toThrow(expectedMessage);
    },
  );
});

describe("toggleStepInputSchema validation", () => {
  it.each([
    [true, "  level-1/zen:step-1  ", "level-1/zen:step-1"],
    [false, "level-4/communication:step-5", "level-4/communication:step-5"],
  ] as const)(
    "accepts and trims valid toggleStep input (completed=%s)",
    (completed, rawStepId, expectedStepId) => {
      expect.assertions(1);

      // Arrange
      const input = { completed, stepId: rawStepId };

      // Act
      const parsed = toggleStepInputSchema.parse(input);

      // Assert
      expect(parsed).toStrictEqual({ completed, stepId: expectedStepId });
    },
  );

  it.each([
    ["blank stepId", { completed: true, stepId: "   " }, "Step ID is required"],
    [
      "overlong stepId",
      { completed: true, stepId: `level-1/${"a".repeat(OVER_MAX_STEP_ID_LENGTH)}` },
      "Step ID is too long",
    ],
    [
      "non-boolean completed",
      { completed: "true", stepId: "level-1/zen:step-1" },
      /expected boolean/u,
    ],
  ] as const)("rejects invalid toggleStep input (%s)", (_label, rawInput, expectedError) => {
    expect.assertions(1);

    // Act
    function parse() {
      toggleStepInputSchema.parse(rawInput);
    }

    // Assert
    expect(parse).toThrow(expectedError);
  });
});
