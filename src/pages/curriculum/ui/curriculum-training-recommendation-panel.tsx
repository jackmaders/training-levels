import { Link } from "@tanstack/react-router";

import { toLevelRouteParams } from "../model/curriculum-levels";
import type {
  ManualStepSelectionInspection,
  PracticeFallbackMode,
  TrainingRecommendation,
  TrainingRecommendationMode,
  UnmetPrerequisite,
  WaitingTestNotice,
} from "../model/training-recommendation";

interface CurriculumTrainingRecommendationPanelProps {
  activeStepLabel: string;
  excludedCount: number;
  fallbackSummary: string;
  inspection: ManualStepSelectionInspection | null;
  isManualOverride: boolean;
  laterLevelOverrideConfirmed: boolean;
  onChangeMode: (mode?: TrainingRecommendationMode) => void;
  onLaterLevelOverrideChange: (confirmed: boolean) => void;
  onOpenWaitingTest: (stepId: string) => void;
  onResetExclusions: () => void;
  onSuggestAnother: () => void;
  preferredMode: TrainingRecommendationMode | undefined;
  recommendation: TrainingRecommendation;
}

function ModePreferenceControls({
  onChangeMode,
  preferredMode,
}: {
  onChangeMode: (mode?: TrainingRecommendationMode) => void;
  preferredMode: TrainingRecommendationMode | undefined;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <span className="font-medium">Mode preference:</span>
      <button
        aria-pressed={preferredMode === "practice"}
        className="min-h-10 rounded-md border px-3 py-1.5"
        type="button"
        onClick={() => {
          if (preferredMode === "practice") {
            onChangeMode();
            return;
          }
          onChangeMode("practice");
        }}
      >
        Practice
      </button>
      <button
        aria-pressed={preferredMode === "test"}
        className="min-h-10 rounded-md border px-3 py-1.5"
        type="button"
        onClick={() => {
          if (preferredMode === "test") {
            onChangeMode();
            return;
          }
          onChangeMode("test");
        }}
      >
        Cold Test
      </button>
    </div>
  );
}

function WaitingTestCallout({
  notice,
  onOpenWaitingTest,
}: {
  notice: WaitingTestNotice | null;
  onOpenWaitingTest: (stepId: string) => void;
}) {
  if (notice === null) {
    return null;
  }
  return (
    <div className="space-y-2 rounded-md border bg-background p-3 text-sm">
      <p className="font-medium">
        Cold Test waiting: {notice.behaviorTitle} · {notice.stepLabel}
      </p>
      <p className="text-muted-foreground">{notice.reason}</p>
      <button
        className="min-h-10 rounded-md border px-3 py-1.5"
        type="button"
        onClick={() => {
          onOpenWaitingTest(notice.stepId);
        }}
      >
        Open waiting Test
      </button>
    </div>
  );
}

function FallbackSummaryCallout({
  currentLevelNumber,
  fallbackMode,
  fallbackSummary,
}: {
  currentLevelNumber: number;
  fallbackMode: PracticeFallbackMode;
  fallbackSummary: string;
}) {
  if (fallbackMode === "none") {
    return null;
  }
  const message =
    fallbackMode === "all_complete"
      ? `All Main Quest levels are complete. Maintenance focus: ${fallbackSummary}.`
      : `All remaining steps in Level ${String(currentLevelNumber)} have unmet Comebefores. Fallback step: ${fallbackSummary}.`;
  return (
    <p className="rounded-md border bg-background p-3 text-sm text-muted-foreground">{message}</p>
  );
}

function PrerequisiteLink({ prerequisite }: { prerequisite: UnmetPrerequisite }) {
  const params = toLevelRouteParams(prerequisite.pageSlug);
  if (params === null) {
    return <span>{prerequisite.title}</span>;
  }
  return (
    <Link
      className="font-medium underline underline-offset-4"
      params={params}
      to="/levels/$section/$page"
    >
      {prerequisite.title}
    </Link>
  );
}

