import { Link } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";

import type { BehaviorCurriculumPage } from "@/shared/curriculum-data";

import type { PracticeGuidance } from "../model/practice-guidance";
import type { PRACTICE_STEP_OPTIONS, PracticePlan } from "../model/practice-ladders";
import type { PracticeProgression } from "../model/practice-progression";
import { CurriculumContentBlocks } from "./curriculum-content-blocks";
import { CurriculumTrainingReadinessChoice } from "./curriculum-training-readiness-choice";
import {
  InterruptedTimerNotice,
  TrainingReadingLinks,
  type TrainingReadingKind,
} from "./curriculum-training-reading";
import { CurriculumTrainingTotals, type PracticeTotalRecord } from "./curriculum-training-totals";

const STEP_TARGET = "Dog moves away from a treat held in your hand while you are sitting.";
const LAST_ITEM_OFFSET = 1;
const DEFAULT_PRACTICE_LIMIT = 5;
const TIMER_TICK_MILLISECONDS = 1000;
const NO_TARGET_INDEX = -1;
type PracticeStepOption = (typeof PRACTICE_STEP_OPTIONS)[number];
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
  pendingAttempt: { attemptId: string; outcome: Outcome; target: string } | null;
  record: (outcome: Outcome, target: string) => void;
  recordTotals: (successCount: number, notYetCount: number) => void;
  saveDecision: (decision: PracticeDecision) => void;
  saving: boolean;
  undo: (attemptId: string) => void;
}

function TrainingHeading({
  mode = "Practice",
  stepLabel,
}: {
  mode?: "Practice" | "Test";
  stepLabel: string;
}) {
  return (
    <header className="space-y-2">
      <p className="text-sm text-muted-foreground">
        {mode} · {stepLabel}
      </p>
      <h1 className="text-3xl font-bold tracking-tight">Guided {mode}</h1>
    </header>
  );
}

function TrainingPrep({
  decision,
  equipment,
  guidance,
  history,
  onSelectStep,
  onStart,
  plan,
  selectedStepId,
  stepOptions,
  target,
  testOffer = null,
}: {
  equipment: BehaviorCurriculumPage["equipment"];
  guidance: PracticeGuidance | null;
  decision: PracticeDecision | null;
  history: readonly PracticeRecord[];
  onSelectStep: (stepId: string) => void;
  onStart: () => void;
  plan: PracticePlan | null;
  selectedStepId: string;
  stepOptions: readonly PracticeStepOption[];
  target: string;
  testOffer?: ReactNode;
}) {
  const currentHistory = history.filter((attempt) => attempt.undoneAt === null);

  return (
    <section aria-labelledby="prep-heading" className="space-y-5 rounded-lg border p-5">
      <h2 className="text-xl font-semibold" id="prep-heading">
        Prep
      </h2>
      <label className="grid max-w-lg gap-2 font-medium" htmlFor="practice-step">
        Behavior and Step
        <select
          className="min-h-11 rounded-md border bg-background px-3 font-normal"
          id="practice-step"
          value={selectedStepId}
          onChange={(event) => onSelectStep(event.currentTarget.value)}
        >
          {stepOptions.map((step) => (
            <option key={step.stepId} value={step.stepId}>
              {step.label}
            </option>
          ))}
        </select>
      </label>
      <PrepDetail heading="Equipment">
        <CurriculumContentBlocks blocks={equipment} />
      </PrepDetail>
      <PrepDetail heading="Practice target">
        <output aria-label="Current practice target">{target}</output>
      </PrepDetail>
      <PracticePrepDetails guidance={guidance} plan={plan} />
      <AttemptCounts history={currentHistory} />
      <SavedDecisionNotice decision={decision} />
      <button
        className="rounded-md bg-primary px-4 py-2 text-primary-foreground"
        type="button"
        onClick={onStart}
      >
        {currentHistory.length === 0 ? "Start Practice" : "Resume Practice"}
      </button>
      {testOffer}
    </section>
  );
}

