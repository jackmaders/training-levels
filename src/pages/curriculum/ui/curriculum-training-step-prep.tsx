import { useState } from "react";

import type { BehaviorCurriculumPage, CurriculumSyllabus } from "@/shared/curriculum-data";

import type { PracticeGuidance } from "../model/practice-guidance";
import { PRACTICE_STEP_OPTIONS, type PracticePlan } from "../model/practice-ladders";
import {
  resolveStepSelectionInspection,
  type PracticeStepOption,
} from "../model/step-practice-state";
import type {
  TrainingRecommendation,
  TrainingRecommendationMode,
} from "../model/training-recommendation";
import { TrainingReadingLinks, type TrainingReadingKind } from "./curriculum-training-reading";
import { CurriculumTrainingRecommendationPanel } from "./curriculum-training-recommendation-panel";
import { CurriculumTrainingStepTestOffer } from "./curriculum-training-step-test";
import {
  TrainingPrep,
  type PracticeDecision,
  type PracticeRecord,
} from "./curriculum-training-views";

interface TrainingStepPrepViewProps {
  activeStep: PracticeStepOption;
  completedStepIds: ReadonlySet<string>;
  curriculumPage: BehaviorCurriculumPage;
  decision: PracticeDecision | null;
  excludedCount: number;
  fallbackSummary: string;
  guidance: PracticeGuidance | null;
  history: readonly PracticeRecord[];
  isManualOverride: boolean;
  onChangeMode: (mode?: TrainingRecommendationMode) => void;
  onExcludeStep: (stepId: string) => void;
  onOpenReading: (kind: TrainingReadingKind) => void;
  onResetExclusions: () => void;
  onSelectionChange: (stepId?: string, target?: string) => void;
  onStartPractice: () => void;
  onStartTest: (coldOverride: boolean) => void;
  plan: PracticePlan | null;
  preferredMode: TrainingRecommendationMode | undefined;
  recommendation: TrainingRecommendation;
  syllabus: CurriculumSyllabus;
  target: string;
  totals: readonly { createdAt: Date }[];
}

function StepRecommendationCard({
  laterLevelOverrideConfirmed,
  onLaterLevelOverrideChange,
  ...props
}: TrainingStepPrepViewProps & {
  laterLevelOverrideConfirmed: boolean;
  onLaterLevelOverrideChange: (confirmed: boolean) => void;
}) {
  const inspection = resolveStepSelectionInspection(props);
  return (
    <CurriculumTrainingRecommendationPanel
      activeStepLabel={props.activeStep.label}
      excludedCount={props.excludedCount}
      fallbackSummary={props.fallbackSummary}
      inspection={inspection}
      isManualOverride={props.isManualOverride}
      laterLevelOverrideConfirmed={laterLevelOverrideConfirmed}
      preferredMode={props.preferredMode}
      recommendation={props.recommendation}
      onChangeMode={(nextMode) => {
        onLaterLevelOverrideChange(false);
        if (nextMode === undefined) {
          props.onChangeMode();
          return;
        }
        props.onChangeMode(nextMode);
      }}
      onLaterLevelOverrideChange={onLaterLevelOverrideChange}
      onOpenWaitingTest={(stepId) => {
        onLaterLevelOverrideChange(false);
        props.onSelectionChange(stepId);
      }}
      onResetExclusions={() => {
        onLaterLevelOverrideChange(false);
        props.onResetExclusions();
        props.onSelectionChange();
      }}
      onSuggestAnother={() => {
        onLaterLevelOverrideChange(false);
        props.onExcludeStep(props.activeStep.stepId);
        props.onSelectionChange();
      }}
    />
  );
}

function TrainingStepPrepView(props: TrainingStepPrepViewProps) {
  const [laterLevelOverrideConfirmed, setLaterLevelOverrideConfirmed] = useState(false);
  const inspection = resolveStepSelectionInspection(props);
  const laterLevelBlocked =
    inspection !== null && inspection.isLaterLevel && !laterLevelOverrideConfirmed;

  return (
    <>
      <TrainingReadingLinks onOpen={props.onOpenReading} />
      <TrainingPrep
        decision={props.decision}
        equipment={props.curriculumPage.equipment}
        guidance={props.guidance}
        history={props.history}
        plan={props.plan}
        recommendationPanel={
          <StepRecommendationCard
            {...props}
            laterLevelOverrideConfirmed={laterLevelOverrideConfirmed}
            onLaterLevelOverrideChange={setLaterLevelOverrideConfirmed}
          />
        }
        selectedStepId={props.activeStep.stepId}
        startDisabled={laterLevelBlocked}
        stepOptions={PRACTICE_STEP_OPTIONS}
        target={props.target}
        testOffer={
          <CurriculumTrainingStepTestOffer
            blockedByOverride={laterLevelBlocked}
            decision={props.decision}
            history={props.history}
            recommendedMode={
              props.recommendation.stepId === props.activeStep.stepId
                ? props.recommendation.mode
                : undefined
            }
            stepId={props.activeStep.stepId}
            totals={props.totals}
            onStartTest={props.onStartTest}
          />
        }
        onSelectStep={(stepId) => {
          setLaterLevelOverrideConfirmed(false);
          props.onSelectionChange(stepId);
        }}
        onStart={props.onStartPractice}
      />
    </>
  );
}

export { TrainingStepPrepView };
