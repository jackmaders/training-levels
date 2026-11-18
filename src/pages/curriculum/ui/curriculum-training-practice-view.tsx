import { Link } from "@tanstack/react-router";

import type { PracticeProgression } from "../model/practice-progression";
import { CurriculumTrainingReadinessChoice } from "./curriculum-training-readiness-choice";
import { CurriculumTrainingTotals, type PracticeTotalRecord } from "./curriculum-training-totals";

const STEP_TARGET = "Dog moves off a treat held in your hand while you are sitting.";
const LAST_ITEM_OFFSET = 1;

type Outcome = "success" | "not_yet";
type PracticeDecision = "keep_practicing" | "recommend_test";
interface PracticeRecord {
  attemptId: string;
  createdAt: Date;
  outcome: Outcome;
  target: string;
  undoneAt: Date | null;
}
interface PracticeActions {
  correctTotals: (recordId: string, successCount: number, notYetCount: number) => void;
  correct: (attempt: PracticeRecord) => void;
  errorMessage: string | null;
  handleRetry: () => void;
  pendingAttempt: { attemptId: string; outcome: Outcome } | null;
  record: (outcome: Outcome) => void;
  recordTotals: (successCount: number, notYetCount: number) => void;
  saveDecision: (decision: PracticeDecision) => void;
  saving: boolean;
  undo: (attemptId: string) => void;
}

function TrainingPractice({
  actions,
  decision,
  history,
  progression,
  totals,
}: {
  actions: PracticeActions;
  decision: PracticeDecision | null;
  history: readonly PracticeRecord[];
  progression: PracticeProgression;
  totals: readonly PracticeTotalRecord[];
}) {
  const currentHistory = history.filter((attempt) => attempt.undoneAt === null);
  const lastAttempt = currentHistory.at(-LAST_ITEM_OFFSET);

  return (
    <section aria-labelledby="practice-heading" className="space-y-5">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold" id="practice-heading">
          Current target
        </h2>
        <p>{progression.nextTarget}</p>
        <p className="text-sm text-muted-foreground">
          Method: {progression.method.replaceAll("_", " ")}. Source: {progression.source}.
        </p>
        <p className="text-sm text-muted-foreground">App default: {progression.appDefault}</p>
      </div>
      <p className="rounded-md border p-3 text-sm">
        Readiness check: {progression.readinessQuestion}
      </p>
      {progression.readyForTest ? (
        <CurriculumTrainingReadinessChoice decision={decision} handleSave={actions.saveDecision} />
      ) : null}
      <PracticeCounts history={currentHistory} />
      <SaveError actions={actions} />
      <AttemptHistory actions={actions} history={currentHistory} />
      <CurriculumTrainingTotals actions={actions} totals={totals} />
      <RecordingControls actions={actions} lastAttempt={lastAttempt} />
    </section>
  );
}

function PracticeCounts({ history }: { history: readonly PracticeRecord[] }) {
  const success = history.filter((attempt) => attempt.outcome === "success").length;
  const notYet = history.filter((attempt) => attempt.outcome === "not_yet").length;
  return (
    <p aria-live="polite" className="text-sm text-muted-foreground">
      {String(success)} Success · {String(notYet)} Not yet
    </p>
  );
}

function SaveError({ actions }: { actions: PracticeActions }) {
  if (actions.errorMessage === null) {
    return null;
  }

  return (
    <div
      aria-live="assertive"
      className="space-y-2 rounded-md border border-destructive p-3 text-sm text-destructive"
    >
      <p>Could not save this attempt. Your counts have not changed. {actions.errorMessage}</p>
      {actions.pendingAttempt === null ? null : (
        <button
          className="underline underline-offset-4"
          disabled={actions.saving}
          type="button"
          onClick={actions.handleRetry}
        >
          Retry save
        </button>
      )}
    </div>
  );
}

function AttemptHistory({
  actions,
  history,
}: {
  actions: PracticeActions;
  history: readonly PracticeRecord[];
}) {
  return (
    <ol aria-label="Practice history" className="space-y-2">
      {history.map((attempt) => (
        <li
          className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
          key={attempt.attemptId}
        >
          <span>
            {attempt.outcome === "success" ? "Success" : "Not yet"} · {attempt.target}
          </span>
          <button
            className="underline underline-offset-4"
            disabled={actions.saving}
            type="button"
            onClick={() => actions.correct(attempt)}
          >
            Correct
          </button>
        </li>
      ))}
    </ol>
  );
}

function RecordingControls({
  actions,
  lastAttempt,
}: {
  actions: PracticeActions;
  lastAttempt: PracticeRecord | undefined;
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-20 border-t bg-background/95 p-4 backdrop-blur">
      <div className="mx-auto grid max-w-3xl grid-cols-2 gap-3">
        <OutcomeButton actions={actions} outcome="success" />
        <OutcomeButton actions={actions} outcome="not_yet" />
        <button
          className="min-h-12 rounded-md border"
          disabled={actions.saving || lastAttempt === undefined}
          type="button"
          onClick={() => {
            if (lastAttempt !== undefined) {
              actions.undo(lastAttempt.attemptId);
            }
          }}
        >
          Undo
        </button>
        <Link
          className="flex min-h-12 items-center justify-center rounded-md border"
          to="/levels/$section/$page"
          params={{ page: "zen", section: "level-1" }}
        >
          Finish Practice
        </Link>
      </div>
    </div>
  );
}

function OutcomeButton({ actions, outcome }: { actions: PracticeActions; outcome: Outcome }) {
  const label = outcome === "success" ? "Success" : "Not yet";
  return (
    <button
      className={
        outcome === "success"
          ? "min-h-16 rounded-md bg-primary text-lg font-semibold text-primary-foreground"
          : "min-h-16 rounded-md border text-lg font-semibold"
      }
      disabled={actions.saving || actions.pendingAttempt !== null}
      type="button"
      onClick={() => actions.record(outcome)}
    >
      {label}
    </button>
  );
}

export { STEP_TARGET, TrainingPractice, PracticeCounts };
export type { Outcome, PracticeActions, PracticeDecision, PracticeRecord };
