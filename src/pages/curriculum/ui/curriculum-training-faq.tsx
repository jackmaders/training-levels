import { useSuspenseQueries } from "@tanstack/react-query";
import { Suspense } from "react";

import type { BehaviorCurriculumPage } from "@/shared/curriculum-data";

import { curriculumPageQueryOptions } from "../api/curriculum-query-options";
import {
  GENERAL_FAQ_PAGE_SLUGS,
  getBehaviorFaq,
  getBehaviorLabel,
  getGeneralFaq,
  type TrainingFaqEntry,
} from "../model/training-faq";
import { CurriculumContentBlocks } from "./curriculum-content-blocks";

function TrainingFaq({ page }: { page: BehaviorCurriculumPage }) {
  const behaviorLabel = getBehaviorLabel(page);

  return (
    <div className="space-y-8">
      <FaqSection
        emptyMessage={`The ${behaviorLabel} chapter has no Problem or Question notes. Use the Explanation for its full Step instructions.`}
        entries={getBehaviorFaq(page)}
        heading={`${behaviorLabel} questions`}
        id="behavior-faq-heading"
      />
      <Suspense
        fallback={<p className="text-sm text-muted-foreground">Loading general answers…</p>}
      >
        <GeneralFaq />
      </Suspense>
    </div>
  );
}

function GeneralFaq() {
  const pages = useSuspenseQueries({
    combine: (results) =>
      results.flatMap((result) =>
        result.data !== null && result.data.kind !== "behavior" ? [result.data] : [],
      ),
    queries: GENERAL_FAQ_PAGE_SLUGS.map((pageSlug) => curriculumPageQueryOptions(pageSlug)),
  });

  return (
    <FaqSection
      emptyMessage="General answers are unavailable."
      entries={getGeneralFaq(pages)}
      heading="General training questions"
      id="general-faq-heading"
    />
  );
}

function FaqSection({
  emptyMessage,
  entries,
  heading,
  id,
}: {
  emptyMessage: string;
  entries: readonly TrainingFaqEntry[];
  heading: string;
  id: string;
}) {
  return (
    <section aria-labelledby={id} className="space-y-3">
      <h3 className="text-lg font-semibold tracking-tight" id={id}>
        {heading}
      </h3>
      {entries.length === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      ) : (
        <div className="divide-y rounded-lg border">
          {entries.map((entry) => (
            <FaqAnswer entry={entry} key={`${entry.source.href}:${entry.question}`} />
          ))}
        </div>
      )}
    </section>
  );
}

function FaqAnswer({ entry }: { entry: TrainingFaqEntry }) {
  return (
    <details className="group px-4 py-3">
      <summary className="min-h-11 cursor-pointer py-2 font-medium">{entry.question}</summary>
      <div className="space-y-3 pt-2">
        <CurriculumContentBlocks blocks={entry.answer} />
        <p className="text-sm text-muted-foreground">
          Source:{" "}
          <a className="text-primary underline underline-offset-4" href={entry.source.href}>
            {entry.source.label}
          </a>
        </p>
      </div>
    </details>
  );
}

export { TrainingFaq };
