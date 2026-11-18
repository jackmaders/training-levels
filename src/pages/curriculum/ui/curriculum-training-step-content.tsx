import { useState, type ReactElement } from "react";

import type { CurriculumSyllabus } from "@/shared/curriculum-data";

import { deriveStepPracticeState, type PracticeStepOption } from "../model/step-practice-state";
import type {
  TrainingRecommendation,
  TrainingRecommendationMode,
} from "../model/training-recommendation";
import { TrainingReadingGate } from "./curriculum-training-reading";
import { TrainingStepPrepView } from "./curriculum-training-step-prep";
import { CurriculumTrainingTestGate } from "./curriculum-training-step-test";
import { TrainingBreak, TrainingHeading, TrainingPractice } from "./curriculum-training-views";
import { usePracticeActions } from "./use-practice-actions";
import { useStepQueries } from "./use-step-queries";

type TrainingView = "prep" | "practice" | "break" | "test" | "test-override";

interface TrainingStepContentProps {
  activeStep: PracticeStepOption;
  completedStepIds: ReadonlySet<string>;
  excludedCount: number;
  isManualOverride: boolean;
  onChangeMode: (mode?: TrainingRecommendationMode) => void;
  onExcludeStep: (stepId: string) => void;
  onLockStep: (stepId: string) => void;
  onResetExclusions: () => void;
  onSelectionChange: (stepId?: string, target?: string) => void;
  preferredMode: TrainingRecommendationMode | undefined;
  recommendation: TrainingRecommendation;
  selectedTarget: string | undefined;
  syllabus: CurriculumSyllabus;
}

interface ActiveStepBodyProps {
  actions: ReturnType<typeof usePracticeActions>;
  derived: ReturnType<typeof deriveStepPracticeState>;
  openReading: (kind: "explanation" | "faq", interruptedTimedHold?: boolean) => void;
  props: TrainingStepContentProps;
  queries: Omit<ReturnType<typeof useStepQueries>, "behaviorPage"> & {
    behaviorPage: NonNullable<ReturnType<typeof useStepQueries>["behaviorPage"]>;
  };
  setView: (view: TrainingView) => void;
  timerInterrupted: boolean;
  view: TrainingView;
}

function isTestView(view: TrainingView): view is "test" | "test-override" {
  return view === "test" || view === "test-override";
}

function getHeadingMode(view: TrainingView): "Practice" | "Test" {
  return isTestView(view) ? "Test" : "Practice";
}

function PracticeViewBody({
  actions,
  derived,
  openReading,
  props,
  queries,
  setView,
  timerInterrupted,
}: ActiveStepBodyProps): ReactElement {
  return (
    <TrainingPractice
      actions={{
        ...actions,
        record: (outcome, currentTarget) => {
          props.onSelectionChange(props.activeStep.stepId);
          actions.record(outcome, currentTarget);
        },
      }}
      decision={queries.decision}
      finishStep={props.activeStep}
      guidance={derived.guidance}
      history={queries.history}
      plan={derived.plan}
      progression={derived.progression}
      target={derived.target}
      timerInterrupted={timerInterrupted}
      totals={queries.totals}
      onBreak={() => {
        setView("break");
      }}
      onChangeTarget={(nextTarget) => {
        props.onSelectionChange(props.activeStep.stepId, nextTarget);
      }}
      onOpenReading={openReading}
    />
  );
}

function ActiveStepBody(bodyProps: ActiveStepBodyProps): ReactElement {
  const { derived, openReading, props, queries, setView, view } = bodyProps;
  if (view === "practice") {
    return <PracticeViewBody {...bodyProps} />;
  }
  if (view !== "prep") {
    return (
      <TrainingBreak
        finishStep={props.activeStep}
        onContinue={() => {
          setView("practice");
        }}
      />
    );
  }
  return (
    <TrainingStepPrepView
      {...props}
      curriculumPage={queries.behaviorPage}
      decision={queries.decision}
      fallbackSummary={derived.fallbackSummary}
      guidance={derived.guidance}
      history={queries.history}
      plan={derived.plan}
      target={derived.target}
      totals={queries.totals}
      onOpenReading={openReading}
      onStartPractice={() => {
        props.onLockStep(props.activeStep.stepId);
        setView("practice");
      }}
      onStartTest={(coldOverride) => {
        props.onLockStep(props.activeStep.stepId);
        setView(coldOverride ? "test-override" : "test");
      }}
    />
  );
}

function TrainingStepContent(props: TrainingStepContentProps) {
  const { activeStep } = props;
  const [view, setView] = useState<TrainingView>("prep");
  const { behaviorPage, ...queries } = useStepQueries(activeStep);
  const derived = deriveStepPracticeState({
    activeStep,
    curriculumPage: behaviorPage,
    history: queries.history,
    selectedTarget: props.selectedTarget,
  });
  const actions = usePracticeActions(activeStep.stepId, derived.target);
  if (behaviorPage === null) {
    return <main className="mx-auto max-w-3xl p-6">Training instructions are unavailable.</main>;
  }

  return (
    <main className="mx-auto max-w-3xl space-y-8 px-4 pt-8 pb-36 sm:px-6">
      <TrainingHeading mode={getHeadingMode(view)} stepLabel={activeStep.label} />
      <TrainingReadingGate
        page={behaviorPage}
        progressionSource={derived.plan?.source ?? null}
        returnLabel={view === "practice" ? "Back to Practice" : "Back to Prep"}
        stepId={activeStep.stepId}
      >
        {({ openReading, timerInterrupted }) => (
          <CurriculumTrainingTestGate
            active={isTestView(view)}
            coldOverride={view === "test-override"}
            stepId={activeStep.stepId}
          >
            <ActiveStepBody
              actions={actions}
              derived={derived}
              openReading={openReading}
              props={props}
              queries={{ ...queries, behaviorPage }}
              setView={setView}
              timerInterrupted={timerInterrupted}
              view={view}
            />
          </CurriculumTrainingTestGate>
        )}
      </TrainingReadingGate>
    </main>
  );
}

export { TrainingStepContent };
