import { cn } from "cn";
import type { ComponentProps } from "react";

import type { BehaviorCurriculumPage, CurriculumSyllabus } from "@/shared/curriculum-data";

import {
  BehaviorHeader,
  ContentSection,
  IntroSection,
  ThinkAboutSections,
  WhereWeAreGoingSection,
} from "./curriculum-behavior-sections";
import { CurriculumBehaviorSteps } from "./curriculum-behavior-steps";
import { CurriculumPageBreadcrumb } from "./curriculum-page-breadcrumb";
import { CurriculumPageFooter } from "./curriculum-page-footer";
import { useBehaviorArticleState } from "./use-behavior-article-state";

interface CurriculumBehaviorArticleProps extends ComponentProps<"article"> {
  activeAnchor?: string | undefined;
  completedStepIds: ReadonlySet<string>;
  page: BehaviorCurriculumPage;
  syllabus: CurriculumSyllabus;
}

function BehaviorArticleContentSections({
  page,
  onSelectAnchor,
}: {
  onSelectAnchor: (anchor: string) => void;
  page: BehaviorCurriculumPage;
}) {
  return (
    <>
      <IntroSection blocks={page.introBlocks} />
      <ContentSection blocks={page.comebefores} heading="Comebefores" id="comebefores" />
      <WhereWeAreGoingSection
        extraBlocks={page.whereWeAreGoing.extraBlocks}
        steps={page.whereWeAreGoing.steps}
        onSelectAnchor={onSelectAnchor}
      />
      <ContentSection blocks={page.equipment} heading="Equipment" id="equipment" />
      <ThinkAboutSections sections={page.thinkAbout} />
      <ContentSection
        blocks={page.aboutTheCues ?? []}
        heading="About the Cues"
        id="about-the-cues"
      />
    </>
  );
}

function CurriculumBehaviorArticle({
  activeAnchor,
  className,
  completedStepIds,
  page,
  syllabus,
  ...props
}: CurriculumBehaviorArticleProps) {
  const {
    behaviorState,
    currentLevelNumber,
    currentSection,
    generalization,
    openAnchors,
    setAnchorOpen,
  } = useBehaviorArticleState({ activeAnchor, completedStepIds, page, syllabus });

  return (
    <article className={cn("space-y-8", className)} {...props}>
      <div className="space-y-4">
        <CurriculumPageBreadcrumb page={page} syllabus={syllabus} />
        <BehaviorHeader
          behaviorState={behaviorState}
          completedStepIds={completedStepIds}
          currentLevelNumber={currentLevelNumber}
          page={page}
          section={currentSection}
        />
      </div>
      <BehaviorArticleContentSections
        page={page}
        onSelectAnchor={(anchor) => {
          setAnchorOpen(anchor, true);
        }}
      />
      <CurriculumBehaviorSteps
        completedStepIds={completedStepIds}
        generalization={generalization}
        openAnchors={openAnchors}
        page={page}
        stepStatesById={behaviorState?.stepsById}
        onStepOpenChange={setAnchorOpen}
      />
      <CurriculumPageFooter pageSlug={page.pageSlug} syllabus={syllabus} />
    </article>
  );
}

export { CurriculumBehaviorArticle };