function ManualSelectionWarnings({
  currentLevelNumber,
  inspection,
  laterLevelOverrideConfirmed,
  onLaterLevelOverrideChange,
}: {
  currentLevelNumber: number;
  inspection: ManualStepSelectionInspection | null;
  laterLevelOverrideConfirmed: boolean;
  onLaterLevelOverrideChange: (confirmed: boolean) => void;
}) {
  if (inspection === null) {
    return null;
  }
  return (
    <>
      {inspection.unmetPrerequisites.length > 0 ? (
        <div className="space-y-2 rounded-md border border-amber-500/50 bg-amber-500/10 p-3 text-sm">
          <p className="font-medium">Unmet Comebefores</p>
          <ul className="list-disc space-y-1 pl-5">
            {inspection.unmetPrerequisites.map((prerequisite) => (
              <li key={prerequisite.pageSlug}>
                <PrerequisiteLink prerequisite={prerequisite} />
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {inspection.selectedLevelNumber !== null && inspection.isLaterLevel ? (
        <label className="flex items-start gap-2 rounded-md border p-3 text-sm">
          <input
            checked={laterLevelOverrideConfirmed}
            type="checkbox"
            onChange={(event) => {
              onLaterLevelOverrideChange(event.currentTarget.checked);
            }}
          />
          <span>
            {`Train this Level ${String(inspection.selectedLevelNumber)} Behavior for this Training only (keeps Level ${String(currentLevelNumber)} as your current Level goal)`}
          </span>
        </label>
      ) : null}
    </>
  );
}

function RecommendationSummary({
  activeStepLabel,
  isManualOverride,
  recommendation,
}: {
  activeStepLabel: string;
  isManualOverride: boolean;
  recommendation: TrainingRecommendation;
}) {
  const recommendedAction = recommendation.mode === "test" ? "Cold Test" : "Practice";

  return (
    <div className="space-y-1">
      <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        {`Current goal: Level ${String(recommendation.currentLevelNumber)}`}
      </p>
      <p className="text-base font-semibold">
        {`Recommended next: ${recommendedAction} · ${recommendation.behaviorTitle} — ${recommendation.stepLabel}`}
      </p>
      <p className="text-sm text-muted-foreground">{recommendation.reason}</p>
      {isManualOverride ? (
        <p className="text-sm font-medium">{`Manual selection: ${activeStepLabel}`}</p>
      ) : null}
    </div>
  );
}

function ChooseSomethingElseControls({
  excludedCount,
  onResetExclusions,
  onSuggestAnother,
}: {
  excludedCount: number;
  onResetExclusions: () => void;
  onSuggestAnother: () => void;
}) {
  return (
    <div className="space-y-2 border-t pt-3">
      <p className="text-sm font-semibold">Choose something else</p>
      <div className="flex flex-wrap gap-2">
        <button
          className="min-h-10 rounded-md border px-3 py-1.5 text-sm"
          type="button"
          onClick={onSuggestAnother}
        >
          Suggest another activity
        </button>
        {excludedCount > 0 ? (
          <button
            className="min-h-10 rounded-md border px-3 py-1.5 text-sm"
            type="button"
            onClick={onResetExclusions}
          >
            Reset suggestions
          </button>
        ) : null}
      </div>
    </div>
  );
}

function CurriculumTrainingRecommendationPanel(props: CurriculumTrainingRecommendationPanelProps) {
  const { recommendation } = props;
  return (
    <section
      aria-label="Recommended next activity"
      className="space-y-4 rounded-md border bg-muted/30 p-4"
    >
      <RecommendationSummary
        activeStepLabel={props.activeStepLabel}
        isManualOverride={props.isManualOverride}
        recommendation={recommendation}
      />
      <ModePreferenceControls
        preferredMode={props.preferredMode}
        onChangeMode={props.onChangeMode}
      />
      <WaitingTestCallout
        notice={recommendation.waitingTestNotice}
        onOpenWaitingTest={props.onOpenWaitingTest}
      />
      <FallbackSummaryCallout
        currentLevelNumber={recommendation.currentLevelNumber}
        fallbackMode={recommendation.fallbackMode}
        fallbackSummary={props.fallbackSummary}
      />
      <ChooseSomethingElseControls
        excludedCount={props.excludedCount}
        onResetExclusions={props.onResetExclusions}
        onSuggestAnother={props.onSuggestAnother}
      />
      <ManualSelectionWarnings
        currentLevelNumber={recommendation.currentLevelNumber}
        inspection={props.inspection}
        laterLevelOverrideConfirmed={props.laterLevelOverrideConfirmed}
        onLaterLevelOverrideChange={props.onLaterLevelOverrideChange}
      />
    </section>
  );
}

export { CurriculumTrainingRecommendationPanel };
