import { Link } from "@tanstack/react-router";
import { useState, useSyncExternalStore } from "react";

import type { BehaviorStep } from "@/shared/curriculum-data";

import { canTestToday } from "../model/test-eligibility";
import { CurriculumContentBlocks } from "./curriculum-content-blocks";

const LAST_ITEM_OFFSET = 1;

function subscribeToClock() {
  return () => {
    // Wall-clock day check is evaluated on hydration; no live clock subscription.
  };
}

function getServerTestEligibility() {
  return false;
}

type Outcome = "success" | "not_yet";
type PracticeDecision = "keep_practicing" | "recommend_test";
interface StepTestRecord {
  coldOverride: boolean;
  outcome: Outcome;
  stepId: string;
  testId: string;
  testedAt: Date;
}
interface StepTestActions {
  errorMessage: string | null;
  record: (outcome: Outcome, coldOverride: boolean) => void;
  saving: boolean;
}
interface CurriculumTrainingTestOfferProps {
  decision: PracticeDecision | null;
  onStartTest: (coldOverride: boolean) => void;
  practiceDates: readonly Date[];
  step: BehaviorStep;
  testHistory: readonly StepTestRecord[];
}

function CurriculumTrainingTestOffer({
  decision,
  onStartTest,
  practiceDates,
  step,
  testHistory,
}: CurriculumTrainingTestOfferProps) {
  const [coldOverride, setColdOverride] = useState(false);
  // Defer wall-clock eligibility until post-hydration snapshot so SSR and client hydration match.
  const eligibleByDay = useSyncExternalStore(
    subscribeToClock,
    () => canTestToday([...practiceDates, ...testHistory.map((test) => test.testedAt)]),
    getServerTestEligibility,
  );
  const testRecommended = decision === "recommend_test" || testHistory.length > 0;
  if (!testRecommended) {
    return null;
  }

  return (
    <div className="space-y-3 rounded-md border p-4">
      <h3 className="font-medium">Test this Step cold</h3>
      <LatestTestStatus latestTest={testHistory.at(-LAST_ITEM_OFFSET)} />
      <ColdnessGuidance
        checked={coldOverride}
        eligibleByDay={eligibleByDay}
        onChange={setColdOverride}
      />
      <button
        className="min-h-11 rounded-md border px-3"
        disabled={!eligibleByDay && !coldOverride}
        type="button"
        onClick={() => {
          onStartTest(!eligibleByDay && coldOverride);
        }}
      >
        Start Test
      </button>
      {step.tryItCold === null || step.tryItCold.length === 0 ? (
        <p className="text-sm text-destructive">Cold Test instructions are unavailable.</p>
      ) : null}
      <TestHistory history={testHistory} />
    </div>
  );
}

function LatestTestStatus({ latestTest }: { latestTest: StepTestRecord | undefined }) {
  if (latestTest === undefined) {
    return null;
  }

  return (
    <p aria-live="polite" className="rounded-md border p-3 text-sm">
      Latest Test:{" "}
      {latestTest.outcome === "success" ? "Passed — Step complete" : "Not yet — Needs practice"}.
    </p>
  );
}

function ColdnessGuidance({
  checked,
  eligibleByDay,
  onChange,
}: {
  checked: boolean;
  eligibleByDay: boolean;
  onChange: (checked: boolean) => void;
}) {
  if (eligibleByDay) {
    return (
      <p className="text-sm text-muted-foreground">
        The last recorded Practice or Test was on another day. Start without warming up this
        Behavior.
      </p>
    );
  }

  return (
    <>
      <p className="text-sm text-muted-foreground">
        You recorded Practice or a Test today. Wait until another day, or confirm that you can test
        the Behavior cold now.
      </p>
      <ColdnessConfirmation checked={checked} onChange={onChange} />
    </>
  );
}

function ColdnessConfirmation({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-2 text-sm">
      <input
        checked={checked}
        type="checkbox"
        onChange={(event) => {
          onChange(event.currentTarget.checked);
        }}
      />
      <span>I confirm I can test this Behavior cold without warming it up now.</span>
    </label>
  );
}

function TrainingTest({
  actions,
  coldOverride,
  history,
  step,
}: {
  actions: StepTestActions;
  coldOverride: boolean;
  history: readonly StepTestRecord[];
  step: BehaviorStep;
}) {
  const latestTest = history.at(-LAST_ITEM_OFFSET);
  return (
    <section aria-labelledby="test-heading" className="space-y-5">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold" id="test-heading">
          Test the full Step criterion cold
        </h2>
        <p>Follow the source instructions without practicing this Behavior first.</p>
        <CurriculumContentBlocks blocks={step.tryItCold ?? []} />
        {coldOverride ? (
          <p className="text-sm text-muted-foreground">You confirmed this Test is cold today.</p>
        ) : null}
      </div>
      <TestResult latestTest={latestTest} />
      <TestError message={actions.errorMessage} />
      <TestOutcomes actions={actions} coldOverride={coldOverride} />
      <FinishTestLink />
    </section>
  );
}

function TestResult({ latestTest }: { latestTest: StepTestRecord | undefined }) {
  if (latestTest === undefined) {
    return null;
  }

  return (
    <div className="space-y-2">
      <TestHistory history={[latestTest]} />
      <p aria-live="polite" className="rounded-md border p-3">
        {latestTest.outcome === "success"
          ? "Test passed. This Step is complete."
          : "Not yet. Needs practice; Practice is recommended."}
      </p>
    </div>
  );
}

function TestError({ message }: { message: string | null }) {
  return message === null ? null : (
    <p aria-live="assertive" className="text-sm text-destructive">
      Could not save this Test. {message}
    </p>
  );
}

function TestOutcomes({
  actions,
  coldOverride,
}: {
  actions: StepTestActions;
  coldOverride: boolean;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <button
        className="min-h-16 rounded-md bg-primary text-lg font-semibold text-primary-foreground"
        disabled={actions.saving}
        type="button"
        onClick={() => {
          actions.record("success", coldOverride);
        }}
      >
        Test passed
      </button>
      <button
        className="min-h-16 rounded-md border text-lg font-semibold"
        disabled={actions.saving}
        type="button"
        onClick={() => {
          actions.record("not_yet", coldOverride);
        }}
      >
        Not yet
      </button>
    </div>
  );
}

function TestHistory({ history }: { history: readonly StepTestRecord[] }) {
  return (
    <ol aria-label="Test history" className="space-y-2">
      {history.map((test) => (
        <li className="rounded-md border px-3 py-2 text-sm" key={test.testId}>
          {test.outcome === "success" ? "Passed" : "Not yet"}
          {test.coldOverride ? " · coldness confirmed" : " · later day"}
        </li>
      ))}
    </ol>
  );
}

function FinishTestLink() {
  return (
    <Link
      className="inline-flex min-h-11 items-center rounded-md border px-3"
      to="/levels/$section/$page"
      params={{ page: "zen", section: "level-1" }}
    >
      Finish Test
    </Link>
  );
}

export { CurriculumTrainingTestOffer, TestHistory, TrainingTest };
export type { StepTestActions, StepTestRecord };
