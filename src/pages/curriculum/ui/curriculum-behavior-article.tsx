import { cn } from "cn";
import type { ComponentProps } from "react";

import type {
  BehaviorCurriculumPage,
  BehaviorStepSummary,
  BehaviorThinkAboutSection,
  ContentBlock,
  CurriculumSyllabus,
} from "@/shared/curriculum-data";
import { Progress, ProgressLabel, ProgressValue } from "@/shared/ui/shadcn/progress";

import { getBehaviorProgress, stripStepPrefixFromNodes } from "../model/curriculum-levels";
import { CurriculumBehaviorSteps } from "./curriculum-behavior-steps";
import { CurriculumContentBlocks, InlineNodes } from "./curriculum-content-blocks";
import { CurriculumPageBreadcrumb } from "./curriculum-page-breadcrumb";
import { CurriculumPageFooter } from "./curriculum-page-footer";
import { useStepAnchors } from "./use-step-anchors";

interface CurriculumBehaviorArticleProps extends ComponentProps<"article"> {
  activeAnchor?: string | undefined;
  completedStepIds: ReadonlySet<string>;
  page: BehaviorCurriculumPage;
  syllabus: CurriculumSyllabus;
}

function CurriculumBehaviorArticle({
  activeAnchor,
  className,
  completedStepIds,
  page,
  syllabus,
  ...props
}: CurriculumBehaviorArticleProps) {
  const { openAnchors, setAnchorOpen } = useStepAnchors(activeAnchor);

  return (
    <article className={cn("space-y-8", className)} {...props}>
      <div className="space-y-4">
        <CurriculumPageBreadcrumb page={page} syllabus={syllabus} />
        <BehaviorHeader completedStepIds={completedStepIds} page={page} />
      </div>

      {page.introBlocks.length > 0 ? <CurriculumContentBlocks blocks={page.introBlocks} /> : null}
      <ContentSection blocks={page.comebefores} heading="Comebefores" id="comebefores" />
      <WhereWeAreGoingSection
        extraBlocks={page.whereWeAreGoing.extraBlocks}
        steps={page.whereWeAreGoing.steps}
        onSelectAnchor={(anchor) => {
          setAnchorOpen(anchor, true);
        }}
      />
      <ContentSection blocks={page.equipment} heading="Equipment" id="equipment" />
      <ThinkAboutSections sections={page.thinkAbout} />
      <ContentSection
        blocks={page.aboutTheCues ?? []}
        heading="About the Cues"
        id="about-the-cues"
      />
      <CurriculumBehaviorSteps
        completedStepIds={completedStepIds}
        openAnchors={openAnchors}
        page={page}
        onStepOpenChange={setAnchorOpen}
      />
      <CurriculumPageFooter pageSlug={page.pageSlug} syllabus={syllabus} />
    </article>
  );
}

function BehaviorHeader({
  completedStepIds,
  page,
}: {
  completedStepIds: ReadonlySet<string>;
  page: BehaviorCurriculumPage;
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
      {page.pageSlug === "level-1/zen" ? (
        <a
          className="inline-flex rounded-md bg-primary px-4 py-2 text-primary-foreground"
          href="/training"
        >
          Practice Step 1
        </a>
      ) : null}
    </header>
  );
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

export { CurriculumBehaviorArticle };
