import type { CurriculumSyllabus, LevelNumber } from "@/shared/curriculum-data";

import { formatStepSummary } from "./curriculum-levels";
import { getPrerequisiteChain } from "./dependency-relationships";
import { collectLevelBehaviors } from "./training-recommendation-helpers";

interface InspectManualStepSelectionInput {
  completedStepIds: ReadonlySet<string>;
  currentLevelNumber: LevelNumber;
  pageSlug: string;
  syllabus: CurriculumSyllabus;
}

interface UnmetPrerequisite {
  pageSlug: string;
  title: string;
}

interface ManualStepSelectionInspection {
  hasWarning: boolean;
  isLaterLevel: boolean;
  selectedLevelNumber: LevelNumber | null;
  unmetPrerequisites: readonly UnmetPrerequisite[];
}

function getTrainingFallbackGuidance(
  step: { heading?: string; label?: string } | undefined,
  fallbackLabel: string,
): string {
  const headingText = step?.heading === undefined ? "" : formatStepSummary(step.heading);
  if (headingText !== "") {
    return headingText;
  }
  const labelText = step?.label?.trim() ?? "";
  return labelText === "" ? fallbackLabel : labelText;
}

function inspectManualStepSelection({
  completedStepIds,
  currentLevelNumber,
  pageSlug,
  syllabus,
}: InspectManualStepSelectionInput): ManualStepSelectionInspection {
  const behaviors = collectLevelBehaviors(syllabus);
  const selectedBehavior = behaviors.find((behavior) => behavior.pageSlug === pageSlug);
  const selectedLevelNumber = selectedBehavior === undefined ? null : selectedBehavior.levelNumber;
  const prerequisiteSlugs = new Set(getPrerequisiteChain(pageSlug));
  const unmetPrerequisites = behaviors
    .filter(
      (behavior) =>
        prerequisiteSlugs.has(behavior.pageSlug) &&
        behavior.stepIds.some((stepId) => !completedStepIds.has(stepId)),
    )
    .map((behavior) => ({ pageSlug: behavior.pageSlug, title: behavior.title }));
  const isLaterLevel = selectedLevelNumber !== null && selectedLevelNumber > currentLevelNumber;
  return {
    hasWarning: unmetPrerequisites.length > 0 || isLaterLevel,
    isLaterLevel,
    selectedLevelNumber,
    unmetPrerequisites,
  };
}

export {
  getTrainingFallbackGuidance,
  inspectManualStepSelection,
  type InspectManualStepSelectionInput,
  type ManualStepSelectionInspection,
  type UnmetPrerequisite,
};
