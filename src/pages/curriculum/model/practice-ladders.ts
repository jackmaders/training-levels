import { getPracticeStepOptions } from "./practice-guidance";

type AttemptResult = "success" | "not_yet";

interface LadderAttempt {
  outcome: AttemptResult;
  target: string;
}

interface LadderTargetOption {
  distanceFeet: number;
  durationSeconds: number;
  label: string;
}

interface PracticePlan {
  appDefaultPracticeLimit: number;
  appDefaultRepetitions: number;
  distanceFeet: number;
  durationSeconds: number;
  easierTarget: string | null;
  nextTarget: string | null;
  priorAchievement: string | null;
  restartReason: string | null;
  source: string;
  stepId: string;
  target: string;
  targetOptions: readonly LadderTargetOption[];
}

interface LadderRule {
  appDefaultRepetitions: number;
  distanceFeet: readonly number[];
  durationRestartTargetIndex?: number;
  durationSeconds: readonly number[];
  initialTargetIndex: number;
  restartTargetIndex: number;
  source: string;
  sourceDurationRestart?: string;
  sourceRestart: string;
}

interface LadderPosition {
  priorAchievement: string | null;
  restartReason: string | null;
  targetIndex: number;
}

const APP_DEFAULT_PRACTICE_LIMIT = 5;
const APP_DEFAULT_REPETITIONS = 1;
const CRATE_STEP_2_ID = "level-3/crate:step-2";
const CRATE_STEP_3_ID = "level-3/crate:step-3";
const DISTANCE_LADDER_TARGET_COUNT = 6;
const FIRST_TARGET_INDEX = 0;
const LAST_INDEX_OFFSET = 1;
const NO_DURATION_SECONDS = 0;
const NO_DISTANCE_FEET = 0;
const NO_TARGET_INDEX = -1;
const TWO_FEET = 2;
const THREE_FEET = 3;
const FOUR_FEET = 4;
const FIVE_FEET = 5;
const SIX_FEET = 6;
const SEVEN_FEET = 7;
const EIGHT_FEET = 8;
const NINE_FEET = 9;
const TEN_FEET = 10;
const FIFTEEN_SECONDS = 15;
const THIRTY_SECONDS = 30;
const FORTY_FIVE_SECONDS = 45;
const SIXTY_SECONDS = 60;
const NINETY_SECONDS = 90;
const ONE_HUNDRED_TWENTY_SECONDS = 120;
const TARGET_INDEX_INCREMENT = 1;
const PRACTICE_STEP_OPTIONS = [
  ...getPracticeStepOptions(),
  { label: "Level 3 Crate · Step 2", pageSlug: "level-3/crate", stepId: CRATE_STEP_2_ID },
  { label: "Level 3 Crate · Step 3", pageSlug: "level-3/crate", stepId: CRATE_STEP_3_ID },
] as const;

const STEP_TWO_TARGETS = [
  [TWO_FEET, NO_DURATION_SECONDS],
  [TWO_FEET, FIFTEEN_SECONDS],
  [THREE_FEET, THIRTY_SECONDS],
  [FOUR_FEET, FORTY_FIVE_SECONDS],
  [FIVE_FEET, SIXTY_SECONDS],
] as const;
const STEP_THREE_TARGETS = [
  [FIVE_FEET, NO_DURATION_SECONDS],
  [SIX_FEET, NO_DURATION_SECONDS],
  [SEVEN_FEET, NO_DURATION_SECONDS],
  [EIGHT_FEET, NO_DURATION_SECONDS],
  [NINE_FEET, NO_DURATION_SECONDS],
  [TEN_FEET, NO_DURATION_SECONDS],
  [FIVE_FEET, SIXTY_SECONDS],
  [FIVE_FEET, NINETY_SECONDS],
  [FIVE_FEET, ONE_HUNDRED_TWENTY_SECONDS],
] as const;

const LADDER_RULES: Readonly<Record<string, LadderRule>> = {
  [CRATE_STEP_2_ID]: {
    appDefaultRepetitions: APP_DEFAULT_REPETITIONS,
    distanceFeet: STEP_TWO_TARGETS.map((target) => target[FIRST_TARGET_INDEX]),
    durationSeconds: STEP_TWO_TARGETS.map((target) => target[LAST_INDEX_OFFSET]),
    initialTargetIndex: FIRST_TARGET_INDEX,
    restartTargetIndex: FIRST_TARGET_INDEX,
    source: "Level 3 Crate, Step 2: 2 ft/15 sec, 3 ft/30 sec, 4 ft/45 sec, 5 ft/1 min.",
    sourceRestart: "When she makes a mistake, cut back on time, distance, or both.",
  },
  [CRATE_STEP_3_ID]: {
    appDefaultRepetitions: APP_DEFAULT_REPETITIONS,
    distanceFeet: STEP_THREE_TARGETS.map((target) => target[FIRST_TARGET_INDEX]),
    durationRestartTargetIndex: DISTANCE_LADDER_TARGET_COUNT,
    durationSeconds: STEP_THREE_TARGETS.map((target) => target[LAST_INDEX_OFFSET]),
    initialTargetIndex: FIRST_TARGET_INDEX,
    restartTargetIndex: FIRST_TARGET_INDEX,
    source:
      "Level 3 Crate, Step 3: separate 5–10 ft and 1–2 min ladders; examples include 8 ft/90 sec and 10 ft/30 sec.",
    sourceDurationRestart: "Restart the duration ladder at 5 ft/1 min.",
    sourceRestart: "Restart the distance ladder at 5 ft with no time.",
  },
};

