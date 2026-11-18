import type { ReactNode } from "react";

import type { BehaviorCurriculumPage, BehaviorStep } from "@/shared/curriculum-data";

import { CurriculumContentBlocks } from "./curriculum-content-blocks";
import {
  PracticeCounts,
  STEP_TARGET,
  type PracticeDecision,
  type PracticeRecord,
} from "./curriculum-training-practice-view";
import { CurriculumTrainingTestOffer, type StepTestRecord } from "./curriculum-training-test-views";
import type { PracticeTotalRecord } from "./curriculum-training-totals";

const LAST_TEST_OFFSET = 1;

function TrainingHeading({ mode }: { mode: "Practice" | "Test" }) {
  return (
    <header className="space-y-2">
      <p className="text-sm text-muted-foreground">{mode} · Level 1: Zen · Step 1</p>
      <h1 className="text-3xl font-bold tracking-tight">{mode} hand Zen</h1>
    </header>
  );
}

function TrainingPrep({
  decision,
  equipment,
  history,
  onStart,
  onStartTest,
  step,
  testHistory,
  totals,
}: {
  equipment: BehaviorCurriculumPage["equipment"];
  decision: PracticeDecision | null;
  history: readonly PracticeRecord[];
  onStart: () => void;
  onStartTest: (coldOverride: boolean) => void;
  step: BehaviorStep;
  testHistory: readonly StepTestRecord[];
  totals: readonly PracticeTotalRecord[];
}) {
  const currentHistory = history.filter((attempt) => attempt.undoneAt === null);
  const practiceDates = [
    ...currentHistory.map((attempt) => attempt.createdAt),
    ...totals.map((record) => record.createdAt),
  ];

  return (
    <section aria-labelledby="prep-heading" className="space-y-5 rounded-lg border p-5">
      <h2 className="text-xl font-semibold" id="prep-heading">
        Prep
      </h2>
      <PracticePrepDetails equipment={equipment} />
      <TrainingPrepStatus decision={decision} history={currentHistory} testHistory={testHistory} />
      <button
        className="rounded-md bg-primary px-4 py-2 text-primary-foreground"
        type="button"
        onClick={onStart}
      >
        {currentHistory.length === 0 ? "Start Practice" : "Resume Practice"}
      </button>
      <CurriculumTrainingTestOffer
        decision={decision}
        onStartTest={onStartTest}
        practiceDates={practiceDates}
        step={step}
        testHistory={testHistory}
      />
    </section>
  );
}

function PracticePrepDetails({ equipment }: { equipment: BehaviorCurriculumPage["equipment"] }) {
  return (
    <>
      <PrepDetail heading="Equipment">
        <CurriculumContentBlocks blocks={equipment} />
      </PrepDetail>
      <PrepDetail heading="Setup">
        <p>
          Sit in a chair with a treat protected in your closed hand. Keep your hand still near your
          Dog.
        </p>
      </PrepDetail>
      <PrepDetail heading="Practice target">
        <p>{STEP_TARGET}</p>
      </PrepDetail>
      <PrepDetail heading="Observable success">
        <p>
          Your Dog moves her nose or body away from the treat hand. Mark and reward, then record it.
        </p>
      </PrepDetail>
    </>
  );
}

function TrainingPrepStatus({
  decision,
  history,
  testHistory,
}: {
  decision: PracticeDecision | null;
  history: readonly PracticeRecord[];
  testHistory: readonly StepTestRecord[];
}) {
  const lastTest = testHistory.at(-LAST_TEST_OFFSET);
  return (
    <>
      <PracticeCounts history={history} />
      <SavedDecisionNotice decision={decision} />
      {lastTest === undefined ? null : (
        <p aria-live="polite" className="rounded-md border p-3 text-sm">
          Latest Test:{" "}
          {lastTest.outcome === "success" ? "Passed — Step complete" : "Not yet — Needs practice"}.
        </p>
      )}
    </>
  );
}

function SavedDecisionNotice({ decision }: { decision: PracticeDecision | null }) {
  if (decision !== "recommend_test") {
    return null;
  }

  return (
    <output className="rounded-md border p-3 text-sm">
      You chose to recommend a Test next time for this Step.
    </output>
  );
}

function PrepDetail({ children, heading }: { children: ReactNode; heading: string }) {
  const headingId = `${heading.toLowerCase().replaceAll(" ", "-")}-heading`;
  return (
    <section aria-labelledby={headingId} className="space-y-2">
      <h3 className="font-medium" id={headingId}>
        {heading}
      </h3>
      {children}
    </section>
  );
}

export { TrainingHeading, TrainingPrep };
