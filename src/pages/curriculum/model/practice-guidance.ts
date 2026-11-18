import type { StepNumber } from "@/shared/curriculum-data";

import { PRACTICE_GUIDANCE_LEVEL_ONE } from "./practice-guidance-level-one";
import { PRACTICE_GUIDANCE_LEVEL_TWO_FOUNDATIONS } from "./practice-guidance-level-two-foundations";
import { PRACTICE_GUIDANCE_LEVEL_TWO_GENERALIZATION } from "./practice-guidance-level-two-generalization";
import { PRACTICE_GUIDANCE_LEVEL_TWO_POSITION } from "./practice-guidance-level-two-position";
import { PRACTICE_GUIDANCE_LEVEL_TWO_STAYS } from "./practice-guidance-level-two-stays";
import type {
  BehaviorRule,
  PracticeGuidance,
  PracticeGuidanceAttempt,
  PracticeTargetLadder,
  StepRule,
  TargetUnit,
} from "./practice-guidance.types";

const APP_DEFAULT_LIMIT =
  "Pause after 5 recorded attempts; continue or finish. This is an app default.";
const LADDER_READINESS =
  "Consider a Test after a recorded Success at the final target, which is the full criterion.";
const JUDGMENT_READINESS =
  "Handler judgment: this Step has no numeric ladder. After a recorded Success, decide from the readiness question whether your Dog met the full criterion.";
const STEPS_PER_BEHAVIOR = 5;
const STEP_ID_SEPARATOR = ":step-";
const LAST_INDEX = -1;
const DEFAULT_INCREMENT = 1;
const UNIT_LABELS: Readonly<Record<TargetUnit, readonly [string, string]>> = {
  foot: ["foot", "feet"],
  inch: ["inch", "inches"],
  second: ["second", "seconds"],
};
/** Main Quest order, so Practice options follow the curriculum and Level 1 Zen Step 1 stays first. */
const CURRICULUM_BEHAVIOR_ORDER = [
  "level-1/zen",
  "level-1/come",
  "level-1/sit",
  "level-1/target",
  "level-1/down",
  "level-2/zen",
  "level-2/focus",
  "level-2/come",
  "level-2/down",
  "level-2/sit",
  "level-2/lazy-leash",
  "level-2/target",
  "level-2/go-to-mat",
  "level-2/crate",
  "level-2/distance",
  "level-2/jump",
  "level-2/relax",
  "level-2/handling",
  "level-2/tricks",
  "level-2/communication",
] as const;
const BEHAVIOR_RULES: Readonly<Record<string, BehaviorRule>> = {
  ...PRACTICE_GUIDANCE_LEVEL_ONE,
  ...PRACTICE_GUIDANCE_LEVEL_TWO_FOUNDATIONS,
  ...PRACTICE_GUIDANCE_LEVEL_TWO_POSITION,
  ...PRACTICE_GUIDANCE_LEVEL_TWO_GENERALIZATION,
  ...PRACTICE_GUIDANCE_LEVEL_TWO_STAYS,
};

interface ParsedStepId {
  behaviorName: string;
  levelNumber: string;
  pageSlug: string;
  stepNumber: number;
}

interface TargetProgress {
  readyForTest: boolean;
  target: string;
  targetOptions: readonly string[];
}

function parseStepId(stepId: string): ParsedStepId {
  const [pageSlug = "", rawStepNumber = ""] = stepId.split(STEP_ID_SEPARATOR);
  const [section = "", behaviorSlug = ""] = pageSlug.split("/");
  return {
    behaviorName: behaviorSlug
      .split("-")
      .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
      .join(" "),
    levelNumber: section.slice("level-".length),
    pageSlug,
    stepNumber: Number(rawStepNumber),
  };
}

function isAuthoredStepNumber(stepNumber: number): stepNumber is StepNumber {
  return Number.isInteger(stepNumber) && stepNumber >= 1 && stepNumber <= STEPS_PER_BEHAVIOR;
}

