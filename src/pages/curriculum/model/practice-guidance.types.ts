import type { StepNumber } from "@/shared/curriculum-data";

export type TargetAdvancement = "app default" | "source";
export type TargetUnit = "foot" | "inch" | "minute" | "second";

export interface PracticeGuidance {
  conditions: string;
  criterion: string;
  progression: string;
  readiness: string;
  readinessBasis: string;
  readyForTest: boolean;
  restart: string;
  setup: string;
  source: string;
  suggestedLimit: string;
  success: string;
  target: string;
  targetAdvancement: TargetAdvancement | null;
  targetOptions: readonly string[];
}

export interface PracticeGuidanceAttempt {
  outcome: "success" | "not_yet";
  target: string;
}

export interface PracticeTargetLadder {
  advancement: TargetAdvancement;
  endAt: number;
  /** Amount added per rung; defaults to 1. */
  increment?: number;
  /** Rung value to return to after a Not yet; defaults to the first rung. */
  restartAt?: number;
  startAt: number;
  /** Target text with a `{value}` placeholder for the formatted amount. */
  targetTemplate: string;
  /** Unit of each rung value; defaults to seconds. */
  unit?: TargetUnit;
}

export interface BehaviorRule {
  conditions: string;
  progression: string;
  readiness: string;
  restart: string;
  setup: string;
  steps?: Partial<Record<StepNumber, StepRule>>;
}

/** Step overrides; explicit `practiceTargets` restart at their first rung after a Not yet. */
export interface StepRule {
  conditions?: string;
  progression?: string;
  readiness?: string;
  restart?: string;
  practiceTargetLadder?: PracticeTargetLadder;
  practiceTargets?: readonly string[];
  targetAdvancement?: TargetAdvancement;
}
