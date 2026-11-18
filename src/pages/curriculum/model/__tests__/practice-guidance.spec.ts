import { describe, expect, it } from "vite-plus/test";

import { getCurriculumSyllabus } from "@/shared/curriculum-data/index.server";

import {
  getPracticeGuidance,
  getPracticeGuidanceCoverage,
  getPracticeStepOptions,
  type PracticeGuidance,
} from "../practice-guidance";
import type { PracticeGuidanceAttempt } from "../practice-guidance.types";

const LEVEL_SECTION_SLUGS = new Set(["level-1", "level-2"]);
const NUMERIC_CRITERION = /\d+ (?:second|minute|foot|feet|inch|step)/u;
const COME_FORTY_FEET = "level-2/come:step-3";
const COME_FORTY_FEET_CRITERION = "Dog comes 40 feet to you.";
const FOCUS_TWO_SECONDS = "level-2/focus:step-2";
const FOCUS_TWO_SECONDS_CRITERION = "Dog holds eye contact for 2 seconds.";

function getLevelOneAndTwoSteps() {
  return getCurriculumSyllabus()
    .sections.filter((section) => LEVEL_SECTION_SLUGS.has(section.sectionSlug))
    .flatMap((section) => section.pages.flatMap((page) => page.stepSummaries ?? []));
}

function requireGuidance(
  stepId: string,
  criterion: string,
  attempts: readonly PracticeGuidanceAttempt[] = [],
): PracticeGuidance {
  const guidance = getPracticeGuidance(stepId, criterion, attempts);
  if (guidance === null) {
    throw new Error(`Missing Practice guidance for ${stepId}.`);
  }
  return guidance;
}

function hasCompleteGuidance(guidance: PracticeGuidance): boolean {
  const authoredText = [
    guidance.conditions,
    guidance.criterion,
    guidance.progression,
    guidance.readiness,
    guidance.readinessBasis,
    guidance.restart,
    guidance.setup,
    guidance.source,
    guidance.success,
    guidance.target,
  ].every((value) => value.trim().length >= 5);
  const hasSource = guidance.source.includes("Main Quest Level");
  const identifiesTheAppDefault = guidance.suggestedLimit.includes("app default");
  return authoredText && hasSource && identifiesTheAppDefault;
}

function getNumericStepsWithoutTargets(): string[] {
  return getLevelOneAndTwoSteps()
    .filter((step) => NUMERIC_CRITERION.test(step.label))
    .filter((step) => requireGuidance(step.stepId, step.label).targetOptions.length === 0)
    .map((step) => step.stepId);
}

