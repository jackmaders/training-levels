import type { SyllabusSection } from "@/shared/curriculum-data";

export type StepProvenance =
  | "unfinished"
  | "previously_recorded"
  | "test_passed"
  | "needs_practice";

export type StepTestOutcome = "success" | "not_yet";

export interface ResolveStepProvenanceInput {
  isCompleted: boolean;
  latestTestOutcome: StepTestOutcome | null;
}

export interface StepProvenanceSummary {
  hasHistoricalCompletion: boolean;
  provenance: StepProvenance;
}

export interface LevelAdvancementReadiness {
  completedStepCount: number;
  isReadyToAdvance: boolean;
  remainingStepCount: number;
  totalStepCount: number;
}

/** Resolves display provenance while keeping prior achievement checked after a failed retest. */
export function resolveStepProvenance({
  isCompleted,
  latestTestOutcome,
}: ResolveStepProvenanceInput): StepProvenanceSummary {
  if (latestTestOutcome === "not_yet") {
    return {
      hasHistoricalCompletion: isCompleted,
      provenance: "needs_practice",
    };
  }

  if (!isCompleted) {
    return {
      hasHistoricalCompletion: false,
      provenance: "unfinished",
    };
  }

  return {
    hasHistoricalCompletion: true,
    provenance: latestTestOutcome === "success" ? "test_passed" : "previously_recorded",
  };
}

/** Computes Level advancement readiness from behavior step completions alone. */
export function getLevelAdvancementReadiness(
  section: SyllabusSection,
  completedStepIds: ReadonlySet<string>,
): LevelAdvancementReadiness {
  const behaviorStepIds = section.pages
    .filter((page) => page.kind === "behavior")
    .flatMap((page) => page.stepIds ?? []);
  const totalStepCount = behaviorStepIds.length;
  let completedStepCount = 0;

  for (const stepId of behaviorStepIds) {
    if (completedStepIds.has(stepId)) {
      completedStepCount += 1;
    }
  }

  const remainingStepCount = totalStepCount - completedStepCount;

  return {
    completedStepCount,
    isReadyToAdvance: totalStepCount > 0 && remainingStepCount === 0,
    remainingStepCount,
    totalStepCount,
  };
}
