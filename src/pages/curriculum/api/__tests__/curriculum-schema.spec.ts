import { describe, expect, it } from "vite-plus/test";

import { getCurriculumPageInputSchema, toggleStepInputSchema } from "../curriculum-schema";

const OVER_MAX_SLUG_LENGTH = 130;
const OVER_MAX_STEP_ID_LENGTH = 170;

describe("curriculum-schema", () => {
  it("accepts and trims valid curriculum page slugs including unknown stems", () => {
    expect.assertions(4);

    // Arrange
    const zenInput = { pageSlug: "  level-1/zen  " };
    const theoryInput = { pageSlug: "theory/01-foreword" };
    const appendixInput = { pageSlug: "appendices/appendix-a-leading-the-dance" };
    const unknownStemInput = { pageSlug: "level-1/nonexistent" };

    // Act & Assert
    expect(getCurriculumPageInputSchema.parse(zenInput)).toStrictEqual({ pageSlug: "level-1/zen" });
    expect(getCurriculumPageInputSchema.parse(theoryInput)).toStrictEqual({
      pageSlug: "theory/01-foreword",
    });
    expect(getCurriculumPageInputSchema.parse(appendixInput)).toStrictEqual({
      pageSlug: "appendices/appendix-a-leading-the-dance",
    });
    expect(getCurriculumPageInputSchema.parse(unknownStemInput)).toStrictEqual({
      pageSlug: "level-1/nonexistent",
    });
  });

  it("rejects malformed curriculum page slugs", () => {
    expect.assertions(5);

    // Arrange
    const emptySlug = { pageSlug: "   " };
    const missingSection = { pageSlug: "zen" };
    const invalidSection = { pageSlug: "level-5/zen" };
    const pathTraversal = { pageSlug: "../theory/01-foreword" };
    const overlongSlug = { pageSlug: `level-1/${"a".repeat(OVER_MAX_SLUG_LENGTH)}` };

    // Act & Assert
    expect(() => getCurriculumPageInputSchema.parse(emptySlug)).toThrow("Page slug is required");
    expect(() => getCurriculumPageInputSchema.parse(missingSection)).toThrow(
      "Invalid curriculum page slug",
    );
    expect(() => getCurriculumPageInputSchema.parse(invalidSection)).toThrow(
      "Invalid curriculum page slug",
    );
    expect(() => getCurriculumPageInputSchema.parse(pathTraversal)).toThrow(
      "Invalid curriculum page slug",
    );
    expect(() => getCurriculumPageInputSchema.parse(overlongSlug)).toThrow("Page slug is too long");
  });

  it("accepts and trims valid toggleStep inputs", () => {
    expect.assertions(2);

    // Arrange
    const checkInput = { completed: true, stepId: "  level-1/zen:step-1  " };
    const uncheckInput = { completed: false, stepId: "level-4/communication:step-5" };

    // Act & Assert
    expect(toggleStepInputSchema.parse(checkInput)).toStrictEqual({
      completed: true,
      stepId: "level-1/zen:step-1",
    });
    expect(toggleStepInputSchema.parse(uncheckInput)).toStrictEqual({
      completed: false,
      stepId: "level-4/communication:step-5",
    });
  });

  it("rejects empty, overlong, or non-boolean toggleStep inputs", () => {
    expect.assertions(3);

    // Arrange
    const blankStepId = { completed: true, stepId: "   " };
    const overlongStepId = {
      completed: true,
      stepId: `level-1/${"a".repeat(OVER_MAX_STEP_ID_LENGTH)}`,
    };
    const invalidCompleted = { completed: "true", stepId: "level-1/zen:step-1" };

    // Act & Assert
    expect(() => toggleStepInputSchema.parse(blankStepId)).toThrow("Step ID is required");
    expect(() => toggleStepInputSchema.parse(overlongStepId)).toThrow("Step ID is too long");
    expect(() => toggleStepInputSchema.parse(invalidCompleted)).toThrow(/expected boolean/u);
  });
});