function PracticeGuidanceDetails({ guidance }: { guidance: PracticeGuidance }) {
  return (
    <div className="space-y-3">
      <PrepDetail heading="Observable success">
        <p>{guidance.success}</p>
      </PrepDetail>
      <PrepDetail heading="Setup">
        <p>{guidance.setup}</p>
      </PrepDetail>
      <PrepDetail heading="Conditions">
        <p>{guidance.conditions}</p>
      </PrepDetail>
      <PrepDetail heading="Progression and restart">
        <p>{guidance.progression}</p>
        <p>{guidance.restart}</p>
      </PrepDetail>
      <PrepDetail heading="Readiness">
        <p>{guidance.readiness}</p>
        <p>{guidance.readinessBasis}</p>
      </PrepDetail>
      <PracticeTargetLadderDetails guidance={guidance} />
      <PrepDetail heading="Practice limit (app default)">
        <p>{guidance.suggestedLimit}</p>
      </PrepDetail>
      <PrepDetail heading="Source">
        <p>{guidance.source}</p>
      </PrepDetail>
    </div>
  );
}

function PracticeTargetLadderDetails({ guidance }: { guidance: PracticeGuidance }) {
  const advancement = describeAdvancement(guidance);
  if (advancement === null) {
    return null;
  }
  return (
    <PrepDetail heading="Practice target ladder">
      <ol className="list-inside list-decimal">
        {guidance.targetOptions.map((target) => (
          <li key={target}>{target}</li>
        ))}
      </ol>
      <p>{advancement}</p>
    </PrepDetail>
  );
}

function PracticePrepDetails({
  guidance,
  plan,
}: {
  guidance: PracticeGuidance | null;
  plan: PracticePlan | null;
}) {
  if (guidance === null) {
    if (plan === null) {
      return (
        <PrepDetail heading="Observable success">
          <p>Your Dog moves away from the treat hand. Mark and reward, then record it.</p>
        </PrepDetail>
      );
    }
    return <LadderDetails plan={plan} />;
  }

  return <PracticeGuidanceDetails guidance={guidance} />;
}

