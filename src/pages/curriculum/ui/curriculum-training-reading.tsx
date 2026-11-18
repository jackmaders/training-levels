import { useEffect, useRef, useState, type ReactNode } from "react";

import type { BehaviorCurriculumPage, ContentBlock } from "@/shared/curriculum-data";

import { stripStepPrefixFromNodes } from "../model/curriculum-levels";
import { getBehaviorLabel } from "../model/training-faq";
import { CurriculumContentBlocks, InlineNodes } from "./curriculum-content-blocks";
import { TrainingFaq } from "./curriculum-training-faq";

type TrainingReadingKind = "explanation" | "faq";

const READING_TITLES: Record<TrainingReadingKind, string> = {
  explanation: "Explanation",
  faq: "FAQ",
};

interface TrainingReadingContent {
  page: BehaviorCurriculumPage;
  progressionSource: string | null;
  returnLabel: string;
  stepId: string;
}

interface TrainingReadingControls {
  /**
   * Replaces the current Training view with reading. Pass `interruptedTimedHold` when a started
   * timed hold was not recorded, so the return can ask for a fresh attempt.
   */
  openReading: (kind: TrainingReadingKind, interruptedTimedHold?: boolean) => void;
  timerInterrupted: boolean;
}

/**
 * Shows Explanation or FAQ in place of the Training view rendered by `children`, and restores that
 * view on return. Selection and recorded attempts live outside this component, so reading never
 * discards them.
 */
function TrainingReadingGate({
  children,
  ...content
}: TrainingReadingContent & { children: (controls: TrainingReadingControls) => ReactNode }) {
  const [readingKind, setReadingKind] = useState<TrainingReadingKind | null>(null);
  const [timerInterrupted, setTimerInterrupted] = useState(false);

  if (readingKind !== null) {
    return (
      <TrainingReading {...content} kind={readingKind} onReturn={() => setReadingKind(null)} />
    );
  }

  return children({
    openReading: (kind, interruptedTimedHold = false) => {
      setTimerInterrupted(interruptedTimedHold);
      setReadingKind(kind);
    },
    timerInterrupted,
  });
}

/** Optional reading entry points shown in Prep and In progress. */
function TrainingReadingLinks({ onOpen }: { onOpen: (kind: TrainingReadingKind) => void }) {
  return (
    <nav aria-label="Training reading" className="flex flex-wrap gap-2 text-sm">
      {(["explanation", "faq"] as const).map((kind) => (
        <button
          className="min-h-11 rounded-md border px-4 py-2"
          key={kind}
          type="button"
          onClick={() => onOpen(kind)}
        >
          {READING_TITLES[kind]}
        </button>
      ))}
    </nav>
  );
}

function TrainingReading({
  kind,
  onReturn,
  page,
  progressionSource,
  returnLabel,
  stepId,
}: TrainingReadingContent & { kind: TrainingReadingKind; onReturn: () => void }) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const headingId = `${kind}-reading-heading`;

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <section aria-labelledby={headingId} className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2
          className="text-xl font-semibold outline-none"
          id={headingId}
          ref={headingRef}
          tabIndex={-1}
        >
          {READING_TITLES[kind]}
        </h2>
        <button
          className="min-h-11 rounded-md bg-primary px-4 py-2 text-primary-foreground"
          type="button"
          onClick={onReturn}
        >
          {returnLabel}
        </button>
      </div>
      {kind === "explanation" ? (
        <TrainingExplanation page={page} progressionSource={progressionSource} stepId={stepId} />
      ) : (
        <TrainingFaq page={page} />
      )}
    </section>
  );
}

function TrainingExplanation({
  page,
  progressionSource,
  stepId,
}: {
  page: BehaviorCurriculumPage;
  progressionSource: string | null;
  stepId: string;
}) {
  const step = page.steps.find((candidate) => candidate.stepId === stepId);
  if (step === undefined) {
    return <p>The source instructions for this Step are unavailable.</p>;
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Source:{" "}
        <a
          className="text-primary underline underline-offset-4"
          href={`${page.href}#${step.anchor}`}
        >
          {getBehaviorLabel(page)}, Step {String(step.stepNumber)}
        </a>
      </p>
      <ExplanationSection blocks={step.instructions} heading={`Method: ${step.heading}`} />
      <ExplanationSection blocks={step.tryItCold ?? []} heading="Try It Cold" />
      <ExplanationSection blocks={step.comeafters ?? []} heading="Comeafters" />
      <ExplanationSection
        blocks={[...page.introBlocks, ...page.thinkAbout.flatMap((section) => section.blocks)]}
        heading="Why it works"
      />
      <ExplanationSection blocks={page.aboutTheCues ?? []} heading="About the Cues" />
      <ExplanationProgression
        currentStepId={step.stepId}
        page={page}
        progressionSource={progressionSource}
      />
    </div>
  );
}

function ExplanationProgression({
  currentStepId,
  page,
  progressionSource,
}: {
  currentStepId: string;
  page: BehaviorCurriculumPage;
  progressionSource: string | null;
}) {
  return (
    <ExplanationBlock heading="Progression">
      <ol className="list-decimal space-y-1.5 pl-6">
        {page.whereWeAreGoing.steps.map((summary) => (
          <li
            aria-current={summary.stepId === currentStepId ? "step" : undefined}
            className="leading-7 aria-[current=step]:font-semibold"
            key={summary.stepId}
          >
            <InlineNodes nodes={stripStepPrefixFromNodes(summary.content)} />
          </li>
        ))}
      </ol>
      {progressionSource === null ? null : (
        <p className="text-sm text-muted-foreground">Practice ladder: {progressionSource}</p>
      )}
    </ExplanationBlock>
  );
}

function ExplanationSection({
  blocks,
  heading,
}: {
  blocks: readonly ContentBlock[];
  heading: string;
}) {
  if (blocks.length === 0) {
    return null;
  }

  return (
    <ExplanationBlock heading={heading}>
      <CurriculumContentBlocks blocks={blocks} />
    </ExplanationBlock>
  );
}

function ExplanationBlock({ children, heading }: { children: ReactNode; heading: string }) {
  return (
    <section className="space-y-3">
      <h3 className="text-lg font-semibold tracking-tight">{heading}</h3>
      {children}
    </section>
  );
}

/** Explains that a timed hold stopped when reading opened and was not recorded. */
function InterruptedTimerNotice() {
  return (
    <output className="block rounded-md border p-3 text-sm">
      Timed hold interrupted when you opened reading. It was not recorded; start a fresh timed
      attempt.
    </output>
  );
}

export { InterruptedTimerNotice, TrainingReadingGate, TrainingReadingLinks };
export type { TrainingReadingKind };
