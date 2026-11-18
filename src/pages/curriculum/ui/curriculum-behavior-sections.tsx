import { Link } from "@tanstack/react-router";

import type {
  BehaviorCurriculumPage,
  BehaviorStepSummary,
  BehaviorThinkAboutSection,
  ContentBlock,
  SyllabusSection,
} from "@/shared/curriculum-data";
import { Progress, ProgressLabel, ProgressValue } from "@/shared/ui/shadcn/progress";

import { getBehaviorProgress, stripStepPrefixFromNodes } from "../model/curriculum-levels";
import { CurriculumContentBlocks, InlineNodes } from "./curriculum-content-blocks";
import { CurriculumLevelReadiness } from "./curriculum-level-readiness";

function BehaviorHeader({
  completedStepIds,
  page,
  section,
}: {
  completedStepIds: ReadonlySet<string>;
  page: BehaviorCurriculumPage;
  section: SyllabusSection | undefined;
}) {
  const stepIds = page.steps.map((step) => step.stepId);
  const progress = getBehaviorProgress(stepIds, completedStepIds);

  return (
    <header className="space-y-3">
      <h1 className="text-3xl font-bold tracking-tight">{page.title}</h1>
      <Progress aria-label={`${page.title} progress`} className="gap-2" value={progress.percent}>
        <ProgressLabel>Step Progress</ProgressLabel>
        <ProgressValue>
          {() => `${String(progress.completedCount)} of ${String(progress.totalCount)} steps`}
        </ProgressValue>
      </Progress>
      <CurriculumLevelReadiness completedStepIds={completedStepIds} section={section} />
      {page.pageSlug === "level-1/zen" ? (
        <Link
          className="inline-flex rounded-md bg-primary px-4 py-2 text-primary-foreground"
          search={{ stepId: "level-1/zen:step-1" }}
          to="/training"
        >
          Practice Step 1
        </Link>
      ) : null}
    </header>
  );
}

function IntroSection({ blocks }: { blocks: readonly ContentBlock[] }) {
  if (blocks.length === 0) {
    return null;
  }

  return <CurriculumContentBlocks blocks={blocks} />;
}

function ContentSection({
  blocks,
  heading,
  id,
}: {
  blocks: readonly ContentBlock[];
  heading: string;
  id: string;
}) {
  if (blocks.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby={id} className="space-y-3">
      <h2 className="text-xl font-semibold tracking-tight" id={id}>
        {heading}
      </h2>
      <CurriculumContentBlocks blocks={blocks} />
    </section>
  );
}

function WhereWeAreGoingSection({
  extraBlocks,
  onSelectAnchor,
  steps,
}: {
  extraBlocks: readonly ContentBlock[];
  onSelectAnchor: (anchor: string) => void;
  steps: readonly BehaviorStepSummary[];
}) {
  if (steps.length === 0 && extraBlocks.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="where-we-are-going" className="space-y-3">
      <h2 className="text-xl font-semibold tracking-tight" id="where-we-are-going">
        Where We Are Going
      </h2>
      {steps.length > 0 ? (
        <WhereWeAreGoingStepList onSelectAnchor={onSelectAnchor} steps={steps} />
      ) : null}
      {extraBlocks.length > 0 ? <CurriculumContentBlocks blocks={extraBlocks} /> : null}
    </section>
  );
}

function WhereWeAreGoingStepList({
  onSelectAnchor,
  steps,
}: {
  onSelectAnchor: (anchor: string) => void;
  steps: readonly BehaviorStepSummary[];
}) {
  return (
    <ol className="list-decimal space-y-1.5 pl-6">
      {steps.map((step) => (
        <li className="leading-7" key={step.stepId}>
          <a
            className="font-medium text-primary underline underline-offset-4 hover:opacity-80"
            href={`#${step.anchor}`}
            onClick={() => {
              onSelectAnchor(step.anchor);
            }}
          >
            {`Step ${String(step.stepNumber)}`}
          </a>
          {": "}
          <InlineNodes nodes={stripStepPrefixFromNodes(step.content)} />
        </li>
      ))}
    </ol>
  );
}

function ThinkAboutSections({ sections }: { sections: readonly BehaviorThinkAboutSection[] }) {
  return (
    <>
      {sections.map((section) => (
        <ContentSection
          blocks={section.blocks}
          heading={section.heading}
          id={section.id}
          key={section.id}
        />
      ))}
    </>
  );
}

export { BehaviorHeader, ContentSection, IntroSection, ThinkAboutSections, WhereWeAreGoingSection };