function LadderDetails({ plan }: { plan: PracticePlan }) {
  return (
    <section
      aria-label="Step ladder guidance"
      className="space-y-2 rounded-md bg-muted p-3 text-sm"
    >
      <p>
        <strong>Prior achievement:</strong> {plan.priorAchievement ?? "None recorded yet"}
      </p>
      {plan.restartReason === null ? null : (
        <p>
          <strong>Restart suggestion:</strong> {plan.target}. {plan.restartReason}
        </p>
      )}
      <p>
        <strong>Source:</strong> {plan.source}
      </p>
      <p>
        App defaults: {String(plan.appDefaultRepetitions)} confirmed attempt to advance each target;
        take a break after {String(plan.appDefaultPracticeLimit)} recorded attempts.
      </p>
    </section>
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

function TrainingPractice({
  actions,
  decision,
  history,
  onBreak,
  onChangeTarget,
  onOpenReading,
  finishStep,
  guidance,
  plan,
  progression,
  timerInterrupted,
  totals,
  target,
}: {
  actions: PracticeActions;
  decision: PracticeDecision | null;
  history: readonly PracticeRecord[];
  onBreak: () => void;
  onChangeTarget: (target: string) => void;
  /** Opens reading; reports whether a timed hold was started but not yet recorded. */
  onOpenReading: (kind: TrainingReadingKind, interruptedTimedHold: boolean) => void;
  timerInterrupted: boolean;
  finishStep: PracticeStepOption;
  guidance: PracticeGuidance | null;
  plan: PracticePlan | null;
  progression: PracticeProgression | null;
  totals: readonly PracticeTotalRecord[];
  target: string;
}) {
  const currentHistory = history.filter((attempt) => attempt.undoneAt === null);
  const lastAttempt = currentHistory.at(-LAST_ITEM_OFFSET);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [deadlineTimestamp, setDeadlineTimestamp] = useState<number | null>(null);
  const [showTimerInterrupted, setShowTimerInterrupted] = useState(timerInterrupted);
  const timerComplete = remainingSeconds === 0;
  const timerActive =
    deadlineTimestamp !== null && remainingSeconds !== null && remainingSeconds > 0;
  const targetDuration =
    plan?.targetOptions.find((option) => option.label === target)?.durationSeconds ??
    plan?.durationSeconds ??
    0;
  const { readyForTest, targetOptions } = getPracticeChoices(plan, guidance, progression);
  const practiceActions: PracticeActions = {
    ...actions,
    record: (outcome, currentTarget) => {
      setRemainingSeconds(null);
      setDeadlineTimestamp(null);
      setShowTimerInterrupted(false);
      actions.record(outcome, currentTarget);
    },
  };

  useEffect(() => {
    if (!timerActive) {
      return;
    }
    const timerId = window.setInterval(() => {
      if (deadlineTimestamp !== null) {
        const millisecondsRemaining = deadlineTimestamp - Date.now();
        const secondsRemaining = Math.ceil(millisecondsRemaining / TIMER_TICK_MILLISECONDS);
        setRemainingSeconds(Math.max(0, secondsRemaining));
      }
    }, TIMER_TICK_MILLISECONDS);
    return () => window.clearInterval(timerId);
  }, [deadlineTimestamp, timerActive]);
  function handleSaveDecision(nextDecision: PracticeDecision) {
    actions.saveDecision(nextDecision);
  }

  return (
    <section aria-labelledby="practice-heading" className="space-y-5">
      <TrainingReadingLinks onOpen={(kind) => onOpenReading(kind, remainingSeconds !== null)} />
      <PracticeTargetHeader
        plan={plan}
        target={target}
        targetOptions={targetOptions}
        onChangeTarget={(nextTarget) => {
          setRemainingSeconds(null);
          setDeadlineTimestamp(null);
          onChangeTarget(nextTarget);
        }}
      />
      {guidance === null ? null : (
        <PracticeGuidanceSummary guidance={guidance} showReadiness={progression === null} />
      )}
      {showTimerInterrupted && remainingSeconds === null ? <InterruptedTimerNotice /> : null}
      {plan === null || targetDuration === 0 ? null : (
        <TimerControls
          complete={timerComplete}
          remainingSeconds={remainingSeconds}
          target={target}
          onConfirm={(outcome) => practiceActions.record(outcome, target)}
          onStart={() => {
            setShowTimerInterrupted(false);
            setDeadlineTimestamp(Date.now() + targetDuration * TIMER_TICK_MILLISECONDS);
            setRemainingSeconds(targetDuration);
          }}
        />
      )}
      <PracticeLimitNotice
        attemptCount={currentHistory.length}
        limit={plan?.appDefaultPracticeLimit ?? DEFAULT_PRACTICE_LIMIT}
      />
      <AttemptCounts history={currentHistory} />
      <SaveError actions={practiceActions} />
      <AttemptHistory actions={practiceActions} history={currentHistory} />
      {progression === null ? null : <ProgressionDetails progression={progression} />}
      {readyForTest ? (
        <CurriculumTrainingReadinessChoice decision={decision} handleSave={handleSaveDecision} />
      ) : null}
      <SavedDecisionNotice decision={decision} />
      <CurriculumTrainingTotals actions={actions} totals={totals} />
      <RecordingControls
        actions={practiceActions}
        lastAttempt={lastAttempt}
        target={target}
        onBreak={onBreak}
        finishStep={finishStep}
      />
    </section>
  );
}

function getPracticeChoices(
  plan: PracticePlan | null,
  guidance: PracticeGuidance | null,
  progression: PracticeProgression | null,
): { readyForTest: boolean; targetOptions: readonly string[] } {
  return {
    readyForTest: progression?.readyForTest ?? guidance?.readyForTest ?? false,
    targetOptions:
      plan?.targetOptions.map((option) => option.label) ?? guidance?.targetOptions ?? [],
  };
}

function PracticeTargetHeader({
  onChangeTarget,
  plan,
  target,
  targetOptions,
}: {
  onChangeTarget: (target: string) => void;
  plan: PracticePlan | null;
  target: string;
  targetOptions: readonly string[];
}) {
  return (
    <div className="space-y-2">
      <h2 className="text-xl font-semibold" id="practice-heading">
        Current target
      </h2>
      <output aria-label="Current practice target">{target}</output>
      {targetOptions.length === 0 ? null : (
        <TargetChoices options={targetOptions} target={target} onChangeTarget={onChangeTarget} />
      )}
      {plan === null ? null : (
        <>
          <p>Prior achievement: {plan.priorAchievement ?? "None recorded yet"}</p>
          {plan.restartReason === null ? null : (
            <p>
              Restart suggestion: {plan.target}. {plan.restartReason}
            </p>
          )}
        </>
      )}
    </div>
  );
}

function ProgressionDetails({ progression }: { progression: PracticeProgression }) {
  return (
    <>
      <p>{progression.nextTarget}</p>
      <p className="text-sm text-muted-foreground">
        Method: {progression.method.replaceAll("_", " ")}. Source: {progression.source}.
      </p>
      <p className="text-sm text-muted-foreground">App default: {progression.appDefault}</p>
      <p className="rounded-md border p-3 text-sm">
        Readiness check: {progression.readinessQuestion}
      </p>
    </>
  );
}

function describeAdvancement(guidance: PracticeGuidance): string | null {
  if (guidance.targetOptions.length === 0) {
    return null;
  }
  return guidance.targetAdvancement === "source"
    ? "Source ladder: a success advances one rung; a miss returns to the restart target."
    : "App default rungs: the curriculum does not set these intermediate targets. A success advances one rung; a miss returns to the restart target.";
}

function PracticeGuidanceSummary({
  guidance,
  showReadiness,
}: {
  guidance: PracticeGuidance;
  showReadiness: boolean;
}) {
  const advancement = describeAdvancement(guidance);
  return (
    <section aria-label="Practice guidance" className="space-y-2 rounded-md border p-3 text-sm">
      <p>{guidance.progression}</p>
      <p>{guidance.restart}</p>
      {advancement === null ? null : <p>{advancement}</p>}
      {showReadiness ? (
        <>
          <p>Readiness check: {guidance.readiness}</p>
          <p>{guidance.readinessBasis}</p>
        </>
      ) : null}
    </section>
  );
}

function TargetChoices({
  onChangeTarget,
  options,
  target,
}: {
  onChangeTarget: (target: string) => void;
  options: readonly string[];
  target: string;
}) {
  const targetIndex = options.indexOf(target);
  return (
    <div className="flex flex-wrap gap-2 text-sm">
      <button
        className="rounded-md border px-3 py-2"
        disabled={targetIndex <= 0}
        type="button"
        onClick={() => onChangeTarget(options[targetIndex - 1] ?? target)}
      >
        Easier target
      </button>
      <button
        className="rounded-md border px-3 py-2"
        disabled={targetIndex === NO_TARGET_INDEX || targetIndex >= options.length - 1}
        type="button"
        onClick={() => onChangeTarget(options[targetIndex + 1] ?? target)}
      >
        Next ladder target
      </button>
      <label className="grid gap-1" htmlFor="practice-target">
        Choose target
      </label>
      <select
        className="min-h-10 rounded-md border bg-background px-2"
        id="practice-target"
        value={target}
        onChange={(event) => onChangeTarget(event.currentTarget.value)}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

function TimerControls({
  complete,
  onConfirm,
  onStart,
  remainingSeconds,
  target,
}: {
  complete: boolean;
  onConfirm: (outcome: Outcome) => void;
  onStart: () => void;
  remainingSeconds: number | null;
  target: string;
}) {
  return (
    <section aria-label="Optional timer" className="space-y-2 rounded-md border p-3">
      <p>Optional timer for {target}</p>
      {remainingSeconds === null ? (
        <button className="rounded-md border px-3 py-2" type="button" onClick={onStart}>
          Start timer
        </button>
      ) : (
        <p aria-live="polite">
          {complete ? "Timer complete." : `${String(remainingSeconds)} seconds remaining.`}
        </p>
      )}
      {complete ? (
        <div className="flex gap-2">
          <button
            className="rounded-md bg-primary px-3 py-2 text-primary-foreground"
            type="button"
            onClick={() => onConfirm("success")}
          >
            Confirm Success
          </button>
          <button
            className="rounded-md border px-3 py-2"
            type="button"
            onClick={() => onConfirm("not_yet")}
          >
            Record Not yet
          </button>
        </div>
      ) : null}
    </section>
  );
}

function AttemptCounts({ history }: { history: readonly PracticeRecord[] }) {
  const success = history.filter((attempt) => attempt.outcome === "success").length;
  const notYet = history.filter((attempt) => attempt.outcome === "not_yet").length;
  return (
    <p aria-live="polite" className="text-sm text-muted-foreground">
      {String(success)} Success · {String(notYet)} Not yet
    </p>
  );
}

function PracticeLimitNotice({ attemptCount, limit }: { attemptCount: number; limit: number }) {
  if (attemptCount < limit) {
    return null;
  }
  return (
    <output>
      App-default practice limit reached. Take a break, then choose Continue or Finish.
    </output>
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
  onBreak,
  finishStep,
  target,
}: {
  actions: PracticeActions;
  lastAttempt: PracticeRecord | undefined;
  onBreak: () => void;
  finishStep: PracticeStepOption;
  target: string;
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-20 border-t bg-background/95 p-4 backdrop-blur">
      <div className="mx-auto grid max-w-3xl grid-cols-2 gap-3">
        <OutcomeButton actions={actions} outcome="success" target={target} />
        <OutcomeButton actions={actions} outcome="not_yet" target={target} />
        <button
          className="min-h-12 rounded-md border"
          disabled={actions.saving || lastAttempt === undefined}
          type="button"
          onClick={() =>
            lastAttempt === undefined ? undefined : actions.undo(lastAttempt.attemptId)
          }
        >
          Undo
        </button>
        <button className="min-h-12 rounded-md border" type="button" onClick={onBreak}>
          Take a break
        </button>
        <FinishTrainingLink step={finishStep} />
      </div>
    </div>
  );
}

function OutcomeButton({
  actions,
  outcome,
  target,
}: {
  actions: PracticeActions;
  outcome: Outcome;
  target: string;
}) {
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
      onClick={() => actions.record(outcome, target)}
    >
      {label}
    </button>
  );
}

function TrainingBreak({
  onContinue,
  finishStep,
}: {
  onContinue: () => void;
  finishStep: PracticeStepOption;
}) {
  return (
    <section aria-labelledby="break-heading" className="space-y-4 rounded-lg border p-5">
      <h2 className="text-xl font-semibold" id="break-heading">
        Take a break
      </h2>
      <p>
        Your attempts and target are saved. Continue when you and your Dog are ready, or finish
        Practice.
      </p>
      <div className="flex flex-wrap gap-3">
        <button
          className="rounded-md bg-primary px-4 py-2 text-primary-foreground"
          type="button"
          onClick={onContinue}
        >
          Continue
        </button>
        <FinishTrainingLink step={finishStep} label="Finish" />
      </div>
    </section>
  );
}

function FinishTrainingLink({
  label = "Finish Practice",
  step,
}: {
  label?: string;
  step: PracticeStepOption;
}) {
  const [section, page] = step.pageSlug.split("/");
  if (section === undefined || page === undefined) {
    return null;
  }
  return (
    <Link
      className="flex min-h-12 items-center justify-center rounded-md border"
      to="/levels/$section/$page"
      params={{ page, section }}
    >
      {label}
    </Link>
  );
}

export { STEP_TARGET, TrainingBreak, TrainingHeading, TrainingPractice, TrainingPrep };
export type { Outcome, PracticeActions, PracticeDecision, PracticeRecord };
