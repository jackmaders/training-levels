import { describe, it, expect } from "vitest";
import {
  CalloutSchema,
  StepDataSchema,
  BehaviorDataSchema,
} from "../src/types/curriculum";

describe("Curriculum Schemas", () => {
  it("validates a Callout object", () => {
    const callout = {
      type: "tip" as const,
      rawType: "TIP",
      title: "TRAINING TIP",
      contentMarkdown: "Remember to reward immediately.",
    };
    const result = CalloutSchema.safeParse(callout);
    expect(result.success).toBe(true);
  });

  it("validates a StepData object", () => {
    const step = {
      id: "level-1-zen-step-1",
      stepNumber: 1,
      title: "The dog moves away from a treat in your closed fist.",
      criterionSummary: "Dog moves away from a treat in your hand.",
      instructionsMarkdown: "Start sitting in a chair...",
      tryItCold: "Say Leave It and put your hand out...",
      comeafters: "Teach Step 1 again while you're standing up...",
      callouts: [],
    };
    const result = StepDataSchema.safeParse(step);
    expect(result.success).toBe(true);
  });

  it("fails validation if a behavior does not have exactly 5 steps", () => {
    const invalidBehavior = {
      id: "level-1-zen",
      level: 1,
      behaviorKey: "zen",
      title: "Zen",
      order: 1,
      pages: "65-75",
      comebefores: null,
      equipment: null,
      thinkAbout: null,
      aboutCues: null,
      introMarkdown: "Intro text",
      criteriaTable: [],
      callouts: [],
      steps: [], // Empty! Should fail length(5)
    };
    const result = BehaviorDataSchema.safeParse(invalidBehavior);
    expect(result.success).toBe(false);
  });
});