function getPracticeGuidance(
  stepId: string,
  criterion: string,
  attempts: readonly PracticeGuidanceAttempt[] = [],
): PracticeGuidance | null {
  const { behaviorName, levelNumber, pageSlug, stepNumber } = parseStepId(stepId);
  const behavior = BEHAVIOR_RULES[pageSlug];
  if (behavior === undefined || !isAuthoredStepNumber(stepNumber) || criterion.trim() === "") {
    return null;
  }

  const stepRule = behavior.steps?.[stepNumber] ?? {};
  return {
    ...getTargetProgress(stepRule, criterion, attempts),
    conditions: stepRule.conditions ?? behavior.conditions,
    criterion,
    progression: stepRule.progression ?? behavior.progression,
    readiness: stepRule.readiness ?? behavior.readiness,
    restart: stepRule.restart ?? behavior.restart,
    setup: behavior.setup,
    source: `Main Quest Level ${levelNumber} ${behaviorName}, Step ${String(stepNumber)} (including its Try It Cold instructions).`,
    success: `Success means your Dog meets the full criterion: ${criterion}`,
    suggestedLimit: APP_DEFAULT_LIMIT,
    targetAdvancement:
      stepRule.practiceTargetLadder?.advancement ?? stepRule.targetAdvancement ?? null,
  };
}

function getTargetProgress(
  stepRule: StepRule,
  criterion: string,
  attempts: readonly PracticeGuidanceAttempt[],
): TargetProgress & { readinessBasis: string } {
  const targetOptions = getPracticeTargets(stepRule);
  const lastAttempt = attempts.at(LAST_INDEX);
  const lastSucceeded = lastAttempt?.outcome === "success";
  if (targetOptions.length === 0) {
    return {
      readinessBasis: JUDGMENT_READINESS,
      readyForTest: lastSucceeded,
      target: criterion,
      targetOptions,
    };
  }
  return {
    readinessBasis: LADDER_READINESS,
    readyForTest: lastSucceeded && lastAttempt.target === targetOptions.at(LAST_INDEX),
    target: targetOptions[getTargetIndex(targetOptions, lastAttempt, stepRule)] ?? criterion,
    targetOptions,
  };
}

function getPracticeTargets(stepRule: StepRule): readonly string[] {
  const ladder = stepRule.practiceTargetLadder;
  if (ladder === undefined) {
    return stepRule.practiceTargets ?? [];
  }
  return getLadderValues(ladder).map((value) =>
    ladder.targetTemplate.replace("{value}", formatAmount(value, ladder.unit ?? "second")),
  );
}

function getLadderValues(ladder: PracticeTargetLadder): readonly number[] {
  const increment = ladder.increment ?? DEFAULT_INCREMENT;
  const values: number[] = [];
  for (let value = ladder.startAt; value <= ladder.endAt; value += increment) {
    values.push(value);
  }
  return values;
}

function formatAmount(value: number, unit: TargetUnit): string {
  const [singular, plural] = UNIT_LABELS[unit];
  return `${String(value)} ${value === 1 ? singular : plural}`;
}

function getRestartIndex(stepRule: StepRule): number {
  const ladder = stepRule.practiceTargetLadder;
  if (ladder?.restartAt === undefined) {
    return 0;
  }
  return Math.max(0, getLadderValues(ladder).indexOf(ladder.restartAt));
}

function getTargetIndex(
  targets: readonly string[],
  lastAttempt: PracticeGuidanceAttempt | undefined,
  stepRule: StepRule,
): number {
  if (lastAttempt === undefined) {
    return 0;
  }
  if (lastAttempt.outcome === "not_yet") {
    return getRestartIndex(stepRule);
  }
  const lastIndex = targets.indexOf(lastAttempt.target);
  return lastIndex === -1 ? 0 : Math.min(lastIndex + 1, targets.length - 1);
}

function getPracticeGuidanceCoverage(): readonly string[] {
  return CURRICULUM_BEHAVIOR_ORDER.flatMap((pageSlug) =>
    Array.from(
      { length: STEPS_PER_BEHAVIOR },
      (_unused, index) => `${pageSlug}${STEP_ID_SEPARATOR}${String(index + 1)}`,
    ),
  );
}

function getPracticeStepOptions(): readonly { label: string; pageSlug: string; stepId: string }[] {
  return getPracticeGuidanceCoverage().map((stepId) => {
    const { behaviorName, levelNumber, pageSlug, stepNumber } = parseStepId(stepId);
    return {
      label: `Level ${levelNumber} ${behaviorName} · Step ${String(stepNumber)}`,
      pageSlug,
      stepId,
    };
  });
}

export { getPracticeGuidance, getPracticeGuidanceCoverage, getPracticeStepOptions };
export type { PracticeGuidance } from "./practice-guidance.types";
