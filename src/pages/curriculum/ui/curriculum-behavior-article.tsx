import { useQuery } from "@tanstack/react-query";
import { cn } from "cn";
import type { ComponentProps } from "react";

import type { BehaviorCurriculumPage, CurriculumSyllabus } from "@/shared/curriculum-data";

import {
  EMPTY_PAGE_GENERALIZATION,
  pageGeneralizationQueryOptions,
} from "../api/generalization-query-options";
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
  const { data: generalization = EMPTY_PAGE_GENERALIZATION } = useQuery(
    pageGeneralizationQueryOptions(page.pageSlug),
  );
  const currentSection = syllabus.sections.find(
    (section) => section.sectionSlug === page.sectionSlug,
  );

  return (
    <article className={cn("space-y-8", className)} {...props}>
      <div className="space-y-4">
        <CurriculumPageBreadcrumb page={page} syllabus={syllabus} />
        <BehaviorHeader completedStepIds={completedStepIds} page={page} section={currentSection} />
      </div>

      <IntroSection blocks={page.introBlocks} />
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
        generalization={generalization}
        openAnchors={openAnchors}
        page={page}
        onStepOpenChange={setAnchorOpen}
      />
      <CurriculumPageFooter pageSlug={page.pageSlug} syllabus={syllabus} />
    </article>
  );
}

export { CurriculumBehaviorArticle };
