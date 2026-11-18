import { Link } from "@tanstack/react-router";

import { isValidMainQuestStepId } from "@/shared/curriculum-data";
import { Badge } from "@/shared/ui/shadcn/badge";

import {
  toTrainingLaunchSearch,
  type CurriculumBehaviorStateKind,
  type CurriculumBehaviorTrainingState,
  type CurriculumStepTrainingState,
  type CurriculumTrainingLaunchAction,
} from "../model/curriculum-training-state";
import { isStepTestable } from "../model/training-recommendation";

const TRAINING_STATE_BADGE_VARIANTS: Record<
  CurriculumBehaviorStateKind,
  "default" | "secondary" | "destructive" | "outline"
> = {
  cold_test_waiting: "secondary",
  in_practice: "secondary",
  needs_practice: "destructive",
  previously_recorded: "secondary",
  test_passed: "default",
  test_ready: "default",
  unfinished: "outline",
};

function TrainingStateBadge({
  label,
  stateKind,
}: {
  label: string;
  stateKind: CurriculumBehaviorStateKind;
}) {
  return <Badge variant={TRAINING_STATE_BADGE_VARIANTS[stateKind]}>{label}</Badge>;
}

function BehaviorRecommendationBadges({
  behaviorState,
}: {
  behaviorState: CurriculumBehaviorTrainingState;
}) {
  return (
    <>
      <TrainingStateBadge label={behaviorState.stateLabel} stateKind={behaviorState.stateKind} />
      {behaviorState.isRecommendedNext ? <Badge variant="default">Recommended next</Badge> : null}
      {!behaviorState.isRecommendedNext && behaviorState.isEligibleNextOption ? (
        <Badge variant="outline">Eligible next option</Badge>
      ) : null}
    </>
  );
}

function BehaviorLaunchLinks({
  primaryLaunch,
  secondaryTestLaunch,
}: {
  primaryLaunch: CurriculumTrainingLaunchAction | null;
  secondaryTestLaunch: CurriculumTrainingLaunchAction | null;
}) {
  if (primaryLaunch === null && secondaryTestLaunch === null) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {primaryLaunch === null ? null : (
        <Link
          className="inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          search={toTrainingLaunchSearch(primaryLaunch.stepId, primaryLaunch.mode)}
          to="/training"
        >
          {primaryLaunch.label}
        </Link>
      )}
      {secondaryTestLaunch === null ? null : (
        <Link
          className="inline-flex rounded-md border bg-background px-4 py-2 text-sm font-medium hover:bg-muted"
          search={{ mode: secondaryTestLaunch.mode, stepId: secondaryTestLaunch.stepId }}
          to="/training"
        >
          {secondaryTestLaunch.label}
        </Link>
      )}
    </div>
  );
}

function BehaviorSelectionNotices({
  behaviorState,
  currentLevelNumber,
}: {
  behaviorState: CurriculumBehaviorTrainingState;
  currentLevelNumber: number;
}) {
  const { hasHistoricalCompletion, inspection, stateKind } = behaviorState;
  const unmetTitles = inspection.unmetPrerequisites.map((item) => item.title).join(", ");
  const hasRetainedNotice = stateKind === "needs_practice" && hasHistoricalCompletion;
  const hasUnmetNotice = inspection.unmetPrerequisites.length > 0;

  if (!hasRetainedNotice && !hasUnmetNotice && !inspection.isLaterLevel) {
    return null;
  }

  return (
    <div className="space-y-1 text-sm text-muted-foreground">
      {hasRetainedNotice ? (
        <p>Downstream achievements intact: completed Steps still satisfy Comebefores.</p>
      ) : null}
      {hasUnmetNotice ? (
        <p>
          {`Unmet Comebefores: ${unmetTitles}. Launching opens Prep with a manual override option.`}
        </p>
      ) : null}
      {inspection.isLaterLevel ? (
        <p>
          {`Later-Level selection (Current goal: Level ${String(currentLevelNumber)}). Launching into Prep does not change your Level goal.`}
        </p>
      ) : null}
    </div>
  );
}

function CurriculumBehaviorTrainingSummary({
  behaviorState,
  currentLevelNumber,
}: {
  behaviorState: CurriculumBehaviorTrainingState | undefined;
  currentLevelNumber: number;
}) {
  if (behaviorState === undefined) {
    return null;
  }

  return (
    <div className="space-y-3 rounded-lg border bg-card px-4 py-3">
      <div className="flex flex-wrap items-center gap-2">
        <BehaviorRecommendationBadges behaviorState={behaviorState} />
      </div>
      <BehaviorSelectionNotices
        behaviorState={behaviorState}
        currentLevelNumber={currentLevelNumber}
      />
      <BehaviorLaunchLinks
        primaryLaunch={behaviorState.primaryLaunch}
        secondaryTestLaunch={behaviorState.secondaryTestLaunch}
      />
    </div>
  );
}

function StepActiveTrainingBadge({
  stepState,
}: {
  stepState: CurriculumStepTrainingState | undefined;
}) {
  if (stepState === undefined || stepState.stateKind === "unfinished") {
    return null;
  }

  return <TrainingStateBadge label={stepState.stateLabel} stateKind={stepState.stateKind} />;
}

function StepTrainingLinks({
  stepId,
  stepNumber,
  stepState,
}: {
  stepId: string;
  stepNumber: number;
  stepState?: CurriculumStepTrainingState | undefined;
}) {
  if (!isValidMainQuestStepId(stepId)) {
    return null;
  }

  const canTest = stepState?.canTest ?? isStepTestable(stepId);

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <Link
        aria-label={`Open Step ${String(stepNumber)} in Practice`}
        className="inline-flex rounded-md border bg-background px-3 py-1 font-medium hover:bg-muted"
        search={{ mode: "practice", stepId }}
        to="/training"
      >
        Practice
      </Link>
      {canTest ? (
        <Link
          aria-label={`Open Step ${String(stepNumber)} in Test`}
          className="inline-flex rounded-md border bg-background px-3 py-1 font-medium hover:bg-muted"
          search={{ mode: "test", stepId }}
          to="/training"
        >
          Test
        </Link>
      ) : null}
    </div>
  );
}

export {
  CurriculumBehaviorTrainingSummary,
  StepActiveTrainingBadge,
  StepTrainingLinks,
  TrainingStateBadge,
};