function getPracticePlan(stepId: string, attempts: readonly LadderAttempt[]): PracticePlan {
  const rule = LADDER_RULES[stepId];
  if (rule === undefined) {
    throw new Error(`No source-backed Practice ladder is available for ${stepId}.`);
  }

  return createPlan({ ...getLadderPosition(rule, attempts), rule, stepId });
}

function hasPracticeLadder(stepId: string): boolean {
  return LADDER_RULES[stepId] !== undefined;
}

function getLadderPosition(rule: LadderRule, attempts: readonly LadderAttempt[]): LadderPosition {
  const activeAttempts = attempts.filter((attempt) => attempt.target !== "");
  const lastAttempt = activeAttempts.at(-LAST_INDEX_OFFSET);
  const targetIndex =
    lastAttempt === undefined ? NO_TARGET_INDEX : findTargetIndex(rule, lastAttempt.target);
  const restartAtDuration = isDurationRestart(rule, lastAttempt, targetIndex);

  return {
    priorAchievement: findPriorAchievement(activeAttempts),
    restartReason: getRestartReason(rule, lastAttempt, restartAtDuration),
    targetIndex: getNextTargetIndex({
      lastAttempt,
      lastIndex: targetIndex,
      restartAtDuration,
      rule,
    }),
  };
}

function findPriorAchievement(attempts: readonly LadderAttempt[]): string | null {
  return attempts.toReversed().find((attempt) => attempt.outcome === "success")?.target ?? null;
}

function isDurationRestart(
  rule: LadderRule,
  lastAttempt: LadderAttempt | undefined,
  targetIndex: number,
): boolean {
  return (
    lastAttempt?.outcome === "not_yet" &&
    rule.durationRestartTargetIndex !== undefined &&
    targetIndex >= rule.durationRestartTargetIndex
  );
}

function getNextTargetIndex({
  lastAttempt,
  lastIndex,
  restartAtDuration,
  rule,
}: {
  lastAttempt: LadderAttempt | undefined;
  lastIndex: number;
  restartAtDuration: boolean;
  rule: LadderRule;
}): number {
  if (lastAttempt?.outcome === "not_yet") {
    return restartAtDuration
      ? (rule.durationRestartTargetIndex ?? rule.restartTargetIndex)
      : rule.restartTargetIndex;
  }

  if (lastIndex === NO_TARGET_INDEX) {
    return rule.initialTargetIndex;
  }
  return Math.min(lastIndex + TARGET_INDEX_INCREMENT, rule.distanceFeet.length - LAST_INDEX_OFFSET);
}

function getRestartReason(
  rule: LadderRule,
  lastAttempt: LadderAttempt | undefined,
  restartAtDuration: boolean,
): string | null {
  if (lastAttempt === undefined || lastAttempt.outcome === "success") {
    return null;
  }
  if (restartAtDuration) {
    return rule.sourceDurationRestart ?? rule.sourceRestart;
  }
  return rule.sourceRestart;
}

function createPlan({
  priorAchievement,
  restartReason,
  rule,
  stepId,
  targetIndex,
}: LadderPosition & { rule: LadderRule; stepId: string }): PracticePlan {
  const distanceFeet = rule.distanceFeet[targetIndex] ?? NO_DISTANCE_FEET;
  const durationSeconds = rule.durationSeconds[targetIndex] ?? NO_DURATION_SECONDS;
  const target = formatTarget(distanceFeet, durationSeconds);

  return {
    appDefaultPracticeLimit: APP_DEFAULT_PRACTICE_LIMIT,
    appDefaultRepetitions: rule.appDefaultRepetitions,
    distanceFeet,
    durationSeconds,
    easierTarget: formatAdjacentTarget(rule, targetIndex, -TARGET_INDEX_INCREMENT),
    nextTarget: formatAdjacentTarget(rule, targetIndex, TARGET_INDEX_INCREMENT),
    priorAchievement,
    restartReason,
    source: rule.source,
    stepId,
    target,
    targetOptions: rule.distanceFeet.map((feet, index) => {
      const targetSeconds = rule.durationSeconds[index] ?? NO_DURATION_SECONDS;
      return {
        distanceFeet: feet,
        durationSeconds: targetSeconds,
        label: formatTarget(feet, targetSeconds),
      };
    }),
  };
}

function formatAdjacentTarget(
  rule: LadderRule,
  targetIndex: number,
  offset: number,
): string | null {
  const adjacentIndex = targetIndex + offset;
  const distanceFeet = rule.distanceFeet[adjacentIndex];
  const durationSeconds = rule.durationSeconds[adjacentIndex];
  if (distanceFeet === undefined || durationSeconds === undefined) {
    return null;
  }
  return formatTarget(distanceFeet, durationSeconds);
}

function findTargetIndex(rule: LadderRule, target: string): number {
  return rule.distanceFeet.findIndex(
    (feet, optionIndex) =>
      formatTarget(feet, rule.durationSeconds[optionIndex] ?? NO_DURATION_SECONDS) === target,
  );
}

function recordLadderOutcome(plan: PracticePlan, outcome: AttemptResult): LadderAttempt {
  return { outcome, target: plan.target };
}

function formatTarget(distanceFeet: number, durationSeconds: number): string {
  return `${String(distanceFeet)} feet · ${String(durationSeconds)} seconds`;
}

export { getPracticePlan, hasPracticeLadder, PRACTICE_STEP_OPTIONS, recordLadderOutcome };
export type { AttemptResult, LadderAttempt, PracticePlan };