describe("guided Practice authoring", () => {
  it("provides source-backed setup and readiness guidance for every Level 1 and 2 Step", () => {
    expect.assertions(3);
    const steps = getLevelOneAndTwoSteps();

    const guidance = steps.map((step) => requireGuidance(step.stepId, step.label));

    expect(getPracticeGuidanceCoverage()).toStrictEqual(steps.map((step) => step.stepId));
    expect(guidance.map((item) => item.criterion)).toStrictEqual(steps.map((step) => step.label));
    expect(guidance.map((item) => hasCompleteGuidance(item))).toStrictEqual(steps.map(() => true));
  });

  it("offers every authored Step in curriculum order with Level 1 Zen Step 1 first", () => {
    expect.assertions(3);

    const options = getPracticeStepOptions();

    expect(options.map((option) => option.stepId)).toStrictEqual(getPracticeGuidanceCoverage());
    expect(options[0]).toStrictEqual({
      label: "Level 1 Zen · Step 1",
      pageSlug: "level-1/zen",
      stepId: "level-1/zen:step-1",
    });
    expect(options).toContainEqual({
      label: "Level 2 Go To Mat · Step 3",
      pageSlug: "level-2/go-to-mat",
      stepId: "level-2/go-to-mat:step-3",
    });
  });

  it("uses explicit Step overrides for source-specific ladders", () => {
    expect.assertions(2);

    const guidance = requireGuidance(
      "level-2/zen:step-2",
      "The dog stays off a treat for 10 seconds",
    );

    expect(guidance.progression).toContain("10 seconds");
    expect(guidance.source).toContain("Level 2 Zen, Step 2");
  });

  it("keeps the Level 2 Down one-second ladder distinct from its distance restart", () => {
    expect.assertions(4);

    const downTenSeconds = requireGuidance(
      "level-2/down:step-1",
      "The dog downs and stays down for 10 seconds",
    );
    const downOneMinute = requireGuidance(
      "level-2/down:step-4",
      "The dog downs and stays down for 1 minute while you walk 20 feet away and return",
    );

    expect(downTenSeconds.restart).toContain("1 second");
    expect(downOneMinute.progression).toContain("20 feet");
    expect(downOneMinute.progression).toContain("1-minute");
    expect(downOneMinute.restart).toContain("half the failed distance");
  });

  it("keeps the Level 2 Sit stationary hold separate from walking away", () => {
    expect.assertions(3);

    const sitFiveFeet = requireGuidance(
      "level-2/sit:step-1",
      "The dog sits and stays while you walk 5 feet away and return",
    );

    expect(sitFiveFeet.progression).toContain("10 seconds");
    expect(sitFiveFeet.targetOptions).toContain(
      "Beside you, she sits without moving for 10 seconds.",
    );
    expect(sitFiveFeet.targetOptions.at(-1)).toBe(
      "Walk 5 feet away and return, pivoting back to her side; she sits until you are beside her.",
    );
  });

  it("provides interactive target rungs for every numeric Step criterion", () => {
    expect.assertions(1);

    const stepsWithoutTargets = getNumericStepsWithoutTargets();

    expect(stepsWithoutTargets).toStrictEqual([]);
  });

  it("advances a distance ladder after a success and restarts at the source distance after a miss", () => {
    expect.assertions(3);
    const fiveFeet = "Call her from 5 feet away, without your real Come cue.";
    const tenFeet = "Call her from 10 feet away, without your real Come cue.";
    const fifteenFeet = "Call her from 15 feet away, without your real Come cue.";

    const start = requireGuidance(COME_FORTY_FEET, COME_FORTY_FEET_CRITERION);
    const afterSuccesses = requireGuidance(COME_FORTY_FEET, COME_FORTY_FEET_CRITERION, [
      { outcome: "success", target: fiveFeet },
      { outcome: "success", target: tenFeet },
    ]);
    const afterMiss = requireGuidance(COME_FORTY_FEET, COME_FORTY_FEET_CRITERION, [
      { outcome: "success", target: fiveFeet },
      { outcome: "success", target: tenFeet },
      { outcome: "not_yet", target: fifteenFeet },
    ]);

    expect(start.target).toBe(fiveFeet);
    expect(afterSuccesses.target).toBe(fifteenFeet);
    expect(afterMiss.target).toBe(tenFeet);
  });

  it("labels app-chosen rung sizes as an app default", () => {
    expect.assertions(2);

    const guidance = requireGuidance(COME_FORTY_FEET, COME_FORTY_FEET_CRITERION);

    expect(guidance.targetAdvancement).toBe("app default");
    expect(guidance.targetOptions.at(-1)).toBe(
      "Call her from 40 feet away, without your real Come cue.",
    );
  });

  it("restarts explicit source rungs at the first rung and keeps unknown targets at the start", () => {
    expect.assertions(2);
    const criterion = "Dog relaxes for 1 minute, gets excited, and relaxes again.";
    const secondRung =
      "Bounce between short settles and a few seconds of mild excitement until she changes easily.";

    const afterMiss = requireGuidance("level-2/relax:step-4", criterion, [
      { outcome: "not_yet", target: secondRung },
    ]);
    const afterUnknownTarget = requireGuidance("level-2/relax:step-4", criterion, [
      { outcome: "success", target: "A target from an older version" },
    ]);

    expect(afterMiss.target).toBe(
      "A short settle, a short and easy excite, then another short settle.",
    );
    expect(afterUnknownTarget.target).toBe(afterMiss.target);
  });

  it("is ready for a Test only after a recorded success at the full numeric criterion", () => {
    expect.assertions(3);
    const oneSecond = "Hold eye contact for 1 second.";
    const twoSeconds = "Hold eye contact for 2 seconds.";

    const notStarted = requireGuidance(FOCUS_TWO_SECONDS, FOCUS_TWO_SECONDS_CRITERION);
    const partWay = requireGuidance(FOCUS_TWO_SECONDS, FOCUS_TWO_SECONDS_CRITERION, [
      { outcome: "success", target: oneSecond },
    ]);
    const fullCriterion = requireGuidance(FOCUS_TWO_SECONDS, FOCUS_TWO_SECONDS_CRITERION, [
      { outcome: "success", target: oneSecond },
      { outcome: "success", target: twoSeconds },
    ]);

    expect(notStarted.readyForTest).toBe(false);
    expect(partWay.readyForTest).toBe(false);
    expect(fullCriterion.readyForTest).toBe(true);
  });

  it("formats inch rungs in readable units", () => {
    expect.assertions(2);

    const poleInches = requireGuidance(
      "level-2/distance:step-2",
      "Dog walks around a pole 2 feet from you.",
    );

    expect(poleInches.targetOptions[0]).toBe(
      "She goes around the pole while you stand 2 inches from it.",
    );
    expect(poleInches.targetOptions.at(-1)).toBe(
      "She goes around the pole while you stand 24 inches from it.",
    );
  });

  it("identifies handler judgment for Steps without a numeric ladder", () => {
    expect.assertions(3);
    const criterion = "Dog allows you to touch her head, tail, and feet.";

    const notStarted = requireGuidance("level-2/handling:step-1", criterion);
    const afterSuccess = requireGuidance("level-2/handling:step-1", criterion, [
      { outcome: "success", target: criterion },
    ]);

    expect(notStarted.readinessBasis).toContain("Handler judgment");
    expect(notStarted.readyForTest).toBe(false);
    expect(afterSuccess.readyForTest).toBe(true);
  });

  it("returns no guidance for Steps outside the authored Levels or criteria", () => {
    expect.assertions(3);

    const otherLevel = getPracticeGuidance("level-3/crate:step-2", "The dog stays in the crate");
    const unknownStep = getPracticeGuidance("level-1/zen:step-9", "Dog stays away.");
    const blankCriterion = getPracticeGuidance("level-1/zen:step-1", "   ");

    expect(otherLevel).toBeNull();
    expect(unknownStep).toBeNull();
    expect(blankCriterion).toBeNull();
  });
});
