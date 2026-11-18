import { describe, expect, it } from "vite-plus/test";

import rawSyllabus from "../data/syllabus.json";
import { isValidMainQuestStepId } from "../main-quest";

const SYLLABUS_STEP_IDS = rawSyllabus.sections.flatMap((section) =>
  section.pages.flatMap((page) => ("stepIds" in page ? page.stepIds : [])),
);

describe("main quest step validation", () => {
  it("accepts every stepId in the syllabus across all levels", () => {
    expect.assertions(4);

    // Act
    const allValid = SYLLABUS_STEP_IDS.every((stepId) => isValidMainQuestStepId(stepId));

    // Assert
    expect(SYLLABUS_STEP_IDS).toHaveLength(rawSyllabus.totalSteps);
    expect(allValid).toBe(true);
    expect(isValidMainQuestStepId("level-1/zen:step-1")).toBe(true);
    expect(isValidMainQuestStepId("level-4/communication:step-5")).toBe(true);
  });

  it("rejects unknown, prose, and empty stepIds", () => {
    expect.assertions(4);

    // Assert
    expect(isValidMainQuestStepId("")).toBe(false);
    expect(isValidMainQuestStepId("invalid-step")).toBe(false);
    expect(isValidMainQuestStepId("theory/01-foreword")).toBe(false);
    expect(isValidMainQuestStepId("level-1/zen:step-99")).toBe(false);
  });
});
