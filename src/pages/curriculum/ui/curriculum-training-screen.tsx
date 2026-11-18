import type { BehaviorCurriculumPage, BehaviorStep } from "@/shared/curriculum-data";

import type { PracticeProgression } from "../model/practice-progression";
import {
  TrainingPractice,
  type PracticeActions,
  type PracticeRecord,
} from "./curriculum-training-practice-view";
import {
  TrainingTest,
  type StepTestActions,
  type StepTestRecord,
} from "./curriculum-training-test-views";
import type { PracticeTotalRecord } from "./curriculum-training-totals";
import { TrainingHeading, TrainingPrep } from "./curriculum-training-views";

interface CurriculumTrainingScreenProps {
  coldOverride: boolean;
  decision: "keep_practicing" | "recommend_test" | null;
  equipment: BehaviorCurriculumPage["equipment"];
  history: readonly PracticeRecord[];
  onStartPractice: () => void;
  onStartTest: (coldOverride: boolean) => void;
  progression: PracticeProgression;
  step: BehaviorStep;
  testActions: StepTestActions;
  testHistory: readonly StepTestRecord[];
  totals: readonly PracticeTotalRecord[];
  view: "prep" | "practice" | "test";
  practiceActions: PracticeActions;
}

function CurriculumTrainingScreen({
  coldOverride,
  decision,
  equipment,
  history,
  onStartPractice,
  onStartTest,
  practiceActions,
  progression,
  step,
  testActions,
  testHistory,
  totals,
  view,
}: CurriculumTrainingScreenProps) {
  return (
    <main className="mx-auto max-w-3xl space-y-8 px-4 pt-8 pb-36 sm:px-6">
      <TrainingHeading mode={view === "test" ? "Test" : "Practice"} />
      <TrainingStep
        {...{
          coldOverride,
          decision,
          equipment,
          history,
          onStartPractice,
          onStartTest,
          practiceActions,
          progression,
          step,
          testActions,
          testHistory,
          totals,
          view,
        }}
      />
    </main>
  );
}

function TrainingStep(props: CurriculumTrainingScreenProps) {
  const {
    coldOverride,
    decision,
    equipment,
    history,
    onStartPractice,
    onStartTest,
    practiceActions,
    progression,
    step,
    testActions,
    testHistory,
    totals,
    view,
  } = props;
  if (view === "prep") {
    return (
      <TrainingPrep
        decision={decision}
        equipment={equipment}
        history={history}
        onStart={onStartPractice}
        onStartTest={onStartTest}
        step={step}
        testHistory={testHistory}
        totals={totals}
      />
    );
  }
  if (view === "practice") {
    return (
      <TrainingPractice
        actions={practiceActions}
        decision={decision}
        history={history}
        progression={progression}
        totals={totals}
      />
    );
  }
  return (
    <TrainingTest
      actions={testActions}
      coldOverride={coldOverride}
      history={testHistory}
      step={step}
    />
  );
}

export { CurriculumTrainingScreen };
