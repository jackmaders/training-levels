import { AlertCircle } from "lucide-react";

import type {
  BehaviorCurriculumPage,
  BehaviorStepSummary,
  BehaviorThinkAboutSection,
  ContentBlock,
  CurriculumSyllabus,
} from "@/shared/curriculum-data";
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/shadcn/alert";
import { Progress, ProgressLabel, ProgressValue } from "@/shared/ui/shadcn/progress";

import { useToggleStep } from "../api/use-toggle-step";
import { getBehaviorProgress } from "../model/curriculum-levels";
import { CurriculumContentBlocks, InlineNodes } from "./curriculum-content-blocks";
import { CurriculumPageBreadcrumb } from "./curriculum-page-breadcrumb";
import { CurriculumPageFooter } from "./curriculum-page-footer";
import { CurriculumStepCard } from "./curriculum-step-card";

interface CurriculumBehaviorArticleProps {
  completedStepIds: ReadonlySet<string>;
  initialOpenAnchor?: string | undefined;
  page: BehaviorCurriculumPage;
  syllabus: CurriculumSyllabus;
}

function CurriculumBehaviorArticle({
  completedStepIds,
  initialOpenAnchor,
  page,
  syllabus,
}: CurriculumBehaviorArticleProps) {
  return (
    <article className="space-y-8">
      <div className="space-y-4">
        <CurriculumPageBreadcrumb page={page} syllabus={syllabus} />
        <BehaviorHeader completedStepIds={completedStepIds} page={page} />
      </div>

      {page.introBlocks.length > 0 ? <CurriculumContentBlocks blocks={page.introBlocks} /> : null}
      <OptionalContentSection blocks={page.comebefores} heading="Comebefores" id="comebefores" />
      <WhereWeAreGoingSection
        extraBlocks={page.whereWeAreGoing.extraBlocks}
        steps={page.whereWeAreGoing.steps}
      />
      <OptionalContentSection blocks={page.equipment} heading="Equipment" id="equipment" />
      <ThinkAboutSections sections={page.thinkAbout} />
      <OptionalContentSection
        blocks={page.aboutTheCues ?? []}
        heading="About the Cues"
        id="about-the-cues"
      />
      <BehaviorStepsSection
        completedStepIds={completedStepIds}
        initialOpenAnchor={initialOpenAnchor}
        page={page}
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
      <p className="text-sm font-medium text-muted-foreground">{page.behaviorFamily}</p>
      <h1 className="text-3xl font-bold tracking-tight">{page.title}</h1>
      <Progress aria-label={`${page.title} progress`} className="gap-2" value={progress.percent}>
        <ProgressLabel>Step Progress</ProgressLabel>
        <ProgressValue>
          {() => `${String(progress.completedCount)} of ${String(progress.totalCount)} steps`}
        </ProgressValue>
      </Progress>
    </header>
  );
}

function OptionalContentSection({
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
  steps,
}: {
  extraBlocks: readonly ContentBlock[];
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
      {steps.length > 0 ? <WhereWeAreGoingStepList steps={steps} /> : null}
      {extraBlocks.length > 0 ? <CurriculumContentBlocks blocks={extraBlocks} /> : null}
    </section>
  );
}

function WhereWeAreGoingStepList({ steps }: { steps: readonly BehaviorStepSummary[] }) {
  return (
    <ol className="list-decimal space-y-1.5 pl-6">
      {steps.map((step) => (
        <li className="leading-7" key={step.stepId}>
          <a
            className="font-medium text-primary underline underline-offset-4 hover:opacity-80"
            href={`#${step.anchor}`}
          >
            {`Step ${String(step.stepNumber)}`}
          </a>
          {": "}
          <InlineNodes nodes={step.content} />
        </li>
      ))}
    </ol>
  );
}

function ThinkAboutSections({ sections }: { sections: readonly BehaviorThinkAboutSection[] }) {
  if (sections.length === 0) {
    return null;
  }

  return (
    <>
      {sections.map((section) => (
        <section aria-labelledby={section.id} className="space-y-3" key={section.id}>
          <h2 className="text-xl font-semibold tracking-tight" id={section.id}>
            {section.heading}
          </h2>
          <CurriculumContentBlocks blocks={section.blocks} />
        </section>
      ))}
    </>
  );
}

function BehaviorStepsSection({
  completedStepIds,
  initialOpenAnchor,
  page,
}: {
  completedStepIds: ReadonlySet<string>;
  initialOpenAnchor: string | undefined;
  page: BehaviorCurriculumPage;
}) {
  const { error, mutate: toggleStep } = useToggleStep();

  return (
    <section aria-labelledby="steps-heading" className="space-y-4">
      <h2 className="text-xl font-semibold tracking-tight" id="steps-heading">
        Steps
      </h2>
      {page.stepsIntroBlocks.length > 0 ? (
        <CurriculumContentBlocks blocks={page.stepsIntroBlocks} />
      ) : null}
      {error === null ? null : (
        <Alert variant="destructive">
          <AlertCircle aria-hidden="true" className="size-4" />
          <AlertTitle>Could not update step progress</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}
      <div className="space-y-3">
        {page.steps.map((step) => (
          <CurriculumStepCard
            defaultOpen={initialOpenAnchor === step.anchor}
            isCompleted={completedStepIds.has(step.stepId)}
            key={step.stepId}
            step={step}
            onToggle={(stepId, completed) => {
              toggleStep({ completed, stepId });
            }}
          />
        ))}
      </div>
    </section>
  );
}

export { CurriculumBehaviorArticle };
